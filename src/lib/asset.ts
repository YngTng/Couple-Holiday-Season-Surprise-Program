/** Resolves a /public path from content files (e.g. "/photos/a.jpg") against the site's base URL. */
export function asset(path: string): string {
  if (/^(data:|blob:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
