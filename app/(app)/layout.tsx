import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: "#fdfbf7",
      backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      overflow: "hidden",
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  );
}
