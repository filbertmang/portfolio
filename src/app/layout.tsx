import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeExperienceTabs } from "@/components/HomeExperienceTabs";
import { PrototypeControl, PrototypeControlProvider } from "@/components/prototype-control";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filbert Mangundap — Senior Product Designer",
  description:
    "Senior product designer based in Toronto with four years of experience designing 0 → 1 for operational and finance tech.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <PrototypeControlProvider>
          <SiteHeader />
          <HomeExperienceTabs />
          {children}
          <PrototypeControl />
        </PrototypeControlProvider>
      </body>
    </html>
  );
}
