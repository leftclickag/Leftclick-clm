"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

type ConfirmVariant = "default" | "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    bgClass: string;
    confirmClass: string;
  }
> = {
  default: {
    icon: Info,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    confirmClass: "bg-blue-600 hover:bg-blue-700",
  },
  danger: {
    icon: XCircle,
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10 border-red-500/30",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10 border-yellow-500/30",
    confirmClass: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: Info,
    iconClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10 border-cyan-500/30",
    confirmClass: "bg-cyan-600 hover:bg-cyan-700",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
    confirmClass: "bg-emerald-600 hover:bg-emerald-700",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={!isPending && !loading}
        onClose={() => !isPending && !loading && onOpenChange(false)}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.bgClass} border`}
            >
              <Icon className={`h-6 w-6 ${config.iconClass}`} />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending || loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || loading}
            className={`flex-1 ${config.confirmClass}`}
          >
            {isPending || loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Lädt...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook für einfache Verwendung
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, "open" | "onOpenChange">>({
    title: "",
    onConfirm: () => {},
  });

  const confirm = React.useCallback(
    (options: Omit<ConfirmDialogProps, "open" | "onOpenChange">) => {
      return new Promise<boolean>((resolve) => {
        setConfig({
          ...options,
          onConfirm: async () => {
            await options.onConfirm();
            resolve(true);
          },
        });
        setIsOpen(true);
      });
    },
    []
  );

  const dialog = (
    <ConfirmDialog
      {...config}
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Dialog wurde abgebrochen
        }
      }}
    />
  );

  return { confirm, dialog };
}

