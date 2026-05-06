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
  metadataBase: new URL("https://cbr-ai-sales-os.vercel.app"),
  title: "Grupo Inmobiliario Castrejón Rodríguez",
  description:
    "Terrenos en Jojutla, Morelos con claridad documental, seguridad jurídica y trato directo.",
  keywords: [
    "terrenos en Jojutla",
    "terrenos en Morelos",
    "Cumbres de Bendición",
    "Grupo Inmobiliario Castrejón Rodríguez",
    "lotes en Jojutla",
    "terrenos 200 m2",
  ],
  openGraph: {
    title: "Grupo Inmobiliario Castrejón Rodríguez",
    description:
      "Terrenos en Jojutla, Morelos con claridad documental, seguridad jurídica y trato directo.",
    url: "/",
    siteName: "Grupo Inmobiliario Castrejón Rodríguez",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/videos/CBR-intro-poster.jpg",
        width: 1200,
        height: 630,
        alt: "Cumbres de Bendición en Jojutla, Morelos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grupo Inmobiliario Castrejón Rodríguez",
    description: "Terrenos en Jojutla, Morelos con claridad documental y trato directo.",
    images: ["/videos/CBR-intro-poster.jpg"],
  },
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
