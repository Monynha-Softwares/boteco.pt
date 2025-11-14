import { useTranslation } from 'react-i18next';
import { Stepper } from '@/components/reactbits';

const HowItWorksSection = () => {
  const { t } = useTranslation('home');

  const howItWorksSteps = t('howItWorks.steps', { returnObjects: true }) as { title: string; description: string }[];

  return <Stepper title={t('howItWorks.title')} steps={howItWorksSteps} depth="overlay" />;
};

export default HowItWorksSection;