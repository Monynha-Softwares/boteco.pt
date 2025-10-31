import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { ThemeToggle } from './ThemeToggle';
import MobileNav from './MobileNav'; // Importar MobileNav
import { useIsMobile } from '@/hooks/use-mobile'; // Importar useIsMobile

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';
  const isMobile = useIsMobile();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

  return (
    <header className="bg-boteco-wine text-boteco-wine-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={getLocalizedPath('/')} className="text-2xl font-bold">
          Boteco Pro
        </Link>
        
        {isMobile ? (
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <MobileNav isOpen={isMobileNavOpen} onOpenChange={setIsMobileNavOpen} />
          </div>
        ) : (
          <nav className="flex items-center space-x-4">
            <Link to={getLocalizedPath('/')} className="hover:underline">
              {t('home:hero.title', { ns: 'home' }).split(':')[0]}
            </Link>
            <Link to={getLocalizedPath('/sobre')} className="hover:underline">
              {t('about:title', { ns: 'about' })}
            </Link>
            <Link to={getLocalizedPath('/contato')} className="hover:underline">
              {t('contact:title', { ns: 'contact' })}
            </Link>
            <Link to={getLocalizedPath('/blog')} className="hover:underline">
              {t('blog:title', { ns: 'blog' })}
            </Link>
            <Link to="/painel" className="hover:underline">
              {t('painel:title', { ns: 'painel' })}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;