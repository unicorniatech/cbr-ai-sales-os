import { activeTenant, formatCurrency } from "../config/tenants";

export function StructuredData() {
  const project = activeTenant.project;
  const baseUrl = "https://www.castrejonbienesyraices.com";
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Castrejón Bienes y Raíces",
        inLanguage: "es-MX",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/proyectos?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${baseUrl}/#organization`,
        name: activeTenant.brand,
        alternateName: "Castrejón Bienes y Raíces",
        slogan: activeTenant.slogan,
        url: `${baseUrl}/`,
        logo: `${baseUrl}/brand/CBR-LOGO.webp`,
        image: `${baseUrl}/videos/CBR-intro-poster.jpg`,
        telephone: activeTenant.contact.whatsapp,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle 20 de noviembre, colonia Lázaro Cárdenas",
          addressLocality: "Jojutla",
          addressRegion: "Morelos",
          addressCountry: "MX",
        },
        areaServed: [
          "Jojutla, Morelos",
          "Zona sur de Morelos",
          "Tequesquitengo, Morelos",
          "Zacatepec, Morelos",
          "Tlaquiltenango, Morelos",
        ],
        knowsAbout: [
          "terrenos en Morelos",
          "terrenos en Jojutla",
          "terrenos zona sur",
          "terrenos Tequesquitengo",
          "terrenos Zacatepec",
          "terrenos Tlaquiltenango",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: activeTenant.contact.whatsapp,
          contactType: "sales",
          areaServed: "MX",
          availableLanguage: "Spanish",
        },
      },
      {
        "@type": "Product",
        "@id": `${baseUrl}/secciones/cumbres-de-bendicion#project`,
        name: project.name,
        description: `${project.name} ofrece terrenos en Jojutla, Morelos, con lotes de ${project.lots}, medidas ${project.dimensions}, ubicación en ${project.location}. Enganche ${formatCurrency(project.downPayment)} y mensualidades de ${formatCurrency(project.monthlyPayment)}.`,
        brand: {
          "@id": `${baseUrl}/#organization`,
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "MXN",
          lowPrice: project.standardPrice,
          highPrice: project.mainStreetPrice,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "OfferCatalog",
        "@id": `${baseUrl}/proyectos#catalog`,
        name: "Terrenos en Morelos",
        description:
          "Catálogo de terrenos en Morelos, terrenos en Jojutla y oportunidades en zona sur como Tequesquitengo, Zacatepec y Tlaquiltenango.",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Landform",
              name: "Terrenos en Jojutla",
              description: "Lotes y terrenos en Jojutla, Morelos con documentación revisable.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Landform",
              name: "Terrenos en zona sur de Morelos",
              description: "Oportunidades de terrenos en zona sur, Tequesquitengo, Zacatepec y Tlaquiltenango.",
            },
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Dónde venden terrenos en Morelos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Castrejón Bienes y Raíces ofrece terrenos en Morelos, especialmente en Jojutla y zona sur, con información clara, ubicación verificable y atención directa por WhatsApp.",
            },
          },
          {
            "@type": "Question",
            name: "¿Hay terrenos en Jojutla con pagos mensuales?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `En Cumbres de Bendición hay lotes de ${project.lots} con enganche de ${formatCurrency(project.downPayment)} y mensualidades de ${formatCurrency(project.monthlyPayment)}.`,
            },
          },
          {
            "@type": "Question",
            name: "¿También muestran terrenos en Tequesquitengo, Zacatepec o Tlaquiltenango?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La página de terrenos está preparada para publicar locaciones y oportunidades en Morelos, incluyendo Tequesquitengo, Zacatepec, Tlaquiltenango, Jojutla y zona sur.",
            },
          },
        ],
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
