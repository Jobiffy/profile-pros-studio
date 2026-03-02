import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  GripVertical, Eye, EyeOff, Plus, Trash2, FileText, Briefcase,
  GraduationCap, Wrench, FolderOpen, Award, Users, LayoutList, Type
} from "lucide-react";

export type SectionId = "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "leadership" | string;

export interface SectionItem {
  id: SectionId;
  label: string;
  visible: boolean;
  isCustom: boolean;
}

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: "summary", label: "Professional Summary", visible: true, isCustom: false },
  { id: "experience", label: "Experience", visible: true, isCustom: false },
  { id: "education", label: "Education", visible: true, isCustom: false },
  { id: "skills", label: "Skills", visible: true, isCustom: false },
  { id: "projects", label: "Projects", visible: true, isCustom: false },
  { id: "certifications", label: "Certifications", visible: true, isCustom: false },
  { id: "leadership", label: "Leadership", visible: true, isCustom: false },
];

const SECTION_ICONS: Record<string, any> = {
  summary: FileText, experience: Briefcase, education: GraduationCap,
  skills: Wrench, projects: FolderOpen, certifications: Award,
  leadership: Users,
};

interface Props {
  sections: SectionItem[];
  onSectionsChange: (sections: SectionItem[]) => void;
  onAddCustomSection: (title: string) => void;
  onRemoveCustomSection: (sectionId: string) => void;
}

export function getDefaultSections(customSections?: { title: string }[]): SectionItem[] {
  const customs: SectionItem[] = (customSections || []).map((s, i) => ({
    id: `custom_${i}`,
    label: s.title,
    visible: true,
    isCustom: true,
  }));
  return [...DEFAULT_SECTIONS, ...customs];
}

export function SectionManager({ sections, onSectionsChange, onAddCustomSection, onRemoveCustomSection }: Props) {
  const [newSectionName, setNewSectionName] = useState("");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...sections];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    onSectionsChange(updated);
  }, [sections, onSectionsChange]);

  const toggleVisibility = useCallback((index: number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], visible: !updated[index].visible };
    onSectionsChange(updated);
  }, [sections, onSectionsChange]);

  const handleAddSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    onAddCustomSection(name);
    setNewSectionName("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutList size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Section Manager</h3>
            <p className="text-[10px] text-muted-foreground">Drag to reorder • Toggle visibility</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {sections.map((section, index) => {
            const Icon = SECTION_ICONS[section.id] || Type;
            return (
              <motion.div
                key={section.id}
                layout
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing select-none ${
                  section.visible
                    ? "bg-card border-border/50 hover:border-primary/30"
                    : "bg-muted/30 border-border/20 opacity-60"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <GripVertical size={14} className="text-muted-foreground shrink-0" />
                <Icon size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground flex-1 truncate">{section.label}</span>

                {section.isCustom && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveCustomSection(section.id); }}
                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); toggleVisibility(index); }}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>

                <span className="text-[9px] text-muted-foreground font-mono w-4 text-center">{index + 1}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Add Custom Section */}
        <div className="p-3 pt-2">
          <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border/50 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Add Custom Section</p>
            <div className="flex gap-2">
              <Input
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                placeholder="e.g. Volunteering, Awards..."
                className="h-8 text-xs bg-background border-border/60"
                onKeyDown={e => e.key === "Enter" && handleAddSection()}
              />
              <button
                onClick={handleAddSection}
                disabled={!newSectionName.trim()}
                className="h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1 shrink-0"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="px-3 pb-4">
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              💡 <strong>Tip:</strong> Drag sections to reorder them in your resume. Hidden sections won't appear in the PDF export.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
