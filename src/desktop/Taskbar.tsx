import { getApp } from '../apps/registry';
import { useMusic } from '../audio/MusicProvider';
import { UNLOCK_EVERYTHING } from '../config/testing';
import { THEMES } from '../theme/themes';
import { useActiveTheme } from '../theme/useActiveTheme';
import { useWindowManager } from '../windows/WindowManager';
import { Clock } from './Clock';
import { APP_NAME } from '../content/person';

export function Taskbar() {
  const { windows, activeAppId, focusWindow } = useWindowManager();
  const { themeId } = useActiveTheme();
  const music = useMusic();

  return (
    <nav
      aria-label="Taskbar"
      className="relative z-40 flex shrink-0 items-center gap-1 border-t border-line bg-surface/90 px-2 pb-[env(safe-area-inset-bottom)] text-ink backdrop-blur-md"
    >
      <div className="flex h-14 min-w-0 items-center gap-2 px-2">
        <span aria-hidden="true" className="text-lg text-accent-text">
          ♡
        </span>
        <span className="truncate text-sm font-semibold">{APP_NAME}</span>
        <span className="hidden truncate text-xs text-ink-muted sm:inline">· {THEMES[themeId].label}</span>
      </div>

      <ul aria-label="Open windows" className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
        {windows.map((win) => {
          const app = getApp(win.appId);
          const active = win.appId === activeAppId;
          return (
            <li key={win.appId}>
              <button
                type="button"
                onClick={() => focusWindow(win.appId)}
                aria-current={active ? 'true' : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm ${
                  active ? 'bg-surface-2 font-semibold ring-1 ring-line' : 'hover:bg-surface-2'
                }`}
              >
                <span aria-hidden="true">{app.icon}</span>
                <span className="max-w-32 truncate">{app.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="ml-auto flex items-center gap-1">
        {UNLOCK_EVERYTHING && (
          <span
            title="Every app is unlocked for testing. Set UNLOCK_EVERYTHING to false in src/config/testing.ts before gifting."
            className="flex items-center gap-1 rounded-full bg-plum px-2.5 py-1 text-xs font-semibold text-cream"
          >
            <span aria-hidden="true">🔓</span> Test mode
          </span>
        )}
        <button
          type="button"
          onClick={music.togglePlay}
          aria-pressed={music.playback.isPlaying}
          aria-label={music.playback.isPlaying ? 'Pause music' : 'Play music'}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg hover:bg-surface-2"
        >
          <span aria-hidden="true">{music.playback.isPlaying ? '❚❚' : '♪'}</span>
        </button>
        <Clock />
      </div>
    </nav>
  );
}
