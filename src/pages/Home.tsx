import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Lightbulb, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Seo from '@/components/Seo'; // Importar o componente Seo

const Home = () => {
  const { t, i18n } = useTranslation('home');
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

  const features = t('features', { returnObjects: true }) as { title: string; description: string }[];
  const howItWorksSteps = t('howItWorks.steps', { returnObjects: true }) as { title: string; description: string }[];
  const plans = t('plans.options', { returnObjects: true }) as { name: string; price: string; features: string[] }[];
  const testimonials = t('testimonials.quotes', { returnObjects: true }) as { text: string; author: string }[];
  const faqItems = t('faq.items', { returnObjects: true }) as { question: string; answer: string }[];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } }, // Changed ease to string alias
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } }, // Changed ease to string alias
  };

  const pageTitle = t('hero.title');
  const pageDescription = t('hero.subtitle');

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="flex flex-col items-center justify-center">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="w-full py-20 md:py-32 lg:py-48 bg-gradient-to-r from-monynha-primary to-monynha-secondary text-monynha-primary-foreground text-center"
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
                <Button size="lg" className="bg-monynha-primary-foreground text-monynha-primary hover:bg-monynha-neutral-100 hover:text-monynha-primary transition-colors duration-300">
                  {t('hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="w-full py-16 bg-monynha-neutral-50"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
              {t('featuresTitle', { defaultValue: 'Nossas Funcionalidades' })}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants} custom={index}>
                  <Card className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-monynha-primary flex items-center">
                        <CheckCircle className="mr-3 h-6 w-6 text-monynha-secondary" />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-monynha-neutral-500">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
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

        {/* Plans Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="w-full py-16 bg-monynha-neutral-50"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-monynha-neutral-700">
              {t('plans.title')}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-monynha-neutral-500 mb-12">
              {t('plans.description')}
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div key={index} variants={itemVariants} custom={index}>
                  <Card className="p-8 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-monynha-primary mb-2">{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-semibold text-monynha-neutral-600">{plan.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-monynha-neutral-500">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-monynha-secondary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="mt-6 w-full bg-monynha-secondary text-monynha-primary-foreground hover:bg-monynha-secondary/90">
                        {t('plans.choosePlan', { defaultValue: 'Escolher Plano' })}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
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

        {/* FAQ Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="w-full py-16 bg-monynha-neutral-50"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
              {t('faq.title')}
            </motion.h2>
            <motion.div variants={itemVariants}>
              <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto text-left">
                {faqItems.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-semibold text-monynha-primary hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-monynha-neutral-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="w-full py-20 bg-monynha-primary text-monynha-primary-foreground text-center"
        >
          <div className="container mx-auto px-4">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6">
              {t('finalCta.title')}
            </motion.h2>
            <motion.div variants={itemVariants}>
              <Link to={getLocalizedPath('/contato')}>
                <Button size="lg" className="bg-monynha-secondary text-monynha-primary-foreground hover:bg-monynha-secondary/90 transition-colors duration-300">
                  {t('finalCta.button')} <Lightbulb className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Home;