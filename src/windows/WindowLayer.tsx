import { getApp } from '../apps/registry';
import { useElementSize } from '../hooks/useElementSize';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { DesktopWindow } from './DesktopWindow';
import { MobileSheet } from './MobileSheet';
import { useWindowManager } from './WindowManager';

export function WindowLayer() {
  const { windows, activeAppId } = useWindowManager();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [ref, bounds] = useElementSize<HTMLDivElement>();

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {isMobile
        ? activeAppId && <MobileSheet key={activeAppId} app={getApp(activeAppId)} />
        : bounds.width > 0 &&
          windows.map((win) => (
            <DesktopWindow
              key={win.appId}
              app={getApp(win.appId)}
              win={win}
              isActive={win.appId === activeAppId}
              bounds={bounds}
            />
          ))}
    </div>
  );
}
