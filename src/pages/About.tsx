import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Users, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo'; // Importar o componente Seo

const About: React.FC = () => {
  const { t, i18n } = useTranslation('about');

  const values = t('values', { returnObjects: true }) as string[];
  const contentSections = t('content', { returnObjects: true }) as { heading: string; text: string }[];

  const pageTitle = t('title');
  const pageDescription = t('mission');

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
        <h1 className="text-4xl font-bold text-center mb-12 text-monynha-primary">
          {t('title')}
        </h1>

        <section className="mb-12 text-center max-w-3xl mx-auto">
          <p className="text-xl text-monynha-neutral-600 mb-4">
            {t('mission')}
          </p>
          <p className="text-lg text-monynha-neutral-500">
            {t('vision')}
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-monynha-neutral-700">
            {t('valuesTitle', { defaultValue: 'Nossos Valores' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-monynha-secondary mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold text-monynha-primary">{values[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-monynha-neutral-500">{t('valueDescription1', { defaultValue: 'Celebramos a individualidade e a riqueza das diferentes perspectivas.' })}</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <ShieldCheck className="h-12 w-12 text-monynha-secondary mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold text-monynha-primary">{values[1]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-monynha-neutral-500">{t('valueDescription2', { defaultValue: 'Buscamos constantemente novas formas de superar desafios e inovar.' })}</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-monynha-secondary mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold text-monynha-primary">{values[2]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-monynha-neutral-500">{t('valueDescription3', { defaultValue: 'Trabalhamos juntos, com honestidade, para alcançar nossos objetivos.' })}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="max-w-4xl mx-auto text-monynha-neutral-700">
          <h2 className="text-3xl font-bold text-center mb-8 text-monynha-neutral-700">
            {t('storyTitle', { defaultValue: 'Nossa História' })}
          </h2>
          <p className="text-lg leading-relaxed mb-6">
            {t('story')}
          </p>
        </section>
      </div>
    </>
  );
};

export default About;