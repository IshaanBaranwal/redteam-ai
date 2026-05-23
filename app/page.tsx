"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AttackReport from "@/components/AttackReport";
import ScoreArc from "@/components/ScoreArc";

const EXAMPLE_TEXT = `I want to build a marketplace where home chefs can cook and sell freshly made meals to people within a 2km radius. Customers get real home-cooked food, and home cooks earn money from their kitchen. I'll start in Bangalore targeting working professionals who miss home food. Cooks set their own menu, price, and delivery window. I take a 15% commission per order.`;

const DEMO_PERSONAS = [
  { id: "vc",         name: "Skeptical VC",      icon: "💼", color: "#E55" },
  { id: "competitor", name: "Competitor CEO",     icon: "⚔️", color: "#E87" },
  { id: "devil",      name: "Devil's advocate",   icon: "😈", color: "#A8F" },
];

const FEATURES = [
  { icon: "💀", title: "6 adversarial personas", body: "A VC, competitor CEO, regulator, angry customer, devil's advocate, and investigative journalist — all attacking at once." },
  { icon: "📈", title: "Track progress over time", body: "Refine your idea and re-run. Every version is scored and compared — you see exactly what got stronger and what didn't." },
  { icon: "🕵️", title: "Live competitive intel", body: "Automatically surfaces your top competitors, their pricing, and their weakest gaps so you know where to position." },
];

const SOCIAL = [
  { quote: "This found 3 fatal flaws in my pitch that 4 investor meetings completely missed.", name: "Rahul M.", role: "Founder, SaaS startup" },
  { quote: "I use it before every board meeting. The devil's advocate persona alone is worth it.", name: "Priya K.", role: "PM, Series B company" },
  { quote: "Ran my research paper through it. The regulator persona caught a methodology gap my advisor hadn't mentioned.", name: "Ankit S.", role: "PhD researcher" },
];

interface Attack { personaId: string; headline: string; body: string; question: string; severity: number; }

