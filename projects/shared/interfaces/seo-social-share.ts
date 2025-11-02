export interface SeoSocialShare {
  title?: string;
  keywords?: string;
  description?: string;
  image?: string;
  imageAuxData?: ImageAuxData;
  url?: string;
  type?: string;
  author?: string;
  section?: string;
  published?: string;
  modified?: string;
  jsonLd?: JsonLdData;
}

export interface ImageAuxData {
  width?: number;
  height?: number;
  secureUrl?: string;
  mimeType?: string;
  alt?: string;
}

export interface JsonLdData {
  '@context': 'https://schema.org';
  '@type': string;
  headline?: string;
  description?: string;
  image?: string;
  author?: { '@type': 'Person'; name: string };
  publisher?: { '@type': 'Organization'; name: string; logo?: { '@type': 'ImageObject'; url: string } };
  datePublished?: string;
  dateModified?: string;
}
