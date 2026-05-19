import type { Metadata } from "next";
import { Kalam, Patrick_Hand } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "RedTeam.ai — Stress-test your ideas",
  description: "Adversarial AI stress-testing from 6 expert personas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" className={`${kalam.variable} ${patrickHand.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
