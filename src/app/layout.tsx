// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { PicksProvider } from "@/hooks/usePicks";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});
const migra = localFont({
  src: [
    {
      path: "../../public/fonts/migra/Migra-Extrabold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/migra/MigraItalic-ExtralightItalic.otf",
      weight: "200",
      style: "italic",
    },
  ],
  variable: "--font-migra",
});

export const metadata: Metadata = {
  title: "Taper",
  description: "How elite is your swim knowledge?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${migra.variable}`}
    >
      <body>
        <PicksProvider>{children}</PicksProvider>
      </body>
    </html>
  );
}