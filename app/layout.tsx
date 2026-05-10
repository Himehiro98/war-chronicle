import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "War Chronicle — 多角的戦争史データベース",
  description: "戦争は突然起きない。人類は似た条件で何度も衝突してきた。BC1457から2025まで167戦争を時系列・地理・因果・構造で横断する、戦争防止のための知的教養プラットフォーム。",
  keywords: ["戦争史", "歴史", "教育", "因果関係", "現代史", "国際関係", "地政学", "戦争防止"],
  openGraph: {
    title: "War Chronicle — 戦争は突然起きない",
    description: "BC1457〜2025、167戦争を時系列・地理・因果・構造で横断する知的教養プラットフォーム",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "War Chronicle — 戦争は突然起きない",
    description: "人類は似た条件で何度も衝突してきた。167戦争を多角的に分析。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
