import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LiveNotifications from "@/components/LiveNotifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NorraClip Dashboard",
  description: "Monitor payments, activations, and bug reports for NorraClip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex bg-background text-foreground font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 relative">
            {/* Background glowing orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ background: "rgba(96,165,250,0.04)" }}></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ background: "rgba(147,197,253,0.03)" }}></div>
            
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>

        {/* Live payment notifications — mounted globally */}
        <LiveNotifications />
      </body>
    </html>
  );
}
