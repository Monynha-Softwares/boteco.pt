"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { motion, Variants, Easing } from 'framer-motion';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestimonialsCarouselProps {
  testimonials: { text: string; author: string }[];
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ testimonials }) => {
  const { t } = useTranslation('home');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = React.useCallback((api: EmblaCarouselType) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as Easing } },
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4"> {/* Adjust margin to compensate for item padding */}
          {testimonials.map((testimonial, index) => (
            <div className="flex-none w-full pl-4" key={index}> {/* Add padding to items */}
              <motion.div variants={itemVariants} custom={index}>
                <Card
                  depth="overlay"
                  className="p-6 h-full flex flex-col justify-between"
                >
                  <CardContent className="text-lg italic text-boteco-neutral/80 mb-4">
                    "{testimonial.text}"
                  </CardContent>
                  <CardFooter className="text-right font-semibold text-boteco-primary">
                    - {testimonial.author}
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        depth="overlay"
        className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 z-10 text-boteco-neutral hover:bg-depth-overlay/80"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        depth="overlay"
        className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 rounded-full p-2 z-10 text-boteco-neutral hover:bg-depth-overlay/80"
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default TestimonialsCarousel;