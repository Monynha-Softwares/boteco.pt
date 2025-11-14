import AnimatedSection, { AnimatedItem, type DepthLevel } from './AnimatedSection';
import { cn } from '@/lib/utils';

type Step = {
  title: string;
  description: string;
};

type StepperProps = {
  title: string;
  steps: Step[];
  depth?: DepthLevel;
  className?: string;
};

const Stepper = ({ title, steps, depth = 'surface', className }: StepperProps) => {
  return (
    <AnimatedSection depth={depth} className={className} containerClassName="space-y-10">
      <AnimatedItem as="h2" className="text-center text-3xl font-bold text-boteco-neutral md:text-4xl">
        {title}
      </AnimatedItem>
      <ol className="grid gap-8 md:grid-cols-3" aria-label={title}>
        {steps.map((step, index) => (
          <AnimatedItem
            as="li"
            key={step.title}
            className="flex flex-col gap-3 rounded-lg border border-boteco-tertiary/40 bg-depth-overlay/60 p-6 text-left shadow-sm"
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold',
                'bg-boteco-primary text-boteco-primary-foreground shadow-md',
              )}
            >
              {index + 1}
            </span>
            <h3 className="text-xl font-semibold text-boteco-neutral">{step.title}</h3>
            <p className="text-base text-boteco-neutral/80">{step.description}</p>
          </AnimatedItem>
        ))}
      </ol>
    </AnimatedSection>
  );
};

export default Stepper;
