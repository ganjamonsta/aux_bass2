import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUX Player",
  description: "Telegram-first music player and library.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
