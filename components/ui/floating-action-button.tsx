"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MessageCircle, Phone, Mail, Calendar, HelpCircle } from "lucide-react";

// ============================================
// 🎯 FLOATING ACTION BUTTON (FAB)
// ============================================

interface FABAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  mainIcon?: ReactNode;
  mainColor?: string;
  className?: string;
}

const DEFAULT_ACTIONS: FABAction[] = [
  {
    id: "chat",
    icon: <MessageCircle className="h-5 w-5" />,
    label: "Chat",
    onClick: () => {},
    color: "#10B981",
  },
  {
    id: "call",
    icon: <Phone className="h-5 w-5" />,
    label: "Anrufen",
    onClick: () => {},
    color: "#3B82F6",
  },
  {
    id: "email",
    icon: <Mail className="h-5 w-5" />,
    label: "E-Mail",
    onClick: () => {},
    color: "#8B5CF6",
  },
  {
    id: "calendar",
    icon: <Calendar className="h-5 w-5" />,
    label: "Termin",
    onClick: () => {},
    color: "#F59E0B",
  },
];

export function FloatingActionButton({
  actions = DEFAULT_ACTIONS,
  position = "bottom-right",
  mainIcon,
  mainColor = "#6366F1",
  className = "",
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 flex flex-col gap-3 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Label */}
                <motion.span
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  {action.label}
                </motion.span>

                {/* Button */}
                <motion.button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: action.color }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {action.icon}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl"
        style={{ backgroundColor: mainColor }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {mainIcon || (isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />)}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 💬 CHAT FAB
// ============================================

interface ChatFABProps {
  onOpen?: () => void;
  unreadCount?: number;
  agentName?: string;
  agentAvatar?: string;
  welcomeMessage?: string;
  className?: string;
}

export function ChatFAB({
  onOpen,
  unreadCount = 0,
  agentName = "Support",
  agentAvatar,
  welcomeMessage = "Hallo! Wie kann ich helfen?",
  className = "",
}: ChatFABProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState(false);

  // Show tooltip after 3 seconds on first visit
  useState(() => {
    if (!hasShownTooltip) {
      const timer = setTimeout(() => {
        setIsTooltipOpen(true);
        setHasShownTooltip(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setIsTooltipOpen(false), 5000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {isTooltipOpen && (
          <motion.div
            className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                {agentAvatar ? (
                  <img src={agentAvatar} alt={agentName} className="h-full w-full rounded-full" />
                ) : (
                  <span className="text-white font-bold">{agentName[0]}</span>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{agentName}</p>
                <p className="text-white/80 text-xs">Online</p>
              </div>
              <button
                onClick={() => setIsTooltipOpen(false)}
                className="ml-auto text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message */}
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg p-3 text-gray-700 text-sm">
                {welcomeMessage}
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <button
                onClick={() => {
                  setIsTooltipOpen(false);
                  onOpen?.();
                }}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Chat starten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={onOpen}
        className="relative h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="h-6 w-6" />

        {/* Unread Badge */}
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

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-400"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}

// ============================================
// ❓ HELP FAB
// ============================================

interface HelpItem {
  id: string;
  question: string;
  answer: string;
}

interface HelpFABProps {
  items?: HelpItem[];
  className?: string;
}

const DEFAULT_HELP_ITEMS: HelpItem[] = [
  {
    id: "1",
    question: "Wie erstelle ich einen Lead Magnet?",
    answer: "Klicke auf 'Neuer Lead Magnet' und folge dem Wizard.",
  },
  {
    id: "2",
    question: "Wie integriere ich das Widget?",
    answer: "Gehe zu Einstellungen > Embed Code und kopiere den Code.",
  },
  {
    id: "3",
    question: "Wo sehe ich meine Analytics?",
    answer: "Im Dashboard unter 'Analytics' findest du alle Statistiken.",
  },
];

export function HelpFAB({ items = DEFAULT_HELP_ITEMS, className = "" }: HelpFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HelpItem | null>(null);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Hilfe Center</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedItem(null);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {selectedItem ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-muted-foreground mb-3 hover:text-foreground"
                  >
                    ← Zurück
                  </button>
                  <h4 className="font-medium mb-2">{selectedItem.question}</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.answer}</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </motion.button>
    </div>
  );
}

