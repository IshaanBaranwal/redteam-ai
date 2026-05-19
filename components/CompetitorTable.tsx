"use client";

interface Competitor { name: string; pricing: string; market: string; gap: string; sentiment: string; }

export default function CompetitorTable({ competitors }: { competitors: Competitor[] }) {
  if (competitors.length === 0) return (
    <div style={{ textAlign: "center", padding: "52px 0", color: "#aaa", fontSize: 14, fontFamily: "var(--font-body)", fontStyle: "italic" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔭</div>
      No competitive intel yet. Run the agent to generate analysis.
    </div>
  );

  return (
    <div style={{
      background: "#fff",
      border: "2px solid #2d2d2d",
      borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
      overflow: "hidden",
      boxShadow: "5px 5px 0px 0px #2d2d2d",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#fff9c4", borderBottom: "2px solid #2d2d2d" }}>
            {["Company", "Pricing", "Market", "Their gap", "Sentiment"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#2d2d2d", fontFamily: "var(--font-heading)", fontWeight: 700, letterSpacing: "0.04em", fontSize: 13 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fdfbf7", borderBottom: "1px dashed #e5e0d8" }}>
              <td style={{ padding: "11px 14px", color: "#2d2d2d", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14 }}>{c.name}</td>
              <td style={{ padding: "11px 14px", color: "#555", fontFamily: "var(--font-body)" }}>{c.pricing}</td>
              <td style={{ padding: "11px 14px", color: "#555", fontFamily: "var(--font-body)" }}>{c.market}</td>
              <td style={{ padding: "11px 14px", color: "#ff4d4d", fontFamily: "var(--font-body)", fontStyle: "italic" }}>{c.gap}</td>
              <td style={{ padding: "11px 14px", color: c.sentiment.startsWith("↑") ? "#22c55e" : "#aaa", fontFamily: "var(--font-heading)", fontWeight: 700 }}>{c.sentiment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
