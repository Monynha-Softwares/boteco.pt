import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar todos os arquivos de conteúdo para cada idioma
import ptHome from './content/pt/home.json';
import ptAbout from './content/pt/about.json';
import ptContact from './content/pt/contact.json';
import ptBlog from './content/pt/blog.json';
import ptPrivacy from './content/pt/legal/privacy.json';
import ptTerms from './content/pt/legal/terms.json';
import ptPainel from './content/pt/painel.json';
import ptMenuDigital from './content/pt/menu-digital.json';
import ptFornecedores from './content/pt/fornecedores.json';
import ptFidelidade from './content/pt/fidelidade.json';
import ptEventos from './content/pt/eventos.json';
import ptIntegracoes from './content/pt/integracoes.json';
import ptCommon from './content/pt/common.json';

import enHome from './content/en/home.json';
import enAbout from './content/en/about.json';
import enContact from './content/en/contact.json';
import enBlog from './content/en/blog.json';
import enPrivacy from './content/en/legal/privacy.json';
import enTerms from './content/en/legal/terms.json';
import enPainel from './content/en/painel.json';
import enMenuDigital from './content/en/menu-digital.json';
import enFornecedores from './content/en/fornecedores.json';
import enFidelidade from './content/en/fidelidade.json';
import enEventos from './content/en/eventos.json';
import enIntegracoes from './content/en/integracoes.json';
import enCommon from './content/en/common.json';

import esHome from './content/es/home.json';
import esAbout from './content/es/about.json';
import esContact from './content/es/contact.json';
import esBlog from './content/es/blog.json';
import esPrivacy from './content/es/legal/privacy.json';
import esTerms from './content/es/legal/terms.json';
import esPainel from './content/es/painel.json';
import esMenuDigital from './content/es/menu-digital.json';
import esFornecedores from './content/es/fornecedores.json';
import esFidelidade from './content/es/fidelidade.json';
import esEventos from './content/es/eventos.json';
import esIntegracoes from './content/es/integracoes.json';
import esCommon from './content/es/common.json';

import frHome from './content/fr/home.json';
import frAbout from './content/fr/about.json';
import frContact from './content/fr/contact.json';
import frBlog from './content/fr/blog.json';
import frPrivacy from './content/fr/legal/privacy.json';
import frTerms from './content/fr/legal/terms.json';
import frPainel from './content/fr/painel.json';
import frMenuDigital from './content/fr/menu-digital.json';
import frFornecedores from './content/fr/fornecedores.json';
import frFidelidade from './content/fr/fidelidade.json';
import frEventos from './content/fr/eventos.json';
import frIntegracoes from './content/fr/integracoes.json';
import frCommon from './content/fr/common.json';

const resources = {
  pt: {
    home: ptHome,
    about: ptAbout,
    contact: ptContact,
    blog: ptBlog,
    privacy: ptPrivacy,
    terms: ptTerms,
    painel: ptPainel,
    'menu-digital': ptMenuDigital,
    fornecedores: ptFornecedores,
    fidelidade: ptFidelidade,
    eventos: ptEventos,
    integracoes: ptIntegracoes,
    common: ptCommon,
  },
  en: {
    home: enHome,
    about: enAbout,
    contact: enContact,
    blog: enBlog,
    privacy: enPrivacy,
    terms: enTerms,
    painel: enPainel,
    'menu-digital': enMenuDigital,
    fornecedores: enFornecedores,
    fidelidade: enFidelidade,
    eventos: enEventos,
    integracoes: enIntegracoes,
    common: enCommon,
  },
  es: {
    home: esHome,
    about: esAbout,
    contact: esContact,
    blog: esBlog,
    privacy: esPrivacy,
    terms: esTerms,
    painel: esPainel,
    'menu-digital': esMenuDigital,
    fornecedores: esFornecedores,
    fidelidade: esFidelidade,
    eventos: esEventos,
    integracoes: esIntegracoes,
    common: esCommon,
  },
  fr: {
    home: frHome,
    about: frAbout,
    contact: frContact,
    blog: frBlog,
    privacy: frPrivacy,
    terms: frTerms,
    painel: frPainel,
    'menu-digital': frMenuDigital,
    fornecedores: frFornecedores,
    fidelidade: frFidelidade,
    eventos: frEventos,
    integracoes: frIntegracoes,
    common: frCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    debug: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    ns: [
      'home',
      'about',
      'contact',
      'blog',
      'privacy',
      'terms',
      'painel',
      'menu-digital',
      'fornecedores',
      'fidelidade',
      'eventos',
      'integracoes',
      'common',
    ],
    defaultNS: 'home',
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0, // Look for locale in the first path segment
    },
  });

export default i18n;