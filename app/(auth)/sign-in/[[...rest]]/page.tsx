import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 40%, #F0F9FF 100%)",
    }}>
      <SignIn />
    </div>
  );
}
