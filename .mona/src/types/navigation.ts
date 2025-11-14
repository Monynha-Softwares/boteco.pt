export type NavDepth = 'link' | 'surface' | 'overlay';

export interface NavLabelMap {
  [locale: string]: string;
}

export interface BaseNavItem {
  id: string;
  type: 'link' | 'mega';
  depth?: NavDepth;
  label: NavLabelMap;
  href?: string;
  localeAware?: boolean;
  description?: NavLabelMap;
}

export interface NavItem extends BaseNavItem {
  items?: BaseNavItem[];
}

export interface NavigationContent {
  items: NavItem[];
}
