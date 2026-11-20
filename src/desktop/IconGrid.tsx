import { useEffect } from 'react';
import { isAppUnlocked } from '../apps/lock';
import { APPS } from '../apps/registry';
import { useAppDate } from '../date/DateProvider';
import { useToast } from '../ui/ToastProvider';
import { DesktopIcon } from './DesktopIcon';
import { useLaunchApp } from './useLaunchApp';

export function IconGrid() {
  const { todayKey } = useAppDate();
  const launch = useLaunchApp();
  const notify = useToast();

  // Announce apps that unlock today.
  useEffect(() => {
    const fresh = APPS.filter((app) => app.unlockAt === todayKey);
    const [first] = fresh;
    if (!first) return;
    if (fresh.length === 1) notify(`${first.title} is now unlocked`, first.icon);
    else notify(`${fresh.length} new apps unlocked`, '✨');
  }, [todayKey, notify]);

  return (
    <ul
      aria-label="Apps"
      className="relative grid grid-cols-3 gap-x-2 gap-y-5 px-4 pb-6 pt-16 min-[440px]:grid-cols-4 md:w-max md:grid-flow-col md:grid-cols-none md:grid-rows-4 md:gap-x-3 md:gap-y-2 md:pt-5"
    >
      {APPS.map((app) => (
        <li key={app.id} className="flex justify-center">
          <DesktopIcon app={app} locked={!isAppUnlocked(app, todayKey)} isNew={app.unlockAt === todayKey} onOpen={launch} />
        </li>
      ))}
    </ul>
  );
}
