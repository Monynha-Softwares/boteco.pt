import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection, { AnimatedItem, type DepthLevel } from './AnimatedSection';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeroAction = {
  label: string;
  href: string;
  'aria-label'?: string;
  external?: boolean;
};

type HeroProps = {
  title: string;
  subtitle: string;
  action: HeroAction;
  secondaryAction?: HeroAction;
  depth?: DepthLevel;
  align?: 'center' | 'start';
  className?: string;
};

const Hero = ({
  title,
  subtitle,
  action,
  secondaryAction,
  depth = 'overlay',
  align = 'center',
  className,
}: HeroProps) => {
  const ActionLink = ({ action: actionToRender, children }: { action: HeroAction; children: ReactNode }) => {
    if (actionToRender.external) {
      return (
        <a
          href={actionToRender.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={actionToRender['aria-label'] ?? actionToRender.label}
        >
          {children}
        </a>
      );
    }

    return (
      <Link to={actionToRender.href} aria-label={actionToRender['aria-label'] ?? actionToRender.label}>
        {children}
      </Link>
    );
  };

  return (
    <AnimatedSection
      depth={depth}
      className={cn(
        'relative overflow-hidden py-20 md:py-28 lg:py-36',
        'bg-gradient-to-br from-boteco-primary to-boteco-secondary text-boteco-primary-foreground',
        className,
      )}
      variant="fade"
      containerClassName={cn(
        'flex flex-col items-center gap-6 text-center',
        align === 'start' && 'items-start text-left',
      )}
    >
      <AnimatedItem as="h1" className="text-4xl font-bold tracking-tight md:text-6xl">
        {title}
      </AnimatedItem>
      <AnimatedItem as="p" className="max-w-3xl text-lg md:text-2xl text-boteco-primary-foreground/90">
        {subtitle}
      </AnimatedItem>
      <AnimatedItem>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="group bg-boteco-tertiary text-boteco-neutral hover:bg-boteco-tertiary/90 focus-visible:ring-offset-2"
          >
            <ActionLink action={action}>
              <span className="flex items-center gap-2">
                {action.label}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </ActionLink>
          </Button>
          {secondaryAction ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-transparent bg-white text-boteco-primary shadow-lg transition hover:bg-white/90 focus-visible:ring-offset-2"
            >
              <ActionLink action={secondaryAction}>
                <span className="font-semibold">{secondaryAction.label}</span>
              </ActionLink>
            </Button>
          ) : null}
        </div>
      </AnimatedItem>
    </AnimatedSection>
  );
};

export default Hero;
