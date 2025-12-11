"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Copy, 
  Code, 
  ExternalLink, 
  MoreHorizontal,
  Link as LinkIcon,
  FileCode,
  Clipboard,
  Check,
  CopyPlus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";

interface LeadMagnetActionsProps {
  magnet: {
    id: string;
    slug: string;
    title: string;
  };
  onDuplicated?: () => void;
}

export function LeadMagnetActions({ magnet, onDuplicated }: LeadMagnetActionsProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();
  
  const duplicateMutation = trpc.leadMagnets.duplicate.useMutation({
    onSuccess: (newLeadMagnet) => {
      // Cache invalidieren und Liste neu laden
      utils.leadMagnets.list.invalidate();
      onDuplicated?.();
      // Optional: Zur neuen Kopie navigieren
      router.push(`/admin/lead-magnets/${newLeadMagnet.id}`);
    },
    onError: (error) => {
      console.error("Fehler beim Duplizieren:", error);
      alert(`Fehler beim Duplizieren: ${error.message}`);
    },
    onSettled: () => {
      setIsDuplicating(false);
    }
  });

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    duplicateMutation.mutate({ id: magnet.id });
  };

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
  
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

  const getIframeCode = () => {
    return `<!-- LeftClick CLM Widget - iFrame -->
<iframe
  src="${widgetUrl}"
  width="100%"
  height="600px"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
  allow="clipboard-write"
  loading="lazy"
></iframe>`;
  };

  const getPopupCode = () => {
    return `<!-- LeftClick CLM Widget - Popup -->
<script>
(function() {
  var config = {
    id: '${magnet.id}',
    slug: '${magnet.slug}',
    trigger: 'click',
    position: 'center'
  };
  
  var script = document.createElement('script');
  script.src = '${baseUrl}/embed.js';
  script.async = true;
  script.onload = function() {
    window.LeftClickCLM && window.LeftClickCLM.init(config);
  };
  document.head.appendChild(script);
})();
</script>

<!-- Trigger Button -->
<button data-leftclick-trigger="${magnet.slug}">
  ${magnet.title} öffnen
</button>`;
  };

  const getApiEndpoint = () => {
    return `${baseUrl}/api/lead-magnets/${magnet.id}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mehr Aktionen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Widget-Integration</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => copyToClipboard(widgetUrl, "url")}
          className="cursor-pointer"
        >
          {copiedItem === "url" ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <LinkIcon className="mr-2 h-4 w-4" />
          )}
          <span>Widget-URL kopieren</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => copyToClipboard(getIframeCode(), "iframe")}
          className="cursor-pointer"
        >
          {copiedItem === "iframe" ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Code className="mr-2 h-4 w-4" />
          )}
          <span>iFrame-Code kopieren</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => copyToClipboard(getPopupCode(), "popup")}
          className="cursor-pointer"
        >
          {copiedItem === "popup" ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <FileCode className="mr-2 h-4 w-4" />
          )}
          <span>Popup-Code kopieren</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          API & Entwicklung
        </DropdownMenuLabel>

        <DropdownMenuItem 
          onClick={() => copyToClipboard(getApiEndpoint(), "api")}
          className="cursor-pointer"
        >
          {copiedItem === "api" ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Clipboard className="mr-2 h-4 w-4" />
          )}
          <span>API-Endpoint kopieren</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => copyToClipboard(magnet.slug, "slug")}
          className="cursor-pointer"
        >
          {copiedItem === "slug" ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>Slug kopieren</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a 
            href={widgetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>In neuem Tab öffnen</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Lead Magnet verwalten
        </DropdownMenuLabel>

        <DropdownMenuItem 
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="cursor-pointer"
        >
          {isDuplicating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CopyPlus className="mr-2 h-4 w-4" />
          )}
          <span>{isDuplicating ? "Wird dupliziert..." : "Duplizieren"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
