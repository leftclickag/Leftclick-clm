"use client";

import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  FileText,
  Settings,
  User,
  BarChart3,
  Zap,
  Moon,
  Sun,
  LogOut,
  Plus,
  Home,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ============================================
// ⌘K COMMAND PALETTE
// ============================================

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  commands?: CommandItem[];
  placeholder?: string;
  onClose?: () => void;
}

const DEFAULT_COMMANDS: CommandItem[] = [
  {
    id: "home",
    title: "Dashboard",
    description: "Zurück zum Dashboard",
    icon: <Home className="h-4 w-4" />,
    shortcut: "⌘H",
    category: "Navigation",
    action: () => (window.location.href = "/admin"),
    keywords: ["home", "start", "übersicht"],
  },
  {
    id: "new-lead-magnet",
    title: "Neuer Lead Magnet",
    description: "Lead Magnet erstellen",
    icon: <Plus className="h-4 w-4" />,
    shortcut: "⌘N",
    category: "Aktionen",
    action: () => (window.location.href = "/admin/lead-magnets/new"),
    keywords: ["neu", "erstellen", "create"],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Performance analysieren",
    icon: <BarChart3 className="h-4 w-4" />,
    shortcut: "⌘A",
    category: "Navigation",
    action: () => (window.location.href = "/admin/analytics"),
    keywords: ["statistik", "report", "daten"],
  },
  {
    id: "settings",
    title: "Einstellungen",
    description: "Systemeinstellungen",
    icon: <Settings className="h-4 w-4" />,
    shortcut: "⌘,",
    category: "Navigation",
    action: () => (window.location.href = "/admin/settings"),
    keywords: ["config", "optionen"],
  },
  {
    id: "profile",
    title: "Profil",
    description: "Profil bearbeiten",
    icon: <User className="h-4 w-4" />,
    category: "Navigation",
    action: () => (window.location.href = "/admin/profile"),
    keywords: ["account", "konto"],
  },
  {
    id: "toggle-theme",
    title: "Theme wechseln",
    description: "Dark/Light Mode umschalten",
    icon: <Moon className="h-4 w-4" />,
    shortcut: "⌘D",
    category: "Aktionen",
    action: () => {
      document.documentElement.classList.toggle("light");
    },
    keywords: ["dark", "light", "dunkel", "hell"],
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Schnellzugriff",
    icon: <Zap className="h-4 w-4" />,
    shortcut: "⌘J",
    category: "Aktionen",
    action: () => {},
    keywords: ["schnell", "aktion"],
  },
  {
    id: "logout",
    title: "Abmelden",
    description: "Ausloggen",
    icon: <LogOut className="h-4 w-4" />,
    category: "Account",
    action: () => (window.location.href = "/auth/logout"),
    keywords: ["logout", "ausloggen"],
  },
];

export function CommandPalette({
  commands = DEFAULT_COMMANDS,
  placeholder = "Suche oder Befehl eingeben...",
  onClose,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower))
    );
  }, [search, commands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      const category = cmd.category || "Andere";
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Navigate with arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    setSelectedIndex(0);
    onClose?.();
  }, [onClose]);

  const executeCommand = useCallback(
    (command: CommandItem) => {
      command.action();
      handleClose();
    },
    [handleClose]
  );

  return (
    <>
      {/* Trigger Button (optional) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Suchen...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Palette */}
            <motion.div
              className="fixed top-[20%] left-1/2 w-full max-w-xl z-[100000]"
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Command className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded font-mono">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto py-2">
                  {filteredCommands.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Keine Ergebnisse gefunden</p>
                    </div>
                  ) : (
                    Object.entries(groupedCommands).map(([category, cmds]) => (
                      <div key={category}>
                        <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {category}
                        </div>
                        {cmds.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <button
                              key={cmd.id}
                              onClick={() => executeCommand(cmd)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <span
                                className={`p-1.5 rounded-lg ${
                                  isSelected
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {cmd.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {cmd.title}
                                </div>
                                {cmd.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {cmd.description}
                                  </div>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <kbd className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded font-mono">
                                  {cmd.shortcut}
                                </kbd>
                              )}
                              {isSelected && (
                                <ArrowRight className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd>
                      Navigieren
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
                      Ausführen
                    </span>
                  </div>
                  <span>
                    {filteredCommands.length} Befehle
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook to programmatically open command palette
export function useCommandPalette() {
  const open = useCallback(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  }, []);

  return { open };
}

