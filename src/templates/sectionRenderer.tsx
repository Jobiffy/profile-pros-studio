import { ResumeData } from "@/types/resume";
import React from "react";

export interface SectionOrderItem {
  id: string;
  visible: boolean;
}

export interface HighlightProps {
  changedFields?: Map<string, string>;
  showChanges?: boolean;
  onInlineEdit?: (field: string, value: unknown) => void;
}

const HIGHLIGHT_COLORS: Record<string, { border: string; bg: string; badge: string; badgeText: string; label: string }> = {
  grammar: { border: "border-blue-400/60", bg: "bg-blue-400/5", badge: "bg-blue-400", badgeText: "text-blue-900", label: "GRAMMAR FIX" },
  content: { border: "border-amber-400/60", bg: "bg-amber-400/5", badge: "bg-amber-400", badgeText: "text-amber-900", label: "CONTENT UPDATED" },
  keyword: { border: "border-emerald-400/60", bg: "bg-emerald-400/5", badge: "bg-emerald-400", badgeText: "text-emerald-900", label: "KEYWORD OPTIMIZED" },
  formatting: { border: "border-violet-400/60", bg: "bg-violet-400/5", badge: "bg-violet-400", badgeText: "text-violet-900", label: "REFORMATTED" },
};

/**
 * Check if any changed field matches a given prefix.
 * e.g., prefix "experience[0]" matches "experience[0].bullets", "experience[0].title", etc.
 * prefix "summary" matches "summary"
 */
export function getChangeType(changedFields: Map<string, string> | undefined, prefix: string): string | null {
  if (!changedFields) return null;
  // Exact match
  if (changedFields.has(prefix)) return changedFields.get(prefix)!;
  // Prefix match (e.g., "experience[0]" matches "experience[0].bullets")
  for (const [key, type] of changedFields) {
    if (key.startsWith(prefix + ".") || key.startsWith(prefix + "[")) return type;
  }
  return null;
}

export function HighlightWrap({ changeType, children }: {
  changeType: string | null; children: React.ReactNode;
}) {
  if (!changeType) return <>{children}</>;
  
  const colors = HIGHLIGHT_COLORS[changeType] || HIGHLIGHT_COLORS.content;
  
  return (
    <div className="relative">
      <div className={`absolute -inset-1 rounded-md border-2 ${colors.border} ${colors.bg} pointer-events-none`} />
      <div className={`absolute -top-2.5 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold ${colors.badge} ${colors.badgeText} pointer-events-none z-10`}>
        {colors.label}
      </div>
      {children}
    </div>
  );
}

/**
 * Universal section renderer for hand-coded templates.
 * Maps section IDs to render functions and renders them in sectionOrder.
 * Supports granular color-coded highlighting of AI changes per item.
 */
export function renderOrderedSections(
  sectionOrder: SectionOrderItem[] | undefined,
  sectionMap: Record<string, () => React.ReactNode>,
  highlightProps?: HighlightProps
): React.ReactNode[] {
  const defaultOrder = Object.keys(sectionMap).map(id => ({ id, visible: true }));
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  return order
    .filter(s => s.visible)
    .map(s => {
      const renderFn = sectionMap[s.id];
      if (!renderFn) return null;
      const content = renderFn();
      if (!content) return null;
      
      // Check for section-level highlight (e.g., "summary" exact match)
      if (highlightProps?.showChanges && highlightProps?.changedFields) {
        const ct = getChangeType(highlightProps.changedFields, s.id);
        if (ct) {
          return (
            <HighlightWrap key={s.id} changeType={ct}>
              {content}
            </HighlightWrap>
          );
        }
      }
      
      return <React.Fragment key={s.id}>{content}</React.Fragment>;
    })
    .filter(Boolean) as React.ReactNode[];
}
