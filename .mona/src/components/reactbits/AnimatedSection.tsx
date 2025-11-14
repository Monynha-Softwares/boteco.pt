import { ForwardedRef, forwardRef, ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export type DepthLevel = 'surface' | 'overlay' | 'elevated';

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  depth?: DepthLevel;
  variant?: 'fade' | 'fade-up';
  as?: keyof JSX.IntrinsicElements;
  id?: string;
  'aria-labelledby'?: string;
  containerClassName?: string;
};

const sectionVariants: Record<'fade' | 'fade-up', Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  },
  'fade-up': {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  },
};

const depthStyles: Record<DepthLevel, string> = {
  surface: 'bg-depth-surface text-foreground',
  overlay: 'bg-depth-overlay text-foreground',
  elevated: 'bg-depth-elevated text-boteco-neutral-soft-foreground',
};

const BaseSection = forwardRef(function BaseSection(
  {
    as: Component = 'section',
    children,
    className,
    depth = 'surface',
    variant = 'fade-up',
    containerClassName,
    ...props
  }: AnimatedSectionProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <Component
        ref={ref as ForwardedRef<HTMLElement>}
        className={cn('w-full py-16', depthStyles[depth], className)}
        {...props}
      >
        <div className={cn('container px-4', containerClassName)}>{children}</div>
      </Component>
    );
  }

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      ref={ref as ForwardedRef<HTMLElement>}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants[variant]}
      className={cn('w-full py-16', depthStyles[depth], className)}
      {...props}
    >
      <div className={cn('container px-4', containerClassName)}>{children}</div>
    </MotionComponent>
  );
});

export type AnimatedItemProps = {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  variant?: 'fade' | 'fade-up';
};

const itemVariants: Record<'fade' | 'fade-up', Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  },
  'fade-up': {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
};

export const AnimatedItem = ({
  as: Component = 'div',
  children,
  className,
  variant = 'fade-up',
  ...props
}: AnimatedItemProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={itemVariants[variant]}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default BaseSection;
