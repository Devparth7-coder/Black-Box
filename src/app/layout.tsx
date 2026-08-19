import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLACKBOX — AI Behavior Analysis & Reliability Laboratory",
  description:
    "Put an AI inside a black box. Run thousands of controlled experiments and discover how it actually behaves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="scanlines vignette">{children}</body>
    </html>
  );
}
