import i18n from 'i18next';
import Backend from 'i18next-fs-backend';

// import i18nextMiddleware from 'i18next-http-middleware';

export const defaultLocale = () => {
   return 'en';
}

export const setLocale = (_locale: string = defaultLocale()) => {
   i18n.changeLanguage(_locale);
};
console.log(`__dirname`);
console.log(__dirname);
i18n
   // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
   .use(Backend)
   // .use(i18nextMiddleware.LanguageDetector)
   // pass the i18n instance to react-i18next.
   // .use(initReactI18next)
   // init i18next
   // for all options read: https://www.i18next.com/overview/configuration-options
   .init({
      fallbackLng: defaultLocale(),
      interpolation: {
         escapeValue: true, // not needed for react as it escapes by default
      },
      backend: {
         loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      },
      ns: ['common', 'shared'],
      defaultNS: 'shared'
   });
export default i18n;
