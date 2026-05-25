import type { Metadata } from "next";
import { Instrument_Serif, Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aleen.Code — Portfólio Fotográfico",
  description: "Fotografia e vídeo editorial. Documental, ensaios, shows, eventos. São Paulo, Brasil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
