import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better Cut — Auto Subtitle Generator",
  description: "สร้าง subtitle อัตโนมัติจากวิดีโอด้วย AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "dark antialiased", geistSans.variable, geistMono.variable, "font-sans", roboto.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
