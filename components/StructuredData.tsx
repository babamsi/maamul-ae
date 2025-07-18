import Script from "next/script"

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Maamul",
    description:
      "All-in-One Management Solution for East African Businesses to Streamline their operations with seamless payment integrations and powerful management tools.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Point of Sale (POS)",
      "Inventory Management",
      "Customer Management",
      "Supplier Management",
      "Analytics & Reporting",
      "Multi-Payment Integration",
    ],
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
