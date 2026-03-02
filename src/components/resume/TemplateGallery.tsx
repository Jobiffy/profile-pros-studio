import { motion } from "framer-motion";
import { templateList, templateComponents } from "@/templates";
import { TemplateInfo } from "@/types/resume";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

type CategoryFilter = "all" | "mba" | "tech" | "generic";

interface Props {
  selected: TemplateInfo;
  onSelect: (t: TemplateInfo) => void;
}

export function TemplateGallery({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const filtered = filter === "all" ? templateList : templateList.filter(t => t.category === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-semibold text-foreground mb-2">Templates</h3>
        <div className="flex gap-1">
          {(["all", "mba", "tech", "generic"] as CategoryFilter[]).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all"
              style={{
                background: filter === cat ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color: filter === cat ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-2">
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
                <div>
                  <p className="text-xs font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
                  <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 inline-block bg-muted text-muted-foreground">{t.category}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
