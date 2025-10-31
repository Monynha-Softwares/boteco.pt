"use client";

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { SignedIn, UserButton } from '@clerk/clerk-react';

interface MobileNavProps {
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ onOpenChange, isOpen }) => {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';

  const getLocalizedPath = (path: string) => `/${currentLocale}${path}`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          depth="overlay"
          className="lg:hidden text-boteco-primary-foreground hover:bg-boteco-primary/80 active:scale-98"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t('openMenu', { defaultValue: 'Abrir menu' })}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px] bg-background flex flex-col">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-boteco-primary">Boteco Pro</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 flex-grow">
          <Link to={getLocalizedPath('/')} className="text-lg font-medium text-foreground hover:text-boteco-primary transition-colors" onClick={() => onOpenChange(false)}>
            {t('home:hero.title', { ns: 'home' }).split(':')[0]}
          </Link>
          <Link to={getLocalizedPath('/sobre')} className="text-lg font-medium text-foreground hover:text-boteco-primary transition-colors" onClick={() => onOpenChange(false)}>
            {t('about:title', { ns: 'about' })}
          </Link>
          <Link to={getLocalizedPath('/contato')} className="text-lg font-medium text-foreground hover:text-boteco-primary transition-colors" onClick={() => onOpenChange(false)}>
            {t('contact:title', { ns: 'contact' })}
          </Link>
          <Link to={getLocalizedPath('/blog')} className="text-lg font-medium text-foreground hover:text-boteco-primary transition-colors" onClick={() => onOpenChange(false)}>
            {t('blog:title', { ns: 'blog' })}
          </Link>
          <Link to="/painel" className="text-lg font-medium text-foreground hover:text-boteco-primary transition-colors" onClick={() => onOpenChange(false)}>
            {t('painel:title', { ns: 'painel' })}
          </Link>
        </nav>
        <div className="flex flex-col space-y-4 mt-auto pb-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <SignedIn>
            <div className="flex items-center justify-start">
              <UserButton afterSignOutUrl="/" />
              <span className="ml-2 text-foreground">{t('profile', { defaultValue: 'Perfil' })}</span>
            </div>
          </SignedIn>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;