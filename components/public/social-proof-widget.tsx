"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, Flame } from "lucide-react";

interface SocialProofStats {
  total_completions: number;
  today_completions: number;
  this_week_completions: number;
  last_completion_at: string | null;
  avg_completion_time_seconds: number | null;
}

interface SocialProofWidgetProps {
  leadMagnetId: string;
  variant?: "banner" | "floating" | "inline" | "minimal";
  position?: "top" | "bottom" | "bottom-left" | "bottom-right";
  showRealtime?: boolean;
  className?: string;
}

export function SocialProofWidget({
  leadMagnetId,
  variant = "floating",
  position = "bottom-left",
  showRealtime = true,
  className = "",
}: SocialProofWidgetProps) {
  const [stats, setStats] = useState<SocialProofStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string | null>(null);

  // Fetch initial stats
  useEffect(() => {
    fetch(`/api/social-proof/${leadMagnetId}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        // Show with delay for effect
        setTimeout(() => setIsVisible(true), 1000);
      })
      .catch(console.error);
  }, [leadMagnetId]);

  // Realtime updates via Supabase Realtime (simulated with polling for simplicity)
  useEffect(() => {
    if (!showRealtime) return;

    const interval = setInterval(() => {
      fetch(`/api/social-proof/${leadMagnetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (stats && data.total_completions > stats.total_completions) {
            // New completion! Show activity notification
            setRecentActivity(getRandomLocation());
            setTimeout(() => setRecentActivity(null), 5000);
          }
          setStats(data);
        })
        .catch(console.error);
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [leadMagnetId, showRealtime, stats]);

  if (!stats || !isVisible) return null;

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "gerade eben";
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`;
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std.`;
    return `vor ${Math.floor(seconds / 86400)} Tagen`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Position classes
  const positionClasses: Record<string, string> = {
    "top": "top-4 left-1/2 -translate-x-1/2",
    "bottom": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  // Floating variant (most common)
  if (variant === "floating") {
    return (
      <div
        className={`fixed ${positionClasses[position]} z-40 animate-in slide-in-from-bottom-4 fade-in duration-500 ${className}`}
      >
        {/* Recent activity notification */}
        {recentActivity && (
          <div className="mb-2 rounded-lg bg-green-500 px-4 py-2 text-sm text-white shadow-lg animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-2">
              <span className="animate-pulse">🎉</span>
              <span>Jemand aus {recentActivity} hat gerade abgeschlossen!</span>
            </div>
          </div>
        )}

        {/* Main widget */}
        <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl px-4 py-3 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{Math.max(0, stats.today_completions - 3)}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                {formatNumber(stats.total_completions)} haben das gemacht
              </p>
              <p className="text-xs text-gray-500">
                {stats.today_completions} heute • {stats.this_week_completions} diese Woche
              </p>
            </div>
          </div>

          {stats.last_completion_at && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              Letzte Teilnahme: {formatTimeAgo(stats.last_completion_at)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Banner variant (full width)
  if (variant === "banner") {
    return (
      <div
        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 ${className}`}
      >
        <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-semibold">{formatNumber(stats.total_completions)}</span>
            <span>haben bereits teilgenommen</span>
          </div>
          <span className="text-white/60">|</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>{stats.today_completions} heute</span>
          </div>
          {recentActivity && (
            <>
              <span className="text-white/60">|</span>
              <span className="animate-pulse">
                🎉 Gerade eben aus {recentActivity}!
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm ${className}`}
      >
        <div className="flex -space-x-1.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white"
            />
          ))}
        </div>
        <span className="font-medium text-gray-700">
          {formatNumber(stats.total_completions)}+ haben das gemacht
        </span>
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`flex items-center gap-1.5 text-sm text-gray-600 ${className}`}>
      <Users className="h-4 w-4" />
      <span>{formatNumber(stats.total_completions)} Teilnehmer</span>
    </div>
  );
}

// Helper: Random German city for activity notifications
function getRandomLocation(): string {
  const locations = [
    "Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart",
    "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden",
    "Hannover", "Nürnberg", "Duisburg", "Bochum", "Wien", "Zürich",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

