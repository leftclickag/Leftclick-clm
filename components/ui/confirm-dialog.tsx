"use client";

import { useState, createContext, useContext, useCallback, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle, XCircle, Trash2 } from "lucide-react";

// Dialog-Typen
type DialogType = "confirm" | "alert" | "warning" | "delete" | "success";

interface ConfirmOptions {
  title: string;
  description: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "ghost";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (title: string, description: string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

// Hook zum Verwenden des Confirm-Dialogs
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

// Provider-Komponente
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const alert = useCallback((title: string, description: string): Promise<void> => {
    return new Promise((resolve) => {
      setOptions({
        title,
        description,
        type: "alert",
        confirmText: "OK",
        cancelText: undefined,
      });
      setResolvePromise(() => () => resolve());
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
  };

  const getIcon = () => {
    switch (options?.type) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "delete":
        return <Trash2 className="h-6 w-6 text-red-500" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "alert":
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getIconBackground = () => {
    switch (options?.type) {
      case "warning":
        return "bg-amber-500/20";
      case "delete":
        return "bg-red-500/20";
      case "success":
        return "bg-green-500/20";
      default:
        return "bg-blue-500/20";
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${getIconBackground()}`}>
                {getIcon()}
              </div>
              <DialogTitle className="text-lg">{options?.title}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogBody>
            <p className="text-muted-foreground">{options?.description}</p>
          </DialogBody>
          <DialogFooter className="gap-3">
            {options?.cancelText !== undefined && (
              <Button variant="outline" onClick={handleCancel}>
                {options?.cancelText || "Abbrechen"}
              </Button>
            )}
            <Button
              variant={options?.confirmVariant || (options?.type === "delete" ? "destructive" : "default")}
              onClick={handleConfirm}
            >
              {options?.confirmText || "Bestätigen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

// Einfache Confirm-Dialog-Komponente für direkten Gebrauch
interface SimpleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmVariant?: "default" | "destructive" | "outline" | "ghost";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  type = "confirm",
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  onConfirm,
  onCancel,
  confirmVariant,
}: SimpleConfirmDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "delete":
        return <Trash2 className="h-6 w-6 text-red-500" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case "warning":
        return "bg-amber-500/20";
      case "delete":
        return "bg-red-500/20";
      case "success":
        return "bg-green-500/20";
      default:
        return "bg-blue-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getIconBackground()}`}>
              {getIcon()}
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground">{description}</p>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant || (type === "delete" ? "destructive" : "default")}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Alert-Dialog-Komponente
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: "info" | "warning" | "error" | "success";
  buttonText?: string;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  type = "info",
  buttonText = "OK",
}: AlertDialogProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case "warning":
        return "bg-amber-500/20";
      case "error":
        return "bg-red-500/20";
      case "success":
        return "bg-green-500/20";
      default:
        return "bg-blue-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getIconBackground()}`}>
              {getIcon()}
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground">{description}</p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
