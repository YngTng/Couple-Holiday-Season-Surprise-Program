import { useCallback, useState } from 'react';
import { MusicProvider } from './audio/MusicProvider';
import { BootSequence } from './boot/BootSequence';
import { DateProvider } from './date/DateProvider';
import { Desktop } from './desktop/Desktop';
import { DevToolsProvider } from './dev/DevToolsProvider';
import { SettingsProvider } from './settings/SettingsProvider';
import { ThemeController } from './theme/useActiveTheme';
import { ToastProvider } from './ui/ToastProvider';
import { WindowManagerProvider } from './windows/WindowManager';

export default function App() {
  const [booted, setBooted] = useState(false);
  const finishBoot = useCallback(() => setBooted(true), []);

  return (
    <DateProvider>
      <SettingsProvider>
        <MusicProvider>
          <ToastProvider>
            <WindowManagerProvider>
              <DevToolsProvider>
                <ThemeController />
                {booted ? <Desktop /> : <BootSequence onDone={finishBoot} />}
              </DevToolsProvider>
            </WindowManagerProvider>
          </ToastProvider>
        </MusicProvider>
      </SettingsProvider>
    </DateProvider>
  );
}
