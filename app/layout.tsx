import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/query-provider"
import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://my-link-six-orcin.vercel.app/"),
  title: {
    template: "%s | MyLink",
    default: "MyLink | Your Unified Developer Profile",
  },
  description: "Gather all your scattered activities into a single, clean page.",
  openGraph: {
    title: "MyLink | Your Unified Developer Profile",
    description: "Gather all your scattered activities into a single, clean page.",
    url: "https://my-link-six-orcin.vercel.app/",
    siteName: "MyLink",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink | Your Unified Developer Profile",
    description: "Gather all your scattered activities into a single, clean page.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
