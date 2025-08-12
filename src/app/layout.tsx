import type { Metadata } from "next";
import { Open_Sans, Roboto_Mono, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/mr-theme/components/provider"
import { MrAuth } from "@/mr-auth"
import { Toaster } from "@/components/ui/sonner"

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lasy CRM",
  description: "Simple e poderoso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${robotoMono.variable} ${lora.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <MrAuth>
            {children}
          </MrAuth>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
