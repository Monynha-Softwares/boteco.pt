import * as React from "react";

import { cn } from "@/lib/utils";

type DepthLevel = "none" | "surface" | "overlay" | "elevated";

const cardDepthStyles: Record<DepthLevel, string> = {
  none: "bg-transparent text-foreground",
  surface:
    "bg-depth-surface text-foreground border border-depth-surface/60 shadow-sm",
  overlay:
    "bg-depth-overlay text-foreground border border-depth-overlay/60 shadow-md",
  elevated:
    "bg-depth-elevated text-foreground border border-depth-elevated/50 shadow-lg",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: DepthLevel;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, depth = "surface", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg transition-shadow", cardDepthStyles[depth], className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
