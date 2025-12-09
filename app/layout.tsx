import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "LoL Team Randomizer - Generate Random League of Legends Teams",
    description:
        "Smart team generator for League of Legends. Create random teams with role assignments, track statistics, and manage your roster.",
    generator: "v0.app",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
          <body className={`font-sans antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
