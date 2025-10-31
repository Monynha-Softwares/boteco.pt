"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants, Easing } from 'framer-motion';

const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation('home');

  const howItWorksSteps = t('howItWorks.steps', { returnObjects: true }) as { title: string; description: string }[];

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
          {t('howItWorks.title')}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-monynha-secondary text-monynha-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-monynha-neutral-700">{step.title}</h3>
                <p className="text-monynha-neutral-500">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorksSection;