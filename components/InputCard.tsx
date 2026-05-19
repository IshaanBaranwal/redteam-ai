"use client";

import { useRef, useCallback, useState } from "react";

const INPUT_TYPES = [
  { id: "idea",     icon: "💡", label: "Idea",      hint: "Ingenuity, market fit & timing judged",           placeholder: "Describe your idea in plain language. Don't over-polish — the agent works better with raw, honest thinking.\n\nExample: I want to build a tool that lets non-technical founders run adversarial stress-tests on their business ideas using AI personas..." },
  { id: "pitch",    icon: "📊", label: "Pitch",     hint: "Narrative, slide logic & investor-readiness judged", placeholder: "Paste your pitch deck content or upload the deck as a PDF / PPTX." },
  { id: "research", icon: "🔬", label: "Research",  hint: "Methodology, citations & logical gaps judged",    placeholder: "Paste your abstract, paper, or research summary." },
  { id: "strategy", icon: "🗺️", label: "Strategy", hint: "Assumptions, risk & execution gaps judged",       placeholder: "Paste your strategy document, OKRs, or roadmap." },
  { id: "product",  icon: "📋", label: "PRD",       hint: "User needs, feasibility & prioritisation judged", placeholder: "Paste your product requirements document or feature spec." },
];

interface InputCardProps {
  inputType: string;
  inputText: string;
  onInputTypeChange: (t: string) => void;
  onInputTextChange: (t: string) => void;
  onFileUpload?: (file: File) => void;
}

export default function InputCard({ inputType, inputText, onInputTypeChange, onInputTextChange, onFileUpload }: InputCardProps) {
  const [inputMode, setInputMode] = useState<"text" | "file" | "url">("text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    if ("dataTransfer" in e) { e.preventDefault(); setDragging(false); }
    const file = "dataTransfer" in e ? e.dataTransfer?.files?.[0] : (e.target as HTMLInputElement).files?.[0];
    if (file) { setUploadedFile(file); onFileUpload?.(file); }
  }, [onFileUpload]);

  const currentType = INPUT_TYPES.find(t => t.id === inputType);

  return (
    <div style={{
      background: "#fff",
      border: "2px solid #2d2d2d",
      borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
      padding: 24, marginBottom: 16,
      boxShadow: "5px 5px 0px 0px #2d2d2d",
    }}>
      {/* Type selector */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, color: "#2d2d2d", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-heading)" }}>
          What are you stress-testing?
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {INPUT_TYPES.map(t => {
            const on = inputType === t.id;
            return (
              <button key={t.id} onClick={() => onInputTypeChange(t.id)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 20px",
                borderRadius: "8px 32px 8px 32px / 32px 8px 32px 8px",
                cursor: "pointer",
                border: `2px solid ${on ? "#ff4d4d" : "#2d2d2d"}`,
                background: on ? "#ff4d4d" : "#fff",
                fontFamily: "var(--font-heading)", fontSize: 15,
                color: on ? "#fff" : "#2d2d2d",
                fontWeight: 700,
                boxShadow: on ? "2px 2px 0px 0px #2d2d2d" : "3px 3px 0px 0px #2d2d2d",
                transform: on ? "translate(1px, 1px)" : "none",
                transition: "all 0.1s",
              }}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        {currentType && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#2d5da1", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
            ↳ {currentType.hint}
          </div>
        )}
      </div>

      <div style={{ height: 2, background: "#e5e0d8", borderTop: "1px dashed #ccc", marginBottom: 16 }} />

      {/* Mode toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)" }}>Input mode</span>
        <div style={{ display: "flex", gap: 6 }}>
          {(["text", "file", "url"] as const).map(m => (
            <button key={m} onClick={() => setInputMode(m)} style={{
              fontSize: 12, padding: "5px 12px",
              borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
              border: "2px solid #2d2d2d",
              background: inputMode === m ? "#2d2d2d" : "#fff",
              color: inputMode === m ? "#fff" : "#2d2d2d",
              fontFamily: "var(--font-body)", cursor: "pointer",
              boxShadow: inputMode === m ? "1px 1px 0px 0px #2d2d2d" : "2px 2px 0px 0px #2d2d2d",
              transform: inputMode === m ? "translate(1px, 1px)" : "none",
              transition: "all 0.1s",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {inputMode === "text" && (
        <textarea rows={6} value={inputText}
          onChange={e => onInputTextChange(e.target.value)}
          placeholder={currentType?.placeholder || "Paste your content here..."} />
      )}

      {inputMode === "file" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop as (e: React.DragEvent) => void}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#ff4d4d" : "#2d2d2d"}`,
            borderRadius: "30px 5px 20px 5px / 5px 20px 5px 30px",
            padding: 32, textAlign: "center", cursor: "pointer",
            background: dragging ? "#fff9c4" : "#fdfbf7",
            transition: "all 0.1s",
            boxShadow: "3px 3px 0px 0px #2d2d2d",
          }}>
          <input ref={fileRef} type="file" accept=".pdf,.pptx,.docx" style={{ display: "none" }}
            onChange={onDrop as (e: React.ChangeEvent<HTMLInputElement>) => void} />
          {uploadedFile ? (
            <>
              <div style={{ fontSize: 14, color: "#22c55e", marginBottom: 4, fontFamily: "var(--font-body)" }}>✓ {uploadedFile.name}</div>
              <div style={{ fontSize: 13, color: "#aaa", fontFamily: "var(--font-body)" }}>{(uploadedFile.size / 1024).toFixed(0)} KB · Click to replace</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 10 }}>☁️</div>
              <div style={{ fontSize: 14, color: "#555", marginBottom: 4, fontFamily: "var(--font-body)" }}>Drop a file or click to browse</div>
              <div style={{ fontSize: 12, color: "#aaa", fontFamily: "var(--font-body)" }}>PDF · PPTX · DOCX</div>
            </>
          )}
        </div>
      )}

      {inputMode === "url" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="https://..." style={{ flex: 1 }} />
          <button style={{
            padding: "0 18px", background: "#fff",
            border: "2px solid #2d2d2d",
            borderRadius: "5px 15px 5px 15px / 15px 5px 15px 5px",
            color: "#2d2d2d", fontFamily: "var(--font-body)",
            fontSize: 13, cursor: "pointer",
            boxShadow: "3px 3px 0px 0px #2d2d2d",
          }}>Fetch</button>
        </div>
      )}
    </div>
  );
}
