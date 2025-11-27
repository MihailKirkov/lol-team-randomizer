import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoL Team Randomizer - Generate Balanced League of Legends Teams",
  description:
    "Smart team generator for League of Legends. Create balanced teams with role assignments, track statistics, and manage your roster.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
