"use client";

import { useState } from "react";
import { MoreHorizontal, LinkIcon, Code, FileCode, Clipboard, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LeadMagnetActionsProps {
  magnet: { id: string; slug: string; title: string };
}

export function LeadMagnetActions({ magnet }: LeadMagnetActionsProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://your-app.com";
  const widgetUrl = `${baseUrl}/widget/${magnet.slug}`;

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error("Fehler beim Kopieren:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Widget-Integration</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => copyToClipboard(widgetUrl, "url")}>
          {copiedItem === "url" ? <Check className="mr-2 h-4 w-4" /> : <LinkIcon className="mr-2 h-4 w-4" />}
          Widget-URL kopieren
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            In neuem Tab öffnen
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

