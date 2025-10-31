"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, Variants, Easing } from 'framer-motion';

const HeroSection: React.FC = () => {
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
      animate="visible"
      variants={sectionVariants}
      className="w-full py-20 md:py-32 lg:py-48 bg-gradient-to-r from-boteco-wine to-boteco-mustard text-boteco-wine-foreground text-center"
    >
      <div className="container mx-auto px-4">
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {t('hero.title')}
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          {t('hero.subtitle')}
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to={getLocalizedPath('/contato')}>
            <Button size="lg" className="bg-boteco-beige text-boteco-brown hover:bg-boteco-beige/80 hover:text-boteco-brown transition-colors duration-300">
              {t('hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;