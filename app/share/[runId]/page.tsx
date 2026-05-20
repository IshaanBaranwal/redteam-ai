"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ScoreArc from "@/components/ScoreArc";
import AttackReport from "@/components/AttackReport";

interface Attack { personaId: string; headline: string; body: string; question: string; severity: number; }
interface ShareData {
  threadTitle: string;
  version: number;
  score: number;
  verdict: string;
  weakestPoint: string;
  inputType: string;
  attacks: Attack[];
}

const severityLabel = (s: number) => ["Low", "Medium", "High", "Critical"][s] ?? "Unknown";
const scoreColor = (s: number) => s < 40 ? "#ff4d4d" : s < 65 ? "#f59e0b" : "#22c55e";

export default function SharePage() {
  const { runId } = useParams<{ runId: string }>();
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${runId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true));
  }, [runId]);

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#fdfbf7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: "var(--font-body)", color: "#aaa" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤷</div>
        <div style={{ fontSize: 18, color: "#2d2d2d", marginBottom: 8, fontFamily: "var(--font-heading)", fontWeight: 700 }}>Result not found</div>
        <div style={{ marginBottom: 24 }}>This link may have expired or been deleted.</div>
        <Link href="/" style={{ color: "#ff4d4d", textDecoration: "underline" }}>Try redteam.ai</Link>
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#fdfbf7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-body)", color: "#aaa", fontSize: 14 }}>Loading...</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fdfbf7",
      backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      color: "#2d2d2d",
    }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "2px dashed #2d2d2d",
        background: "#fdfbf7",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", gap: 8,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: "#2d2d2d" }}>
            redteam<span style={{ color: "#ff4d4d" }}>.</span>ai
          </div>
        </Link>
        <Link href="/sign-up" style={{
          fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
          color: "#fff", textDecoration: "none",
          background: "#ff4d4d", padding: "8px 20px",
          border: "2px solid #2d2d2d",
          borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
          boxShadow: "3px 3px 0px 0px #2d2d2d",
          display: "inline-block",
        }}>
          Try it free →
        </Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: "#aaa", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Attack report · v{data.version}
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(22px, 4vw, 32px)", color: "#2d2d2d", lineHeight: 1.2, marginBottom: 0 }}>
            {data.threadTitle}
          </h1>
        </div>

        {/* Score card */}
        <div style={{
          background: "#fff",
          border: "3px solid #2d2d2d",
          borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
          boxShadow: "6px 6px 0px 0px #2d2d2d",
          padding: "28px 32px",
          display: "flex", alignItems: "center", gap: 28,
          marginBottom: 28,
        }}>
          <ScoreArc score={data.score} />
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: scoreColor(data.score), marginBottom: 6, lineHeight: 1.3 }}>
              {data.verdict}
            </div>
            <div style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)" }}>Survivability score out of 100</div>
          </div>
        </div>

        {/* Weakest point */}
        {data.weakestPoint && (
          <div style={{
            background: "#fff0f0", border: "2px dashed #ff4d4d",
            borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
            padding: "16px 20px", marginBottom: 28,
            boxShadow: "3px 3px 0px 0px #ff4d4d44",
          }}>
            <div style={{ fontSize: 11, color: "#ff4d4d", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              ⚠ Weakest point
            </div>
            <div style={{ fontSize: 14, color: "#c0392b", lineHeight: 1.7, fontFamily: "var(--font-body)" }}>{data.weakestPoint}</div>
          </div>
        )}

        {/* Attacks */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "#2d2d2d", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {data.attacks.length} attacks
          </div>
          <AttackReport attacks={data.attacks} inputText="" />
        </div>

        {/* Attribution */}
        <div style={{ fontSize: 12, color: "#aaa", fontFamily: "var(--font-body)", marginBottom: 8, textAlign: "center" }}>
          Generated by {data.attacks.length} adversarial AI personas on{" "}
          <Link href="/" style={{ color: "#ff4d4d", textDecoration: "none" }}>redteam.ai</Link>
        </div>

        {/* CTA */}
        <div style={{
          background: "#fff9c4",
          border: "3px solid #2d2d2d",
          borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          boxShadow: "8px 8px 0px 0px #2d2d2d",
          padding: "36px 40px",
          textAlign: "center",
          transform: "rotate(0.3deg)",
        }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24, color: "#2d2d2d", marginBottom: 12 }}>
            Stress-test your own idea
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
            6 adversarial AI personas attack your idea so you find the real weaknesses before investors, competitors, and customers do.
          </p>
          <Link href="/sign-up" style={{
            display: "inline-block", textDecoration: "none",
            padding: "14px 36px",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
            background: "#ff4d4d", color: "#fff",
            border: "2px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            boxShadow: "4px 4px 0px 0px #2d2d2d",
          }}>
            Try it free — no sign-up needed →
          </Link>
        </div>
      </div>
    </div>
  );
}
