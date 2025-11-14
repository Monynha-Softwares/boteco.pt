import { useTranslation } from 'react-i18next';
import { PricingTable } from '@/components/reactbits';

const PlansSection = () => {
  const { t } = useTranslation('home');

  const plans = t('plans.options', { returnObjects: true }) as { name: string; price: string; features: string[] }[];

  return (
    <PricingTable
      title={t('plans.title')}
      description={t('plans.description')}
      options={plans}
      depth="surface"
      ctaLabel={t('plans.choosePlan', { defaultValue: 'Escolher Plano' })}
    />
  );
};

export default PlansSection;