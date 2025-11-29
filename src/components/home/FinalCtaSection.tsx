import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { AnimatedItem, AnimatedSection } from '@/components/reactbits';
import { useLocalizedPath } from '@/hooks/use-localized-path'; // Import the hook

const FinalCtaSection = () => {
  const { t } = useTranslation('home');
  const localizePath = useLocalizedPath(); // Use the hook

  return (
    <AnimatedSection
      depth="overlay"
      className="bg-boteco-primary text-boteco-primary-foreground text-center"
      containerClassName="flex flex-col items-center gap-6"
    >
      <AnimatedItem as="h2" className="text-3xl font-bold md:text-4xl">
        {t('finalCta.title')}
      </AnimatedItem>
      <AnimatedItem>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="transition-colors duration-300 active:scale-98"
        >
          <Link to={localizePath('/contato')}> {/* Use localizePath */}
            <span className="flex items-center gap-2">
              {t('finalCta.button')}
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
            </span>
          </Link>
        </Button>
      </AnimatedItem>
    </AnimatedSection>
  );
};

export default FinalCtaSection;