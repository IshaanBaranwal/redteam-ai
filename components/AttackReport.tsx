"use client";

import { useState } from "react";
import { PERSONAS } from "@/lib/personas";

const SEV_COLOR = ["#22c55e", "#f59e0b", "#f97316", "#ff4d4d"];
const SEV_LABEL = ["Low", "Medium", "High", "Critical"];
const ROTATIONS = [-1.2, 0.8, -0.5, 1.1, -0.8, 0.6, -1.0, 0.7];

interface Attack { personaId: string; headline: string; body: string; question: string; severity: number; }

function AttackCard({
  attack,
  index,
  inputText,
  diffBadge,
  personaName,
  personaRole,
}: {
  attack: Attack;
  index: number;
  inputText?: string;
  diffBadge?: "new" | "repeated";
  personaName: string;
  personaRole: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const persona = PERSONAS.find(p => p.id === attack.personaId) ?? { name: personaName, role: personaRole, icon: "🎯", color: "#aaa" };
  const rot = ROTATIONS[index % ROTATIONS.length];

  const [defending, setDefending] = useState(false);
  const [defense, setDefense] = useState("");
  const [defenseResult, setDefenseResult] = useState<{ response: string; verdict: "addressed" | "partial" | "vulnerable" } | null>(null);
  const [defenseLoading, setDefenseLoading] = useState(false);

  const verdictColor = (v: "addressed" | "partial" | "vulnerable") => {
    if (v === "addressed") return "#22c55e";
    if (v === "partial") return "#f59e0b";
    return "#ff4d4d";
  };

  const handleDefend = async () => {
    if (!defense.trim() || defenseLoading) return;
    setDefenseLoading(true);
    try {
      const res = await fetch("/api/attack/defend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: attack.personaId,
          personaName: persona.name,
          personaRole: persona.role,
          headline: attack.headline,
          body: attack.body,
          question: attack.question,
          defense,
          inputText: inputText ?? "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDefenseResult(data);
        setDefending(false);
      }
    } catch {}
    finally { setDefenseLoading(false); }
  };

  return (
    <div style={{
      border: "2px solid #2d2d2d",
      borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
      marginBottom: 16,
      overflow: "hidden",
      background: "#fff9c4",
      boxShadow: "5px 5px 0px 0px #2d2d2d",
      transform: `rotate(${rot}deg)`,
      transition: "transform 0.1s, box-shadow 0.1s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = `rotate(${rot * 0.3}deg) translate(-2px, -2px)`; e.currentTarget.style.boxShadow = "7px 7px 0px 0px #2d2d2d"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rot}deg)`; e.currentTarget.style.boxShadow = "5px 5px 0px 0px #2d2d2d"; }}
    >
      <div onClick={() => setExpanded(e => !e)} style={{
        padding: "14px 18px",
        display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
        borderBottom: expanded ? "2px dashed #2d2d2d" : "none",
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{persona.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: persona.color, fontFamily: "var(--font-heading)", fontWeight: 700, letterSpacing: "0.04em" }}>
              {persona.name}
            </span>
            <span style={{
              fontSize: 11, padding: "2px 10px",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              fontFamily: "var(--font-heading)", fontWeight: 700,
              background: `${SEV_COLOR[attack.severity]}22`,
              color: SEV_COLOR[attack.severity],
              border: `2px solid ${SEV_COLOR[attack.severity]}`,
              boxShadow: `2px 2px 0px 0px ${SEV_COLOR[attack.severity]}`,
            }}>
              {SEV_LABEL[attack.severity]}
            </span>
            {diffBadge === "new" && (
              <span style={{
                fontSize: 10, padding: "2px 8px",
                borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
                fontFamily: "var(--font-heading)", fontWeight: 700,
                background: "#ff4d4d", color: "#fff",
                border: "2px solid #2d2d2d",
                boxShadow: "2px 2px 0px 0px #2d2d2d",
              }}>NEW</span>
            )}
            {diffBadge === "repeated" && (
              <span style={{
                fontSize: 11, padding: "2px 8px",
                borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
                fontFamily: "var(--font-heading)", fontWeight: 700,
                background: "#fff9c4", color: "#2d2d2d",
                border: "2px dashed #aaa",
              }}>↻</span>
            )}
          </div>
          <div style={{ fontSize: 15, color: "#2d2d2d", fontFamily: "var(--font-heading)", fontWeight: 700, lineHeight: 1.3 }}>
            {attack.headline}
          </div>
        </div>
        <span style={{ fontSize: 16, color: "#aaa", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2d2d2d", fontFamily: "var(--font-body)" }}>
          <p style={{ marginBottom: 14 }}>{attack.body}</p>
          <p style={{
            borderLeft: `3px solid ${persona.color}`,
            paddingLeft: 14,
            color: "#555",
            fontStyle: "italic",
            fontSize: 14,
            background: `${persona.color}10`,
            padding: "10px 14px",
            borderRadius: "0 8px 8px 0",
            border: `1px dashed ${persona.color}`,
          }}>
            "{attack.question}"
          </p>

          {/* Defend result */}
          {defenseResult && (
            <div style={{
              marginTop: 14, padding: "12px 14px",
              background: "#fff",
              border: "2px solid #2d2d2d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              boxShadow: "3px 3px 0px 0px #2d2d2d",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{persona.icon}</span>
                <span style={{
                  fontSize: 11, padding: "2px 10px",
                  borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
                  fontFamily: "var(--font-heading)", fontWeight: 700,
                  background: verdictColor(defenseResult.verdict),
                  color: "#fff",
                  border: "2px solid #2d2d2d",
                  boxShadow: "2px 2px 0px 0px #2d2d2d",
                  textTransform: "uppercase",
                }}>
                  {defenseResult.verdict}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#2d2d2d", lineHeight: 1.7, margin: 0 }}>
                {defenseResult.response}
              </p>
            </div>
          )}

          {/* Defend button */}
          {!defending && !defenseResult && (
            <button
              onClick={() => setDefending(true)}
              style={{
                marginTop: 12,
                padding: "6px 14px",
                fontSize: 12,
                fontFamily: "var(--font-body)",
                background: "transparent",
                border: "2px dashed #2d2d2d",
                borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                cursor: "pointer",
                color: "#2d2d2d",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderStyle = "solid"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2d2d2d"; e.currentTarget.style.borderStyle = "dashed"; }}
            >
              ↩ Defend this
            </button>
          )}

          {defenseResult && !defending && (
            <button
              onClick={() => { setDefenseResult(null); setDefense(""); setDefending(true); }}
              style={{
                marginTop: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontFamily: "var(--font-body)",
                background: "transparent",
                border: "2px dashed #aaa",
                borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                cursor: "pointer",
                color: "#aaa",
              }}
            >
              Try again
            </button>
          )}

          {/* Defend textarea */}
          {defending && (
            <div style={{ marginTop: 12 }}>
              <textarea
                value={defense}
                onChange={e => setDefense(e.target.value)}
                placeholder="Write your defense here..."
                rows={3}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  padding: "10px 12px",
                  border: "2px solid #2d2d2d",
                  borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
                  background: "#fff",
                  color: "#2d2d2d",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={handleDefend}
                  disabled={defenseLoading || !defense.trim()}
                  style={{
                    padding: "7px 16px",
                    fontSize: 12,
                    fontFamily: "var(--font-heading)", fontWeight: 700,
                    background: defenseLoading || !defense.trim() ? "#e5e0d8" : "#2d2d2d",
                    color: defenseLoading || !defense.trim() ? "#aaa" : "#fff",
                    border: "2px solid #2d2d2d",
                    borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                    cursor: defenseLoading || !defense.trim() ? "default" : "pointer",
                    boxShadow: "3px 3px 0px 0px #2d2d2d",
                  }}
                >
                  {defenseLoading ? "Thinking..." : "Submit defense"}
                </button>
                <button
                  onClick={() => { setDefending(false); setDefense(""); }}
                  style={{
                    padding: "7px 14px",
                    fontSize: 12,
                    fontFamily: "var(--font-body)",
                    background: "#e5e0d8",
                    color: "#2d2d2d",
                    border: "2px dashed #2d2d2d",
                    borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AttackReportProps {
  attacks: Attack[];
  inputText?: string;
  diffMap?: Record<string, "new" | "repeated">;
  resolvedAttacks?: Attack[];
}

export default function AttackReport({ attacks, inputText, diffMap, resolvedAttacks }: AttackReportProps) {
  const [resolvedOpen, setResolvedOpen] = useState(false);

  if (attacks.length === 0 && (!resolvedAttacks || resolvedAttacks.length === 0)) return (
    <div style={{ textAlign: "center", padding: "52px 0", color: "#aaa", fontSize: 14, fontFamily: "var(--font-body)", fontStyle: "italic" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🌤️</div>
      No attacks yet. Run the agent to generate a report.
    </div>
  );

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Resolved attacks */}
      {resolvedAttacks && resolvedAttacks.length > 0 && (
        <div style={{
          marginBottom: 20,
          border: "2px dashed #22c55e",
          borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
          background: "#f0fdf4",
          overflow: "hidden",
        }}>
          <button
            onClick={() => setResolvedOpen(o => !o)}
            style={{
              width: "100%", textAlign: "left",
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, color: "#22c55e", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
              ✓ Resolved from previous run ({resolvedAttacks.length})
            </span>
            <span style={{ fontSize: 12, color: "#22c55e" }}>{resolvedOpen ? "▲" : "▼"}</span>
          </button>
          {resolvedOpen && (
            <div style={{ padding: "0 16px 14px" }}>
              {resolvedAttacks.map((a, i) => {
                const p = PERSONAS.find(x => x.id === a.personaId);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, opacity: 0.7 }}>
                    <span style={{ fontSize: 14 }}>{p?.icon ?? "🎯"}</span>
                    <span style={{ fontSize: 13, color: "#555", fontFamily: "var(--font-body)", textDecoration: "line-through" }}>
                      {a.headline}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active attacks */}
      {attacks.map((a, i) => {
        const persona = PERSONAS.find(p => p.id === a.personaId) ?? { name: a.personaId, role: "", icon: "🎯", color: "#aaa" };
        return (
          <AttackCard
            key={i}
            attack={a}
            index={i}
            inputText={inputText}
            diffBadge={diffMap?.[a.personaId]}
            personaName={persona.name}
            personaRole={persona.role}
          />
        );
      })}
    </div>
  );
}
