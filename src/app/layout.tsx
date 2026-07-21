import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const arabic = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مقياس فروست",
  description: "مقياس فروست متعدد الأبعاد لقياس الكمالية ومتابعتها",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={arabic.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
