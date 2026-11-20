import { useCallback } from 'react';
import { isAppUnlocked } from '../apps/lock';
import type { AppDefinition } from '../apps/types';
import { useAppDate } from '../date/DateProvider';
import { formatDateKeyShort } from '../lib/zoned';
import { useToast } from '../ui/ToastProvider';
import { useWindowManager } from '../windows/WindowManager';

/** Opens an app, or shows an "Unlocks Dec X" toast if it is still locked. */
export function useLaunchApp(): (app: AppDefinition) => void {
  const { todayKey } = useAppDate();
  const notify = useToast();
  const { openWindow } = useWindowManager();

  return useCallback(
    (app: AppDefinition) => {
      if (!isAppUnlocked(app, todayKey)) {
        notify(`${app.title} · Unlocks ${formatDateKeyShort(app.unlockAt)}`, '🔒');
        return;
      }
      openWindow(app.id);
    },
    [todayKey, notify, openWindow],
  );
}
