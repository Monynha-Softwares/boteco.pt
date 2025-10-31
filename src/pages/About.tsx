"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Users, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo';
import { motion, Variants, Easing } from 'framer-motion'; // Importar motion e Variants

const About: React.FC = () => {
  const { t, i18n } = useTranslation('about');

  const values = t('values', { returnObjects: true }) as string[];

  const pageTitle = t('title');
  const pageDescription = t('mission');

  // Variantes para as seções
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as Easing } },
  };

  // Variantes para os itens dentro das seções (cards, parágrafos)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as Easing } },
  };

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-12 text-boteco-primary"
        >
          {t('title')}
        </motion.h1>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="mb-12 text-center max-w-3xl mx-auto"
        >
          <motion.p variants={itemVariants} className="text-xl text-boteco-neutral/90 mb-4">
            {t('mission')}
          </motion.p>
          <motion.p variants={itemVariants} className="text-lg text-boteco-neutral/80">
            {t('vision')}
          </motion.p>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="mb-12"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-8 text-boteco-neutral">
            {t('valuesTitle', { defaultValue: 'Nossos Valores' })}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
              <Card
                depth="overlay"
                className="text-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader>
                  <Lightbulb className="h-12 w-12 text-boteco-secondary mx-auto mb-4" />
                  <CardTitle className="text-xl font-semibold text-boteco-primary">{values[0]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-boteco-neutral/80">{t('valueDescription1', { defaultValue: 'Celebramos a individualidade e a riqueza das diferentes perspectivas.' })}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card
                depth="overlay"
                className="text-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader>
                  <ShieldCheck className="h-12 w-12 text-boteco-secondary mx-auto mb-4" />
                  <CardTitle className="text-xl font-semibold text-boteco-primary">{values[1]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-boteco-neutral/80">{t('valueDescription2', { defaultValue: 'Buscamos constantemente novas formas de superar desafios e inovar.' })}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card
                depth="overlay"
                className="text-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader>
                  <Users className="h-12 w-12 text-boteco-secondary mx-auto mb-4" />
                  <CardTitle className="text-xl font-semibold text-boteco-primary">{values[2]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-boteco-neutral/80">{t('valueDescription3', { defaultValue: 'Trabalhamos juntos, com honestidade, para alcançar nossos objetivos.' })}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="max-w-4xl mx-auto text-boteco-neutral"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-8 text-boteco-neutral">
            {t('storyTitle', { defaultValue: 'Nossa História' })}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg leading-relaxed mb-6">
            {t('story')}
          </motion.p>
        </motion.section>
      </div>
    </>
  );
};

export default About;