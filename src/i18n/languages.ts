export const LANGUAGES = [
 {code:'de',name:'Deutsch',locale:'de-DE'}, {code:'en',name:'English',locale:'en-GB'},
 {code:'fr',name:'Français',locale:'fr-FR'}, {code:'es',name:'Español',locale:'es-ES'},
 {code:'it',name:'Italiano',locale:'it-IT'}, {code:'nl',name:'Nederlands',locale:'nl-NL'},
 {code:'pl',name:'Polski',locale:'pl-PL'}, {code:'cs',name:'Čeština',locale:'cs-CZ'},
 {code:'tr',name:'Türkçe',locale:'tr-TR'}, {code:'pt',name:'Português',locale:'pt-PT'},
 {code:'uk',name:'Українська',locale:'uk-UA'}, {code:'ru',name:'Русский',locale:'ru-RU'},
 {code:'ar',name:'العربية',locale:'ar-SA'}, {code:'fa',name:'فارسی',locale:'fa-IR'},
 {code:'ro',name:'Română',locale:'ro-RO'}, {code:'el',name:'Ελληνικά',locale:'el-GR'},
 {code:'sv',name:'Svenska',locale:'sv-SE'}, {code:'da',name:'Dansk',locale:'da-DK'},
 {code:'no',name:'Norsk bokmål',locale:'nb-NO'}, {code:'fi',name:'Suomi',locale:'fi-FI'},
] as const;
export type Language = typeof LANGUAGES[number]['code'];
export const isLanguage = (value: unknown): value is Language => LANGUAGES.some(item=>item.code===value);
export const localeFor = (code: string) => LANGUAGES.find(item=>item.code===code)?.locale ?? 'de-DE';
export const isRtl = (code: string) => code==='fa'||code==='ar';
