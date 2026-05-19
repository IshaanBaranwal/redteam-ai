"use client";

interface Version { v: number; score: number; date: string; label: string; }

const scoreColor = (s: number) => s === 0 ? "#ccc" : s < 40 ? "#ff4d4d" : s < 65 ? "#f59e0b" : "#22c55e";

function ScoreChart({ versions }: { versions: Version[] }) {
  // Total SVG height includes space for score labels above data and date labels below
  const w = 100, dataTop = 14, dataH = 32, dateH = 14;
  const totalH = dataTop + dataH + dateH;
  const pts = versions.map((v, i) => {
    const x = 10 + (i / Math.max(versions.length - 1, 1)) * (w - 20);
    const y = dataTop + (1 - v.score / 100) * dataH;
    return [x, y, v] as [number, number, Version];
  });
  return (
    <div style={{ padding: "20px 0 8px" }}>
      <div style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-body)" }}>Score over time</div>
      <svg width="100%" viewBox={`0 0 ${w} ${totalH}`}>
        <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none" stroke="#2d2d2d" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y, v], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill={i === pts.length - 1 ? "#ff4d4d" : "#e5e0d8"} stroke="#2d2d2d" strokeWidth="2" />
            {/* date label — inside the bottom reserved zone */}
            <text x={x} y={dataTop + dataH + 10} textAnchor="middle" fontSize="5.5" fill="#aaa" fontFamily="var(--font-patrick), cursive">{v.date}</text>
            {/* score label — inside the top reserved zone, never above viewBox */}
            <text x={x} y={Math.max(y - 5, 8)} textAnchor="middle" fontSize="6" fill="#2d2d2d" fontFamily="var(--font-kalam), cursive" fontWeight="700">{v.score}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ProgressPanel({ versions }: { versions: Version[] }) {
  if (versions.length === 0) return (
    <div style={{ textAlign: "center", padding: "52px 0", color: "#aaa", fontSize: 14, fontFamily: "var(--font-body)", fontStyle: "italic" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📈</div>
      No runs yet. Submit your first attack to track progress.
    </div>
  );
  return (
    <div style={{
      background: "#fff",
      border: "2px solid #2d2d2d",
      borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
      padding: 20,
      boxShadow: "5px 5px 0px 0px #2d2d2d",
    }}>
      {versions.map((v, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px dashed #e5e0d8" }}>
          <span style={{ fontSize: 12, color: "#aaa", width: 24, fontFamily: "var(--font-heading)", fontWeight: 700 }}>v{v.v}</span>
          <div style={{ flex: 1, height: 8, background: "#e5e0d8", borderRadius: 4, overflow: "hidden", border: "1.5px solid #2d2d2d" }}>
            <div style={{ width: `${v.score}%`, height: "100%", background: scoreColor(v.score), transition: "width 0.6s ease", borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 13, color: scoreColor(v.score), fontFamily: "var(--font-heading)", fontWeight: 700, width: 28 }}>{v.score}</span>
          <span style={{ fontSize: 12, color: "#555", fontFamily: "var(--font-body)" }}>{v.label}</span>
          <span style={{ fontSize: 11, color: "#aaa", marginLeft: "auto", fontFamily: "var(--font-body)" }}>{v.date}</span>
        </div>
      ))}
      <ScoreChart versions={versions} />
    </div>
  );
}
