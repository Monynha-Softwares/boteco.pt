"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BaseNavItem, NavItem } from '@/types/navigation';
import { hasClerkAuth } from '@/utils/clerk';

interface MobileNavProps {
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  currentLocale: string;
  items: NavItem[];
}

const MobileNav: React.FC<MobileNavProps> = ({ onOpenChange, isOpen, currentLocale, items }) => {
  const { t } = useTranslation();

  const getLabel = React.useCallback(
    (item: BaseNavItem) => item.label[currentLocale] ?? item.label.pt ?? Object.values(item.label)[0],
    [currentLocale],
  );

  const getDescription = React.useCallback(
    (item: BaseNavItem) => item.description?.[currentLocale] ?? item.description?.pt ?? '',
    [currentLocale],
  );

  const resolveHref = React.useCallback(
    (item: BaseNavItem) => {
      if (!item.href) {
        return '#';
      }

      if (item.localeAware === false || item.href.startsWith('http')) {
        return item.href;
      }

      const normalized = item.href.startsWith('/') ? item.href : `/${item.href}`;
      return `/${currentLocale}${normalized}`;
    },
    [currentLocale],
  );

  const handleNavigate = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          depth="overlay"
          className="lg:hidden text-boteco-primary-foreground hover:bg-boteco-primary/80 active:scale-98 h-11 w-11 min-h-11 min-w-11"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t('openMenu', { defaultValue: 'Abrir menu' })}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px] bg-background flex flex-col transition-colors duration-300">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-boteco-primary">Boteco Pro</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col flex-grow">
          <Accordion type="multiple" className="space-y-2">
            {items.map((item) =>
              item.type === 'mega' && item.items?.length ? (
                <AccordionItem key={item.id} value={item.id} className="border-b border-border/40">
                  <AccordionTrigger className="text-left text-lg font-medium text-foreground transition-colors hover:text-boteco-primary min-h-11 py-3">
                    {getLabel(item)}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-3">
                    {item.items.map((child) => (
                      <Link
                        key={child.id}
                        to={resolveHref(child)}
                        onClick={handleNavigate}
                        className="block rounded-md bg-muted/40 px-4 py-3 transition-colors hover:bg-muted min-h-11"
                      >
                        <span className="block text-sm font-medium text-foreground">{getLabel(child)}</span>
                        {child.description && (
                          <span className="block text-xs text-muted-foreground">{getDescription(child)}</span>
                        )}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={item.id}
                  to={resolveHref(item)}
                  onClick={handleNavigate}
                  className="block rounded-md px-4 py-3 text-lg font-medium text-foreground transition-colors hover:bg-muted/60 hover:text-boteco-primary min-h-11"
                >
                  {getLabel(item)}
                </Link>
              ),
            )}
          </Accordion>
        </nav>
        <div className="flex flex-col space-y-4 mt-auto pb-4">
          {/* Removed duplicate LanguageSwitcher to avoid hidden aria-label collision */}
          <ThemeToggle />
          {hasClerkAuth && (
            <SignedIn>
              <div className="flex items-center justify-start">
                <UserButton afterSignOutUrl="/" />
                <span className="ml-2 text-foreground">{t('profile', { defaultValue: 'Perfil' })}</span>
              </div>
            </SignedIn>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
