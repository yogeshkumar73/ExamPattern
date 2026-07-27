import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

import { Header } from "@/components/header";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"),

  title: {
    default: "Aura Prime",
    template: "%s | Aura Prime",
  },

  description:
    "AI-powered exam pattern analysis, syllabus comparison, question prediction, and intelligent academic insights.",

  keywords: [
    "AI Exam Analyzer",
    "Exam Prediction",
    "Question Predictor",
    "Exam Pattern",
    "Education AI",
    "Machine Learning",
    "Student Platform",
    "Aura Prime",
  ],

  applicationName: "Aura Prime",

  authors: [
    {
      name: "Aura Prime Team",
    },
  ],

  creator: "Aura Prime",

  publisher: "Aura Prime",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Aura Prime",
    description:
      "Analyze exam papers using AI and predict high-probability questions instantly.",
    siteName: "Aura Prime",
  },

  twitter: {
    card: "summary_large_image",
    title: "Aura Prime",
    description:
      "AI-powered Exam Pattern Analyzer",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark scroll-smooth"
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen
          bg-background
          text-foreground
          antialiased
          font-sans
          selection:bg-primary/30
          selection:text-white
          overflow-x-hidden
        "
      >
        <Providers>
          {/* Background Decorations */}
          <div className="fixed inset-0 -z-50 overflow-hidden">
            <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-3xl" />
            <div className="absolute right-0 top-20 h-[24rem] w-[24rem] rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl" />
          </div>

          <div className="relative flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>

        <Analytics />
      </body>
    </html>
  );
}