import { motion } from "framer-motion";
import { templateList } from "@/templates";
import { TemplateInfo } from "@/types/resume";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Briefcase, Code, Layout, GraduationCap, Heart, Search, TrendingUp, BarChart3, LineChart, Package, Check, type LucideIcon } from "lucide-react";

type CategoryFilter = "all" | "marketing" | "sales" | "consulting" | "pm" | "tech" | "hr" | "freshers" | "generic" | "finance" | "operations" | "project_management";

const categoryMeta: Record<string, { icon: LucideIcon; label: string }> = {
  all: { icon: Layout, label: "All" },
  marketing: { icon: TrendingUp, label: "Marketing" },
  sales: { icon: BarChart3, label: "Sales" },
  consulting: { icon: LineChart, label: "Consulting" },
  pm: { icon: Package, label: "Product" },
  tech: { icon: Code, label: "Tech" },
  finance: { icon: BarChart3, label: "Finance" },
  operations: { icon: Package, label: "Operations" },
  project_management: { icon: Briefcase, label: "Project Mgmt" },
  hr: { icon: Heart, label: "HR Picks" },
  freshers: { icon: GraduationCap, label: "Freshers" },
  generic: { icon: Briefcase, label: "Generic" },
};

interface Props {
  selected: TemplateInfo;
  onSelect: (t: TemplateInfo) => void;
}

export function TemplateGallery({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const getFiltered = () => {
    let list = templateList;
    if (filter !== "all") list = list.filter(t => t.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  };

  const filtered = getFiltered();
  const counts: Record<string, number> = {};
  for (const t of templateList) counts[t.category] = (counts[t.category] || 0) + 1;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Templates <span className="text-muted-foreground font-normal">({templateList.length})</span></h3>
        
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-muted/50 border border-border/50 focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {(Object.keys(categoryMeta) as CategoryFilter[]).map(cat => {
            const meta = categoryMeta[cat];
            const Icon = meta.icon;
            const count = cat === "all" ? templateList.length : (counts[cat] || 0);
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-medium transition-all ${
                  filter === cat 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={10} />
                {meta.label}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">No templates match your search</div>
          )}
          {filtered.map((t, i) => {
            const isSelected = selected.id === t.id;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className={`rounded-lg border transition-all ${isSelected ? "border-primary/40 bg-primary/5" : "border-border/30 hover:border-border/60"}`}
              >
                <button
                  onClick={() => onSelect(t)}
                  className="w-full text-left p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-8 rounded-sm shrink-0" style={{ background: t.preview }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{t.name}</p>
                        {isSelected && <Check size={12} className="text-primary shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">{t.description}</p>
                      <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-1 inline-block">{t.category}</span>
                    </div>
                  </div>
                </button>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-3 pb-3"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium">
                      <Check size={10} /> Currently applied
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
