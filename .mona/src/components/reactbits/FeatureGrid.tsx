import AnimatedSection, { AnimatedItem, type DepthLevel } from './AnimatedSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Feature = {
  title: string;
  description: string;
  iconLabel?: string;
};

type FeatureGridProps = {
  title: string;
  features: Feature[];
  depth?: DepthLevel;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClasses: Record<NonNullable<FeatureGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const FeatureGrid = ({ title, features, depth = 'surface', columns = 3, className }: FeatureGridProps) => {
  return (
    <AnimatedSection depth={depth} className={className} containerClassName="space-y-12 text-center">
      <AnimatedItem as="h2" className="text-3xl font-bold text-boteco-neutral md:text-4xl">
        {title}
      </AnimatedItem>
      <div className={cn('grid gap-6 text-left auto-rows-fr', columnClasses[columns])}>
        {features.map((feature) => (
          <AnimatedItem key={feature.title} className="flex">
            <Card
              depth="overlay"
              className="flex flex-col flex-1 gap-4 border-none bg-depth-overlay/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-1"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-boteco-secondary text-boteco-secondary-foreground">
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                  <span className="sr-only">{feature.iconLabel ?? feature.title}</span>
                </span>
                <CardTitle className="text-left text-xl font-semibold text-boteco-neutral">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-boteco-neutral/80">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </AnimatedItem>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default FeatureGrid;
