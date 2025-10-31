"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { motion, Variants, Easing } from 'framer-motion';

const FinalCtaSection: React.FC = () => {
  const { t } = useTranslation('home');
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

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
      className="w-full py-20 bg-boteco-primary text-boteco-primary-foreground text-center"
    >
      <div className="container mx-auto px-4">
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6">
          {t('finalCta.title')}
        </motion.h2>
        <motion.div variants={itemVariants}>
          <Link to={getLocalizedPath('/contato')}>
            <Button
              size="lg"
              variant="secondary"
              className="transition-colors duration-300 active:scale-98"
            >
              {t('finalCta.button')} <Lightbulb className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FinalCtaSection;