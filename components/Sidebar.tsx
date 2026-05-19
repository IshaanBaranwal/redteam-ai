"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Thread { id: string; title: string; score: number; runs: number; date: string; scores: number[]; }

const scoreColor = (s: number) =>
  s === 0 ? "#aaa" : s < 40 ? "#ff4d4d" : s < 65 ? "#f59e0b" : "#22c55e";

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const W = 44, H = 16;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - ((s - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const lastScore = scores[scores.length - 1];
  const color = scoreColor(lastScore);
  const [lx, ly] = pts[pts.length - 1].split(",").map(Number);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lx} cy={ly} r={2.5} fill={color} />
    </svg>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [creating, setCreating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/threads");
      if (res.ok) { const d = await res.json(); setThreads(d.threads ?? []); }
    } catch {}
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads, pathname]);

  useEffect(() => {
    const handler = () => fetchThreads();
    window.addEventListener("thread-renamed", handler);
    window.addEventListener("run-completed", handler);
    return () => {
      window.removeEventListener("thread-renamed", handler);
      window.removeEventListener("run-completed", handler);
    };
  }, [fetchThreads]);

  const handleNewThread = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (res.ok) { await fetchThreads(); router.push(`/thread/${data.thread.id}`); }
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: "fixed", top: 14, left: 14, zIndex: 20,
          background: "#fff", border: "2px solid #2d2d2d",
          borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
          color: "#2d2d2d", cursor: "pointer", fontSize: 16,
          padding: "4px 10px", boxShadow: "3px 3px 0px 0px #2d2d2d",
          fontFamily: "var(--font-body)",
        }}>☰</button>
      )}

      <div style={{
        width: open ? 248 : 0,
        minWidth: open ? 248 : 0,
        backgroundColor: "#fdfbf7",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        borderRight: "3px solid #2d2d2d",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s, min-width 0.25s",
        overflow: "hidden", flexShrink: 0,
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 18px 16px",
          borderBottom: "2px dashed #2d2d2d",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <Link href="/thread" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: "#2d2d2d", lineHeight: 1 }}>
              redteam<span style={{ color: "#ff4d4d" }}>.</span>ai
            </div>
          </Link>
          <button onClick={() => setOpen(false)} style={{
            background: "none", border: "2px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            color: "#2d2d2d", cursor: "pointer", fontSize: 12,
            padding: "2px 7px", fontFamily: "var(--font-body)",
          }}>✕</button>
        </div>

        {/* Thread list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          <div style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 6, fontFamily: "var(--font-body)" }}>
            Threads
          </div>

          {threads.length === 0 && (
            <div style={{ padding: "12px 8px", fontSize: 14, color: "#aaa", fontStyle: "italic", fontFamily: "var(--font-body)" }}>
              No threads yet...
            </div>
          )}

          {threads.map(t => {
            const active = pathname === `/thread/${t.id}`;
            return (
              <Link key={t.id} href={`/thread/${t.id}`} style={{ textDecoration: "none", display: "block", marginBottom: 6 }}>
                <div style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
                  border: active ? "2px solid #2d2d2d" : "1.5px dashed #ccc",
                  background: active ? "#fff" : "transparent",
                  boxShadow: active ? "3px 3px 0px 0px #2d2d2d" : "none",
                  transition: "all 0.1s",
                  transform: active ? "none" : undefined,
                }}>
                  <div style={{ fontSize: 13, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: active ? "#2d2d2d" : "#555", fontWeight: active ? 700 : 400, fontFamily: "var(--font-body)" }}>
                    {t.title}
                  </div>
                  {t.scores && t.scores.length >= 2 && (
                    <div style={{ marginBottom: 4 }}>
                      <Sparkline scores={t.scores} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(t.score), fontFamily: "var(--font-heading)" }}>{t.score || "—"}</span>
                    <span style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--font-body)" }}>{t.runs}v · {t.date}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* New thread */}
        <div style={{ padding: "10px 12px 16px" }}>
          <button
            onClick={handleNewThread}
            disabled={creating}
            style={{
              width: "100%", padding: "11px 14px",
              background: creating ? "#e5e0d8" : "#fff",
              border: "2px dashed #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              color: creating ? "#aaa" : "#2d2d2d",
              fontSize: 14, fontWeight: 400,
              cursor: creating ? "default" : "pointer",
              fontFamily: "var(--font-body)",
              boxShadow: creating ? "none" : "3px 3px 0px 0px #2d2d2d",
              transition: "all 0.1s",
            }}
            onMouseEnter={e => { if (!creating) { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "1px 1px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "translate(2px, 2px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = creating ? "#e5e0d8" : "#fff"; e.currentTarget.style.color = creating ? "#aaa" : "#2d2d2d"; e.currentTarget.style.boxShadow = creating ? "none" : "3px 3px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "none"; }}
          >
            {creating ? "Creating..." : "+ New thread"}
          </button>
        </div>
      </div>
    </>
  );
}
