import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terrenos en Morelos, Jojutla y Zona Sur",
  description:
    "Landing de terrenos en Morelos: terrenos en Jojutla, Tequesquitengo, Zacatepec, Tlaquiltenango y zona sur con precio, ubicación, fotos, videos y contacto directo.",
  alternates: {
    canonical: "/proyectos",
  },
  openGraph: {
    title: "Terrenos en Morelos, Jojutla y Zona Sur",
    description:
      "Explora terrenos en Morelos, terrenos en Jojutla y oportunidades en zona sur con información editable, fotos y contacto directo.",
    url: "/proyectos",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
