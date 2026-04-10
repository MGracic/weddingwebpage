import { ui, defaultLang, routes, type Lang } from "./ui";

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang === "en") return "en";
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}

export function getRouteFromUrl(url: URL): string | undefined {
  const lang = getLangFromUrl(url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const langRoutes = routes[lang];
  for (const [route, path] of Object.entries(langRoutes)) {
    if (path === pathname) return route;
  }
  return undefined;
}

export function getLocalizedPath(route: string, lang: Lang): string {
  return routes[lang][route] ?? routes[defaultLang][route] ?? "/";
}

export function getAlternateLanguagePath(url: URL): string {
  const currentLang = getLangFromUrl(url);
  const route = getRouteFromUrl(url);
  const targetLang: Lang = currentLang === "hr" ? "en" : "hr";
  if (!route) return routes[targetLang]["home"];
  return getLocalizedPath(route, targetLang);
}
