import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import MobileNav from './MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import navigation from '@/content/common/navigation.json';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BaseNavItem, NavItem } from '@/types/navigation';
import { hasClerkAuth } from '@/utils/clerk';

const Header: React.FC = () => {
  const { locale } = useParams<{ locale: string }>();
  const currentLocale = locale || 'pt';
  const isMobile = useIsMobile();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

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

  const navItems = React.useMemo(() => (navigation.items as NavItem[]) ?? [], []);

  return (
    <header className="bg-boteco-primary text-boteco-primary-foreground p-4 shadow-md transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <Link
          to={`/${currentLocale}`}
          className="text-2xl font-bold transition-colors hover:text-boteco-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-boteco-primary"
        >
          Boteco Pro
        </Link>

        {isMobile ? (
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {hasClerkAuth && (
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            )}
            <MobileNav
              isOpen={isMobileNavOpen}
              onOpenChange={setIsMobileNavOpen}
              currentLocale={currentLocale}
              items={navItems}
            />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    {item.type === 'mega' && item.items?.length ? (
                      <>
                        <NavigationMenuTrigger className={cn(
                          navigationMenuTriggerStyle(),
                          'bg-transparent text-boteco-primary-foreground transition-colors hover:text-boteco-secondary focus-visible:ring-boteco-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-boteco-primary',
                        )}>
                          {getLabel(item)}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="p-4">
                          <div className="grid gap-4 md:w-[500px] lg:w-[720px] md:grid-cols-2">
                            {item.items.map((child) => (
                              <NavigationMenuLink asChild key={child.id}>
                                <Link
                                  to={resolveHref(child)}
                                  className="focus-visible:outline-none"
                                >
                                  <Card depth={child.depth === 'surface' ? 'surface' : 'overlay'} className="h-full transition-transform duration-200 hover:-translate-y-1">
                                    <CardHeader>
                                      <CardTitle className="text-lg font-semibold text-boteco-primary">
                                        {getLabel(child)}
                                      </CardTitle>
                                      {child.description && (
                                        <CardDescription className="text-sm text-boteco-neutral/80">
                                          {getDescription(child)}
                                        </CardDescription>
                                      )}
                                    </CardHeader>
                                  </Card>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={resolveHref(item)}
                          className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-boteco-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boteco-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-boteco-primary"
                        >
                          {getLabel(item)}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
              <NavigationMenuIndicator />
            </NavigationMenu>
            <LanguageSwitcher />
            <ThemeToggle />
            {hasClerkAuth && (
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(Header);