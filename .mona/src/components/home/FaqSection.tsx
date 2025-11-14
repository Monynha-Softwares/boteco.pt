import { useTranslation } from 'react-i18next';
import { Faq } from '@/components/reactbits';

const FaqSection = () => {
  const { t } = useTranslation('home');

  const faqItems = t('faq.items', { returnObjects: true }) as { question: string; answer: string }[];

  return <Faq title={t('faq.title')} items={faqItems} depth="overlay" />;
};

export default FaqSection;