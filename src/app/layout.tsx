// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEIL 상담 플랫폼",
  description: "사업자 맞춤형 GPT 챗봇, 테마 설정, 1:1 소비자 상담 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-white text-black`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
