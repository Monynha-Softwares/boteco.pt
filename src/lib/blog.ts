import enBlog from '@/content/en/blog.json';
import esBlog from '@/content/es/blog.json';
import frBlog from '@/content/fr/blog.json';
import ptBlog from '@/content/pt/blog.json';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
  tags: string[];
  content: string;
}

export interface BlogContent {
  title: string;
  description: string;
  readMore?: string;
  depthLabels?: Record<string, string>;
  notFound?: {
    title?: string;
    message?: string;
    cta?: string;
  };
  posts: BlogPost[];
}

const blogContentByLocale = {
  pt: ptBlog,
  en: enBlog,
  es: esBlog,
  fr: frBlog,
} as const satisfies Record<string, BlogContent>;

export type SupportedBlogLocale = keyof typeof blogContentByLocale;

export const FALLBACK_LOCALE: SupportedBlogLocale = 'pt';

export const supportedBlogLocales: SupportedBlogLocale[] = Object.keys(
  blogContentByLocale,
) as SupportedBlogLocale[];

export const normalizeLocale = (
  locale?: string,
): SupportedBlogLocale => {
  if (!locale) {
    return FALLBACK_LOCALE;
  }

  const normalized = locale.toLowerCase() as SupportedBlogLocale;

  if (supportedBlogLocales.includes(normalized)) {
    return normalized;
  }

  return FALLBACK_LOCALE;
};

export const getBlogContent = (
  locale?: string,
): BlogContent => blogContentByLocale[normalizeLocale(locale)];

export const findPostBySlug = (
  locale: string | undefined,
  slug: string | undefined,
): BlogPost | undefined => {
  if (!slug) {
    return undefined;
  }

  const content = getBlogContent(locale);
  return content.posts.find((post) => post.slug === slug);
};

export const fetchBlogContent = async (
  locale?: string,
): Promise<BlogContent> => Promise.resolve(getBlogContent(locale));
