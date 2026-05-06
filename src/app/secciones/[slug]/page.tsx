import { editableContentDefaults } from "@/app/lib/editable-content";
import { SectionClientPage } from "./section-client";

const staticSlugs = [
  "cumbres-de-bendicion",
  "mision",
  "vision",
  "lotes-200m2",
  "calle-principal",
  "terrenos-patrimoniales",
  "claridad-documental",
];

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <SectionClientPage slug={slug || editableContentDefaults[0].id} />;
}
