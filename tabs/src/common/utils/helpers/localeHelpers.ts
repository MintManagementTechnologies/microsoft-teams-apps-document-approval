import { format } from 'date-fns';
import { enGB, enUS, enZA, fr } from 'date-fns/locale';

import { defaultLocale } from '../i18n';

export const getLocale = (): string => {
   const params = new URLSearchParams(window.location.hash);
   const locale = params.get("locale") || defaultLocale();
   return locale;
};

// by providing a default string of 'PP' or any of its variants for `formatStr`
// it will format dates in whichever way is appropriate to the locale
const locale = getLocale();
const locales = { fr, enUS, enZA, enGB };
export const getLocaleDate = (dateTimestamp: number = (new Date().getTime()), _format: string = "eeee, MMMM d 'at' hh:mm") => {
   let value = dateTimestamp;
   if(dateTimestamp === 0 || dateTimestamp === undefined || dateTimestamp === null || isNaN(dateTimestamp)) {
      value = (new Date().getTime())
   }
   let date = format(value, _format, {
      //@ts-ignore
      locale: locales[locale]
   })
   return date;
}