import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AnimatedSection, { AnimatedItem } from '@/components/reactbits/AnimatedSection';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocalizedPath } from '@/hooks/use-localized-path';

interface SolutionItem {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  badge?: string;
}

interface SolutionsContent {
  title: string;
  subtitle?: string;
  items: SolutionItem[];
}

const SolutionsSection: React.FC = () => {
  const { t } = useTranslation('home');
  const localizePath = useLocalizedPath();

  const solutions = t('solutions', { returnObjects: true }) as SolutionsContent;

  if (!solutions?.items?.length) {
    return null;
  }

  return (
    <AnimatedSection depth="surface" containerClassName="space-y-10">
      <div className="text-center space-y-4">
        <AnimatedItem as="h2" className="text-3xl font-bold text-boteco-neutral md:text-4xl">
          {solutions.title}
        </AnimatedItem>
        {solutions.subtitle && (
          <AnimatedItem as="p" className="mx-auto max-w-2xl text-lg text-boteco-neutral/80">
            {solutions.subtitle}
          </AnimatedItem>
        )}
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {solutions.items.map((item) => (
          <AnimatedItem key={item.title} className="flex">
            <Card
              depth="overlay"
              className="flex flex-col flex-1 justify-between border-none bg-depth-overlay/90 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl mb-1"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl font-semibold text-boteco-neutral">
                    {item.title}
                  </CardTitle>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-boteco-tertiary text-boteco-neutral">
                      {item.badge}
                    </Badge>
                  )}
                </div>
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
          </AnimatedItem>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default SolutionsSection;
