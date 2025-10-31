"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { motion, Variants, Easing } from 'framer-motion';

const PlansSection: React.FC = () => {
  const { t } = useTranslation('home');

  const plans = t('plans.options', { returnObjects: true }) as { name: string; price: string; features: string[] }[];

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
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-boteco-brown">
          {t('plans.title')}
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-boteco-brown/80 mb-12">
          {t('plans.description')}
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
              <Card className="p-8 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-boteco-wine mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-semibold text-boteco-brown/90">{plan.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-boteco-brown/80">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-boteco-mustard" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full bg-boteco-mustard text-boteco-mustard-foreground hover:bg-boteco-mustard/90">
                    {t('plans.choosePlan', { defaultValue: 'Escolher Plano' })}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default PlansSection;