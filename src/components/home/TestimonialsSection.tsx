"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { motion, Variants, Easing } from 'framer-motion';

const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation('home');

  const testimonials = t('testimonials.quotes', { returnObjects: true }) as { text: string; author: string }[];

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as Easing } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as Easing } },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      className="w-full py-16 bg-white"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
          {t('testimonials.title')}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
              <Card className="p-6 shadow-lg bg-monynha-neutral-50">
                <CardContent className="text-lg italic text-monynha-neutral-600 mb-4">
                  "{testimonial.text}"
                </CardContent>
                <CardFooter className="text-right font-semibold text-monynha-primary">
                  - {testimonial.author}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;