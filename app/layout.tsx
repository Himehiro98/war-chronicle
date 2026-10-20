import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./styles/war.css";
import "./styles/explore.css";
import "./styles/lists.css";
import "./styles/home.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, WAR_COUNT, YEAR_RANGE_LABEL } from "@/lib/site";

const sans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});
const serif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-serif-jp",
  display: "swap",
  preload: false,
});
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 戦争は突然起きない`,
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["戦争史", "世界史", "歴史学習", "因果関係", "現代史", "国際関係", "地政学", "戦争防止"],
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: `${SITE_NAME} — 戦争は突然起きない`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — 戦争は突然起きない`,
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
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
    <html lang="ja" className={`${sans.variable} ${serif.variable} ${display.variable}`}>
      <body>
        <a href="#main" className="skip-link">本文へスキップ</a>
        <SiteHeader />
        <div id="main">{children}</div>
        <SiteFooter warCount={WAR_COUNT} yearRange={YEAR_RANGE_LABEL} />
      </body>
    </html>
  );
}
