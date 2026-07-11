import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/lib/profile-context";
import { FloatingTools } from "@/components/FloatingTools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fórmula Abundancia",
  description: "App privada de Jose y Vivi — salud, dinero y amor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <ProfileProvider>
          {children}
          <FloatingTools />
        </ProfileProvider>
      </body>
    </html>
  );
}
