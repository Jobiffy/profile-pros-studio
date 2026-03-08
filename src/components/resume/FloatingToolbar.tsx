import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bold, Italic, Underline, ChevronDown, Type, Link2, Undo2, Redo2 } from "lucide-react";

const FONT_FAMILIES = [
  "Inter", "Georgia", "Times New Roman", "Arial", "Helvetica",
  "Merriweather", "Roboto", "Lato", "Playfair Display", "Source Sans Pro",
];

const FONT_SIZES = [
  "8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32",
];

interface FloatingToolbarProps {
  containerRef?: React.RefObject<HTMLElement>;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function FloatingToolbar({ containerRef, onUndo, onRedo, canUndo, canRedo }: FloatingToolbarProps) {
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedRangeRef = useRef<Range | null>(null);
  const [currentFont, setCurrentFont] = useState("");
  const [currentSize, setCurrentSize] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

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
        // Don't clear hasSelection if focus is in link input
        if (showLinkInput) return;
        setHasSelection(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const container = containerRef?.current;
      if (container && container.contains(range.commonAncestorContainer)) {
        setHasSelection(true);
        updateToolbarState();
      } else {
        if (!showLinkInput) setHasSelection(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [containerRef, updateToolbarState, showLinkInput]);

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    // Don't prevent default on the link input itself
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT") return;
    e.preventDefault();
  };

  const restoreSelection = useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  }, []);

  const applyCommand = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    updateToolbarState();
  };

  const handleFontSelect = (font: string) => {
    applyCommand("fontName", font);
    setCurrentFont(font);
    setShowFontDropdown(false);
  };

  const handleSizeSelect = (size: string) => {
    if (!restoreSelection()) return;
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

  // Save selection whenever it changes in the container
  useEffect(() => {
    const saveCurrentRange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const container = containerRef?.current;
        if (container && container.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      }
    };

    document.addEventListener("selectionchange", saveCurrentRange);
    return () => document.removeEventListener("selectionchange", saveCurrentRange);
  }, [containerRef]);

  const handleOpenLinkInput = () => {
    // savedRangeRef is already kept up to date
    setShowLinkInput(!showLinkInput);
    setShowFontDropdown(false);
    setShowSizeDropdown(false);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim() || !savedRangeRef.current) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;

    // Restore saved selection
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    // Focus the contentEditable ancestor so execCommand works
    const editableEl = savedRangeRef.current.startContainer.parentElement?.closest("[contenteditable='true']") as HTMLElement;
    if (editableEl) {
      editableEl.focus();
      // Re-apply selection after focus
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }

    document.execCommand("createLink", false, url);

    // Style the newly created link
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parentEl = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;
      const anchor = parentEl?.closest("a") || parentEl?.querySelector("a");
      if (anchor) {
        anchor.style.color = "hsl(217, 91%, 50%)";
        anchor.style.textDecoration = "underline";
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
      }
    }

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
      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-popover-foreground hover:bg-accent/50 ${!canUndo ? 'opacity-30 pointer-events-none' : ''}`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-popover-foreground hover:bg-accent/50 ${!canRedo ? 'opacity-30 pointer-events-none' : ''}`}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={14} />
      </button>

      <div className="w-px h-5 bg-border mx-0.5" />

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
          onClick={handleOpenLinkInput}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${disabledClass} text-popover-foreground hover:bg-accent/50`}
          title="Insert Link"
        >
          <Link2 size={14} />
        </button>
        {showLinkInput && (
          <div className="absolute top-full right-0 mt-1 flex items-center gap-1 p-1.5 rounded-xl bg-popover border border-border shadow-xl z-50">
            <input
              ref={linkInputRef}
              type="text"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleInsertLink(); if (e.key === "Escape") setShowLinkInput(false); }}
              placeholder="https://example.com"
              className="w-52 px-2 py-1 text-[11px] rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
              autoFocus
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleInsertLink();
              }}
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
