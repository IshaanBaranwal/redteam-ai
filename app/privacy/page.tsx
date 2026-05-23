import Link from "next/link";

export default function PrivacyPage() {
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
        borderBottom: "2px dashed #2d2d2d",
        background: "#fdfbf7",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: "#2d2d2d" }}>
            redteam<span style={{ color: "#ff4d4d" }}>.</span>ai
          </div>
        </Link>
        <Link href="/" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#555", textDecoration: "none" }}>
          ← Back
        </Link>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px 80px" }}>

        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: "#aaa", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Privacy
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: "#2d2d2d", lineHeight: 1.1, marginBottom: 16 }}>
            Your ideas are safe here.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#555", lineHeight: 1.8 }}>
            We know you&apos;re sharing things that matter — unannounced ideas, early pitches, confidential strategies.
            Here&apos;s exactly how we handle your data, in plain language.
          </p>
        </div>

        {[
          {
            icon: "🔒",
            title: "Your data is encrypted at rest",
            body: "All data stored in our database (Supabase) is encrypted using AES-256, an industry-standard encryption algorithm used by banks and governments. Your ideas are never stored in plain text on disk.",
          },
          {
            icon: "🚫",
            title: "We never read your ideas",
            body: "We have no process, team, or incentive to read your submissions. The only system that processes your input is the Anthropic API — and that happens automatically, in real time, with no human in the loop.",
          },
          {
            icon: "🤖",
            title: "Your ideas don't train AI models",
            body: "RedTeam.ai uses Anthropic's API. By Anthropic's policy, data sent through their API is not used to train their models. Your ideas stay your ideas.",
          },
          {
            icon: "🗑️",
            title: "You control your data",
            body: "You can delete any thread — and all the runs, attacks, and results inside it — at any time from the sidebar. Deletion is permanent and immediate.",
          },
          {
            icon: "🔗",
            title: "Sharing is always opt-in",
            body: "Your threads are private by default. The only way a result becomes public is if you explicitly click the Share button, which generates a link. You control if and what you share.",
          },
          {
            icon: "📧",
            title: "We don't sell your data",
            body: "We don't share, sell, or monetise your data in any way. The only revenue model is direct support via Ko-fi and potential future paid tiers — not advertising or data brokerage.",
          },
        ].map((item, i) => (
          <div key={i} style={{
            background: "#fff",
            border: "2px solid #2d2d2d",
            borderRadius: i % 2 === 0 ? "30px 5px 20px 5px / 5px 20px 5px 30px" : "8px 2px 8px 2px / 2px 8px 2px 8px",
            padding: "24px 28px",
            marginBottom: 16,
            boxShadow: "4px 4px 0px 0px #2d2d2d",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17, color: "#2d2d2d", marginBottom: 8 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#555", lineHeight: 1.8 }}>
                  {item.body}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{
          marginTop: 40,
          background: "#fff9c4",
          border: "2px dashed #2d2d2d",
          borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
          padding: "20px 24px",
          fontFamily: "var(--font-body)", fontSize: 14, color: "#555", lineHeight: 1.7,
        }}>
          Questions or concerns? Email{" "}
          <a href="mailto:ishbaran21@gmail.com" style={{ color: "#ff4d4d", textDecoration: "none" }}>
            ishbaran21@gmail.com
          </a>
          {" "}— we&apos;ll respond personally.
        </div>
      </div>
    </div>
  );
}
