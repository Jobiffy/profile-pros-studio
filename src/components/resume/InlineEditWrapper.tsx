import React, { useState, useRef, useEffect, useCallback } from "react";

interface InlineEditProps {
  value: string;
  fieldPath: string;
  onUpdate: (field: string, value: string) => void;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

/**
 * Wraps a text element to make it editable on click in the preview.
 * Double-click to edit, blur or Enter to save.
 */
export function InlineEdit({
  value,
  fieldPath,
  onUpdate,
  as: Tag = "span",
  className = "",
  style,
  multiline = false,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const startEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditValue(value);
  }, [value]);

  const save = useCallback(() => {
    setEditing(false);
    if (editValue !== value) {
      onUpdate(fieldPath, editValue);
    }
  }, [editValue, value, fieldPath, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditValue(value);
    }
  }, [save, multiline, value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  if (editing) {
    return (
      <Tag
        ref={ref as any}
        contentEditable
        suppressContentEditableWarning
        className={`${className} outline-none ring-2 ring-primary/40 rounded-sm px-0.5 -mx-0.5 cursor-text`}
        style={{ ...style, minWidth: "20px" }}
        onBlur={save}
        onKeyDown={handleKeyDown}
        onInput={(e) => setEditValue((e.target as HTMLElement).textContent || "")}
        dangerouslySetInnerHTML={{ __html: editValue }}
      />
    );
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:ring-2 hover:ring-primary/20 hover:rounded-sm hover:bg-primary/5 transition-all duration-150`}
      style={style}
      onDoubleClick={startEdit}
      title="Double-click to edit"
    >
      {value || <span className="text-gray-300 italic">Click to edit</span>}
    </Tag>
  );
}
