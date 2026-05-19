"use client";

interface RunLimitModalProps {
  runsUsed: number;
  limit: number;
  onClose: () => void;
}

export default function RunLimitModal({ runsUsed, limit, onClose }: RunLimitModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.45)", padding: 24,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff9c4",
          border: "3px solid #2d2d2d",
          borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          boxShadow: "8px 8px 0px 0px #2d2d2d",
          padding: "40px 36px",
          maxWidth: 460, width: "100%",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 20,
            background: "#e5e0d8", border: "2px solid #2d2d2d",
            borderRadius: "50%", width: 28, height: 28,
            cursor: "pointer", fontSize: 14, color: "#2d2d2d",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-body)",
          }}
        >×</button>

        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>

        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: 24, color: "#2d2d2d", marginBottom: 12,
        }}>
          You&apos;ve used all {limit} free runs
        </div>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: 15,
          color: "#555", lineHeight: 1.7, marginBottom: 20,
        }}>
          You&apos;ve stress-tested {runsUsed} ideas — that&apos;s {runsUsed} more than most founders ever do.
          RedTeam.ai runs on Anthropic&apos;s API which costs money per run.
          If you&apos;ve found it useful, a small contribution helps keep it free for everyone.
        </p>

        <div style={{
          background: "#fff",
          border: "2px dashed #2d2d2d",
          borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
          padding: "14px 16px",
          marginBottom: 24,
          fontFamily: "var(--font-body)", fontSize: 14, color: "#555", lineHeight: 1.6,
        }}>
          💡 <strong>Tip:</strong> Each thread keeps full history — you can still read, review and export all your previous results.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Ko-fi button — link updated in next step */}
          <a
            href="https://ko-fi.com/ishaanbaranwal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center", textDecoration: "none",
              padding: "13px 0",
              fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
              background: "#ff4d4d", color: "#fff",
              border: "2px solid #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              boxShadow: "4px 4px 0px 0px #2d2d2d",
            }}
          >
            ☕ Support on Ko-fi — keep it running
          </a>
          <button
            onClick={onClose}
            style={{
              padding: "11px 0",
              fontFamily: "var(--font-body)", fontSize: 14,
              background: "transparent", color: "#aaa",
              border: "2px dashed #ccc",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              cursor: "pointer",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
