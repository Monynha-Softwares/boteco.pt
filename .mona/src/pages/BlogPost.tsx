import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays } from 'lucide-react';

import Seo from '@/components/Seo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BlogPost as BlogPostType,
  fetchBlogContent,
  normalizeLocale,
} from '@/lib/blog';

const BlogPost: React.FC = () => {
  const { locale: localeParam, slug } = useParams<{
    locale: string;
    slug: string;
  }>();
  const { t, i18n } = useTranslation('blog');
  const normalizedLocale = normalizeLocale(localeParam);

  const { data, isPending } = useQuery({
    queryKey: ['blog', normalizedLocale],
    queryFn: () => fetchBlogContent(normalizedLocale),
    staleTime: 1000 * 60 * 5,
  });

  const post = React.useMemo<BlogPostType | undefined>(() => {
    if (!data) {
      return undefined;
    }

    return data.posts.find((item) => item.slug === slug);
  }, [data, slug]);

  const handleReturnLabel =
    data?.notFound?.cta ??
    t('notFound.cta', { defaultValue: 'Back to the blog' });
  const contentBlocks = React.useMemo(() => {
    if (!post) {
      return [] as { type: 'heading' | 'paragraph'; text: string }[];
    }

    const blocks: { type: 'heading' | 'paragraph'; text: string }[] = [];
    const rawSections = post.content.split(/\n{2,}/);

    rawSections.forEach((section) => {
      const trimmed = section.trim();
      if (!trimmed) {
        return;
      }

      if (trimmed.startsWith('## ')) {
        blocks.push({ type: 'heading', text: trimmed.replace(/^##\s*/, '') });
        return;
      }

      if (trimmed.startsWith('# ')) {
        const headingText = trimmed.replace(/^#\s*/, '');
        if (headingText.toLowerCase() !== post.title.toLowerCase()) {
          blocks.push({ type: 'heading', text: headingText });
        }
        return;
      }

      blocks.push({
        type: 'paragraph',
        text: trimmed.replace(/\s*\n\s*/g, ' '),
      });
    });

    return blocks;
  }, [post]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    );
  }

  if (!post || !slug) {
    const notFoundTitle =
      data?.notFound?.title ??
      t('notFound.title', { defaultValue: 'Post not found' });
    const notFoundMessage =
      data?.notFound?.message ??
      t('notFound.message', {
        defaultValue: 'The article you were looking for is no longer available.',
      });

    return (
      <div className="container mx-auto px-4 py-12">
        <Seo
          title={notFoundTitle}
          description={notFoundMessage}
          ogTitle={notFoundTitle}
          ogDescription={notFoundMessage}
          locale={i18n.language}
        />
        <Card
          depth="overlay"
          className="mx-auto max-w-3xl text-center shadow-lg"
          aria-live="polite"
        >
          <CardContent className="space-y-6 py-12">
            <h1 className="text-3xl font-semibold text-boteco-primary">
              {notFoundTitle}
            </h1>
            <p className="text-boteco-neutral/80">{notFoundMessage}</p>
            <div>
              <Button
                asChild
                variant="secondary"
                className="active:scale-98 transition-transform"
              >
                <Link to={`/${normalizedLocale}/blog`}>{handleReturnLabel}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pageDescription = post.excerpt || post.title;
  const readTimeEstimate = Math.max(
    2,
    Math.round(post.content.split(/\s+/).length / 180),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title={post.title}
        description={pageDescription}
        ogTitle={post.title}
        ogDescription={pageDescription}
        ogImage={post.cover}
        locale={i18n.language}
      />
      <div className="mb-8">
        <Button
          asChild
          variant="ghost"
          className="text-boteco-secondary hover:text-boteco-secondary/80"
        >
          <Link
            to={`/${normalizedLocale}/blog`}
            aria-label={handleReturnLabel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            {handleReturnLabel}
          </Link>
        </Button>
      </div>

      <article className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-4">
          <p className="flex items-center text-sm font-medium uppercase tracking-wide text-boteco-neutral/70">
            <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{post.date}</span>
            <span className="mx-2 text-boteco-neutral/40" aria-hidden="true">
              •
            </span>
            <span>{t('readingTime', { count: readTimeEstimate, defaultValue: '{{count}} min read' })}</span>
          </p>
          <h1 className="text-4xl font-bold leading-tight text-boteco-primary">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-boteco-secondary/10 text-boteco-secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <img
          src={post.cover}
          alt={post.title}
          loading="lazy"
          className="h-64 w-full rounded-lg object-cover shadow-md"
        />

        <div className="prose prose-neutral max-w-none text-base leading-relaxed sm:text-lg">
          {contentBlocks.map((block, index) =>
            block.type === 'heading' ? (
              <h2 key={`${block.text}-${index}`} className="text-2xl font-semibold text-boteco-primary/90">
                {block.text}
              </h2>
            ) : (
              <p key={`${index}-${block.text.slice(0, 12)}`} className="text-boteco-neutral/90">
                {block.text}
              </p>
            ),
          )}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
