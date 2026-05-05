import React, { useRef, useCallback, useEffect } from "react";
import { ResumeData } from "@/types/resume";

interface Props {
  children: React.ReactNode;
  data: ResumeData;
  onEdit?: (field: string, value: unknown) => void;
}

/**
 * Wraps any resume template and enables inline editing via double-click.
 * Uses event delegation to find the closest text match in resumeData
 * and make that element contentEditable.
 */
export function InlineEditWrapper({ children, data, onEdit }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeEditRef = useRef<HTMLElement | null>(null);

  const buildTextMap = useCallback(() => {
    const map = new Map<string, string>();

    if (data.header.name) map.set(data.header.name, "header.name");
    if (data.header.title) map.set(data.header.title, "header.title");
    if (data.header.email) map.set(data.header.email, "header.email");
    if (data.header.phone) map.set(data.header.phone, "header.phone");
    if (data.header.location) map.set(data.header.location, "header.location");
    if (data.header.linkedin) map.set(data.header.linkedin, "header.linkedin");
    if (data.header.website) map.set(data.header.website, "header.website");

    if (data.summary) map.set(data.summary, "summary");

    data.experience.forEach((exp, i) => {
      if (exp.title) map.set(exp.title, `experience[${i}].title`);
      if (exp.company) map.set(exp.company, `experience[${i}].company`);
      if (exp.location) map.set(exp.location, `experience[${i}].location`);
      if (exp.startDate) map.set(exp.startDate, `experience[${i}].startDate`);
      if (exp.endDate) map.set(exp.endDate, `experience[${i}].endDate`);
      exp.bullets.forEach((b, j) => {
        if (b) map.set(b, `experience[${i}].bullets[${j}]`);
      });
    });

    data.education.forEach((edu, i) => {
      if (edu.degree) map.set(edu.degree, `education[${i}].degree`);
      if (edu.school) map.set(edu.school, `education[${i}].school`);
      if (edu.location) map.set(edu.location, `education[${i}].location`);
      if (edu.startDate) map.set(edu.startDate, `education[${i}].startDate`);
      if (edu.endDate) map.set(edu.endDate, `education[${i}].endDate`);
      if (edu.gpa) map.set(edu.gpa, `education[${i}].gpa`);
    });

    data.skills.forEach((s, i) => {
      if (s.category) map.set(s.category, `skills[${i}].category`);
      s.items.forEach((item, j) => {
        if (item) map.set(item, `skills[${i}].items[${j}]`);
      });
    });

    data.projects?.forEach((p, i) => {
      if (p.name) map.set(p.name, `projects[${i}].name`);
      if (p.description) map.set(p.description, `projects[${i}].description`);
      if (p.tech) map.set(p.tech, `projects[${i}].tech`);
      p.bullets.forEach((b, j) => {
        if (b) map.set(b, `projects[${i}].bullets[${j}]`);
      });
    });

    data.certifications?.forEach((c, i) => {
      if (c) map.set(c, `certifications[${i}]`);
    });

    data.leadership?.forEach((l, i) => {
      if (l.role) map.set(l.role, `leadership[${i}].role`);
      if (l.org) map.set(l.org, `leadership[${i}].org`);
      if (l.date) map.set(l.date, `leadership[${i}].date`);
      l.bullets.forEach((b, j) => {
        if (b) map.set(b, `leadership[${i}].bullets[${j}]`);
      });
    });

    data.customSections?.forEach((sec, i) => {
      if (sec.title) map.set(sec.title, `customSections[${i}].title`);
      sec.items.forEach((item, j) => {
        if (item.subtitle) map.set(item.subtitle, `customSections[${i}].items[${j}].subtitle`);
        if (item.description) map.set(item.description, `customSections[${i}].items[${j}].description`);
        item.bullets?.forEach((b, k) => {
          if (b) map.set(b, `customSections[${i}].items[${j}].bullets[${k}]`);
        });
      });
    });

    return map;
  }, [data]);

  /**
   * Find the best editable target element and matched field.
   * Walks from the clicked element upward, preferring the most specific
   * (deepest) element whose direct text content matches a data field.
   */
  const findEditableTarget = useCallback(
    (clicked: HTMLElement, textMap: Map<string, string>) => {
      // Walk from the clicked element up to find a good match
      let el: HTMLElement | null = clicked;
      const candidates: { el: HTMLElement; field: string; exact: boolean }[] = [];

      for (let depth = 0; el && depth < 6; depth++) {
        if (el === wrapperRef.current) break;

        // Get the direct text of this element (excluding child element text)
        const directText = getDirectTextContent(el).trim();
        const fullText = el.textContent?.trim() || "";

        // Try direct text first (most accurate)
        if (directText.length > 0) {
          const field = textMap.get(directText);
          if (field) {
            candidates.push({ el, field, exact: true });
          }
        }

        // Try full text content (for leaf elements only)
        if (el.children.length === 0 && fullText.length > 0) {
          const field = textMap.get(fullText);
          if (field) {
            candidates.push({ el, field, exact: true });
          }
        }

        // Try partial match on leaf elements or elements with very few children
        if (el.children.length <= 1 && fullText.length > 0) {
          for (const [value, path] of textMap.entries()) {
            if (value.length > 3 && fullText === value) {
              candidates.push({ el, field: path, exact: true });
            }
          }
        }

        el = el.parentElement;
      }

      // Prefer the deepest exact match
      if (candidates.length > 0) {
        // Sort: prefer exact matches, then deepest (first found = deepest)
        const best = candidates[0];
        return best;
      }

      // Fallback: try partial matching on the clicked element if it's a leaf
      if (clicked.children.length === 0) {
        const text = clicked.textContent?.trim() || "";
        if (text.length > 3) {
          for (const [value, path] of textMap.entries()) {
            if (value.length > 3 && text.includes(value)) {
              return { el: clicked, field: path, exact: false };
            }
          }
        }
      }

      return null;
    },
    []
  );

  useEffect(() => {
    if (!onEdit || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Skip if already editing
      if (activeEditRef.current) return;
      if (target.contentEditable === "true") return;

      const textMap = buildTextMap();
      const match = findEditableTarget(target, textMap);
      if (!match) return;

      const { el: editEl, field: fieldPath } = match;

      e.stopPropagation();
      e.preventDefault();

      const storedValue = getFieldValue(data, fieldPath);
      if (storedValue === undefined) return;

      // Save original HTML so we can restore on cancel
      const originalHTML = editEl.innerHTML;

      activeEditRef.current = editEl;
      editEl.contentEditable = "true";
      editEl.style.outline = "2px solid rgba(59, 130, 246, 0.4)";
      editEl.style.borderRadius = "2px";
      editEl.style.cursor = "text";
      editEl.style.minWidth = "20px";
      editEl.style.minHeight = "1em";

      // Only set textContent if the element is a pure text leaf
      // NEVER replace innerHTML on elements with children - this causes disappearing
      if (editEl.children.length === 0) {
        editEl.textContent = storedValue;
      }

      editEl.focus();

      // Select all text for easy replacement
      try {
        const range = document.createRange();
        range.selectNodeContents(editEl);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch { /* selection API can throw on detached nodes; safe to ignore */ }

      const cleanup = () => {
        editEl.contentEditable = "false";
        editEl.style.outline = "";
        editEl.style.borderRadius = "";
        editEl.style.cursor = "";
        editEl.style.minWidth = "";
        editEl.style.minHeight = "";
        activeEditRef.current = null;

        const newValue = editEl.textContent?.trim() || "";
        if (newValue && newValue !== storedValue) {
          onEdit(fieldPath, newValue);
        } else if (!newValue) {
          // Restore if emptied
          editEl.innerHTML = originalHTML;
        }

        editEl.removeEventListener("blur", cleanup);
        editEl.removeEventListener("keydown", handleKey);
      };

      const handleKey = (ke: KeyboardEvent) => {
        if (ke.key === "Enter" && !ke.shiftKey) {
          ke.preventDefault();
          editEl.blur();
        }
        if (ke.key === "Escape") {
          editEl.innerHTML = originalHTML;
          editEl.blur();
        }
      };

      editEl.addEventListener("blur", cleanup);
      editEl.addEventListener("keydown", handleKey);
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (activeEditRef.current) return;
      const target = e.target as HTMLElement;
      if (target.contentEditable === "true") return;
      // Only show hover on leaf-ish elements
      if (target.children.length > 3) return;
      const text = target.textContent?.trim();
      if (!text || text.length < 2) return;
      target.style.outline = "1px solid rgba(59, 130, 246, 0.15)";
      target.style.borderRadius = "2px";
      target.style.cursor = "pointer";
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.contentEditable === "true") return;
      target.style.outline = "";
      target.style.borderRadius = "";
      target.style.cursor = "";
    };

    wrapper.addEventListener("dblclick", handleDblClick);
    wrapper.addEventListener("mouseover", handleMouseOver);
    wrapper.addEventListener("mouseout", handleMouseOut);

    return () => {
      wrapper.removeEventListener("dblclick", handleDblClick);
      wrapper.removeEventListener("mouseover", handleMouseOver);
      wrapper.removeEventListener("mouseout", handleMouseOut);
    };
  }, [onEdit, data, buildTextMap, findEditableTarget]);

  return (
    <div ref={wrapperRef} className="inline-edit-wrapper relative">
      {children}
    </div>
  );
}

/** Get only the direct text content of an element, excluding child element text */
function getDirectTextContent(el: HTMLElement): string {
  let text = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
    }
  }
  return text;
}

function getFieldValue(data: ResumeData, field: string): string | undefined {
  const parts = field.match(/([^[.\]]+)/g);
  if (!parts) return undefined;
  let target: unknown = data;
  for (const part of parts) {
    if (target == null || typeof target !== "object") return undefined;
    const key = isNaN(Number(part)) ? part : Number(part);
    target = (target as Record<string, unknown>)[key as string];
  }
  return typeof target === "string" ? target : undefined;
}
