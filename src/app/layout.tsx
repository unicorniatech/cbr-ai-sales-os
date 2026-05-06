import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grupo Inmobiliario Castrejón Rodríguez",
  description:
    "Terrenos en Jojutla, Morelos con claridad documental, seguridad jurídica y trato directo.",
  icons: {
    icon: [
      { url: "/brand/CBR-LOGO.webp", type: "image/webp" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/brand/CBR-LOGO.webp",
    apple: "/brand/CBR-LOGO.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
