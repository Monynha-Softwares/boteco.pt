import { useEffect, useMemo, useState } from 'react';
import AnimatedSection, { AnimatedItem, type DepthLevel } from './AnimatedSection';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Testimonial = {
  text: string;
  author: string;
};

export type TestimonialCarouselProps = {
  title: string;
  testimonials: Testimonial[];
  depth?: DepthLevel;
  className?: string;
};

const TestimonialCarousel = ({ title, testimonials, depth = 'surface', className }: TestimonialCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const handleSetApi = (api: CarouselApi) => {
    setCarouselApi(api);
  };
  const safeTestimonials = useMemo(
    () => (testimonials.length > 0 ? testimonials : [{ text: '', author: '' }]),
    [testimonials],
  );

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => setActiveIndex(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    onSelect();

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  return (
    <AnimatedSection
      depth={depth}
      className={className}
      containerClassName="space-y-8 text-center"
      aria-labelledby="testimonials-heading"
    >
      <AnimatedItem as="h2" id="testimonials-heading" className="text-3xl font-bold text-boteco-neutral md:text-4xl">
        {title}
      </AnimatedItem>
      <AnimatedItem>
        <Carousel opts={{ loop: true, align: 'center' }} setApi={handleSetApi} className="mx-auto max-w-3xl">
          <CarouselContent>
            {safeTestimonials.map((testimonial, index) => (
              <CarouselItem key={`${testimonial.author}-${index}`} className="px-1">
                <Card
                  depth="overlay"
                  className={cn(
                    'mx-auto flex h-full max-w-3xl flex-col justify-center gap-4 border-none bg-depth-overlay/80 p-8 text-left shadow-lg',
                  )}
                  aria-roledescription="slide"
                  aria-label={`${index + 1} ${title}`}
                >
                  <CardHeader className="space-y-4">
                    <CardDescription className="text-lg text-boteco-neutral/90">
                      “{testimonial.text}”
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold uppercase tracking-wide text-boteco-primary">
                      {testimonial.author}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" aria-label={`${title} previous`} />
          <CarouselNext className="hidden md:flex" aria-label={`${title} next`} />
          <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label={`${title} navigation`}>
            {safeTestimonials.map((testimonial, index) => (
              <button
                key={`${testimonial.author}-${index}-dot`}
                type="button"
                className={cn(
                  'h-2.5 w-2.5 rounded-full bg-boteco-neutral/30 transition-colors',
                  index === activeIndex && 'bg-boteco-secondary',
                )}
                aria-label={`${title} ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => {
                  setActiveIndex(index);
                  carouselApi?.scrollTo(index);
                }}
              />
            ))}
          </div>
        </Carousel>
      </AnimatedItem>
    </AnimatedSection>
  );
};

export default TestimonialCarousel;
