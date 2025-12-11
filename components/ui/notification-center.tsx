"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// 🔔 NOTIFICATION CENTER
// ============================================

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClear?: () => void;
  onAction?: (notification: Notification) => void;
  maxHeight?: number;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClear,
  onAction,
  maxHeight = 400,
  className = "",
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Gerade eben";
    if (minutes < 60) return `vor ${minutes}m`;
    if (hours < 24) return `vor ${hours}h`;
    if (days < 7) return `vor ${days}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Benachrichtigungen</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && onMarkAllAsRead && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Alle gelesen
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div
                className="overflow-y-auto"
                style={{ maxHeight }}
              >
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Keine Benachrichtigungen</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  !notification.read ? "font-medium" : ""
                                }`}
                              >
                                {notification.title}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>

                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-2">
                              {notification.actionUrl && (
                                <button
                                  onClick={() => onAction?.(notification)}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  {notification.actionLabel || "Ansehen"}
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                              {!notification.read && onMarkAsRead && (
                                <button
                                  onClick={() => onMarkAsRead(notification.id)}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(notification.id)}
                                  className="text-xs text-muted-foreground hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Unread dot */}
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-border flex items-center justify-between">
                  {onClear && (
                    <button
                      onClick={onClear}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Alle löschen
                    </button>
                  )}
                  <button className="text-xs text-primary hover:underline">
                    Alle anzeigen
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 🔔 TOAST NOTIFICATIONS
// ============================================

interface ToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "warning":
        return "bg-amber-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      default:
        return "bg-card border border-border text-foreground";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg max-w-sm ${getStyles()}`}
    >
      <span className="flex-shrink-0 mt-0.5">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {message && (
          <p className={`text-sm mt-0.5 ${type === "info" ? "text-muted-foreground" : "opacity-90"}`}>
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      {duration && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

// ============================================
// 🔔 TOAST CONTAINER
// ============================================

interface ToastContainerProps {
  toasts: ToastProps[];
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  onClose: (id: string) => void;
}

export function ToastContainer({
  toasts,
  position = "top-right",
  onClose,
}: ToastContainerProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[99999] space-y-2`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 🔔 HOOK FOR TOASTS
// ============================================

export function useToasts() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastProps, "id" | "onClose">) => {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ type: "error", title, message }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: "warning", title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />,
  };
}

