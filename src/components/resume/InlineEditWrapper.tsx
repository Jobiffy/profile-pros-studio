import React, { useRef, useCallback, useEffect } from "react";
import { ResumeData } from "@/types/resume";
import { FloatingToolbar } from "./FloatingToolbar";

interface Props {
  children: React.ReactNode;
  data: ResumeData;
  onEdit?: (field: string, value: any) => void;
}

/**
 * Wraps any resume template and enables inline editing via double-click.
 * Uses event delegation to find the closest text match in resumeData
 * and make that element contentEditable.
 */
export function InlineEditWrapper({ children, data, onEdit }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Build a reverse lookup: text content -> field path
  const buildTextMap = useCallback(() => {
    const map = new Map<string, string>();
    
    // Header fields
    if (data.header.name) map.set(data.header.name, "header.name");
    if (data.header.title) map.set(data.header.title, "header.title");
    if (data.header.email) map.set(data.header.email, "header.email");
    if (data.header.phone) map.set(data.header.phone, "header.phone");
    if (data.header.location) map.set(data.header.location, "header.location");
    if (data.header.linkedin) map.set(data.header.linkedin, "header.linkedin");
    if (data.header.website) map.set(data.header.website, "header.website");
    
    // Summary
    if (data.summary) map.set(data.summary, "summary");
    
    // Experience
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
    
    // Education
    data.education.forEach((edu, i) => {
      if (edu.degree) map.set(edu.degree, `education[${i}].degree`);
      if (edu.school) map.set(edu.school, `education[${i}].school`);
      if (edu.location) map.set(edu.location, `education[${i}].location`);
      if (edu.startDate) map.set(edu.startDate, `education[${i}].startDate`);
      if (edu.endDate) map.set(edu.endDate, `education[${i}].endDate`);
      if (edu.gpa) map.set(edu.gpa, `education[${i}].gpa`);
    });
    
    // Skills
    data.skills.forEach((s, i) => {
      if (s.category) map.set(s.category, `skills[${i}].category`);
      s.items.forEach((item, j) => {
        if (item) map.set(item, `skills[${i}].items[${j}]`);
      });
    });
    
    // Projects
    data.projects?.forEach((p, i) => {
      if (p.name) map.set(p.name, `projects[${i}].name`);
      if (p.description) map.set(p.description, `projects[${i}].description`);
      if (p.tech) map.set(p.tech, `projects[${i}].tech`);
      p.bullets.forEach((b, j) => {
        if (b) map.set(b, `projects[${i}].bullets[${j}]`);
      });
    });
    
    // Certifications
    data.certifications?.forEach((c, i) => {
      if (c) map.set(c, `certifications[${i}]`);
    });
    
    // Leadership
    data.leadership?.forEach((l, i) => {
      if (l.role) map.set(l.role, `leadership[${i}].role`);
      if (l.org) map.set(l.org, `leadership[${i}].org`);
      if (l.date) map.set(l.date, `leadership[${i}].date`);
      l.bullets.forEach((b, j) => {
        if (b) map.set(b, `leadership[${i}].bullets[${j}]`);
      });
    });
    
    // Custom sections
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

  useEffect(() => {
    if (!onEdit || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if already editing
      if (target.contentEditable === "true") return;
      
      // Only edit leaf text elements (not containers with many children)
      const text = target.textContent?.trim();
      if (!text) return;
      
      // Check if this element is mostly a text leaf (has few or no child elements)
      if (target.children.length > 2) return;
      
      const textMap = buildTextMap();
      
      // Try exact match first
      let field = textMap.get(text);
      
      // If no exact match, try to find a field whose value is contained in this text
      if (!field) {
        for (const [value, path] of textMap.entries()) {
          if (value.length > 3 && text.includes(value)) {
            field = path;
            break;
          }
        }
      }
      
      if (!field) return;
      
      e.stopPropagation();
      e.preventDefault();
      
      const originalText = text;
      const fieldPath = field;
      
      // Get the actual stored value for this field
      const storedValue = getFieldValue(data, fieldPath);
      
      target.contentEditable = "true";
      target.focus();
      target.style.outline = "2px solid rgba(59, 130, 246, 0.4)";
      target.style.borderRadius = "2px";
      target.style.cursor = "text";
      
      // If the element contains more than just our value, select only our text
      if (storedValue && target.textContent !== storedValue) {
        target.textContent = storedValue;
      }
      
      const cleanup = () => {
        target.contentEditable = "false";
        target.style.outline = "";
        target.style.borderRadius = "";
        target.style.cursor = "";
        const newValue = target.textContent?.trim() || "";
        if (newValue !== storedValue) {
          onEdit(fieldPath, newValue);
        }
        target.removeEventListener("blur", cleanup);
        target.removeEventListener("keydown", handleKey);
      };
      
      const handleKey = (ke: KeyboardEvent) => {
        if (ke.key === "Enter") { ke.preventDefault(); target.blur(); }
        if (ke.key === "Escape") { 
          target.textContent = storedValue || originalText; 
          target.blur(); 
        }
      };
      
      target.addEventListener("blur", cleanup);
      target.addEventListener("keydown", handleKey);
    };

    // Add hover effect
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.contentEditable === "true") return;
      if (target.children.length > 2) return;
      const text = target.textContent?.trim();
      if (!text) return;
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
  }, [onEdit, data, buildTextMap]);

  return (
    <div ref={wrapperRef} className="inline-edit-wrapper relative">
      {children}
    </div>
  );
}

function getFieldValue(data: ResumeData, field: string): string | undefined {
  const parts = field.match(/([^[.\]]+)/g);
  if (!parts) return undefined;
  let target: any = data;
  for (const part of parts) {
    const key = isNaN(Number(part)) ? part : Number(part);
    target = target?.[key];
    if (target === undefined) return undefined;
  }
  return typeof target === "string" ? target : undefined;
}
