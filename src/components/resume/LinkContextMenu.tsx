import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

interface LinkContextMenuProps {
  containerRef?: React.RefObject<HTMLElement>;
}

export function LinkContextMenu({ containerRef }: LinkContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetAnchor, setTargetAnchor] = useState<HTMLAnchorElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a") as HTMLAnchorElement | null;

      if (anchor && container.contains(anchor)) {
        e.preventDefault();
        e.stopPropagation();

        const rect = anchor.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.bottom + 4 });
        setTargetAnchor(anchor);
        setEditUrl(anchor.href || "");
        setEditing(false);
        setVisible(true);
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
        setEditing(false);
      }
    };

    container.addEventListener("click", handleClick);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      container.removeEventListener("click", handleClick);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [containerRef]);

  const handleOpen = () => {
    if (targetAnchor?.href) {
      window.open(targetAnchor.href, "_blank", "noopener,noreferrer");
    }
    setVisible(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (targetAnchor && editUrl.trim()) {
      const url = editUrl.startsWith("http") ? editUrl : `https://${editUrl}`;
      targetAnchor.href = url;
      targetAnchor.setAttribute("target", "_blank");
    }
    setEditing(false);
    setVisible(false);
  };

  const handleRemove = () => {
    if (targetAnchor) {
      const text = document.createTextNode(targetAnchor.textContent || "");
      targetAnchor.parentNode?.replaceChild(text, targetAnchor);
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] rounded-xl bg-popover border border-border shadow-xl"
          style={{ left: position.x, top: position.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {!editing ? (
            <div className="flex items-center gap-0.5 p-1">
              <button
                onClick={handleOpen}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-popover-foreground hover:bg-accent/50 transition-colors"
              >
                <ExternalLink size={12} />
                Open Link
              </button>
              <div className="w-px h-4 bg-border" />
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-popover-foreground hover:bg-accent/50 transition-colors"
              >
                <Pencil size={12} />
                Edit
              </button>
              <div className="w-px h-4 bg-border" />
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1.5">
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") { setEditing(false); setVisible(false); }
                }}
                className="w-56 px-2 py-1 text-[11px] rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
