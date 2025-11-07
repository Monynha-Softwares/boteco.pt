"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { t } = useTranslation(); // Para traduzir os textos do toggle
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // It's safe to compute menuValue before mounting because it is only used when isMounted is true (see line 48).
  // The fallback chain ensures a valid value is always present.
  const menuValue = theme ?? resolvedTheme ?? "system";
  const systemLabel = resolvedTheme
    ? `${t('systemTheme', { defaultValue: 'Sistema' })} (${resolvedTheme === 'dark'
        ? t('darkTheme', { defaultValue: 'Escuro' })
        : t('lightTheme', { defaultValue: 'Claro' })})`
    : t('systemTheme', { defaultValue: 'Sistema' });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          depth="overlay"
          aria-label={t('toggleTheme', { defaultValue: 'Alternar tema' })}
          className="text-boteco-primary-foreground transition-colors hover:bg-boteco-primary/80 h-11 w-11 min-h-11 min-w-11 flex items-center justify-center"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggleTheme', { defaultValue: 'Alternar tema' })}</span>
        </Button>
      </DropdownMenuTrigger>
      {isMounted && (
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuRadioGroup value={menuValue} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              {t('lightTheme', { defaultValue: 'Claro' })}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              {t('darkTheme', { defaultValue: 'Escuro' })}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              {systemLabel}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}