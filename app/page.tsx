"use client";

import { useState } from "react";
import Link from "next/link";
import AttackReport from "@/components/AttackReport";
import ScoreArc from "@/components/ScoreArc";

const EXAMPLE_TEXT = `I'm building an AI job application assistant. You describe your ideal role once, and it automatically applies to 100+ matching jobs per week — customizing your resume and cover letter for each one, tracking application status, and following up on your behalf.`;

const DEMO_PERSONAS = [
  { id: "vc", name: "Skeptical VC", icon: "💼", color: "#E55", label: "Market & moat" },
  { id: "competitor", name: "Competitor CEO", icon: "⚔️", color: "#E87", label: "Copy & undercut" },
  { id: "devil", name: "Devil's advocate", icon: "😈", color: "#A8F", label: "Internal flaws" },
];

interface Attack { personaId: string; headline: string; body: string; question: string; severity: number; }

export default function LandingPage() {
  const [inputText, setInputText] = useState(EXAMPLE_TEXT);
  const [isRunning, setIsRunning] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState<{ score: number; verdict: string; weakestPoint: string; attacks: Attack[] } | null>(null);

  const handleRun = async () => {
    if (!inputText.trim() || isRunning) return;
    setIsRunning(true);
    setStreamingText("");
    setResult(null);

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText, inputType: "idea" }),
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
              setResult(event.result);
              setStreamingText("");
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fdfbf7",
      backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      color: "#2d2d2d",
    }}>
      {/* Top nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 60,
        borderBottom: "2px dashed #2d2d2d",
        background: "#fdfbf7",
        display: "flex", alignItems: "center",
        padding: "0 32px",
        justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24, color: "#2d2d2d" }}>
          redteam<span style={{ color: "#ff4d4d" }}>.</span>ai
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/sign-in" style={{
            fontFamily: "var(--font-body)", fontSize: 14,
            color: "#2d2d2d", textDecoration: "none",
            padding: "6px 14px",
          }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
            color: "#fff", textDecoration: "none",
            background: "#2d2d2d",
            padding: "8px 18px",
            border: "2px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            boxShadow: "4px 4px 0px 0px #2d2d2d",
            display: "inline-block",
          }}>
            Sign up →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "72px 24px 48px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: 48, lineHeight: 1.15,
          color: "#2d2d2d", marginBottom: 20,
        }}>
          Battle-test your idea<br />
          before the market does.{" "}
          <span style={{ color: "#ff4d4d" }}>⚡</span>
        </h1>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 16,
          color: "#555", lineHeight: 1.8,
          maxWidth: 500, margin: "0 auto",
        }}>
          Six adversarial AI personas attack your idea simultaneously — like having a skeptical VC, a competitor CEO, and a regulator in the room at once.
        </p>
      </section>

      {/* Demo card */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{
          background: "#fff",
          border: "3px solid #2d2d2d",
          borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          boxShadow: "8px 8px 0px 0px #2d2d2d",
          padding: "32px 36px",
          transform: "rotate(-0.5deg)",
          position: "relative",
        }}>
          {/* Tape decoration */}
          <div style={{
            position: "absolute", top: -14, left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            width: 60, height: 20,
            background: "rgba(255,249,196,0.9)",
            border: "1px solid #2d2d2d",
            borderRadius: 2,
          }} />

          <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 13, color: "#aaa", marginBottom: 12 }}>
            Try it now →
          </div>

          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={6}
            style={{
              width: "100%",
              fontFamily: "var(--font-body)", fontSize: 14,
              padding: "14px 16px",
              border: "2px solid #2d2d2d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              background: "#fdfbf7",
              color: "#2d2d2d",
              resize: "vertical",
              outline: "none",
              lineHeight: 1.7,
              boxSizing: "border-box",
              marginBottom: 16,
            }}
          />

          {/* Demo persona chips (locked) */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {DEMO_PERSONAS.map(p => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px",
                background: `${p.color}18`,
                border: `2px solid ${p.color}`,
                borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
                boxShadow: `2px 2px 0px 0px ${p.color}`,
              }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 700, color: p.color }}>{p.name}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--font-body)", marginBottom: 20, fontStyle: "italic" }}>
            Showing 3 of 6 attackers.{" "}
            <Link href="/sign-up" style={{ color: "#2d5da1", textDecoration: "underline" }}>Sign up for all 6.</Link>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning || !inputText.trim()}
            style={{
              width: "100%", padding: "16px",
              fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18,
              background: isRunning || !inputText.trim() ? "#e5e0d8" : "#2d2d2d",
              color: isRunning || !inputText.trim() ? "#aaa" : "#fff",
              border: "3px solid #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              cursor: isRunning || !inputText.trim() ? "default" : "pointer",
              boxShadow: isRunning || !inputText.trim() ? "2px 2px 0px 0px #2d2d2d" : "5px 5px 0px 0px #2d2d2d",
              transition: "all 0.1s",
            }}
            onMouseEnter={e => { if (!isRunning && inputText.trim()) { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "translate(3px,3px)"; } }}
            onMouseLeave={e => { if (!isRunning && inputText.trim()) { e.currentTarget.style.background = "#2d2d2d"; e.currentTarget.style.boxShadow = "5px 5px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "none"; } }}
          >
            {isRunning ? "⟳ Running attack..." : "⚡ Run free attack"}
          </button>
        </div>
      </section>

      {/* Streaming preview */}
      {isRunning && streamingText && (
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 32px" }}>
          <div style={{
            padding: "14px 16px",
            background: "#fff9c4",
            border: "2px dashed #2d2d2d",
            borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
            fontSize: 13, color: "#555", lineHeight: 1.8,
            fontFamily: "var(--font-body)", maxHeight: 160,
            overflow: "hidden",
            boxShadow: "3px 3px 0px 0px #2d2d2d",
            transform: "rotate(-0.3deg)",
          }}>
            {streamingText.slice(-500)}
            <span style={{ color: "#ff4d4d", fontWeight: 700 }}>▋</span>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <>
          <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 32px" }}>
            {/* Score + verdict */}
            <div style={{
              display: "flex", alignItems: "center", gap: 24,
              background: "#fff", border: "2px solid #2d2d2d",
              borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
              boxShadow: "5px 5px 0px 0px #2d2d2d",
              padding: "20px 24px", marginBottom: 20,
            }}>
              <ScoreArc score={result.score} />
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "#2d2d2d", marginBottom: 4 }}>
                  {result.verdict}
                </div>
                <div style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)" }}>
                  Survivability score
                </div>
              </div>
            </div>

            {/* Attacks */}
            <AttackReport attacks={result.attacks} inputText={inputText} />

            {/* Weakest point */}
            <div style={{
              marginTop: 16,
              padding: "16px 20px",
              border: "2px dashed #ff4d4d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              background: "#fff",
              boxShadow: "4px 4px 0px 0px #ff4d4d",
            }}>
              <div style={{ fontSize: 12, color: "#ff4d4d", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                ⚠ Weakest point
              </div>
              <p style={{ fontSize: 14, color: "#2d2d2d", fontFamily: "var(--font-body)", lineHeight: 1.7, margin: 0 }}>
                {result.weakestPoint}
              </p>
            </div>
          </section>

          {/* CTA card */}
          <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 80px" }}>
            <div style={{
              background: "#fff9c4",
              border: "3px solid #2d2d2d",
              borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
              boxShadow: "8px 8px 0px 0px #2d2d2d",
              padding: "36px 40px",
              transform: "rotate(1deg)",
            }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 26, color: "#2d2d2d", marginBottom: 20 }}>
                🔒 Unlock the full stress-test
              </div>
              <ul style={{ listStyle: "none", marginBottom: 28 }}>
                {[
                  "✓ All 6 adversarial personas",
                  "✓ Save results & track progress over time",
                  "✓ Competitive intel on your market",
                  "✓ Custom personas & PDF export",
                  "✓ Re-run diff to see what improved",
                ].map((item, i) => (
                  <li key={i} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#2d2d2d", lineHeight: 2 }}>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 12 }}>
                <Link href="/sign-up" style={{
                  flex: 2,
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  padding: "13px 0",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
                  background: "#ff4d4d", color: "#fff",
                  border: "2px solid #2d2d2d",
                  borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                  boxShadow: "4px 4px 0px 0px #2d2d2d",
                }}>
                  Create free account →
                </Link>
                <Link href="/sign-in" style={{
                  flex: 1,
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  padding: "13px 0",
                  fontFamily: "var(--font-body)", fontSize: 14,
                  background: "transparent", color: "#2d2d2d",
                  border: "2px dashed #2d2d2d",
                  borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                }}>
                  Sign in
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
