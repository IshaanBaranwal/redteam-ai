"use client";

interface ScoreArcProps { score: number; }

export default function ScoreArc({ score }: ScoreArcProps) {
  const color = score === 0 ? "#ccc" : score < 40 ? "#ff4d4d" : score < 65 ? "#f59e0b" : "#22c55e";
  const r = 58, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e0d8" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x="70" y="85" textAnchor="middle" fontSize="52" fontWeight="700"
        fill={color} fontFamily="var(--font-kalam), cursive">{score || "—"}</text>
    </svg>
  );
}
