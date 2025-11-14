import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Seo from '@/components/Seo';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';

// Lazy load below-the-fold sections to improve initial page load
const SolutionsSection = lazy(() => import('@/components/home/SolutionsSection'));
const HowItWorksSection = lazy(() => import('@/components/home/HowItWorksSection'));
const PlansSection = lazy(() => import('@/components/home/PlansSection'));
const PlatformCarouselSection = lazy(() => import('@/components/home/PlatformCarouselSection'));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));
const FaqSection = lazy(() => import('@/components/home/FaqSection'));
const EcosystemCtaSection = lazy(() => import('@/components/home/EcosystemCtaSection'));
const FinalCtaSection = lazy(() => import('@/components/home/FinalCtaSection'));

const SectionSkeleton = () => (
  <div className="w-full py-12 flex items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-boteco-primary border-t-transparent"></div>
  </div>
);

const Home = () => {
  const { t, i18n } = useTranslation('home');
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const pageTitle = t('hero.title');
  const pageDescription = t('hero.subtitle');

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="flex flex-col items-stretch">
        {/* Above-the-fold content loads immediately */}
        <HeroSection />
        <FeaturesSection />
        
        {/* Group 1: Core product information - loads first */}
        <Suspense fallback={<SectionSkeleton />}>
          <SolutionsSection />
          <HowItWorksSection />
          <PlansSection />
        </Suspense>
        
        {/* Group 2: Social proof and engagement - loads second */}
        <Suspense fallback={<SectionSkeleton />}>
          <PlatformCarouselSection />
          <TestimonialsSection />
        </Suspense>
        
        {/* Group 3: FAQ and CTAs - loads last */}
        <Suspense fallback={<SectionSkeleton />}>
          <FaqSection />
          <EcosystemCtaSection />
          <FinalCtaSection />
        </Suspense>
      </div>
    </>
  );
};

export default Home;