import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This improves UX by ensuring users start
 * at the top of new pages instead of maintaining scroll position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // Use 'instant' for immediate scroll, or 'smooth' for animated
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
