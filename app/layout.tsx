import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mannaflow — automation for local businesses",
  description:
    "Chat agents, voice agents, and agentic dashboards that automate follow-up, booking, and lead capture for HVAC contractors.",
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
