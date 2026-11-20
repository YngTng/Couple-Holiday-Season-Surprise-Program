import { useId } from 'react';
import { useMusic } from '../../audio/MusicProvider';
import { FAKE_SETTINGS } from '../../content/system';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSettings, type ColorMode } from '../../settings/SettingsProvider';
import { THEME_IDS, THEMES, isWallpaperChoice } from '../../theme/themes';
import { Segmented, SettingsSection, SwitchRow } from '../../ui/controls';

const MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const satisfies readonly { value: ColorMode; label: string }[];

export function SettingsApp() {
  const { settings, updateSettings } = useSettings();
  const music = useMusic();
  const systemReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wallpaperId = useId();

  return (
    <div className="flex flex-col gap-3 p-4">
      <SettingsSection title="Appearance">
        <Segmented
          label="Colour mode"
          value={settings.colorMode}
          options={MODE_OPTIONS}
          onChange={(colorMode) => updateSettings({ colorMode })}
        />
        <label htmlFor={wallpaperId} className="mt-2 px-1 text-sm font-medium text-ink">
          Wallpaper
        </label>
        <select
          id={wallpaperId}
          value={settings.wallpaper}
          onChange={(e) => {
            const next = e.target.value;
            if (isWallpaperChoice(next)) updateSettings({ wallpaper: next });
          }}
          className="min-h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink"
        >
          <option value="auto">Auto (follows the date)</option>
          {THEME_IDS.map((id) => (
            <option key={id} value={id}>
              {THEMES[id].label} ({THEMES[id].dates})
            </option>
          ))}
        </select>
      </SettingsSection>

      <SettingsSection title="Music">
        <button
          type="button"
          onClick={music.togglePlay}
          className="min-h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent hover:brightness-110"
        >
          {music.playback.isPlaying ? '❚❚ Pause music' : '▶ Play music'}
        </button>
        <p className="px-1 text-xs text-ink-muted">
          Now playing: {music.current ? `${music.current.title} · ${music.current.artist}` : 'nothing yet'}
        </p>
        {music.error && (
          <p role="alert" className="px-1 text-xs font-medium text-accent-text">
            {music.error}
          </p>
        )}
        <p className="px-1 text-xs leading-relaxed text-ink-muted">
          Music plays your playlist. Use your device's volume buttons to change the volume.
        </p>
      </SettingsSection>

      <SettingsSection title="Accessibility">
        <SwitchRow
          label="Reduce animations"
          description={systemReducedMotion ? 'Your device already asks for reduced motion, so animations stay reduced.' : undefined}
          checked={settings.reduceMotion || systemReducedMotion}
          onChange={(reduceMotion) => updateSettings({ reduceMotion })}
        />
      </SettingsSection>

      <SettingsSection title="System">
        <dl className="flex flex-col">
          {FAKE_SETTINGS.map((item) => (
            <div key={item.label} className="flex min-h-11 items-center justify-between gap-3 px-1">
              <dt className="text-sm text-ink">{item.label}:</dt>
              <dd className="rounded-full bg-surface-2 px-3 py-1 font-mono text-sm font-bold text-accent-text ring-1 ring-line">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </SettingsSection>
    </div>
  );
}
