import React, { useRef, useEffect, useState, useCallback } from "react";

const A4_HEIGHT = 1123; // px at 96dpi for A4

interface Props {
  children: React.ReactNode;
  colorPalette: { accent: string; accentLight: string; accentDark: string };
  previewId?: string;
}

/**
 * Wraps resume content and automatically splits into multiple A4 pages
 * when content overflows a single page.
 */
export function MultiPageResume({ children, colorPalette, previewId = "resume-preview" }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  const measure = useCallback(() => {
    if (!contentRef.current) return;
    const height = contentRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(height / A4_HEIGHT));
    setPageCount(pages);
  }, []);

  useEffect(() => {
    measure();
    // Re-measure on content changes via ResizeObserver
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);

  return (
    <div className="flex flex-col gap-8">
      {/* All pages share one continuous content flow with CSS page breaks */}
      <div
        id={previewId}
        className="w-[794px] shadow-2xl rounded-sm overflow-hidden relative"
        style={{
          minHeight: `${A4_HEIGHT}px`,
          boxShadow: '0 8px 40px -8px hsl(var(--foreground) / 0.12)',
          background: 'white',
          '--resume-accent': colorPalette.accent,
          '--resume-accent-light': colorPalette.accentLight,
          '--resume-accent-dark': colorPalette.accentDark,
        } as React.CSSProperties}
      >
        <div ref={contentRef}>
          {children}
        </div>
        {/* Page break indicators */}
        {pageCount > 1 && Array.from({ length: pageCount - 1 }, (_, i) => (
          <div
            key={i}
            data-page-indicator="true"
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ top: `${(i + 1) * A4_HEIGHT}px` }}
          >
            <div className="relative">
              <div className="border-t-2 border-dashed border-red-300/60" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Page {i + 1} → {i + 2}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Page count indicator */}
      {pageCount > 1 && (
        <div className="text-center text-xs text-muted-foreground -mt-4">
          {pageCount} pages • Content will automatically flow across pages
        </div>
      )}
    </div>
  );
}
