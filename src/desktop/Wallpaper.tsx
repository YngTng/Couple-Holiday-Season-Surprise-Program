import type { ThemeId } from '../theme/themes';

/** Wallpapers: CSS gradients + patterns defined in index.css. */
export function Wallpaper({ id }: { id: ThemeId }) {
  return <div aria-hidden="true" data-wallpaper={id} className="wallpaper" />;
}
