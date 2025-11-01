import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MadeWithDyad } from './made-with-dyad';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

  return (
    <footer className="bg-boteco-primary text-boteco-primary-foreground p-4 shadow-inner mt-8 transition-colors duration-300" role="contentinfo">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="flex space-x-4 mb-2 md:mb-0">
          <Link
            to={getLocalizedPath('/legal/privacidade')}
            className="transition-colors hover:text-boteco-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-boteco-primary"
          >
            {t('privacy:title', { ns: 'privacy' })}
          </Link>
          <Link
            to={getLocalizedPath('/legal/termos')}
            className="transition-colors hover:text-boteco-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-boteco-primary"
          >
            {t('terms:title', { ns: 'terms' })}
          </Link>
        </div>
        <p className="text-center md:text-right mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} BotecoPro &middot; {t('common:footer.developedWith', 'Desenvolvido com tecnologia')}{' '}
          <a
            href="https://monynha.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-boteco-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-boteco-primary"
            aria-label={t('common:footer.monynhaAriaLabel', 'Monynha Softwares - abre em nova aba')}
          >
            Monynha Softwares
          </a>
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;
