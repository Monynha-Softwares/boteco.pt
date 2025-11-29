import React from 'react';
import { useTranslation } from 'react-i18next';
import AnimatedSection, { AnimatedItem } from '@/components/reactbits/AnimatedSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface Country {
  name: string;
  description: string;
}

interface GeographicPresenceContent {
  title: string;
  description: string;
  countries: Country[];
}

interface GeographicPresenceSectionProps {
  translationNamespace: string;
}

const GeographicPresenceSection: React.FC<GeographicPresenceSectionProps> = ({ translationNamespace }) => {
  const { t } = useTranslation(translationNamespace);

  const content = t('geographicPresence', { returnObjects: true }) as GeographicPresenceContent;

  if (!content || !content.countries || content.countries.length === 0) {
    return null;
  }

  return (
    <AnimatedSection depth="surface" containerClassName="space-y-10 text-center">
      <div className="space-y-4">
        <AnimatedItem as="h2" className="text-3xl font-bold text-boteco-neutral md:text-4xl">
          {content.title}
        </AnimatedItem>
        <AnimatedItem as="p" className="mx-auto max-w-2xl text-lg text-boteco-neutral/80">
          {content.description}
        </AnimatedItem>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {content.countries.map((country, index) => (
          <AnimatedItem key={country.name} className="flex">
            <Card depth="overlay" className="flex flex-col flex-1 items-center p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-1">
              <CardHeader className="pb-4">
                <MapPin className="h-12 w-12 text-boteco-secondary mx-auto mb-2" />
                <CardTitle className="text-xl font-semibold text-boteco-primary">{country.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-boteco-neutral/80">{country.description}</p>
              </CardContent>
            </Card>
          </AnimatedItem>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default GeographicPresenceSection;