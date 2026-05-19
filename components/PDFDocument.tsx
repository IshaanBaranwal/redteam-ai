"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#1A1A1A" },
  header: { marginBottom: 32 },
  logo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#1A1A1A", marginBottom: 4 },
  logoAccent: { color: "#EF4444" },
  meta: { fontSize: 9, color: "#888", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E5E5E5", marginVertical: 16 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
  scoreBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FEF2F2", border: "2px solid #EF4444", alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#EF4444" },
  verdictBlock: { flex: 1 },
  verdictText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#1A1A1A", marginBottom: 4 },
  weakestBox: { backgroundColor: "#FEF2F2", borderLeft: "3px solid #EF4444", padding: "10 12", borderRadius: 4, marginBottom: 24 },
  weakestLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#EF4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  weakestText: { fontSize: 10, color: "#7A1A1A", lineHeight: 1.6 },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 10 },
  attackCard: { border: "1px solid #E5E5E5", borderRadius: 6, marginBottom: 10, padding: "10 12" },
  attackPersona: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  attackHeadline: { fontSize: 12, fontFamily: "Helvetica-BoldOblique", color: "#1A1A1A", marginBottom: 6 },
  attackBody: { fontSize: 9, color: "#555", lineHeight: 1.65, marginBottom: 8 },
  attackQuestion: { fontSize: 9, fontStyle: "italic", color: "#EF4444", borderLeft: "2px solid #EF4444", paddingLeft: 8 },
  sevBadge: { fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginBottom: 6, alignSelf: "flex-start" },
  tableHeader: { flexDirection: "row", borderBottom: "1px solid #E5E5E5", paddingBottom: 6, marginBottom: 4 },
  tableRow: { flexDirection: "row", paddingVertical: 6, borderBottom: "1px solid #F0F0F0" },
  tableCell: { flex: 1, fontSize: 9, color: "#555" },
  tableCellBold: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1A1A1A" },
  tableCellRed: { flex: 1, fontSize: 9, color: "#EF4444" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 8, color: "#BBB", textAlign: "center" },
});

const SEV_COLOR: Record<number, string> = { 0: "#4ADE80", 1: "#FACC15", 2: "#F87171", 3: "#EF4444" };
const SEV_LABEL: Record<number, string> = { 0: "Low", 1: "Medium", 2: "High", 3: "Critical" };

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

interface PDFDocumentProps {
  threadTitle: string;
  score: number;
  verdict: string;
  weakestPoint: string;
  attacks: Attack[];
  competitors: Competitor[];
  date: string;
}

const personaNames: Record<string, { name: string; color: string }> = {
  vc:         { name: "Skeptical VC",       color: "#CC2222" },
  competitor: { name: "Competitor CEO",     color: "#CC6633" },
  regulator:  { name: "Regulator",          color: "#3377AA" },
  customer:   { name: "Angry Customer",     color: "#CC7700" },
  devil:      { name: "Devil's Advocate",   color: "#7733BB" },
  journalist: { name: "Journalist",         color: "#226633" },
};

const scoreColor = (s: number) => s < 40 ? "#EF4444" : s < 65 ? "#FACC15" : "#4ADE80";

export default function PDFReport({
  threadTitle,
  score,
  verdict,
  weakestPoint,
  attacks,
  competitors,
  date,
}: PDFDocumentProps) {
  return (
    <Document title={`RedTeam Report — ${threadTitle}`} author="RedTeam.ai">
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            redteam<Text style={styles.logoAccent}>ai</Text>
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 8 }}>{threadTitle}</Text>
          <Text style={styles.meta}>Red team report · {date}</Text>
        </View>

        <View style={styles.divider} />

        {/* Score + verdict */}
        <View style={styles.scoreRow}>
          <View style={{ ...styles.scoreBox, borderColor: scoreColor(score) }}>
            <Text style={{ ...styles.scoreNum, color: scoreColor(score) }}>{score}</Text>
          </View>
          <View style={styles.verdictBlock}>
            <Text style={styles.verdictText}>{verdict}</Text>
            <Text style={styles.meta}>Survivability score out of 100</Text>
          </View>
        </View>

        {/* Weakest point */}
        {weakestPoint && (
          <View style={styles.weakestBox}>
            <Text style={styles.weakestLabel}>Weakest point</Text>
            <Text style={styles.weakestText}>{weakestPoint}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Attacks */}
        {attacks.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>Attack report — {attacks.length} attacks</Text>
            {attacks.map((a, i) => {
              const persona = personaNames[a.personaId] ?? { name: a.personaId, color: "#888" };
              return (
                <View key={i} style={styles.attackCard} wrap={false}>
                  <Text style={{ ...styles.attackPersona, color: persona.color }}>{persona.name}</Text>
                  <Text style={{ ...styles.sevBadge, backgroundColor: `${SEV_COLOR[a.severity]}22`, color: SEV_COLOR[a.severity] }}>
                    {SEV_LABEL[a.severity]}
                  </Text>
                  <Text style={styles.attackHeadline}>{a.headline}</Text>
                  <Text style={styles.attackBody}>{a.body}</Text>
                  <Text style={styles.attackQuestion}>"{a.question}"</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Competitor table */}
        {competitors.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionLabel}>Competitive landscape</Text>
            <View style={styles.tableHeader}>
              {["Company", "Pricing", "Market", "Their gap", "Sentiment"].map(h => (
                <Text key={h} style={{ ...styles.tableCell, fontFamily: "Helvetica-Bold", color: "#888", fontSize: 8 }}>{h}</Text>
              ))}
            </View>
            {competitors.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCellBold}>{c.name}</Text>
                <Text style={styles.tableCell}>{c.pricing}</Text>
                <Text style={styles.tableCell}>{c.market}</Text>
                <Text style={styles.tableCellRed}>{c.gap}</Text>
                <Text style={{ ...styles.tableCell, color: c.sentiment.startsWith("↑") ? "#4ADE80" : "#888" }}>{c.sentiment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated by RedTeam.ai · {date}
        </Text>

      </Page>
    </Document>
  );
}
