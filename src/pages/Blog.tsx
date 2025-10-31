import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import Seo from '@/components/Seo'; // Importar o componente Seo
import { Link, useParams } from 'react-router-dom'; // Importar Link e useParams

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation('blog');
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const posts = t('posts', { returnObjects: true }) as { id: string; title: string; excerpt: string; date: string }[];

  const pageTitle = t('title');
  const pageDescription = t('description');

  // Função para gerar o slug a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-'); // Remove hífens duplicados
  };

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
        <h1 className="text-4xl font-bold text-center mb-6 text-boteco-primary">
          {t('title')}
        </h1>
        <p className="text-xl text-center mb-12 text-boteco-neutral/90">
          {t('description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              depth="overlay"
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-boteco-neutral">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center text-boteco-neutral/80">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-boteco-neutral/90">
                  {post.excerpt}
                </p>
                <Link to={`/${currentLocale}/blog/${generateSlug(post.title)}`} className="text-boteco-secondary hover:underline mt-4 inline-block">
                  {t('readMore', { defaultValue: 'Leia Mais' })}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;