import { useLocation, Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { locale } = useParams<{ locale: string }>();
  const { t } = useTranslation();
  const currentLocale = locale || 'pt';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('notFound:message', { defaultValue: 'Oops! Page not found' })}</p>
        <Link to={`/${currentLocale}`} className="text-blue-500 hover:text-blue-700 underline">
          {t('notFound:returnHome', { defaultValue: 'Return to Home' })}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;