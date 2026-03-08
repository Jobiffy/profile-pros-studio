import React, { useState, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, ChevronDown, Type, Link2 } from "lucide-react";

const FONT_FAMILIES = [
  "Inter", "Georgia", "Times New Roman", "Arial", "Helvetica",
  "Merriweather", "Roboto", "Lato", "Playfair Display", "Source Sans Pro",
];

const FONT_SIZES = [
  "8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32",
];

interface FloatingToolbarProps {
  containerRef?: React.RefObject<HTMLElement>;
}

export function FloatingToolbar({ containerRef }: FloatingToolbarProps) {
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [currentFont, setCurrentFont] = useState("");
  const [currentSize, setCurrentSize] = useState("");
  const [hasSelection, setHasSelection] = useState(false);

  const updateToolbarState = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
    setCurrentFont(document.queryCommandValue("fontName").replace(/['"]/g, "") || "");
    const size = document.queryCommandValue("fontSize");
    setCurrentSize(size || "");
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setHasSelection(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const container = containerRef?.current;
      if (container && container.contains(range.commonAncestorContainer)) {
        setHasSelection(true);
        updateToolbarState();
      } else {
        setHasSelection(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [containerRef, updateToolbarState]);

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const applyCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateToolbarState();
  };

  const handleFontSelect = (font: string) => {
    applyCommand("fontName", font);
    setCurrentFont(font);
    setShowFontDropdown(false);
  };

  const handleSizeSelect = (size: string) => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      try {
        range.surroundContents(span);
      } catch {
        applyCommand("fontSize", "7");
        const container = containerRef?.current;
        if (container) {
          const fontElements = container.querySelectorAll('font[size="7"]');
          fontElements.forEach(el => {
            const s = document.createElement("span");
            s.style.fontSize = `${size}px`;
            s.innerHTML = el.innerHTML;
            el.replaceWith(s);
          });
        }
      }
    }
    setCurrentSize(size);
    setShowSizeDropdown(false);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    applyCommand("createLink", url);
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const truncateFont = (f: string) => f.length > 10 ? f.slice(0, 10) + "…" : f;

  const disabledClass = hasSelection ? "" : "opacity-40 pointer-events-none";

  return (
    <div
      onMouseDown={handleToolbarMouseDown}
      className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-popover border border-border shadow-sm"
    >
      {/* Font Family Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowFontDropdown(!showFontDropdown); setShowSizeDropdown(false); setShowLinkInput(false); }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-popover-foreground hover:bg-accent/50 transition-colors min-w-[80px] justify-between ${disabledClass}`}
        >
          <Type size={12} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{truncateFont(currentFont || "Font")}</span>
          <ChevronDown size={10} className="shrink-0 text-muted-foreground" />
        </button>
        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 max-h-52 overflow-y-auto rounded-xl bg-popover border border-border shadow-xl z-50 py-1">
            {FONT_FAMILIES.map(font => (
              <button
                key={font}
                onClick={() => handleFontSelect(font)}
                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent/50 transition-colors ${
                  currentFont === font ? "text-primary font-semibold bg-primary/5" : "text-popover-foreground"
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Font Size Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowSizeDropdown(!showSizeDropdown); setShowFontDropdown(false); setShowLinkInput(false); }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-popover-foreground hover:bg-accent/50 transition-colors min-w-[48px] justify-between ${disabledClass}`}
        >
          <span>{currentSize || "Size"}</span>
          <ChevronDown size={10} className="text-muted-foreground" />
        </button>
        {showSizeDropdown && (
          <div className="absolute top-full left-0 mt-1 w-20 max-h-52 overflow-y-auto rounded-xl bg-popover border border-border shadow-xl z-50 py-1">
            {FONT_SIZES.map(size => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-accent/50 transition-colors ${
                  currentSize === size ? "text-primary font-semibold bg-primary/5" : "text-popover-foreground"
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Bold */}
      <button
        onClick={() => applyCommand("bold")}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${disabledClass} ${
          activeFormats.bold ? "bg-primary/15 text-primary" : "text-popover-foreground hover:bg-accent/50"
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={14} strokeWidth={2.5} />
      </button>

      {/* Italic */}
      <button
        onClick={() => applyCommand("italic")}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${disabledClass} ${
          activeFormats.italic ? "bg-primary/15 text-primary" : "text-popover-foreground hover:bg-accent/50"
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={14} />
      </button>

      {/* Underline */}
      <button
        onClick={() => applyCommand("underline")}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${disabledClass} ${
          activeFormats.underline ? "bg-primary/15 text-primary" : "text-popover-foreground hover:bg-accent/50"
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline size={14} />
      </button>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Hyperlink */}
      <div className="relative">
        <button
          onClick={() => { setShowLinkInput(!showLinkInput); setShowFontDropdown(false); setShowSizeDropdown(false); }}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${disabledClass} text-popover-foreground hover:bg-accent/50`}
          title="Insert Link"
        >
          <Link2 size={14} />
        </button>
        {showLinkInput && (
          <div className="absolute top-full right-0 mt-1 flex items-center gap-1 p-1.5 rounded-xl bg-popover border border-border shadow-xl z-50">
            <input
              type="text"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleInsertLink(); if (e.key === "Escape") setShowLinkInput(false); }}
              placeholder="https://example.com"
              className="w-52 px-2 py-1 text-[11px] rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
              autoFocus
              onMouseDown={e => e.stopPropagation()}
            />
            <button
              onClick={handleInsertLink}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
