'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/hooks/use-translation';

export function DynamicMetadata() {
  const { t } = useTranslation();

  useEffect(() => {
    // Update document title
    document.title = t.metadata.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t.metadata.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = t.metadata.description;
      document.head.appendChild(meta);
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t.metadata.openGraph.title);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = t.metadata.openGraph.title;
      document.head.appendChild(meta);
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', t.metadata.openGraph.description);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = t.metadata.openGraph.description;
      document.head.appendChild(meta);
    }
  }, [t]);

  return null;
}