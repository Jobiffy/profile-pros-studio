import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  GripVertical, Eye, EyeOff, Plus, Trash2, FileText, Briefcase,
  GraduationCap, Wrench, FolderOpen, Award, Users, LayoutList, Type,
  Heart, Globe, BookOpen, Star, Lightbulb, Shield, Mic, PenTool,
  Languages, Target, TrendingUp, Coffee, Search,
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

const SECTION_ICONS: Record<string, LucideIcon> = {
  summary: FileText, experience: Briefcase, education: GraduationCap,
  skills: Wrench, projects: FolderOpen, certifications: Award,
  leadership: Users, volunteering: Heart, publications: BookOpen,
  languages: Languages, interests: Coffee, references: Star,
  awards: Award, honors: Shield, presentations: Mic,
  research: Search, patents: Lightbulb, training: Target,
  affiliations: Globe, portfolio: PenTool, achievements: TrendingUp,
};

const RECOMMENDED_SECTIONS = [
  { name: "Volunteering", icon: Heart, description: "Community service & volunteer work" },
  { name: "Publications", icon: BookOpen, description: "Papers, articles & blog posts" },
  { name: "Languages", icon: Languages, description: "Languages you speak" },
  { name: "Awards & Honors", icon: Award, description: "Recognitions & achievements" },
  { name: "Interests", icon: Coffee, description: "Hobbies & personal interests" },
  { name: "References", icon: Star, description: "Professional references" },
  { name: "Presentations", icon: Mic, description: "Talks, webinars & conferences" },
  { name: "Research", icon: Search, description: "Academic or professional research" },
  { name: "Patents", icon: Lightbulb, description: "Intellectual property & patents" },
  { name: "Training & Courses", icon: Target, description: "Professional development" },
  { name: "Affiliations", icon: Globe, description: "Professional memberships" },
  { name: "Portfolio", icon: PenTool, description: "Creative work & case studies" },
  { name: "Achievements", icon: TrendingUp, description: "Key accomplishments & metrics" },
];

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const toggleVisibility = useCallback((index: number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], visible: !updated[index].visible };
    onSectionsChange(updated);
  }, [sections, onSectionsChange]);

  const handleAddRecommended = (name: string) => {
    onAddCustomSection(name);
    setDialogOpen(false);
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    if (!name) return;
    onAddCustomSection(name);
    setCustomName("");
    setDialogOpen(false);
  };

  // Filter out sections already added
  const existingLabels = new Set(sections.map(s => s.label.toLowerCase()));
  const availableRecommended = RECOMMENDED_SECTIONS.filter(
    r => !existingLabels.has(r.name.toLowerCase()) &&
      (searchFilter === "" || r.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

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
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={onSectionsChange}
          className="p-3 space-y-1"
        >
          {sections.map((section, index) => {
            const iconKey = section.id.startsWith("custom_") ? section.label.toLowerCase().split(" ")[0] : section.id;
            const Icon = SECTION_ICONS[iconKey] || Type;
            return (
              <Reorder.Item
                key={section.id}
                value={section}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing select-none ${
                  section.visible
                    ? "bg-card border-border/50 hover:border-primary/30"
                    : "bg-muted/30 border-border/20 opacity-60"
                }`}
                whileHover={{ scale: 1.01 }}
                whileDrag={{ scale: 1.03, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.15)", zIndex: 50 }}
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
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {/* Add Section Button */}
        <div className="p-3 pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full h-10 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-all">
                <Plus size={14} /> Add Section
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Add a Section</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search sections..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* Recommended Sections */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommended Sections</p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto pr-1">
                    {availableRecommended.map((rec) => (
                      <button
                        key={rec.name}
                        onClick={() => handleAddRecommended(rec.name)}
                        className="flex items-start gap-2 p-2.5 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 text-left transition-all group"
                      >
                        <rec.icon size={14} className="text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{rec.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{rec.description}</p>
                        </div>
                      </button>
                    ))}
                    {availableRecommended.length === 0 && (
                      <p className="col-span-2 text-xs text-muted-foreground text-center py-4">No matching sections found</p>
                    )}
                  </div>
                </div>

                {/* Custom Section */}
                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Or Create Your Own</p>
                  <div className="flex gap-2">
                    <Input
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="e.g. Side Projects, Hobbies..."
                      className="h-9 text-sm"
                      onKeyDown={e => e.key === "Enter" && handleAddCustom()}
                    />
                    <button
                      onClick={handleAddCustom}
                      disabled={!customName.trim()}
                      className="h-9 px-4 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
