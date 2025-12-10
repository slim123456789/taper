// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
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
        <PicksProvider>
          {children}

          {/* Global Floating "Your Picks" Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Link
              href="/picks"
              className="flex items-center justify-center rounded-full border border-white/20 bg-[#070A14]/90 px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-white shadow-2xl backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              Your Picks
            </Link>
          </div>
        </PicksProvider>
      </body>
    </html>
  );
}