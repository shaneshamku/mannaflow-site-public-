import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./hvac-app.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

// Geist is used only by the signed-in HVAC app (via the --font-geist-sans
// CSS var referenced in hvac-app.css). Declaring the variable here does not
// change the marketing pages' font.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "MannaFlow | Saving Time and Money on Every Lead",
  description:
    "MannaFlow helps contractors respond faster, follow up consistently, and save time on every lead.",
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
    <html lang="en" className={geist.variable}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
