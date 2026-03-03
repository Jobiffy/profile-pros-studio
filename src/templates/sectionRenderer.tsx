import { ResumeData } from "@/types/resume";
import React from "react";

export interface SectionOrderItem {
  id: string;
  visible: boolean;
}

export interface HighlightProps {
  changedFields?: Map<string, string>;
  showChanges?: boolean;
}

const HIGHLIGHT_COLORS: Record<string, { border: string; bg: string; badge: string; badgeText: string; label: string }> = {
  grammar: { border: "border-blue-400/60", bg: "bg-blue-400/5", badge: "bg-blue-400", badgeText: "text-blue-900", label: "GRAMMAR FIX" },
  content: { border: "border-amber-400/60", bg: "bg-amber-400/5", badge: "bg-amber-400", badgeText: "text-amber-900", label: "CONTENT UPDATED" },
  keyword: { border: "border-emerald-400/60", bg: "bg-emerald-400/5", badge: "bg-emerald-400", badgeText: "text-emerald-900", label: "KEYWORD OPTIMIZED" },
  formatting: { border: "border-violet-400/60", bg: "bg-violet-400/5", badge: "bg-violet-400", badgeText: "text-violet-900", label: "REFORMATTED" },
};

export function HighlightWrap({ sectionId, changedFields, showChanges, children }: {
  sectionId: string; changedFields?: Map<string, string>; showChanges?: boolean; children: React.ReactNode;
}) {
  const isChanged = showChanges && changedFields?.has(sectionId);
  if (!isChanged) return <>{children}</>;
  
  const changeType = changedFields?.get(sectionId) || "content";
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
 * Supports color-coded highlighting of AI changes.
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
      
      if (highlightProps?.changedFields && highlightProps?.showChanges) {
        return (
          <HighlightWrap
            key={s.id}
            sectionId={s.id}
            changedFields={highlightProps.changedFields}
            showChanges={highlightProps.showChanges}
          >
            {content}
          </HighlightWrap>
        );
      }
      
      return <React.Fragment key={s.id}>{content}</React.Fragment>;
    })
    .filter(Boolean) as React.ReactNode[];
}
