"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, Variants, Easing } from 'framer-motion';

const FaqSection: React.FC = () => {
  const { t } = useTranslation('home');

  const faqItems = t('faq.items', { returnObjects: true }) as { question: string; answer: string }[];

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
      className="w-full py-16 bg-boteco-beige/30"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-boteco-brown">
          {t('faq.title')}
        </motion.h2>
        <motion.div variants={itemVariants}>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto text-left">
            {faqItems.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-semibold text-boteco-wine hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-boteco-brown/80">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FaqSection;