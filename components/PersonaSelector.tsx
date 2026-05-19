"use client";

import { PERSONAS } from "@/lib/personas";
import { useIsMobile } from "@/hooks/useIsMobile";

const ROTATIONS = [-1.2, 0.8, -0.5, 1.1, -0.9, 0.6];

interface CustomPersona { id: string; name: string; role: string; icon: string; }

interface PersonaSelectorProps {
  selected: string[];
  onToggle: (id: string) => void;
  customPersona?: CustomPersona | null;
  onOpenCustomModal?: () => void;
  onRemoveCustomPersona?: () => void;
}

export default function PersonaSelector({
  selected,
  onToggle,
  customPersona,
  onOpenCustomModal,
  onRemoveCustomPersona,
}: PersonaSelectorProps) {
  const totalActive = selected.length;
  const isMobile = useIsMobile();

  return (
    <div style={{
      background: "#fff",
      border: "2px solid #2d2d2d",
      borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
      padding: 20, marginBottom: 16,
      boxShadow: "5px 5px 0px 0px #2d2d2d",
    }}>
      <div style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--font-body)" }}>
        Attackers — <span style={{ color: "#ff4d4d", fontFamily: "var(--font-heading)", fontWeight: 700 }}>{totalActive}</span> active
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
        {PERSONAS.map((p, i) => {
          const on = selected.includes(p.id);
          return (
            <div key={p.id} onClick={() => onToggle(p.id)} style={{
              padding: "10px 12px",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              border: on ? `2px solid ${p.color}` : "2px solid #2d2d2d",
              cursor: "pointer",
              background: on ? `${p.color}18` : "#fdfbf7",
              boxShadow: on ? `3px 3px 0px 0px ${p.color}` : "2px 2px 0px 0px #2d2d2d",
              transform: on ? `rotate(${ROTATIONS[i]}deg) translate(-1px, -1px)` : `rotate(${ROTATIONS[i] * 0.3}deg)`,
              transition: "all 0.1s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 15 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: on ? 700 : 400, color: on ? p.color : "#2d2d2d", fontFamily: "var(--font-heading)" }}>{p.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--font-body)" }}>{p.label}</div>
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div style={{ borderTop: "2px dashed #e5e0d8", margin: "16px 0 14px" }} />

      {/* Custom persona section */}
      {!customPersona ? (
        <button
          onClick={onOpenCustomModal}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontFamily: "var(--font-body)", fontSize: 13,
            background: "transparent", color: "#aaa",
            border: "2px dashed #ccc",
            borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2d2d2d"; e.currentTarget.style.color = "#2d2d2d"; e.currentTarget.style.background = "#fdfbf7"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "transparent"; }}
        >
          + Add your own persona
        </button>
      ) : (
        <div style={{ position: "relative" }}>
          <div
            onClick={() => onToggle(customPersona.id)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              border: selected.includes(customPersona.id) ? "2px solid #2d5da1" : "2px solid #2d2d2d",
              cursor: "pointer",
              background: selected.includes(customPersona.id) ? "#2d5da118" : "#fdfbf7",
              boxShadow: selected.includes(customPersona.id) ? "3px 3px 0px 0px #2d5da1" : "2px 2px 0px 0px #2d2d2d",
              transition: "all 0.1s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 15 }}>{customPersona.icon}</span>
              <span style={{
                fontSize: 12,
                fontWeight: selected.includes(customPersona.id) ? 700 : 400,
                color: selected.includes(customPersona.id) ? "#2d5da1" : "#2d2d2d",
                fontFamily: "var(--font-heading)",
              }}>{customPersona.name}</span>
            </div>
            <div style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--font-body)" }}>Your persona</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onRemoveCustomPersona?.(); }}
            style={{
              position: "absolute", top: 6, right: 6,
              background: "#e5e0d8", border: "none",
              borderRadius: "50%", width: 18, height: 18,
              cursor: "pointer", fontSize: 10, color: "#2d2d2d",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-body)",
              lineHeight: 1,
            }}
            title="Remove custom persona"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
