"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { motion, Variants, Easing } from 'framer-motion';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation('home');

  const features = t('features', { returnObjects: true }) as { title: string; description: string }[];

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
          {t('featuresTitle', { defaultValue: 'Nossas Funcionalidades' })}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
              <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-boteco-wine flex items-center">
                    <CheckCircle className="mr-3 h-6 w-6 text-boteco-mustard" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-boteco-brown/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;