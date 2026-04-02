import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNotes",
  description:
    "Offline-first notes app with tags, pinning, search, and optional backend sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
