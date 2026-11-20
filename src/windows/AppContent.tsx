import { LockedNotice } from '../apps/LockedNotice';
import { isAppUnlocked } from '../apps/lock';
import type { AppDefinition } from '../apps/types';
import { useAppDate } from '../date/DateProvider';

/** Renders the app, or a locked notice if the date moved back before its unlock. */
export function AppContent({ app }: { app: AppDefinition }) {
  const { todayKey } = useAppDate();
  if (!isAppUnlocked(app, todayKey)) return <LockedNotice app={app} />;
  const Component = app.component;
  return <Component />;
}
