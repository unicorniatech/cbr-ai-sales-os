import { activeTenant, formatCurrency } from "../config/tenants";

export function StructuredData() {
  const project = activeTenant.project;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": "https://cbr-ai-sales-os.vercel.app/#organization",
        name: activeTenant.brand,
        slogan: activeTenant.slogan,
        url: "https://cbr-ai-sales-os.vercel.app/",
        logo: "https://cbr-ai-sales-os.vercel.app/brand/CBR-LOGO.webp",
        telephone: activeTenant.contact.whatsapp,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle 20 de noviembre, colonia Lázaro Cárdenas",
          addressLocality: "Jojutla",
          addressRegion: "Morelos",
          addressCountry: "MX",
        },
        areaServed: "Jojutla, Morelos",
      },
      {
        "@type": "Product",
        "@id": "https://cbr-ai-sales-os.vercel.app/secciones/cumbres-de-bendicion#project",
        name: project.name,
        description: `${project.lots}, ${project.dimensions}, ${project.location}. Enganche ${formatCurrency(project.downPayment)} y mensualidades de ${formatCurrency(project.monthlyPayment)}.`,
        brand: {
          "@id": "https://cbr-ai-sales-os.vercel.app/#organization",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "MXN",
          lowPrice: project.standardPrice,
          highPrice: project.mainStreetPrice,
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
