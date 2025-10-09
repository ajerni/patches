/**
 * SEO utility functions for generating meta tags and structured data
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(data: SEOData) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = data.url ? `${baseUrl}${data.url}` : baseUrl;
  const imageUrl = data.image ? (data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`) : undefined;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords?.join(', '),
    openGraph: {
      title: data.title,
      description: data.description,
      url: fullUrl,
      type: data.type || 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      siteName: 'Synth Patch Library',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Generate structured data for a patch
 */
export function generatePatchStructuredData(patch: {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  user: { name: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": patch.title,
    "description": patch.description,
    "author": {
      "@type": "Person",
      "name": patch.user.name
    },
    "dateCreated": patch.createdAt,
    "dateModified": patch.updatedAt,
    "keywords": patch.tags.join(', '),
    "url": `${baseUrl}/patches/${patch.id}`,
    "image": patch.images.length > 0 ? patch.images[0] : undefined,
    "genre": "Modular Synthesis",
    "about": "Synthesizer Patch",
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Synth Patch Library",
      "url": baseUrl
    }
  };
}

/**
 * Generate structured data for a module
 */
export function generateModuleStructuredData(module: {
  id: string;
  name: string;
  manufacturer: string;
  types: string[];
  notes?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  user: { name: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${module.manufacturer} ${module.name}`,
    "description": module.notes || `Modular synthesizer module: ${module.manufacturer} ${module.name}`,
    "brand": {
      "@type": "Brand",
      "name": module.manufacturer
    },
    "category": "Modular Synthesizer Module",
    "additionalProperty": module.types.map(type => ({
      "@type": "PropertyValue",
      "name": "Type",
      "value": type
    })),
    "image": module.images.length > 0 ? module.images[0] : undefined,
    "url": `${baseUrl}/modules/${module.id}`,
    "dateCreated": module.createdAt,
    "dateModified": module.updatedAt,
    "creator": {
      "@type": "Person",
      "name": module.user.name
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Synth Patch Library",
      "url": baseUrl
    }
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Synth Patch Library",
    "description": "Free online tool for documenting and organizing your modular synthesizer patches",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Synth Patch Library"
    }
  };
}
