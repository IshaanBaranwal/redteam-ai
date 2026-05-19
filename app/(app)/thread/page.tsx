"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PERSONAS = [
  { label: "Skeptical VC", color: "#6366F1" },
  { label: "Competitor CEO", color: "#ff4d4d" },
  { label: "Regulator", color: "#f59e0b" },
  { label: "Angry Customer", color: "#ec4899" },
  { label: "Devil's Advocate", color: "#8B5CF6" },
  { label: "Journalist", color: "#22c55e" },
];

const ROTATIONS = [-1.5, 0.8, -0.5, 1.2, -1, 0.6];

export default function ThreadIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      router.push(`/thread/${data.thread.id}`);
    } catch (e) {
      setError((e as Error).message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflow: "auto" }}>

      {/* Main card */}
      <div style={{
        width: "100%", maxWidth: 500,
        background: "#fff",
        border: "3px solid #2d2d2d",
        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
        boxShadow: "8px 8px 0px 0px #2d2d2d",
        padding: "52px 44px 44px",
        textAlign: "center",
        position: "relative",
        transform: "rotate(-0.5deg)",
      }}>

        {/* Tape decoration */}
        <div style={{
          position: "absolute", top: -14, left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: 80, height: 28,
          background: "rgba(229,224,216,0.85)",
          border: "1px solid #ccc",
          borderRadius: 4,
          zIndex: 1,
        }} />

        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>

        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: 36,
          color: "#2d2d2d",
          lineHeight: 1.2,
          marginBottom: 14,
        }}>
          Stress-test<br />
          <span style={{ color: "#ff4d4d" }}>your ideas.</span>
        </h1>

        <p style={{ fontSize: 16, color: "#555", lineHeight: 1.65, marginBottom: 36, fontFamily: "var(--font-body)" }}>
          Paste a startup idea, pitch deck, PRD, or strategy.<br />
          Six adversarial personas attack it simultaneously.
        </p>

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            padding: "14px 36px",
            background: loading ? "#e5e0d8" : "#fff",
            color: loading ? "#aaa" : "#2d2d2d",
            border: "3px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: 18,
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "2px 2px 0px 0px #2d2d2d" : "5px 5px 0px 0px #2d2d2d",
            transition: "all 0.1s",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "translate(3px, 3px)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2d2d2d"; e.currentTarget.style.boxShadow = "5px 5px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "none"; }}
        >
          {loading ? (
            <><span style={{ display: "inline-block", animation: "spin 0.7s linear infinite", fontSize: 16 }}>◌</span> Creating...</>
          ) : "⚡ New Thread"}
        </button>

        {error && (
          <p style={{ marginTop: 16, fontSize: 13, color: "#ff4d4d", fontFamily: "var(--font-body)", border: "1.5px dashed #ff4d4d", padding: "8px 14px", borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px" }}>
            {error}
          </p>
        )}
      </div>

      {/* Persona chips */}
      <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 520 }}>
        {PERSONAS.map((p, i) => (
          <div key={p.label} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "6px 16px",
            borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
            background: "#fff",
            border: "2px solid #2d2d2d",
            fontSize: 13, color: "#2d2d2d",
            fontFamily: "var(--font-body)",
            boxShadow: "2px 2px 0px 0px #2d2d2d",
            transform: `rotate(${ROTATIONS[i]}deg)`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, border: "1.5px solid #2d2d2d" }} />
            {p.label}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
