import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Lightbulb, Users } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation('home');
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

  const features = t('features', { returnObjects: true }) as { title: string; description: string }[];
  const howItWorksSteps = t('howItWorks.steps', { returnObjects: true }) as { title: string; description: string }[];
  const plans = t('plans.options', { returnObjects: true }) as { name: string; price: string; features: string[] }[];
  const testimonials = t('testimonials.quotes', { returnObjects: true }) as { text: string; author: string }[];
  const faqItems = t('faq.items', { returnObjects: true }) as { question: string; answer: string }[];

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-48 bg-gradient-to-r from-monynha-primary to-monynha-secondary text-monynha-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <Link to={getLocalizedPath('/contato')}>
            <Button size="lg" className="bg-monynha-primary-foreground text-monynha-primary hover:bg-monynha-neutral-100 hover:text-monynha-primary transition-colors duration-300">
              {t('hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-monynha-neutral-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
            {t('featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
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
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
            {t('howItWorks.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6">
                <div className="bg-monynha-secondary text-monynha-primary-foreground rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-monynha-neutral-700">{step.title}</h3>
                <p className="text-monynha-neutral-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="w-full py-16 bg-monynha-neutral-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-monynha-neutral-700">
            {t('plans.title')}
          </h2>
          <p className="text-lg text-monynha-neutral-500 mb-12">
            {t('plans.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className="p-8 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    {t('plans.choosePlan')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
            {t('testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-lg bg-monynha-neutral-50">
                <CardContent className="text-lg italic text-monynha-neutral-600 mb-4">
                  "{testimonial.text}"
                </CardContent>
                <CardFooter className="text-right font-semibold text-monynha-primary">
                  - {testimonial.author}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 bg-monynha-neutral-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-monynha-neutral-700">
            {t('faq.title')}
          </h2>
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
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 bg-monynha-primary text-monynha-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('finalCta.title')}
          </h2>
          <Link to={getLocalizedPath('/contato')}>
            <Button size="lg" className="bg-monynha-secondary text-monynha-primary-foreground hover:bg-monynha-secondary/90 transition-colors duration-300">
              {t('finalCta.button')} <Lightbulb className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;