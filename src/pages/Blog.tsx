import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import Seo from '@/components/Seo'; // Importar o componente Seo

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation('blog');

  const posts = t('posts', { returnObjects: true }) as { id: string; title: string; excerpt: string; date: string }[];

  const pageTitle = t('title');
  const pageDescription = t('description');

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
        <h1 className="text-4xl font-bold text-center mb-6 text-boteco-wine">
          {t('title')}
        </h1>
        <p className="text-xl text-center mb-12 text-boteco-brown/90">
          {t('description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-boteco-brown">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center text-boteco-brown/80">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-boteco-brown/90">
                  {post.excerpt}
                </p>
                {/* You can add a Link to a detailed blog post page here */}
                <a href="#" className="text-boteco-mustard hover:underline mt-4 inline-block">
                  {t('readMore', { defaultValue: 'Leia Mais' })}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;