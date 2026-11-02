import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { isLanguage, localeFor } from "./languages";
const catalogs = import.meta.glob<Record<string,string>>("./*.json", {eager:true, import:"default"});
import { SIMPLE_COPY } from "./simple";
let initialLanguage = "de";
try {
  const raw = localStorage.getItem("mycobox.experience.v1");
  const saved: unknown = raw ? JSON.parse(raw) : null;
  if (saved && typeof saved === "object" && "preferences" in saved) {
    const p = saved.preferences;
    if (
      p &&
      typeof p === "object" &&
      "language" in p &&
      isLanguage(p.language)
    )
      initialLanguage = String(p.language);
  }
} catch {
  /* Default German when storage is unavailable. */
}
void i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: "de",
  keySeparator: false,
  nsSeparator: false,
  resources: Object.fromEntries([['de',{translation:{}}], ...Object.entries(catalogs).map(([path,translation])=>[path.replace('./','').replace('.json',''),{translation}])]),
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  returnEmptyString: false,
});
export const currentLocale = () => localeFor(i18n.language);
function template(key: string, params: Record<string, string>) {
  return String(i18n.t(key, { ...params, defaultValue: key }));
}
function translateText(text: string): string {
  const key =
    typeof document !== "undefined" &&
    document.documentElement.dataset.easy === "true"
      ? (SIMPLE_COPY[text] ?? text)
      : text;
  if (i18n.exists(key)) return String(i18n.t(key));
  let m = key.match(
    /^(.+): Kultur vorbereitet\. Bereit für den Demo-Start\.$/u,
  );
  if (m)
    return template(
      "{{name}}: Kultur vorbereitet. Bereit für den Demo-Start.",
      { name: translateText(m[1]) },
    );
  m = key.match(
    /^(.+): Kultur vorbereitet\. Du kannst die Demo jetzt starten\.$/u,
  );
  if (m)
    return template(
      "{{name}}: Kultur vorbereitet. Du kannst die Demo jetzt starten.",
      { name: translateText(m[1]) },
    );
  m = key.match(/^(.+) erreicht\.$/u);
  if (m) return template("{{phase}} erreicht.", { phase: translateText(m[1]) });
  m = key.match(/^Modus geändert: (.+)\.$/u);
  if (m)
    return template("Modus geändert: {{mode}}.", { mode: translateText(m[1]) });
  m = key.match(/^Demo-Szenario aktiviert: (.+)\.$/u);
  if (m)
    return template("Demo-Szenario aktiviert: {{scenario}}.", {
      scenario: translateText(m[1]),
    });
  m = key.match(/^(.+): Details$/u);
  if (m) return template("{{name}}: Details", { name: translateText(m[1]) });
  m = key.match(/^(.+) \(simuliert\)\.$/u);
  if (m) return translateText(m[1]) + " (" + translateText("simuliert") + ").";
  return key;
}
export function tr<T>(value: T): T {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  return value.replace(trimmed, translateText(trimmed)) as T;
}
export function useT() {
  useTranslation();
  return tr;
}
export default i18n;
