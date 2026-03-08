import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bold, Italic, Underline, ChevronDown, Type } from "lucide-react";

const FONT_FAMILIES = [
  "Inter", "Georgia", "Times New Roman", "Arial", "Helvetica",
  "Merriweather", "Roboto", "Lato", "Playfair Display", "Source Sans Pro",
];

const FONT_SIZES = [
  "8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32",
];

interface FloatingToolbarProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function FloatingToolbar({ containerRef }: FloatingToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [currentFont, setCurrentFont] = useState("");
  const [currentSize, setCurrentSize] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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

  const calculatePosition = useCallback((range: Range) => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Position above the selection
    let top = rect.top - containerRect.top - 52;
    let left = rect.left - containerRect.left + rect.width / 2;

    // Clamp horizontal
    left = Math.max(180, Math.min(left, containerRect.width - 180));

    // If too close to top, show below
    if (top < 0) {
      top = rect.bottom - containerRect.top + 8;
    }

    return { top, left };
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        // Delay hide to allow clicking toolbar buttons
        hideTimeoutRef.current = setTimeout(() => setVisible(false), 200);
        return;
      }

      const range = sel.getRangeAt(0);
      // Only show if selection is inside our container
      if (!container.contains(range.commonAncestorContainer)) {
        hideTimeoutRef.current = setTimeout(() => setVisible(false), 200);
        return;
      }

      // Check if any editable element is active
      const editableParent = (range.commonAncestorContainer as HTMLElement).closest?.("[contenteditable='true']")
        || (range.commonAncestorContainer.parentElement)?.closest?.("[contenteditable='true']");

      if (!editableParent) {
        return;
      }

      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

      const pos = calculatePosition(range);
      if (pos) {
        setPosition(pos);
        setVisible(true);
        updateToolbarState();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [containerRef, calculatePosition, updateToolbarState]);

  // Keep toolbar visible when interacting with it
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent losing selection
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
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
    // execCommand fontSize only accepts 1-7, so we use CSS instead
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      try {
        range.surroundContents(span);
      } catch {
        // If range spans multiple elements, apply differently
        applyCommand("fontSize", "7");
        const container = containerRef.current;
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

  const truncateFont = (f: string) => f.length > 10 ? f.slice(0, 10) + "…" : f;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onMouseDown={handleToolbarMouseDown}
          className="absolute z-[100] flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-popover border border-border shadow-lg shadow-black/10 backdrop-blur-md"
          style={{
            top: position.top,
            left: position.left,
            transform: "translateX(-50%)",
          }}
        >
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowFontDropdown(!showFontDropdown); setShowSizeDropdown(false); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-popover-foreground hover:bg-accent/50 transition-colors min-w-[80px] justify-between"
            >
              <Type size={12} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{truncateFont(currentFont || "Font")}</span>
              <ChevronDown size={10} className="shrink-0 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showFontDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-48 max-h-52 overflow-y-auto rounded-xl bg-popover border border-border shadow-xl z-50 py-1"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Font Size Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowSizeDropdown(!showSizeDropdown); setShowFontDropdown(false); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-popover-foreground hover:bg-accent/50 transition-colors min-w-[48px] justify-between"
            >
              <span>{currentSize || "Size"}</span>
              <ChevronDown size={10} className="text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showSizeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-20 max-h-52 overflow-y-auto rounded-xl bg-popover border border-border shadow-xl z-50 py-1"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Bold */}
          <button
            onClick={() => applyCommand("bold")}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeFormats.bold
                ? "bg-primary/15 text-primary"
                : "text-popover-foreground hover:bg-accent/50"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} strokeWidth={2.5} />
          </button>

          {/* Italic */}
          <button
            onClick={() => applyCommand("italic")}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeFormats.italic
                ? "bg-primary/15 text-primary"
                : "text-popover-foreground hover:bg-accent/50"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </button>

          {/* Underline */}
          <button
            onClick={() => applyCommand("underline")}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeFormats.underline
                ? "bg-primary/15 text-primary"
                : "text-popover-foreground hover:bg-accent/50"
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
