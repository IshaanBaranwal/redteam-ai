"use client";

import { useState } from "react";

interface CustomPersonaModalProps {
  onAdd: (persona: { id: string; name: string; role: string; icon: string }) => void;
  onClose: () => void;
}

export default function CustomPersonaModal({ onAdd, onClose }: CustomPersonaModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const canAdd = name.trim().length > 0 && role.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({ id: "custom_1", name: name.trim(), role: role.trim(), icon: "🎯" });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          border: "3px solid #2d2d2d",
          borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          boxShadow: "8px 8px 0px 0px #2d2d2d",
          padding: 36,
          width: "100%", maxWidth: 420,
          margin: "0 20px",
        }}
      >
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: 22, color: "#2d2d2d", marginBottom: 8,
        }}>
          Add custom persona
        </div>
        <div style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)", marginBottom: 24 }}>
          Define your own adversarial perspective.
        </div>

        <label style={{ display: "block", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--font-body)" }}>
            Name
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. My lead investor, Sarah"
            style={{
              width: "100%",
              fontFamily: "var(--font-body)", fontSize: 14,
              padding: "10px 12px",
              border: "2px solid #2d2d2d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              outline: "none",
              color: "#2d2d2d",
              background: "#fdfbf7",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--font-body)" }}>
            Perspective
          </div>
          <textarea
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Describe their perspective and what they focus on when attacking ideas. e.g. Sarah is a Series B SaaS investor obsessed with unit economics and NRR. She tears apart anything with weak retention or unclear monetization..."
            rows={4}
            style={{
              width: "100%",
              fontFamily: "var(--font-body)", fontSize: 13,
              padding: "10px 12px",
              border: "2px solid #2d2d2d",
              borderRadius: "8px 2px 8px 2px / 2px 8px 2px 8px",
              outline: "none",
              color: "#2d2d2d",
              background: "#fdfbf7",
              resize: "vertical",
              lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 0",
              fontFamily: "var(--font-body)", fontSize: 14,
              background: "#e5e0d8", color: "#2d2d2d",
              border: "2px dashed #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            style={{
              flex: 2, padding: "11px 0",
              fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
              background: canAdd ? "#2d2d2d" : "#e5e0d8",
              color: canAdd ? "#fff" : "#aaa",
              border: "2px solid #2d2d2d",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              cursor: canAdd ? "pointer" : "default",
              boxShadow: canAdd ? "4px 4px 0px 0px #2d2d2d" : "none",
              transition: "all 0.1s",
            }}
            onMouseEnter={e => { if (canAdd) { e.currentTarget.style.background = "#ff4d4d"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "translate(2px,2px)"; } }}
            onMouseLeave={e => { if (canAdd) { e.currentTarget.style.background = "#2d2d2d"; e.currentTarget.style.boxShadow = "4px 4px 0px 0px #2d2d2d"; e.currentTarget.style.transform = "none"; } }}
          >
            Add persona →
          </button>
        </div>
      </div>
    </div>
  );
}
