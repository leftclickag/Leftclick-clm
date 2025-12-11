"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  User,
  Users,
  Ticket,
  Contact,
  ChevronUp,
  HelpCircle,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import { Permission } from "@/types/permissions";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  requiredPermission?: Permission; // Optional - wenn nicht gesetzt, für alle sichtbar
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, requiredPermission: "dashboard.view" },
  { name: "Lead-Magnete", href: "/admin/lead-magnets", icon: FileText, requiredPermission: "lead_magnets.view" },
  { name: "Leads", href: "/admin/leads", icon: Contact, requiredPermission: "leads.view" },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, requiredPermission: "analytics.view" },
  { name: "Benutzer", href: "/admin/users", icon: Users, requiredPermission: "users.view" },
  { name: "Invite Codes", href: "/admin/invite-codes", icon: Ticket, requiredPermission: "invite_codes.view" },
  { name: "Einstellungen", href: "/admin/settings", icon: Settings, requiredPermission: "settings.view" },
  { name: "Berechtigungen", href: "/admin/permissions", icon: Shield, requiredPermission: "permissions.view" },
  { name: "Hilfe", href: "/admin/help", icon: HelpCircle }, // Keine Berechtigung erforderlich - für alle sichtbar
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: permissionsData } = trpc.permissions.getCurrentUserPermissions.useQuery();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth/login";
  };

  const hasPermission = (permission?: Permission) => {
    if (!permission) return true; // Keine Berechtigung erforderlich
    return permissionsData?.permissions?.includes(permission) ?? false;
  };

  // Filtere Navigation basierend auf Berechtigungen
  const visibleNavigation = navigation.filter(item => hasPermission(item.requiredPermission));

  return (
    <div className="flex w-72 flex-col glass-strong border-r border-border relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Logo Header */}
      <div className="relative flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse-glow" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">LeftClick</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">CLM Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-2 p-4">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        {visibleNavigation.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                "animate-fade-in",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground dark:hover:text-white"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Active Background */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/80 to-purple-500/60 shadow-lg shadow-purple-500/20" />
              )}
              
              {/* Hover Background */}
              <div className={cn(
                "absolute inset-0 rounded-xl bg-secondary/50 dark:bg-white/5 opacity-0 transition-opacity duration-300",
                !isActive && "group-hover:opacity-100"
              )} />

              {/* Icon */}
              <div className={cn(
                "relative z-10 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300",
                isActive
                  ? "bg-white/20 dark:bg-white/10"
                  : "bg-secondary/50 dark:bg-white/5 group-hover:bg-secondary dark:group-hover:bg-white/10"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-purple-500 dark:group-hover:text-purple-400"
                )} />
              </div>

              {/* Label */}
              <span className="relative z-10">{item.name}</span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute right-3 h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-border p-4 space-y-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-3 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-secondary/50 dark:hover:bg-white/5 rounded-xl px-4 py-3 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-cyan-500/20 border border-purple-500/20">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium">Mein Profil</span>
              </div>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align="end" 
            className="w-56 glass-strong border-border/50"
          >
            <Link href="/admin/profile">
              <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                <User className="h-4 w-4" />
                <span>Mein Profil</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer gap-2 py-2 text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
