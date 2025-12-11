"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  showToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number
  ) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = React.useCallback(
    (message: string, variant: ToastVariant = "info", duration = 5000) => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = React.useMemo(
    () => ({
      showToast,
      success: (message: string, duration?: number) =>
        showToast(message, "success", duration),
      error: (message: string, duration?: number) =>
        showToast(message, "error", duration),
      warning: (message: string, duration?: number) =>
        showToast(message, "warning", duration),
      info: (message: string, duration?: number) =>
        showToast(message, "info", duration),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
  },
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        "animate-in slide-in-from-right-full duration-300",
        "min-w-[300px] max-w-md",
        config.bgClass,
        config.borderClass
      )}
    >
      <div className={cn("flex-shrink-0 mt-0.5", config.iconClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="flex-1 text-sm text-foreground leading-relaxed">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Schließen</span>
      </button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

