import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import Hero from '@/components/reactbits/Hero';
import FeatureGrid from '@/components/reactbits/FeatureGrid';
import Stepper from '@/components/reactbits/Stepper';
import AnimatedSection, { AnimatedItem } from '@/components/reactbits/AnimatedSection';
import { Button } from '@/components/ui/button';
import { useLocalizedPath } from '@/hooks/use-localized-path';
import type { HeroContent, SectionList, Workflow, CtaContent, SeoContent } from '@/types/marketing-page';

interface MarketingPageTemplateProps {
  /**
   * The translation namespace to use for this page
   */
  translationNamespace: string;
}

/**
 * Reusable template for marketing pages with Hero, Benefits, Workflow, Highlights, and CTA sections
 */
const MarketingPageTemplate: React.FC<MarketingPageTemplateProps> = ({ translationNamespace }) => {
  const { t, i18n } = useTranslation(translationNamespace);
  const localizePath = useLocalizedPath();

  const hero = t('hero', { returnObjects: true }) as HeroContent;
  const benefits = t('benefits', { returnObjects: true }) as SectionList;
  const workflow = t('workflow', { returnObjects: true }) as Workflow;
  const highlights = t('highlights', { returnObjects: true }) as SectionList;
  const pageCta = t('cta', { returnObjects: true }) as CtaContent;
  const seo = t('seo', { returnObjects: true }) as SeoContent;

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        ogTitle={seo.title}
        ogDescription={seo.description}
        locale={i18n.language}
      />
      <div className="flex flex-col items-center gap-16">
        <Hero
          title={hero.title}
          subtitle={hero.subtitle}
          action={{ label: hero.cta.label, href: localizePath(hero.cta.href) }}
          depth="overlay"
        />
        <FeatureGrid title={benefits.title} features={benefits.items} depth="surface" />
        <Stepper title={workflow.title} steps={workflow.steps} depth="overlay" />
        <FeatureGrid title={highlights.title} features={highlights.items} depth="surface" />
        <AnimatedSection
          depth="overlay"
          className="w-full"
          containerClassName="flex flex-col items-center gap-6 text-center max-w-3xl"
        >
          <AnimatedItem as="h2" className="text-3xl font-semibold text-boteco-neutral md:text-4xl">
            {pageCta.title}
          </AnimatedItem>
          <AnimatedItem as="p" className="text-lg text-boteco-neutral/80">
            {pageCta.description}
          </AnimatedItem>
          <AnimatedItem>
            <Button
              asChild
              size="lg"
              depth="overlay"
              className="bg-boteco-tertiary text-boteco-neutral hover:bg-boteco-tertiary/90"
            >
              <Link to={localizePath(pageCta.button.href)} className="flex items-center gap-2">
                {pageCta.button.label}
              </Link>
            </Button>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </>
  );
};

export default MarketingPageTemplate;
