"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 animate-in fade-in-0 zoom-in-95 duration-200">
        {children}
      </div>
    </div>,
    document.body
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  onClose?: () => void;
}

export function DialogContent({
  children,
  className,
  showClose = true,
  onClose,
}: DialogContentProps) {
  return (
    <div
      className={cn(
        "relative bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4",
        "max-h-[90vh] overflow-y-auto",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200 hover:scale-110"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Schließen</span>
        </button>
      )}
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("px-6 pt-6 pb-4 space-y-2", className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold text-foreground leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogDescription({
  children,
  className,
}: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("px-6 pb-6 pt-4 flex gap-3", className)}>
      {children}
    </div>
  );
}

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

