import {describe,it,expect} from 'vitest';
import i18n,{currentLocale} from './index';
import {LANGUAGES,isLanguage,isRtl,localeFor} from './languages';
import {translationNotice,LANGUAGE_FILTER_LABEL} from './coverage';
const catalogs=import.meta.glob<Record<string,string>>('./*.json',{eager:true,import:'default'});
describe('Website-Sprachen',()=>{
 it('registriert 20 Sprachen mit vollständigen Metadaten und ehrlichen Übersetzungshinweisen',()=>{expect(LANGUAGES).toHaveLength(20);expect(new Set(LANGUAGES.map(l=>l.code)).size).toBe(20);for(const language of LANGUAGES){expect(isLanguage(language.code)).toBe(true);expect(new Intl.NumberFormat(language.locale).format(21.5)).toBeTruthy();expect(LANGUAGE_FILTER_LABEL[language.code]).toBeTruthy();if(language.code!=='de'){expect(catalogs[`./${language.code}.json`]?.['Temperatur']).toBeTruthy();expect(translationNotice[language.code]).toBeTruthy();}}});
 it('verwendet die richtige Locale und unterscheidet beide RTL-Sprachen',async()=>{expect(isRtl('ar')).toBe(true);expect(isRtl('fa')).toBe(true);expect(isRtl('de')).toBe(false);expect(localeFor('no')).toBe('nb-NO');await i18n.changeLanguage('fr');expect(currentLocale()).toBe('fr-FR');await i18n.changeLanguage('de');});
});
