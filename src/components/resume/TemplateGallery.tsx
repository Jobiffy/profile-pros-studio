import { motion } from "framer-motion";
import { templateList } from "@/templates";
import { TemplateInfo } from "@/types/resume";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Briefcase, Code, Layout, GraduationCap, Heart, Search } from "lucide-react";

type CategoryFilter = "all" | "mba" | "tech" | "generic" | "hr" | "freshers";

const subcategories: Record<string, string[]> = {
  mba: ["Marketing", "Sales", "Consulting", "Product Manager", "Strategy", "Finance"],
  tech: ["Software Engineer", "Data Science", "DevOps", "Frontend", "Full Stack"],
  generic: ["Modern", "Classic", "Minimalist", "Creative"],
  hr: ["ATS-Optimized", "Clean Format", "Professional"],
  freshers: ["Entry Level", "Internship", "Graduate"],
};

const categoryMeta: Record<string, { icon: any; label: string; color: string }> = {
  all: { icon: Layout, label: "All", color: "text-foreground" },
  mba: { icon: Briefcase, label: "MBA", color: "text-amber-500" },
  tech: { icon: Code, label: "Tech", color: "text-blue-500" },
  generic: { icon: Layout, label: "Generic", color: "text-violet-500" },
  hr: { icon: Heart, label: "HR Picks", color: "text-rose-500" },
  freshers: { icon: GraduationCap, label: "Freshers", color: "text-emerald-500" },
};

// Map templates to additional categories
const hrTemplates = ["modern-clean", "professional-classic", "classic-executive", "elegant-refined", "minimalist-type"];
const fresherTemplates = ["modern-clean", "startup-modern", "creative-color", "minimalist-type", "engineering-grid"];

interface Props {
  selected: TemplateInfo;
  onSelect: (t: TemplateInfo) => void;
}

export function TemplateGallery({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const getFiltered = () => {
    let list = templateList;
    if (filter === "hr") list = templateList.filter(t => hrTemplates.includes(t.id));
    else if (filter === "freshers") list = templateList.filter(t => fresherTemplates.includes(t.id));
    else if (filter !== "all") list = templateList.filter(t => t.category === filter);
    
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  };

  const filtered = getFiltered();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Templates</h3>
        
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-muted/50 border border-border/50 focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1">
          {(Object.keys(categoryMeta) as CategoryFilter[]).map(cat => {
            const meta = categoryMeta[cat];
            const Icon = meta.icon;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all ${
                  filter === cat 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={10} />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Subcategory tags */}
        {filter !== "all" && subcategories[filter] && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-1">
            {subcategories[filter].map(sub => (
              <span key={sub} className="px-2 py-0.5 rounded text-[9px] bg-muted/50 text-muted-foreground border border-border/30">
                {sub}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No templates match your search
            </div>
          )}
          {filtered.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(t)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left p-3 rounded-lg transition-all border"
              style={{
                background: selected.id === t.id ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                borderColor: selected.id === t.id ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border) / 0.3)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-8 rounded-sm shrink-0" style={{ background: t.preview }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">{t.description}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.category}</span>
                    {hrTemplates.includes(t.id) && t.category !== "generic" && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500">HR Pick</span>
                    )}
                    {fresherTemplates.includes(t.id) && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Freshers</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
