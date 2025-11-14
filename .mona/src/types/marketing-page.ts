export type HeroContent = {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
};

export type SectionList = {
  title: string;
  items: { title: string; description: string }[];
};

export type Workflow = {
  title: string;
  steps: { title: string; description: string }[];
};

export type CtaContent = {
  title: string;
  description: string;
  button: { label: string; href: string };
};

export type SeoContent = {
  title: string;
  description: string;
};
