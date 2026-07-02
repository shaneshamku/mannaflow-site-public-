import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mannaflow — Helping Contractors Capture Every Opportunity",
  description:
    "Chat agents, voice agents, and agentic dashboards that automate follow-up, booking, and lead capture for HVAC contractors.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
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
