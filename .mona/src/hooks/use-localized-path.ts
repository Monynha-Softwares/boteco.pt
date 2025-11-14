import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Hook to generate locale-aware paths for navigation
 * @returns Function that converts a path to a locale-prefixed path
 */
export function useLocalizedPath() {
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const localizePath = useCallback(
    (path: string) => {
      if (!path) {
        return `/${currentLocale}`;
      }

      if (path.startsWith('http')) {
        return path;
      }

      const normalized = path.startsWith('/') ? path : `/${path}`;
      return `/${currentLocale}${normalized}`;
    },
    [currentLocale],
  );

  return localizePath;
}
