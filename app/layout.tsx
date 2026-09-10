import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EdgeRetail OS",
  description: "Real-Time In-Store Edge Intelligence",
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
