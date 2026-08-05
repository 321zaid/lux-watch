"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "info" | "error";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{ toast: (message: string, kind?: ToastKind) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 1;

export function Toaster({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full items-center gap-3 rounded-sm border bg-ivory px-4 py-3 text-sm text-ink shadow-lg shadow-ink/10 animate-[toast-in_.35s_cubic-bezier(.22,1,.36,1)]",
              t.kind === "success" && "border-gold/40",
              t.kind === "error" && "border-red-400/60"
            )}
          >
            <span className={cn("shrink-0", t.kind === "success" ? "text-gold" : t.kind === "error" ? "text-red-500" : "text-navy")}>
              {t.kind === "success" ? <Check size={16} strokeWidth={2.5} /> : t.kind === "error" ? <X size={16} /> : <Info size={16} />}
            </span>
            <span className="flex-1 font-body">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-smoke hover:text-ink">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}