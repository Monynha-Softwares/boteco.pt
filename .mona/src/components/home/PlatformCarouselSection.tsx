import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AnimatedSection, { AnimatedItem } from '@/components/reactbits/AnimatedSection';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalizedPath } from '@/hooks/use-localized-path';

interface PlatformItem {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

interface PlatformContent {
  title: string;
  items: PlatformItem[];
}

const PlatformCarouselSection: React.FC = () => {
  const { t } = useTranslation('home');
  const localizePath = useLocalizedPath();

  const platform = t('platformCarousel', { returnObjects: true }) as PlatformContent;

  if (!platform?.items?.length) {
    return null;
  }

  return (
    <AnimatedSection depth="overlay" containerClassName="space-y-8">
      <AnimatedItem as="h2" className="text-center text-3xl font-bold text-boteco-primary-foreground md:text-4xl">
        {platform.title}
      </AnimatedItem>
      <Carousel opts={{ align: 'start' }} className="relative w-full">
        <CarouselContent>
          {platform.items.map((item) => (
            <CarouselItem key={item.title} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card depth="surface" className="h-full bg-depth-surface/95 p-6">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl font-semibold text-boteco-neutral">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-base text-boteco-neutral/80">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button
                    asChild
                    variant="link"
                    depth="none"
                    className="px-0 text-boteco-primary hover:text-boteco-secondary"
                  >
                    <Link to={localizePath(item.href)}>{item.ctaLabel}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex bg-boteco-primary text-boteco-primary-foreground hover:bg-boteco-primary/80" />
        <CarouselNext className="hidden md:flex bg-boteco-primary text-boteco-primary-foreground hover:bg-boteco-primary/80" />
      </Carousel>
    </AnimatedSection>
  );
};

export default PlatformCarouselSection;
