import { useTranslation } from 'react-i18next';
import { TestimonialCarousel } from '@/components/reactbits';

const TestimonialsSection = () => {
  const { t } = useTranslation('home');

  const testimonials = t('testimonials.quotes', { returnObjects: true }) as { text: string; author: string }[];

  return (
    <TestimonialCarousel
      title={t('testimonials.title')}
      testimonials={testimonials}
      depth="surface"
    />
  );
};

export default TestimonialsSection;