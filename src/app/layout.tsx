import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Tiggy’s Play · Play, Learn & Grow",
  description: "A little world of big discoveries. Play and learn with Thiago.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
