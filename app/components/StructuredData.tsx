export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "智能提示词优化器",
    "alternativeName": "AI Prompt Optimizer",
    "description": "使用六维度优化框架，将模糊的想法转化为精准的AI提示词",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "5000"
    },
    "creator": {
      "@type": "Organization",
      "name": "Your Company",
      "url": "https://your-domain.com"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}