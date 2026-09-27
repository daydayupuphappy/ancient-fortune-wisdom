import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_SC } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Ancient Fortune Wisdom — Toss the coins. Read the moment.",
  description: "A daily reflection inspired by the I Ching.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${notoSerifSC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-center text-xs text-stone">
          For entertainment and self-reflection only. Not a prediction, nor medical, financial, or legal advice.
        </footer>
      </body>
    </html>
  );
}
