import React from 'react';
import { useTranslation } from 'react-i18next';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MoveRight } from 'lucide-react';
import Seo from '@/components/Seo'; // Importar o componente Seo
import { Link, useParams } from 'react-router-dom'; // Importar Link e useParams

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation('blog');
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const posts = t('posts', { returnObjects: true }) as {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    cover: string;
    tags: string[];
    content: string;
  }[];

  const pageTitle = t('title');
  const pageDescription = t('description');
  const readMoreLabel = t('readMore', { defaultValue: 'Read more' });
  const overlayLabel = t('depthLabels.overlay', { defaultValue: 'Overlay' });
  const tagsLabel = t('tagsLabel', { defaultValue: 'Tags' });

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-6 text-center text-4xl font-bold text-boteco-primary">
          {t('title')}
        </h1>
        <p className="mb-12 text-center text-xl text-boteco-neutral/90">
          {t('description')}
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/${currentLocale}/blog/${post.slug}`}
              className="group flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2"
              aria-label={`${post.title} – ${readMoreLabel}`}
            >
              <Card
                depth="overlay"
                className="flex flex-col flex-1 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl mb-1"
              >
                <CardHeader className="space-y-4 pb-0">
                  <div className="relative">
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={post.cover}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full rounded-md object-cover"
                      />
                    </AspectRatio>
                    <span
                      aria-hidden="true"
                      className="absolute left-3 top-3 rounded-full bg-boteco-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                    >
                      {overlayLabel}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-boteco-neutral/70">
                    <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>{post.date}</span>
                  </div>
                  <CardTitle className="text-2xl font-semibold text-boteco-neutral">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-base text-boteco-neutral/80">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="flex flex-wrap gap-2" aria-label={tagsLabel}>
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
                </CardContent>
                <CardFooter className="items-center justify-between pt-0 text-boteco-secondary">
                  <span className="inline-flex items-center font-medium tracking-wide">
                    {readMoreLabel}
                    <MoveRight
                      className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
