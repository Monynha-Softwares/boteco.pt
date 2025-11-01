import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const linkClassName = cn(
  'text-sm text-boteco-primary-foreground/80',
  'transition-colors hover:text-boteco-secondary-foreground',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-boteco-secondary focus-visible:ring-offset-2',
  'focus-visible:ring-offset-boteco-primary'
);

export const MadeWithDyad = () => {
  const { t } = useTranslation('common');
  
  return (
    <div className="p-4 text-center">
      <a
        href="https://monynha.com"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        aria-label={t('footer.poweredByAriaLabel', 'Powered by Monynha Softwares - abre em nova aba')}
      >
        {t('footer.poweredBy', 'Powered by Monynha Softwares')}
      </a>
    </div>
  );
};

