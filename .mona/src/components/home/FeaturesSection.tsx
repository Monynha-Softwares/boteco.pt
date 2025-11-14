import { useTranslation } from 'react-i18next';
import { FeatureGrid } from '@/components/reactbits';

const FeaturesSection = () => {
  const { t } = useTranslation('home');

  const features = t('features', { returnObjects: true }) as { title: string; description: string }[];

  return (
    <FeatureGrid
      title={t('featuresTitle', { defaultValue: 'Nossas Funcionalidades' })}
      features={features}
      depth="surface"
      columns={3}
    />
  );
};

export default FeaturesSection;