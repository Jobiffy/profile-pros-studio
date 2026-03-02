import { useState } from "react";
import { templateList, templateComponents } from "@/templates";
import { sampleResume } from "@/data/sampleResume";
import { TemplateInfo } from "@/types/resume";
import { FileText, Download, Upload, ChevronRight, Sparkles, Target, MessageSquare, BarChart3, Briefcase, GraduationCap, FolderOpen, Award, Users, Wrench, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const sidebarSections = [
  { icon: User, label: "Header" },
  { icon: FileText, label: "Summary" },
  { icon: Briefcase, label: "Work Experience" },
  { icon: GraduationCap, label: "Education" },
  { icon: FolderOpen, label: "Projects" },
  { icon: Award, label: "Certifications" },
  { icon: Users, label: "Leadership Experience" },
  { icon: Wrench, label: "Technical Skills" },
];

const iconNav = [
  { icon: FileText, label: "Resume Content" },
  { icon: Sparkles, label: "Customize" },
  { icon: MessageSquare, label: "AI Chat" },
  { icon: Target, label: "ATS Score" },
  { icon: Briefcase, label: "Job Desc" },
  { icon: BarChart3, label: "Feedback" },
];

type CategoryFilter = "all" | "mba" | "tech" | "generic";

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(templateList[0]);
  const [activeNav, setActiveNav] = useState(0);
  const [showTemplates, setShowTemplates] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const TemplateComponent = templateComponents[selectedTemplate.id];
  const filtered = categoryFilter === "all" ? templateList : templateList.filter(t => t.category === categoryFilter);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Icon Nav */}
      <div className="w-16 shrink-0 flex flex-col items-center py-4 gap-1" style={{ background: 'hsl(var(--sidebar-bg))', borderRight: '1px solid hsl(var(--sidebar-border))' }}>
        {iconNav.map((item, i) => (
          <button
            key={i}
            onClick={() => { setActiveNav(i); setShowTemplates(i === 1); }}
            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors text-[9px]"
            style={{
              background: activeNav === i ? 'hsl(var(--sidebar-active))' : 'transparent',
              color: activeNav === i ? 'hsl(var(--sidebar-active-fg))' : 'hsl(var(--sidebar-icon))',
            }}
          >
            <item.icon size={18} />
            <span className="leading-none">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Section Panel */}
      <div className="w-64 shrink-0 flex flex-col" style={{ background: 'hsl(var(--sidebar-bg))', borderRight: '1px solid hsl(var(--sidebar-border))' }}>
        {showTemplates ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 pb-2">
              <h2 className="text-sm font-semibold" style={{ color: 'hsl(var(--sidebar-fg))' }}>Templates</h2>
              <div className="flex gap-1 mt-2">
                {(["all", "mba", "tech", "generic"] as CategoryFilter[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className="px-2 py-1 rounded text-[10px] font-medium uppercase transition-colors"
                    style={{
                      background: categoryFilter === cat ? 'hsl(var(--sidebar-active))' : 'transparent',
                      color: categoryFilter === cat ? 'hsl(var(--sidebar-active-fg))' : 'hsl(var(--sidebar-icon))',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 px-3 pb-3">
              <div className="space-y-2">
                {filtered.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      background: selectedTemplate.id === t.id ? 'hsl(var(--sidebar-hover))' : 'transparent',
                      border: selectedTemplate.id === t.id ? '1px solid hsl(var(--sidebar-active))' : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-8 rounded-sm shrink-0" style={{ background: t.preview }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'hsl(var(--sidebar-fg))' }}>{t.name}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: 'hsl(var(--sidebar-icon))' }}>{t.description}</p>
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: 'hsl(var(--sidebar-hover))', color: 'hsl(var(--sidebar-icon))' }}>{t.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-2">
              {sidebarSections.map((section, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[hsl(var(--sidebar-hover))]" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                  <div className="flex items-center gap-3">
                    <section.icon size={16} style={{ color: 'hsl(var(--sidebar-icon))' }} />
                    <span className="text-sm">{section.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ color: 'hsl(var(--sidebar-icon))' }} />
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 shrink-0 flex items-center justify-between px-6" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}>
            <Upload size={14} /> Import Resume
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Template: {selectedTemplate.name}</span>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="flex-1 overflow-auto p-8 flex justify-center" style={{ background: 'hsl(var(--muted))' }}>
          <div className="w-[794px] min-h-[1123px] shadow-xl" style={{ background: 'hsl(var(--resume-bg))', boxShadow: 'var(--resume-shadow)' }}>
            <TemplateComponent data={sampleResume} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
