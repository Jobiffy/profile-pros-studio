import { ResumeData } from "@/types/resume";
import React from "react";

export interface SectionOrderItem {
  id: string;
  visible: boolean;
}

/**
 * Universal section renderer for hand-coded templates.
 * Maps section IDs to render functions and renders them in sectionOrder.
 */
export function renderOrderedSections(
  sectionOrder: SectionOrderItem[] | undefined,
  sectionMap: Record<string, () => React.ReactNode>
): React.ReactNode[] {
  const defaultOrder = Object.keys(sectionMap).map(id => ({ id, visible: true }));
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  return order
    .filter(s => s.visible)
    .map(s => {
      const renderFn = sectionMap[s.id];
      if (!renderFn) return null;
      return <React.Fragment key={s.id}>{renderFn()}</React.Fragment>;
    })
    .filter(Boolean) as React.ReactNode[];
}
