import * as React from 'react';
import en from './locales/en.json';
import de from './locales/de.json';

const I18nCtx = React.createContext(null);
export const useI18n = () => React.useContext(I18nCtx);

const DICTS = { en, de };

function pathGet(obj, path) {
  return path.split('.').reduce((o,k)=> (o && o[k] !== undefined ? o[k] : undefined), obj);
}
function interpolate(str, params={}) {
  return str.replace(/\{(\w+)\}/g, (_,k)=> (params[k] ?? `{${k}}`));
}

export default function I18nProvider({ children }) {
  const [locale, setLocale] = React.useState(() => localStorage.getItem('i18n:locale') || 'en');

  React.useEffect(() => {
    try { localStorage.setItem('i18n:locale', locale); } catch {}
  }, [locale]);

  const t = React.useCallback((key, params) => {
    const dict = DICTS[locale] || en;
    const raw = pathGet(dict, key) ?? pathGet(en, key) ?? key;
    return typeof raw === 'string' ? interpolate(raw, params) : raw;
  }, [locale]);

  const n = React.useCallback((value, opts) => new Intl.NumberFormat(locale, opts).format(value), [locale]);
  const d = React.useCallback((value, opts) => new Intl.DateTimeFormat(locale, opts).format(new Date(value)), [locale]);
  const label = React.useCallback((entityKey, count = 1) => {
    const dict = DICTS[locale] || en;
    const ent = (dict.entities && dict.entities[entityKey]) || (en.entities && en.entities[entityKey]) || {};
    if (count === 1) return ent.one || entityKey;
    return ent.other || ent.one || entityKey;
    }, [locale]);

    // value passed to context:
    const value = React.useMemo(() => ({ locale, setLocale, t, n, d, label }), [locale, t, n, d, label]);

//   const value = React.useMemo(() => ({ locale, setLocale, t, n, d }), [locale, t, n, d]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
