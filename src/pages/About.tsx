"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Users, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo';
import AnimatedSection, { AnimatedItem } from '@/components/reactbits/AnimatedSection'; // Import AnimatedSection and AnimatedItem

const About: React.FC = () => {
  const { t, i18n } = useTranslation('about');

  const values = t('values', { returnObjects: true }) as string[];

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
        <AnimatedItem
          as="h1"
          className="text-4xl font-bold text-center mb-12 text-boteco-primary"
        >
          {t('title')}
        </AnimatedItem>

        <AnimatedSection
          depth="surface"
          containerClassName="mb-12 text-center max-w-3xl mx-auto"
        >
          <AnimatedItem as="p" className="text-xl text-boteco-neutral/90 mb-4">
            {t('mission')}
          </AnimatedItem>
          <AnimatedItem as="p" className="text-lg text-boteco-neutral/80">
            {t('vision')}
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection
          depth="overlay"
          containerClassName="mb-12"
        >
          <AnimatedItem as="h2" className="text-3xl font-bold text-center mb-8 text-boteco-neutral">
            {t('valuesTitle', { defaultValue: 'Nossos Valores' })}
          </AnimatedItem>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto auto-rows-fr">
            <AnimatedItem className="flex">
              <Card
                depth="overlay"
                className="text-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-1 flex flex-col flex-1"
              >
                <CardHeader>
                  <Lightbulb className="h-12 w-12 text-boteco-secondary mx-auto mb-4" />
                  <CardTitle className="text-xl font-semibold text-boteco-primary">{values[0]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-boteco-neutral/80">{t('valueDescription1', { defaultValue: 'Celebramos a individualidade e a riqueza das diferentes perspectivas.' })}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
            <AnimatedItem className="flex">
              <Card
                depth="overlay"
                className="text-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-1 flex flex-col flex-1"
              >
                <CardHeader>
                  <ShieldCheck className="h-12 w-12 text-boteco-secondary mx-auto mb-4" />
                  <CardTitle className="text-xl font-semibold text-boteco-primary">{values[1]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-boteco-neutral/80">{t('valueDescription2', { defaultValue: 'Buscamos constantemente novas formas de superar desafios e inovar.' })}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
            <AnimatedItem className="flex">
              <Card
                depth="overlay"
                className="text-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-1 flex flex-col flex-1"
              >
                <CardHeader>
                  <Users className="h-12 w-12 text-boteco-secondary mx-auto mb-4" />
                  <CardTitle className="text-xl font-semibold text-boteco-primary">{values[2]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-boteco-neutral/80">{t('valueDescription3', { defaultValue: 'Trabalhamos juntos, com honestidade, para alcançar nossos objetivos.' })}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        <AnimatedSection
          depth="surface"
          containerClassName="max-w-4xl mx-auto text-boteco-neutral"
        >
          <AnimatedItem as="h2" className="text-3xl font-bold text-center mb-8 text-boteco-neutral">
            {t('storyTitle', { defaultValue: 'Nossa História' })}
          </AnimatedItem>
          <AnimatedItem as="p" className="text-lg leading-relaxed mb-6">
            {t('story')}
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection
          depth="overlay"
          containerClassName="max-w-4xl mx-auto text-boteco-neutral mt-12"
        >
          <AnimatedItem as="h2" className="text-3xl font-bold text-center mb-8 text-boteco-neutral">
            {t('partnership.title', { defaultValue: 'Parceria Tecnológica' })}
          </AnimatedItem>
          <AnimatedItem as="p" className="text-lg leading-relaxed mb-4 text-center">
            {t('partnership.description')}
          </AnimatedItem>
          <AnimatedItem className="text-center">
            <a
              href={t('partnership.linkUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-boteco-primary hover:text-boteco-secondary transition-colors duration-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2"
              aria-label={t('partnership.linkAriaLabel')}
            >
              {t('partnership.linkText')}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </>
  );
};

export default About;