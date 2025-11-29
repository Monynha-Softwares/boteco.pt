import { useTranslation } from 'react-i18next';
import { Hero } from '@/components/reactbits';
import { useLocalizedPath } from '@/hooks/use-localized-path'; // Import the hook

const HeroSection = () => {
  const { t } = useTranslation('home');
  const localizePath = useLocalizedPath(); // Use the hook

  return (
    <Hero
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
      action={{ label: t('hero.cta'), href: localizePath('/contato') }}
      secondaryAction={{
        label: t('hero.demoCta'),
        href: 'https://app.boteco.pt',
        external: true,
        'aria-label': t('hero.demoCtaAria'),
      }}
      depth="overlay"
    />
  );
};

export default HeroSection;