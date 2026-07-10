"use client";

import { useState, useEffect, useRef, useMemo, KeyboardEvent as ReactKeyboardEvent } from "react";
import { GooeyInput } from "./gooey-input";

export type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  href?: string;
  onClick?: () => void;
  matches?: string[];
};

export interface PortfolioSearchProps {
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
  isMobile?: boolean;
}

export function PortfolioSearch({ items, onSelect, isMobile = false }: PortfolioSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery) ||
        item.matches?.some(m => m.toLowerCase().includes(lowerQuery))
    );
  }, [query, items]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (!isOpen || filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        onSelect(selected);
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex, isOpen]);

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i} className="bg-acid text-black rounded-sm px-[2px]">{part}</mark> : <span key={i}>{part}</span>
        )}
      </>
    );
  };

  return (
    <div className={`relative ${isMobile ? 'w-full px-4 mt-4' : 'w-auto'}`} onKeyDown={handleKeyDown}>
      <div className="sr-only" aria-live="polite">
        {isOpen && query
          ? `${filteredItems.length} results found for ${query}. Use up and down arrows to navigate.`
          : ""}
      </div>
      
      <GooeyInput
        value={query}
        onValueChange={handleQueryChange}
        onOpenChange={setIsOpen}
        placeholder="Search portfolio..."
        expandedWidth={isMobile ? window.innerWidth - 32 : 280}
        collapsedWidth={isMobile ? window.innerWidth - 32 : 40}
        classNames={{
          root: isMobile ? "w-full" : "ml-4",
          trigger: "bg-[var(--surface)] border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--surface-2)] shadow-sm transition-colors",
          bubbleSurface: "bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--text)]",
          input: "text-[var(--text)] placeholder:text-[var(--muted)]"
        }}
      />

      {isOpen && query && (
        <div 
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl border border-line bg-surface p-2 shadow-2xl backdrop-blur-xl"
          style={{ 
            left: isMobile ? '16px' : 'auto', 
            right: isMobile ? '16px' : '0' 
          }}
        >
          {filteredItems.length > 0 ? (
            <ul ref={listRef} className="max-h-[300px] overflow-y-auto outline-none" role="listbox">
              {filteredItems.map((item, idx) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`cursor-pointer rounded-xl px-3 py-2 transition-colors ${
                    idx === selectedIndex ? "bg-surface-2" : "hover:bg-surface-2/50"
                  }`}
                  onClick={() => {
                    onSelect(item);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{highlightMatch(item.title, query)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted border border-line rounded-md px-1.5 py-0.5">{item.type}</span>
                  </div>
                  {item.subtitle && <div className="text-xs text-muted mt-1 truncate">{highlightMatch(item.subtitle, query)}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
