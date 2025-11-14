import AnimatedSection, { AnimatedItem, type DepthLevel } from './AnimatedSection';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type PricingOption = {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
};

type PricingTableProps = {
  title: string;
  description: string;
  options: PricingOption[];
  depth?: DepthLevel;
  className?: string;
  ctaLabel?: string;
};

const PricingTable = ({
  title,
  description,
  options,
  depth = 'surface',
  className,
  ctaLabel,
}: PricingTableProps) => {
  return (
    <AnimatedSection depth={depth} className={className} containerClassName="space-y-12 text-center">
      <AnimatedItem as="h2" className="text-3xl font-bold text-boteco-neutral md:text-4xl">
        {title}
      </AnimatedItem>
      <AnimatedItem as="p" className="mx-auto max-w-2xl text-lg text-boteco-neutral/80">
        {description}
      </AnimatedItem>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 auto-rows-fr">
        {options.map((option) => (
          <AnimatedItem key={option.name} className="flex">
            <Card
              depth={option.highlight ? 'elevated' : 'overlay'}
              className={cn(
                'flex flex-col flex-1 border-none p-6 text-left shadow-lg transition-all duration-300',
                option.highlight
                  ? 'bg-depth-elevated text-boteco-neutral-soft-foreground ring-2 ring-boteco-secondary'
                  : 'bg-depth-overlay/80 hover:-translate-y-1 hover:shadow-xl mb-1',
              )}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">{option.name}</CardTitle>
                <CardDescription className="text-lg text-boteco-neutral/80">
                  {option.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-left text-base">
                      <Check aria-hidden="true" className="mt-1 h-5 w-5 text-boteco-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {ctaLabel ? (
                <CardFooter>
                  <Button
                    variant={option.highlight ? 'default' : 'outline'}
                    className={cn(
                      option.highlight
                        ? 'bg-boteco-secondary text-boteco-secondary-foreground hover:bg-boteco-secondary/90'
                        : 'border-boteco-primary text-boteco-primary hover:bg-boteco-primary hover:text-boteco-primary-foreground',
                    )}
                  >
                    {ctaLabel}
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
          </AnimatedItem>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default PricingTable;
