"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Copy, Code } from "lucide-react";

export function TestDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        TEST DROPDOWN
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-[9999] min-w-[200px] rounded-xl border border-border bg-card p-2 shadow-xl">
          <div className="px-3 py-2 text-sm font-semibold border-b border-border mb-2">
            Test Menü
          </div>
          <button 
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/80"
            onClick={() => alert('Option 1 geklickt!')}
          >
            <Check className="h-4 w-4" />
            Option 1
          </button>
          <button 
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/80"
            onClick={() => alert('Option 2 geklickt!')}
          >
            <Copy className="h-4 w-4" />
            Option 2
          </button>
          <button 
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/80"
            onClick={() => alert('Option 3 geklickt!')}
          >
            <Code className="h-4 w-4" />
            Option 3
          </button>
        </div>
      )}
    </div>
  );
}

