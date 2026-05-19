"use client";

import React from "react";
import ScoreArc from "./ScoreArc";

interface MemoryItem { label: string; resolved: boolean; }
interface RightPanelProps {
  score: number;
  verdict?: string;
  weakestPoint?: string;
  stats?: { label: string; val: string }[];
  memoryItems?: MemoryItem[];
  versions?: { score: number }[];
  exportSlot?: React.ReactNode;
}

function MiniSparkline({ versions }: { versions: { score: number }[] }) {
  const w = 80, h = 28;
  if (versions.length < 2) return null;
  const pts = versions.map((v, i) => {
    const x = (i / (versions.length - 1)) * w;
    const y = h - (v.score / 100) * h;
    return `${x},${y}`;
  }).join(" ");
  const delta = versions[versions.length - 1].score - versions[versions.length - 2].score;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polyline points={pts} fill="none" stroke="#2d2d2d" strokeWidth="2" strokeLinejoin="round" />
        {versions.map((v, i) => {
          const x = (i / (versions.length - 1)) * w;
          const y = h - (v.score / 100) * h;
          return <circle key={i} cx={x} cy={y} r="3" fill={i === versions.length - 1 ? "#ff4d4d" : "#e5e0d8"} stroke="#2d2d2d" strokeWidth="1.5" />;
        })}
      </svg>
      <span style={{ fontSize: 13, fontWeight: 700, color: delta >= 0 ? "#22c55e" : "#ff4d4d", fontFamily: "var(--font-heading)" }}>
        {delta >= 0 ? "+" : ""}{delta}
      </span>
    </div>
  );
}

const verdictLabel = (s: number) => s === 0 ? "No score yet" : s < 40 ? "Needs work" : s < 65 ? "Fragile" : "Strong";
const verdictColor = (s: number) => s === 0 ? "#aaa" : s < 40 ? "#ff4d4d" : s < 65 ? "#f59e0b" : "#22c55e";

const Divider = () => <div style={{ height: 0, borderTop: "2px dashed #e5e0d8", margin: "18px 0" }} />;

export default function RightPanel({ score, verdict, weakestPoint, stats = [], memoryItems = [], versions = [], exportSlot }: RightPanelProps) {
  return (
    <div style={{ padding: 20 }}>

      {/* Score */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-body)" }}>
          Current score
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <ScoreArc score={score} />
        </div>
        {verdict && (
          <div style={{ fontSize: 14, color: verdictColor(score), fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: 4, lineHeight: 1.4, padding: "0 8px" }}>
            {verdict}
          </div>
        )}
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6, fontFamily: "var(--font-body)" }}>
          {score === 0 ? "Run an attack to score" : "out of 100"}
        </div>
        {versions.length >= 2 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <MiniSparkline versions={versions} />
          </div>
        )}
      </div>

      {weakestPoint && (
        <>
          <Divider />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-body)" }}>Weakest point</div>
            <div style={{
              background: "#fff0f0", border: "2px dashed #ff4d4d",
              borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
              padding: "12px 14px",
              boxShadow: "3px 3px 0px 0px #ff4d4d44",
            }}>
              <div style={{ fontSize: 13, color: "#c0392b", lineHeight: 1.7, fontFamily: "var(--font-body)" }}>{weakestPoint}</div>
            </div>
          </div>
        </>
      )}

      {stats.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-body)" }}>Thread summary</div>
            {stats.map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e5e0d8" }}>
                <span style={{ fontSize: 13, color: "#555", fontFamily: "var(--font-body)" }}>{label}</span>
                <span style={{ fontSize: 13, color: "#2d2d2d", fontFamily: "var(--font-heading)", fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {memoryItems.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-body)" }}>Context memory</div>
            <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic", fontFamily: "var(--font-body)" }}>The agent remembers all prior runs in this thread.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {memoryItems.map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: item.resolved ? "#22c55e" : "#f97316", display: "flex", gap: 8, alignItems: "flex-start", fontFamily: "var(--font-body)" }}>
                  <span style={{ marginTop: 1 }}>{item.resolved ? "✓" : "○"}</span>
                  <span style={{ lineHeight: 1.5 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Divider />
      {exportSlot ?? (
        <button style={{
          width: "100%", padding: "11px",
          background: "#fff", border: "2px solid #2d2d2d",
          borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
          color: "#2d2d2d",
          fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
          cursor: "pointer",
          boxShadow: "3px 3px 0px 0px #2d2d2d",
          transition: "all 0.1s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#2d2d2d"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "1px 1px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "translate(2px, 2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2d2d2d"; e.currentTarget.style.boxShadow = "3px 3px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "none"; }}
        >
          ↓ Export PDF report
        </button>
      )}

      <a
        href="https://ko-fi.com/ishaanbaranwal"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block", textAlign: "center", textDecoration: "none",
          marginTop: 10, padding: "9px 0",
          fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa",
          border: "2px dashed #e5e0d8",
          borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#2d2d2d"; (e.currentTarget as HTMLElement).style.borderColor = "#2d2d2d"; (e.currentTarget as HTMLElement).style.background = "#fff9c4"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#aaa"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e0d8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        ☕ Buy me a coffee
      </a>
    </div>
  );
}