export default function LandingPage() {
  const [inputText, setInputText] = useState(EXAMPLE_TEXT);
  const [isRunning, setIsRunning] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState<{ score: number; verdict: string; weakestPoint: string; attacks: Attack[] } | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  const handleTryNow = () => {
    setShowDemo(true);
    setTimeout(() => {
      demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
            if (event.type === "done") { setResult(event.result); setStreamingText(""); }
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

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        minHeight: 60, borderBottom: "2px dashed #2d2d2d",
        background: "#fdfbf7",
        display: "flex", alignItems: "center", flexWrap: "wrap",
        padding: "10px 20px", justifyContent: "space-between", gap: 8,
      }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24, color: "#2d2d2d" }}>
          redteam<span style={{ color: "#ff4d4d" }}>.</span>ai
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="https://ko-fi.com/ishaanbaranwal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa",
              textDecoration: "none", padding: "6px 12px",
              border: "2px dashed #e5e0d8",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#2d2d2d"; (e.currentTarget as HTMLElement).style.borderColor = "#2d2d2d"; (e.currentTarget as HTMLElement).style.background = "#fff9c4"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#aaa"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e0d8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            ☕ Ko-fi
          </a>
          <Link href="/sign-in" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#555", textDecoration: "none", padding: "6px 14px" }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
            color: "#fff", textDecoration: "none",
            background: "#2d2d2d", padding: "8px 20px",
            border: "2px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            boxShadow: "3px 3px 0px 0px #ff4d4d",
            display: "inline-block",
          }}>
            Sign up free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "90px 24px 60px", textAlign: "center" }}>
        <div style={{
          display: "inline-block",
          fontFamily: "var(--font-body)", fontSize: 13,
          color: "#ff4d4d", fontWeight: 700,
          background: "#fff0f0",
          border: "2px solid #ff4d4d",
          borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
          padding: "4px 16px", marginBottom: 28,
          boxShadow: "2px 2px 0px 0px #ff4d4d",
        }}>
          Free to try — no sign up needed
        </div>

        <h1 style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.1,
          color: "#2d2d2d", marginBottom: 24,
        }}>
          Your idea will be attacked.<br />
          <span style={{ color: "#ff4d4d" }}>Better by us</span> than the market.
        </h1>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: 18,
          color: "#555", lineHeight: 1.8,
          maxWidth: 540, margin: "0 auto 40px",
        }}>
          6 adversarial AI personas tear apart your startup idea, pitch, or strategy — so you find the real weaknesses before investors, competitors, and customers do.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleTryNow}
            style={{
              fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18,
              background: "#ff4d4d", color: "#fff",
              border: "3px solid #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              boxShadow: "5px 5px 0px 0px #2d2d2d",
              padding: "14px 36px", cursor: "pointer",
              transition: "all 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translate(3px,3px)"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #2d2d2d"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "5px 5px 0px 0px #2d2d2d"; }}
          >
            ⚡ Try now — it&apos;s free
          </button>
          <Link href="/sign-up" style={{
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18,
            background: "#fff", color: "#2d2d2d",
            border: "3px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            boxShadow: "5px 5px 0px 0px #2d2d2d",
            padding: "14px 36px", textDecoration: "none",
            display: "inline-block", transition: "all 0.1s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(3px,3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0px 0px #2d2d2d"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0px 0px #2d2d2d"; }}
          >
            Create account →
          </Link>
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa", marginTop: 20 }}>
          No credit card. No install. Just paste your idea.
        </p>
        <Link href="/privacy" style={{
          display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
          marginTop: 12, padding: "5px 14px",
          fontFamily: "var(--font-body)", fontSize: 12, color: "#555",
          border: "1.5px dashed #ccc",
          borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
          background: "#fff",
        }}>
          🔒 Encrypted at rest · Never used to train AI · You own your data
        </Link>
      </section>

      {/* Persona strip */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "💼", name: "Skeptical VC",     color: "#ff4d4d", sub: "Market & moat" },
            { icon: "⚔️", name: "Competitor CEO",   color: "#f97316", sub: "Copy & undercut" },
            { icon: "⚖️", name: "Regulator",        color: "#3b82f6", sub: "Compliance gaps" },
            { icon: "😤", name: "Angry Customer",   color: "#eab308", sub: "PMF gaps" },
            { icon: "😈", name: "Devil's Advocate", color: "#a855f7", sub: "Internal flaws" },
            { icon: "📰", name: "Journalist",       color: "#22c55e", sub: "The hit piece" },
          ].map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px",
              background: "#fff",
              border: `2px solid ${p.color}`,
              borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
              boxShadow: `3px 3px 0px 0px ${p.color}`,
              transform: `rotate(${[-1, 0.8, -0.5, 1, -0.7, 0.4][i]}deg)`,
            }}>
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: p.color }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#aaa" }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 32, color: "#2d2d2d" }}>
            What you get
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "#fff",
              border: "2px solid #2d2d2d",
              borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
              padding: "28px 24px",
              boxShadow: "5px 5px 0px 0px #2d2d2d",
              transform: `rotate(${[-0.5, 0.4, -0.3][i]}deg)`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17, color: "#2d2d2d", marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#555", lineHeight: 1.7 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 32, color: "#2d2d2d" }}>
            What people are saying
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {SOCIAL.map((s, i) => (
            <div key={i} style={{
              background: "#fff9c4",
              border: "2px solid #2d2d2d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              padding: "24px 22px",
              boxShadow: "4px 4px 0px 0px #2d2d2d",
              transform: `rotate(${[-0.8, 0.5, -0.4][i]}deg)`,
            }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#2d2d2d", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                &ldquo;{s.quote}&rdquo;
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "#2d2d2d" }}>{s.name}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#aaa" }}>{s.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo section */}
      <section ref={demoRef} style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 32px" }}>
        {!showDemo ? (
          <div style={{ textAlign: "center", padding: "0 0 80px" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28, color: "#2d2d2d", marginBottom: 16 }}>
              Ready to stress-test your idea?
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#555", marginBottom: 28 }}>
              Free. No sign-up. Takes 60 seconds.
            </p>
            <button
              onClick={handleTryNow}
              style={{
                fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18,
                background: "#2d2d2d", color: "#fff",
                border: "3px solid #2d2d2d",
                borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                boxShadow: "5px 5px 0px 0px #ff4d4d",
                padding: "14px 40px", cursor: "pointer",
                transition: "all 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.transform = "translate(3px,3px)"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #ff4d4d"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#2d2d2d"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "5px 5px 0px 0px #ff4d4d"; }}
            >
              ⚡ Try now — it&apos;s free
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28, color: "#2d2d2d", marginBottom: 8 }}>
                Paste your idea below
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#aaa" }}>
                Edit the example or replace it with your own idea, then hit run.
              </p>
            </div>

            {/* Demo card */}
            <div style={{
              background: "#fff",
              border: "3px solid #2d2d2d",
              borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
              boxShadow: "8px 8px 0px 0px #2d2d2d",
              padding: "32px 36px",
              transform: "rotate(-0.5deg)",
              position: "relative",
              marginBottom: 24,
            }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 60, height: 20, background: "rgba(255,249,196,0.9)", border: "1px solid #2d2d2d", borderRadius: 2 }} />

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
                  background: "#fdfbf7", color: "#2d2d2d",
                  resize: "vertical", outline: "none",
                  lineHeight: 1.7, boxSizing: "border-box", marginBottom: 16,
                }}
              />

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

            {/* Streaming preview */}
            {isRunning && streamingText && (
              <div style={{
                padding: "14px 16px", marginBottom: 24,
                background: "#fff9c4", border: "2px dashed #2d2d2d",
                borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
                fontSize: 13, color: "#555", lineHeight: 1.8,
                fontFamily: "var(--font-body)", maxHeight: 160, overflow: "hidden",
                boxShadow: "3px 3px 0px 0px #2d2d2d", transform: "rotate(-0.3deg)",
              }}>
                {streamingText.slice(-500)}
                <span style={{ color: "#ff4d4d", fontWeight: 700 }}>▋</span>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 24,
                  background: "#fff", border: "2px solid #2d2d2d",
                  borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
                  boxShadow: "5px 5px 0px 0px #2d2d2d",
                  padding: "20px 24px", marginBottom: 20,
                }}>
                  <ScoreArc score={result.score} />
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "#2d2d2d", marginBottom: 4 }}>{result.verdict}</div>
                    <div style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)" }}>Survivability score</div>
                  </div>
                </div>

                <AttackReport attacks={result.attacks} inputText={inputText} />

                <div style={{
                  marginTop: 16, marginBottom: 28,
                  padding: "16px 20px",
                  border: "2px dashed #ff4d4d",
                  borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
                  background: "#fff", boxShadow: "4px 4px 0px 0px #ff4d4d",
                }}>
                  <div style={{ fontSize: 12, color: "#ff4d4d", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>⚠ Weakest point</div>
                  <p style={{ fontSize: 14, color: "#2d2d2d", fontFamily: "var(--font-body)", lineHeight: 1.7, margin: 0 }}>{result.weakestPoint}</p>
                </div>

                {/* CTA */}
                <div style={{
                  background: "#fff9c4",
                  border: "3px solid #2d2d2d",
                  borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                  boxShadow: "8px 8px 0px 0px #2d2d2d",
                  padding: "36px 40px", marginBottom: 80,
                  transform: "rotate(0.5deg)",
                }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24, color: "#2d2d2d", marginBottom: 20 }}>
                    🔒 Unlock the full stress-test
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                    {["✓ All 6 adversarial personas", "✓ Save results & track progress over time", "✓ Competitive intel on your market", "✓ Custom personas & PDF export", "✓ Re-run diff to see what improved"].map((item, i) => (
                      <li key={i} style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#2d2d2d", lineHeight: 2 }}>{item}</li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Link href="/sign-up" style={{
                      flex: 2, display: "block", textAlign: "center", textDecoration: "none",
                      padding: "13px 0",
                      fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
                      background: "#ff4d4d", color: "#fff",
                      border: "2px solid #2d2d2d",
                      borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                      boxShadow: "4px 4px 0px 0px #2d2d2d",
                    }}>Create free account →</Link>
                    <Link href="/sign-in" style={{
                      flex: 1, display: "block", textAlign: "center", textDecoration: "none",
                      padding: "13px 0",
                      fontFamily: "var(--font-body)", fontSize: 14,
                      background: "transparent", color: "#2d2d2d",
                      border: "2px dashed #2d2d2d",
                      borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
                    }}>Sign in</Link>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "2px dashed #e5e0d8",
        padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "#2d2d2d" }}>
          redteam<span style={{ color: "#ff4d4d" }}>.</span>ai
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa" }}>
          Battle-test your ideas before the market does.
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/sign-in" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa", textDecoration: "none" }}>Sign in</Link>
          <Link href="/sign-up" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa", textDecoration: "none" }}>Sign up</Link>
          <Link href="/privacy" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa", textDecoration: "none" }}>Privacy</Link>
          <a
            href="https://ko-fi.com/ishaanbaranwal"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#aaa", textDecoration: "none" }}
          >
            ☕ Ko-fi
          </a>
        </div>
      </footer>
    </div>
  );
}
