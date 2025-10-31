"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants, Easing } from 'framer-motion';
import TestimonialsCarousel from './TestimonialsCarousel'; // Importar o novo componente

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
      className="w-full py-16 bg-depth-surface"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-boteco-neutral">
          {t('testimonials.title')}
        </motion.h2>
        <TestimonialsCarousel testimonials={testimonials} /> {/* Usar o componente de carrossel */}
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;