import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { site } from "@/data";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bayerPixel = localFont({
  src: "../fonts/BayerPixel.otf",
  variable: "--font-bayer-pixel",
  display: "block",
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: "I make apps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${bayerPixel.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
