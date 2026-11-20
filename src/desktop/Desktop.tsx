import { MiniPlayer } from '../audio/MiniPlayer';
import { useActiveTheme } from '../theme/useActiveTheme';
import { WindowLayer } from '../windows/WindowLayer';
import { IconGrid } from './IconGrid';
import { Taskbar } from './Taskbar';
import { Wallpaper } from './Wallpaper';
import { APP_NAME } from '../content/person';

export function Desktop() {
  const { wallpaperId } = useActiveTheme();

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden text-ink animate-[fade-in_500ms_ease-out]">
      <Wallpaper id={wallpaperId} />
      <main className="relative min-h-0 flex-1 overflow-y-auto md:overflow-hidden">
        <h1 className="sr-only">{APP_NAME} desktop</h1>
        <IconGrid />
        <WindowLayer />
      </main>
      <Taskbar />
      <MiniPlayer />
    </div>
  );
}
