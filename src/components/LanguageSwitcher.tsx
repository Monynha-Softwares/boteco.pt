import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useParams<{ locale: string }>();

  const currentLocale = locale || i18n.language;

  const handleLanguageChange = (newLocale: string) => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === currentLocale) {
      pathSegments[0] = newLocale;
    } else {
      pathSegments.unshift(newLocale); // Add locale if not present
    }
    const newPath = `/${pathSegments.join('/')}`;
    navigate(newPath);
  };

  return (
    <Select value={currentLocale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[120px] bg-monynha-primary-foreground text-monynha-primary hover:bg-monynha-neutral-100">
        <SelectValue placeholder="Idioma" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pt">Português</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;