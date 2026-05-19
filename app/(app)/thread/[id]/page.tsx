"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";
import dynamic from "next/dynamic";
import { UserButton } from "@clerk/nextjs";
import InputCard from "@/components/InputCard";
import PersonaSelector from "@/components/PersonaSelector";
import AttackReport from "@/components/AttackReport";
import CompetitorTable from "@/components/CompetitorTable";
import ProgressPanel from "@/components/ProgressPanel";
import RightPanel from "@/components/RightPanel";
import CustomPersonaModal from "@/components/CustomPersonaModal";

const PDFExportButton = dynamic(() => import("@/components/PDFExportButton"), { ssr: false });

interface Attack { personaId: string; headline: string; body: string; question: string; severity: number; }
interface Competitor { name: string; pricing: string; market: string; gap: string; sentiment: string; }
interface RunResult { score: number; verdict: string; weakestPoint: string; attacks: Attack[]; runId: string; version: number; }
interface VersionEntry { v: number; score: number; date: string; label: string; }

type Tab = "attacks" | "competitors" | "progress" | "score";
const DESKTOP_TABS: { id: Tab; label: string }[] = [
  { id: "attacks", label: "Attack report" },
  { id: "competitors", label: "Competitive intel" },
  { id: "progress", label: "Progress" },
];
const MOBILE_TABS: { id: Tab; label: string }[] = [
  { id: "attacks", label: "Attacks" },
  { id: "competitors", label: "Intel" },
  { id: "progress", label: "Progress" },
  { id: "score", label: "Score" },
];

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const isMobile = useIsMobile();

  const [inputType, setInputType] = useState("idea");
  const [inputText, setInputText] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState(["vc", "competitor", "devil"]);
  const [activeTab, setActiveTab] = useState<Tab>("attacks");

  const [isRunning, setIsRunning] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [currentResult, setCurrentResult] = useState<RunResult | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [threadTitle, setThreadTitle] = useState("New thread");

  // Custom persona state
  const [customPersona, setCustomPersona] = useState<{ id: string; name: string; role: string; icon: string } | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Diff state
  const prevAttacksRef = useRef<Attack[]>([]);
  const [attackDiff, setAttackDiff] = useState<Record<string, "new" | "repeated">>({});
  const [resolvedAttacks, setResolvedAttacks] = useState<Attack[]>([]);

  // Rename state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const abortRef = useRef<AbortController | null>(null);
  // Used to save competitors to DB once both runId and research results are available
  const pendingCompetitorsRef = useRef<Competitor[]>([]);
  const completedRunIdRef = useRef<string | null>(null);

  const saveCompetitorsToDB = useCallback((runId: string, comps: Competitor[]) => {
    if (!runId || comps.length === 0) return;
    fetch(`/api/runs/${runId}/competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competitors: comps }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!threadId) return;
    fetch(`/api/threads/${threadId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setThreadTitle(data.title ?? "New thread");
        if (data.inputType) setInputType(data.inputType);
        if (data.runs?.length) {
          const latest = data.runs[0];
          if (latest.inputText) setInputText(latest.inputText);
          setCurrentResult({ score: latest.score, verdict: latest.verdict, weakestPoint: latest.weakestPoint, attacks: latest.attacks, runId: latest.id, version: latest.version });
          setVersions(data.runs.map((r: RunResult & { createdAt: string; version: number }) => ({
            v: r.version, score: r.score,
            date: new Date(r.createdAt).toLocaleDateString("en", { weekday: "short" }),
            label: r.version === 1 ? "First draft" : `v${r.version}`,
          })).reverse());

          // Load saved competitors from latest run
          if (latest.competitors?.length) setCompetitors(latest.competitors);

          // Compute diff between latest and previous run on load
          if (data.runs.length >= 2) {
            const previous = data.runs[1];
            const prevAtks = previous.attacks as Attack[];
            const newAtks = latest.attacks as Attack[];
            const prevMap = new Map(prevAtks.map(a => [a.personaId, a]));
            const newMap = new Map(newAtks.map(a => [a.personaId, a]));
            const diff: Record<string, "new" | "repeated"> = {};
            for (const a of newAtks) {
              diff[a.personaId] = prevMap.has(a.personaId) ? "repeated" : "new";
            }
            setAttackDiff(diff);
            // Resolved = same persona ran in both runs, but severity genuinely dropped
            const resolved = prevAtks.filter(prev => {
              const next = newMap.get(prev.personaId);
              return next && prev.severity >= 2 && next.severity < prev.severity;
            });
            setResolvedAttacks(resolved);
          }
        }
      })
      .catch(() => {});
  }, [threadId]);

  const startEditing = () => {
    setTitleDraft(threadTitle);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const saveTitle = async () => {
    setEditingTitle(false);
    const newTitle = titleDraft.trim().slice(0, 100);
    if (!newTitle || newTitle === threadTitle) return;
    setThreadTitle(newTitle);
    await fetch(`/api/threads/${threadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    }).catch(() => {});
    window.dispatchEvent(new CustomEvent("thread-renamed"));
  };

  const togglePersona = (id: string) =>
    setSelectedPersonas(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleRunAttack = useCallback(async () => {
    if (!inputText.trim() || selectedPersonas.length === 0 || isRunning) return;

    // Feature 4: capture previous attacks before clearing
    prevAttacksRef.current = currentResult?.attacks ?? [];
    setAttackDiff({});
    setResolvedAttacks([]);

    abortRef.current = new AbortController();
    setIsRunning(true);
    setStreamingText("");
    setCurrentResult(null);
    setActiveTab("attacks");

    let priorRuns: RunResult[] = [];
    try {
      const threadData = await fetch(`/api/threads/${threadId}`).then(r => r.ok ? r.json() : null);
      priorRuns = threadData?.runs ?? [];
    } catch {}

    pendingCompetitorsRef.current = [];
    completedRunIdRef.current = null;
    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputText, inputType }),
      signal: abortRef.current.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.competitors) {
          setCompetitors(data.competitors);
          pendingCompetitorsRef.current = data.competitors;
          // If attack already finished, save now; otherwise attack done handler will save
          if (completedRunIdRef.current) {
            saveCompetitorsToDB(completedRunIdRef.current, data.competitors);
          }
        }
      })
      .catch(() => {});

    try {
      const res = await fetch("/api/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          inputType,
          personaIds: selectedPersonas,
          threadId,
          priorRuns,
          customPersonas: customPersona ? [customPersona] : [],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const raw = line.slice(6);
          if (raw === "[DONE]") break;
          try {
            const event = JSON.parse(raw);
            if (event.type === "token") setStreamingText(t => t + event.text);
            if (event.type === "done") {
              setCurrentResult(event.result);
              setVersions(v => [...v, { v: event.result.version, score: event.result.score, date: new Date().toLocaleDateString("en", { weekday: "short" }), label: event.result.version === 1 ? "First draft" : `v${event.result.version}` }]);
              setStreamingText("");

              // Feature 4: compute diff
              const prevMap = new Map(prevAttacksRef.current.map((a: Attack) => [a.personaId, a]));
              const newMap = new Map((event.result.attacks as Attack[]).map(a => [a.personaId, a]));
              const diff: Record<string, "new" | "repeated"> = {};
              for (const a of event.result.attacks as Attack[]) {
                diff[a.personaId] = prevMap.has(a.personaId) ? "repeated" : "new";
              }
              setAttackDiff(prevAttacksRef.current.length > 0 ? diff : {});
              // Resolved = same persona ran in both, but severity genuinely dropped (High/Critical → lower)
              const resolved = prevAttacksRef.current.filter((prev: Attack) => {
                const next = newMap.get(prev.personaId);
                return next && prev.severity >= 2 && next.severity < prev.severity;
              });
              setResolvedAttacks(resolved);

              // Persist competitors — save now if research already finished, else research will save when it lands
              completedRunIdRef.current = event.result.runId;
              if (pendingCompetitorsRef.current.length > 0) {
                saveCompetitorsToDB(event.result.runId, pendingCompetitorsRef.current);
              }

              // Notify sidebar to refresh scores
              window.dispatchEvent(new CustomEvent("run-completed"));
            }
            if (event.type === "error") console.error("Attack error:", event.message);
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error(err);
    } finally {
      setIsRunning(false);
    }
  }, [inputText, inputType, selectedPersonas, isRunning, threadId, currentResult, customPersona]);

  // Feature 6: cmd+enter shortcut
  const handleRunAttackRef = useRef(handleRunAttack);
  useEffect(() => { handleRunAttackRef.current = handleRunAttack; });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunAttackRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const memoryItems = versions.length > 0 && currentResult
    ? currentResult.attacks.slice(0, 3).map((a, i) => ({ label: `${a.headline.slice(0, 40)}… — ${i === 0 ? "unresolved" : "noted"}`, resolved: i > 1 }))
    : [];

  const stats = currentResult ? [
    { label: "Runs", val: String(versions.length) },
    { label: "Personas", val: String(selectedPersonas.length) },
    { label: "Attacks", val: String(currentResult.attacks.length) },
    { label: "Score Δ", val: versions.length > 1 ? `${currentResult.score - (versions[versions.length - 2]?.score ?? 0) >= 0 ? "+" : ""}${currentResult.score - (versions[versions.length - 2]?.score ?? 0)}` : "—" },
  ] : [];

  const canRun = inputText.trim().length > 0 && selectedPersonas.length > 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>

      {/* Custom persona modal */}
      {showCustomModal && (
        <CustomPersonaModal
          onAdd={(persona) => {
            setCustomPersona(persona);
            setShowCustomModal(false);
            // Auto-add to selected if not already selected
            setSelectedPersonas(s => s.includes(persona.id) ? s : [...s, persona.id]);
          }}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {/* Topbar */}
      <div style={{
        height: 56, borderBottom: "2px solid #2d2d2d",
        display: "flex", alignItems: "center",
        padding: isMobile ? "0 12px 0 52px" : "0 20px", gap: 12, flexShrink: 0,
        background: "#fdfbf7",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)" }}>Thread /</span>

          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setEditingTitle(false); } }}
              autoFocus
              style={{
                fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17,
                color: "#2d2d2d", background: "#fff",
                border: "2px solid #2d5da1",
                borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                padding: "3px 10px",
                outline: "none",
                boxShadow: "2px 2px 0px 0px #2d5da1",
                minWidth: 180, maxWidth: 320,
              }}
            />
          ) : (
            <span
              onClick={startEditing}
              title="Click to rename"
              style={{
                fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17,
                color: "#2d2d2d", cursor: "text",
                padding: "2px 8px",
                borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                border: "2px dashed transparent",
                transition: "border-color 0.1s, background 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.background = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
            >
              {threadTitle}
            </span>
          )}

          {versions.length > 0 && (
            <span style={{
              fontSize: 11, color: "#ff4d4d",
              border: "2px solid #ff4d4d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              padding: "1px 8px", fontFamily: "var(--font-heading)", fontWeight: 700,
            }}>
              v{versions.length}
            </span>
          )}
        </div>
        <UserButton />
      </div>

      {/* Content grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", overflow: "hidden" }}>

        {/* Center */}
        <div style={{ overflowY: "auto", padding: isMobile ? 16 : 24, borderRight: isMobile ? "none" : "2px solid #2d2d2d" }}>
          <InputCard inputType={inputType} inputText={inputText} onInputTypeChange={setInputType} onInputTextChange={setInputText} />
          <PersonaSelector
            selected={selectedPersonas}
            onToggle={togglePersona}
            customPersona={customPersona}
            onOpenCustomModal={() => setShowCustomModal(true)}
            onRemoveCustomPersona={() => {
              setCustomPersona(null);
              setSelectedPersonas(s => s.filter(x => x !== "custom_1"));
            }}
          />

          {/* Run button */}
          <button
            onClick={handleRunAttack}
            disabled={isRunning || !canRun}
            title="⌘↵ to run"
            style={{
              width: "100%", padding: "15px",
              background: isRunning ? "#e5e0d8" : (canRun ? "#2d2d2d" : "#e5e0d8"),
              color: isRunning ? "#aaa" : (canRun ? "#fff" : "#aaa"),
              border: "3px solid #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              fontFamily: "var(--font-heading)",
              fontWeight: 700, fontSize: 18,
              cursor: (isRunning || !canRun) ? "default" : "pointer",
              boxShadow: (isRunning || !canRun) ? "2px 2px 0px 0px #2d2d2d" : "5px 5px 0px 0px #2d2d2d",
              transition: "all 0.1s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { if (!isRunning && canRun) { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "translate(3px, 3px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = canRun && !isRunning ? "#2d2d2d" : "#e5e0d8"; e.currentTarget.style.boxShadow = (isRunning || !canRun) ? "2px 2px 0px 0px #2d2d2d" : "5px 5px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "none"; }}
          >
            {isRunning ? "⟳ Running attack..." : "⚡ Run attack"}
          </button>

          {/* Streaming preview */}
          {isRunning && streamingText && (
            <div style={{
              marginTop: 14, padding: "14px 16px",
              background: "#fff9c4",
              border: "2px dashed #2d2d2d",
              borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
              fontSize: 13, color: "#555", lineHeight: 1.8,
              fontFamily: "var(--font-body)", maxHeight: 130,
              overflow: "hidden",
              boxShadow: "3px 3px 0px 0px #2d2d2d",
              transform: "rotate(-0.3deg)",
            }}>
              {streamingText.slice(-400)}
              <span style={{ color: "#ff4d4d", fontWeight: 700 }}>▋</span>
            </div>
          )}

          {/* Output tabs */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", gap: isMobile ? 6 : 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(isMobile ? MOBILE_TABS : DESKTOP_TABS).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: isMobile ? "7px 12px" : "8px 18px",
                    fontFamily: "var(--font-heading)", fontWeight: 700,
                    fontSize: isMobile ? 13 : 14,
                    cursor: "pointer",
                    background: activeTab === t.id ? "#2d2d2d" : "#fff",
                    color: activeTab === t.id ? "#fff" : "#2d2d2d",
                    border: "2px solid #2d2d2d",
                    borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
                    boxShadow: activeTab === t.id ? "2px 2px 0px 0px #2d2d2d" : "3px 3px 0px 0px #2d2d2d",
                    transition: "all 0.1s",
                    transform: activeTab === t.id ? "translate(1px, 1px)" : "none",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "attacks" && (
              <AttackReport
                attacks={currentResult?.attacks ?? []}
                inputText={inputText}
                diffMap={attackDiff}
                resolvedAttacks={resolvedAttacks}
              />
            )}
            {activeTab === "competitors" && <CompetitorTable competitors={competitors} />}
            {activeTab === "progress" && <ProgressPanel versions={versions} />}
            {activeTab === "score" && isMobile && (
              <RightPanel
                score={currentResult?.score ?? 0}
                verdict={currentResult?.verdict}
                weakestPoint={currentResult?.weakestPoint}
                stats={stats}
                memoryItems={memoryItems}
                versions={versions}
                exportSlot={
                  currentResult ? (
                    <PDFExportButton
                      threadTitle={threadTitle}
                      score={currentResult.score}
                      verdict={currentResult.verdict}
                      weakestPoint={currentResult.weakestPoint}
                      attacks={currentResult.attacks}
                      competitors={competitors}
                    />
                  ) : undefined
                }
              />
            )}
          </div>
        </div>

        {/* Right panel — desktop only */}
        {!isMobile && <div style={{ overflowY: "auto", borderLeft: "2px solid #2d2d2d" }}>
          <RightPanel
            score={currentResult?.score ?? 0}
            verdict={currentResult?.verdict}
            weakestPoint={currentResult?.weakestPoint}
            stats={stats}
            memoryItems={memoryItems}
            versions={versions}
            exportSlot={
              currentResult ? (
                <PDFExportButton
                  threadTitle={threadTitle}
                  score={currentResult.score}
                  verdict={currentResult.verdict}
                  weakestPoint={currentResult.weakestPoint}
                  attacks={currentResult.attacks}
                  competitors={competitors}
                />
              ) : undefined
            }
          />
        </div>}
      </div>
    </div>
  );
}
