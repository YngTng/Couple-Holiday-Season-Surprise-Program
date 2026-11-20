import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  icon: string;
}

type Notify = (message: string, icon?: string) => void;

const ToastContext = createContext<Notify | null>(null);
const TOAST_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<Notify>(
    (message, icon = '♡') => {
      const id = nextId.current++;
      setToasts((list) => [...list.filter((t) => t.message !== message), { id, message, icon }].slice(-3));
      window.setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex flex-col items-center gap-2 px-4 md:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface py-1 pl-4 pr-1 text-sm text-ink shadow-lg animate-[toast-in_200ms_ease-out]"
          >
            <span aria-hidden="true" className="text-lg">
              {toast.icon}
            </span>
            <p className="flex-1 py-2">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-2"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Notify {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
