import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = "https://muhammad-tasin-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Md. Tasfiq Tasin — AI-Focused Backend, Full-Stack & Flutter Developer",
  description: "Md. Tasfiq Tasin builds practical AI-powered web and mobile products with secure backend APIs, databases, Flutter and context-aware LLM workflows.",
  keywords: ["Md. Tasfiq Tasin", "AI-focused backend developer", "Flutter developer", "FastAPI", "LLM integration", "RAG", "Bangladesh"],
  authors: [{ name: "Md. Tasfiq Tasin", url: "https://github.com/muhammadTasin" }],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Md. Tasfiq Tasin — AI-Focused Backend, Full-Stack & Flutter Developer",
    description: "Practical AI-powered web and mobile products built with secure APIs, databases, Flutter and context-aware LLM workflows.",
    type: "profile",
    locale: "en_US",
    url: siteUrl,
    images: [{ url: "/og-card.png", width: 1200, height: 630, alt: "Md. Tasfiq Tasin — AI-focused backend, full-stack and Flutter developer" }],
  },
  twitter: { card: "summary_large_image", title: "Md. Tasfiq Tasin — AI-Focused Backend Developer", description: "Backend · Applied AI · Flutter · Product systems", images: ["/og-card.png"] },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
