"use client";

// This component is always dynamically imported with ssr:false from the thread page.
// @react-pdf/renderer uses browser canvas APIs and cannot run server-side.

import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFReport from "./PDFDocument";

interface Attack {
  personaId: string;
  headline: string;
  body: string;
  question: string;
  severity: number;
}

interface Competitor {
  name: string;
  pricing: string;
  market: string;
  gap: string;
  sentiment: string;
}

interface PDFExportButtonProps {
  threadTitle: string;
  score: number;
  verdict: string;
  weakestPoint: string;
  attacks: Attack[];
  competitors: Competitor[];
}

export default function PDFExportButton({
  threadTitle,
  score,
  verdict,
  weakestPoint,
  attacks,
  competitors,
}: PDFExportButtonProps) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const filename = `redteam-${threadTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.pdf`;

  const doc = (
    <PDFReport
      threadTitle={threadTitle}
      score={score}
      verdict={verdict}
      weakestPoint={weakestPoint}
      attacks={attacks}
      competitors={competitors}
      date={date}
    />
  );

  return (
    <PDFDownloadLink document={doc} fileName={filename}>
      {({ loading }) => (
        <button
          style={{
            width: "100%", padding: "9px",
            background: "none", border: "1px solid #2A2A2A",
            borderRadius: 6, color: loading ? "#333" : "#555",
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: 11, cursor: loading ? "default" : "pointer",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}
        >
          {loading ? "Preparing PDF…" : "↓ Export PDF report"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
