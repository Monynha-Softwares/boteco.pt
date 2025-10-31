import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation('privacy');

  const contentSections = t('content', { returnObjects: true }) as { heading: string; text: string }[];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-4 text-monynha-primary">
        {t('title')}
      </h1>
      <p className="text-center text-monynha-neutral-500 mb-12">
        {t('lastUpdatedLabel', { defaultValue: 'Última atualização' })}: {t('lastUpdated')}
      </p>

      <div className="space-y-8 text-monynha-neutral-700">
        {contentSections.map((section, index) => (
          <section key={index}>
            <h2 className="text-2xl font-semibold mb-4 text-monynha-neutral-800">
              {section.heading}
            </h2>
            <p className="text-lg leading-relaxed">
              {section.text}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicy;