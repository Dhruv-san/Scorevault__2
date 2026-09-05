import { Institution, CityInfo } from '../types';

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

export function updatePageSeo(meta: SeoMetadata) {
  // Update Title
  document.title = meta.title.includes('Scorevault') ? meta.title : `${meta.title} | Scorevault India`;

  // Update Meta Description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', meta.description);

  // Update Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', meta.canonicalUrl || window.location.href);

  // Update OpenGraph Meta Tags
  setMetaTag('og:title', meta.title);
  setMetaTag('og:description', meta.description);
  setMetaTag('og:url', meta.canonicalUrl || window.location.href);
  setMetaTag('og:type', meta.type || 'website');
  if (meta.ogImage) {
    setMetaTag('og:image', meta.ogImage);
  }

  // Inject / Update JSON-LD Structured Data
  if (meta.jsonLd) {
    let scriptTag = document.querySelector('script[type="application/ld+json"]#scorevault-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', 'scorevault-jsonld');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(meta.jsonLd);
  }
}

function setMetaTag(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function generateEducationalOrganizationJsonLd(institution: Institution) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': institution.name,
    'alternateName': institution.shortName,
    'url': institution.website || `https://scorevault.in/institution/${institution.slug}`,
    'logo': institution.heroImage,
    'image': institution.heroImage,
    'description': institution.description,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': institution.address,
      'addressLocality': institution.locality,
      'addressRegion': institution.state,
      'postalCode': institution.pinCode,
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': institution.coordinates.lat,
      'longitude': institution.coordinates.lng
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': institution.rating,
      'reviewCount': Math.max(1, institution.reviewCount),
      'bestRating': '5',
      'worstRating': '1'
    }
  };
}
