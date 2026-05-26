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
  metadataBase: new URL("https://www.castrejonbienesyraices.com"),
  title: {
    default: "Terrenos en Morelos y Jojutla | Castrejón Bienes y Raíces",
    template: "%s | Castrejón Bienes y Raíces",
  },
  description:
    "Terrenos en Morelos, terrenos en Jojutla y zona sur con precio claro, documentación revisable y trato directo. Cumbres de Bendición y oportunidades en Tequesquitengo, Zacatepec y Tlaquiltenango.",
  keywords: [
    "terrenos en morelos",
    "terrenos morelos",
    "terrenos jojutla",
    "terrenos en jojutla",
    "terrenos zona sur",
    "terrenos zona sur morelos",
    "terrenos tequesquitengo",
    "terrenos en tequesquitengo",
    "terrenos zacatepec",
    "terrenos en zacatepec",
    "terrenos tlaquiltenango",
    "terrenos en tlaquiltenango",
    "terrenos casas",
    "lotes en morelos",
    "lotes en jojutla",
    "terrenos baratos en morelos",
    "terrenos con mensualidades en morelos",
    "Cumbres de Bendición",
    "Grupo Inmobiliario Castrejón Rodríguez",
    "terrenos 200 m2",
  ],
  alternates: {
    canonical: "/",
  },
  category: "real estate",
  openGraph: {
    title: "Terrenos en Morelos y Jojutla | Castrejón Bienes y Raíces",
    description:
      "Terrenos en Morelos, Jojutla y zona sur con claridad documental, precios claros, fotos, ubicación y atención directa por WhatsApp.",
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
    title: "Terrenos en Morelos y Jojutla",
    description: "Terrenos en Morelos, Jojutla, Tequesquitengo, Zacatepec y Tlaquiltenango con claridad documental.",
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
