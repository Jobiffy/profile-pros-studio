import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { templateList, templateComponents } from "@/templates";
import { TemplateInfo } from "@/types/resume";
import { dummyResume } from "@/data/dummyResume";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeAI } from "@/hooks/useResumeAI";
import { useResumeStore } from "@/hooks/useResumeStore";
import { ResumeEditPanel } from "@/components/resume/ResumeEditPanel";
import { ATSScorePanel } from "@/components/resume/ATSScorePanel";
import { JDMatchPanel } from "@/components/resume/JDMatchPanel";
import { AIChatPanel } from "@/components/resume/AIChatPanel";
import { TemplateGallery } from "@/components/resume/TemplateGallery";
import { OnboardingTour } from "@/components/resume/OnboardingTour";
import { ResumeImport } from "@/components/resume/ResumeImport";
import { MultiPageResume } from "@/components/resume/MultiPageResume";
import { InlineEditWrapper } from "@/components/resume/InlineEditWrapper";
import { FloatingToolbar } from "@/components/resume/FloatingToolbar";
import { LinkContextMenu } from "@/components/resume/LinkContextMenu";
import { ColorPalettePanel } from "@/components/resume/ColorPalette";
import { SectionManager, SectionItem, getDefaultSections } from "@/components/resume/SectionManager";
import { exportToPDF, exportToDOCX } from "@/lib/exportResume";
import { toast } from "@/hooks/use-toast";
import {
  FileText, Sparkles, MessageSquare, Target, Briefcase,
  Download, Upload, Palette, Zap, Eye, EyeOff,
  PanelLeftClose, PanelLeftOpen, LayoutList, Sun, Moon, FileDown,
  Plus, X, FileEdit,
} from "lucide-react";

type RightPanel = "none" | "ats" | "jd" | "chat";
type LeftTab = "edit" | "templates" | "sections";

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(templateList[0]);
  const [leftTab, setLeftTab] = useState<LeftTab>("edit");
  const [rightPanel, setRightPanel] = useState<RightPanel>("none");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.65);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const toggleTheme = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("jobiffy-theme", next ? "dark" : "light");
  }, [darkMode]);

  // Resume store for multi-resume + per-resume chat
  const resumeStore = useResumeStore();

  const resumeState = useResumeData();
  const {
    resumeData, setResumeData, updateHeader, updateSummary, updateExperience, updateEducation, updateField,
    colorPalette, setColorPalette, customColor, applyCustomColor,
    changedFields, showChanges, setShowChanges, clearChanges, markChanged,
    undo, redo, canUndo, canRedo, resetHistory,
  } = resumeState;

  // Sync resume data from store when switching resumes
  useEffect(() => {
    if (resumeStore.activeResume) {
      setResumeData(resumeStore.activeResume.data);
      clearChanges();
      resetHistory(resumeStore.activeResume.data);
    }
  }, [resumeStore.activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset history when template changes (undo should not switch templates)
  useEffect(() => {
    resetHistory(resumeData);
  }, [selectedTemplate.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist resume data to store on changes
  useEffect(() => {
    resumeStore.updateActiveData(resumeData);
  }, [resumeData]); // eslint-disable-line react-hooks/exhaustive-deps

  const [sectionItems, setSectionItems] = useState<SectionItem[]>(() => getDefaultSections(resumeData.customSections));

  const handleAddCustomSection = useCallback((title: string) => {
    resumeState.addCustomSection();
    setResumeData(prev => {
      const customs = [...(prev.customSections || [])];
      customs[customs.length - 1] = { ...customs[customs.length - 1], title };
      return { ...prev, customSections: customs };
    });
    setSectionItems(prev => [...prev, { id: `custom_${(resumeData.customSections || []).length}`, label: title, visible: true, isCustom: true }]);
  }, [resumeState, resumeData.customSections, setResumeData]);

  const handleRemoveCustomSection = useCallback((sectionId: string) => {
    const idx = parseInt(sectionId.split("_")[1]);
    if (!isNaN(idx)) {
      resumeState.removeCustomSection(idx);
      setSectionItems(prev => prev.filter(s => s.id !== sectionId));
    }
  }, [resumeState]);

  // Chat messages from store
  const storedChatMessages = resumeStore.activeResume?.chatMessages || [];

  const {
    atsResult, atsLoading, analyzeATS,
    jdResult, jdLoading, matchJD,
    tailorLoading, tailorResume,
    chatMessages, chatLoading, sendChatMessage,
    setChatMessages,
  } = useResumeAI(resumeData);

  // Load chat messages from store when switching resumes
  useEffect(() => {
    setChatMessages(storedChatMessages);
  }, [resumeStore.activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist chat messages to store
  useEffect(() => {
    if (chatMessages.length > 0) {
      resumeStore.updateActiveChatMessages(chatMessages);
    }
  }, [chatMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  const TemplateComponent = templateComponents[selectedTemplate.id];

  const orderedResumeData = React.useMemo(() => {
    const visibilityMap = new Map(sectionItems.map(s => [s.id, s.visible]));
    const data = { ...resumeData };
    if (visibilityMap.get("summary") === false) data.summary = "";
    if (visibilityMap.get("experience") === false) data.experience = [];
    if (visibilityMap.get("education") === false) data.education = [];
    if (visibilityMap.get("skills") === false) data.skills = [];
    if (visibilityMap.get("projects") === false) data.projects = [];
    if (visibilityMap.get("certifications") === false) data.certifications = [];
    if (visibilityMap.get("leadership") === false) data.leadership = [];
    if (data.customSections) {
      data.customSections = data.customSections.filter((_, i) => visibilityMap.get(`custom_${i}`) !== false);
    }
    return data;
  }, [resumeData, sectionItems]);

  useEffect(() => {
    const visited = localStorage.getItem("jobiffy-onboarded");
    if (!visited) setShowOnboarding(true);
    const savedTheme = localStorage.getItem("jobiffy-theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        // If editing inline (contentEditable), let browser handle it
        const active = document.activeElement as HTMLElement;
        if (active?.contentEditable === "true") return;
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        const active = document.activeElement as HTMLElement;
        if (active?.contentEditable === "true") return;
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("jobiffy-onboarded", "true");
  };

  const handleOnboardingNavigate = (panel: string) => {
    if (panel === "edit" || panel === "templates") setLeftTab(panel as LeftTab);
    else if (panel === "ats" || panel === "jd" || panel === "chat") setRightPanel(panel as RightPanel);
  };

  const toggleRightPanel = (panel: RightPanel) => {
    setRightPanel(prev => prev === panel ? "none" : panel);
  };

  const handleChatSend = useCallback((msg: string) => {
    sendChatMessage(msg, {
      onUpdateField: (field, value) => {
        updateField(field, value);
      },
      onReorderSections: (order: string[]) => {
        setSectionItems(prev => {
          const map = new Map(prev.map(s => [s.id, s]));
          const reordered: typeof prev = [];
          for (const id of order) {
            const item = map.get(id);
            if (item) reordered.push(item);
          }
          for (const item of prev) {
            if (!order.includes(item.id)) reordered.push(item);
          }
          return reordered;
        });
      },
      onToggleSection: (sectionId: string, visible: boolean) => {
        setSectionItems(prev => prev.map(s => s.id === sectionId ? { ...s, visible } : s));
      },
      onAddItem: (section: string, item: any) => {
        setResumeData(prev => {
          const next = JSON.parse(JSON.stringify(prev));
          if (section === "experience") next.experience.push(item);
          else if (section === "education") next.education.push(item);
          else if (section === "skills") next.skills.push(item);
          else if (section === "projects") (next.projects = next.projects || []).push(item);
          else if (section === "certifications") (next.certifications = next.certifications || []).push(item);
          else if (section === "leadership") (next.leadership = next.leadership || []).push(item);
          return next;
        });
      },
      onRemoveItem: (section: string, index: number) => {
        setResumeData(prev => {
          const next = JSON.parse(JSON.stringify(prev));
          if (next[section] && Array.isArray(next[section])) {
            next[section].splice(index, 1);
          }
          return next;
        });
      },
      onMarkChanged: markChanged,
      onSetShowChanges: setShowChanges,
    });
  }, [sendChatMessage, updateField, markChanged, setResumeData, setShowChanges]);

  const handleImport = (data: any, fileName?: string) => {
    // Replace current resume content with parsed data
    setResumeData(data);
    resetHistory(data);
    // Name resume after uploaded file
    const baseName = fileName
      ? fileName.replace(/\.[^.]+$/, "")
      : data.header?.name
        ? `${data.header.name}'s Resume`
        : "Imported Resume";
    resumeStore.renameResume(resumeStore.activeId, baseName);
  };

  const handleTailorResume = async (jd: string) => {
    const tailored = await tailorResume(jd);
    if (tailored) {
      const fields = ["summary", "experience", "education", "skills", "projects", "certifications", "leadership"];
      fields.forEach(f => markChanged(f, "keyword"));
      setResumeData(tailored);
      setShowChanges(true);
    }
  };

  const handleNewResume = useCallback(() => {
    resumeStore.addResume(`Resume ${resumeStore.resumes.length + 1}`, { ...dummyResume });
  }, [resumeStore]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} onNavigate={handleOnboardingNavigate} />
      )}
      <ResumeImport open={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />
      <ColorPalettePanel
        open={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        current={colorPalette}
        onSelect={(palette) => {
          setColorPalette(palette);
          setShowColorPalette(false);
          toast({ title: `${palette.name} applied!`, description: "Color theme updated." });
        }}
        customColor={customColor}
        onCustomColor={(hex) => {
          applyCustomColor(hex);
          setShowColorPalette(false);
          toast({ title: "Custom color applied!", description: `Using ${hex}` });
        }}
      />

      {/* ====== LEFT SIDEBAR ====== */}
      <AnimatePresence>
        {!leftCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="shrink-0 flex flex-col bg-card border-r border-border overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">J</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Job<span className="text-primary">iffy</span>
                </span>
              </div>
              <button onClick={() => setLeftCollapsed(true)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* Resume Tabs */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/40 overflow-x-auto scrollbar-none">
              {resumeStore.resumes.map(r => (
                <button
                  key={r.id}
                  onClick={() => resumeStore.switchResume(r.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all shrink-0 max-w-[140px] group ${
                    r.id === resumeStore.activeId
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <FileEdit size={10} className="shrink-0" />
                  <span className="truncate">{r.name}</span>
                  {resumeStore.resumes.length > 1 && (
                    <X
                      size={10}
                      className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        resumeStore.deleteResume(r.id);
                      }}
                    />
                  )}
                </button>
              ))}
              <button
                onClick={handleNewResume}
                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all shrink-0"
                title="New Resume"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40">
              {[
                { id: "edit" as LeftTab, icon: FileText, label: "Editor" },
                { id: "templates" as LeftTab, icon: Sparkles, label: "Templates" },
                { id: "sections" as LeftTab, icon: LayoutList, label: "Sections" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all relative ${
                    leftTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {leftTab === tab.id && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 inset-x-4 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {leftTab === "edit" ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <ResumeEditPanel
                      data={resumeData}
                      onUpdateHeader={updateHeader}
                      onUpdateSummary={updateSummary}
                      onUpdateExperience={updateExperience}
                      onUpdateEducation={updateEducation}
                      onUpdateField={updateField}
                      onAddExperience={resumeState.addExperience}
                      onRemoveExperience={resumeState.removeExperience}
                      onAddEducation={resumeState.addEducation}
                      onRemoveEducation={resumeState.removeEducation}
                      onAddSkillCategory={resumeState.addSkillCategory}
                      onRemoveSkillCategory={resumeState.removeSkillCategory}
                      onAddProject={resumeState.addProject}
                      onRemoveProject={resumeState.removeProject}
                      onAddCertification={resumeState.addCertification}
                      onRemoveCertification={resumeState.removeCertification}
                      onAddLeadership={resumeState.addLeadership}
                      onRemoveLeadership={resumeState.removeLeadership}
                      onAddBullet={resumeState.addBullet}
                      onRemoveBullet={resumeState.removeBullet}
                    />
                  </motion.div>
                ) : leftTab === "templates" ? (
                  <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
                  </motion.div>
                ) : (
                  <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <SectionManager
                      sections={sectionItems}
                      onSectionsChange={setSectionItems}
                      onAddCustomSection={handleAddCustomSection}
                      onRemoveCustomSection={handleRemoveCustomSection}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== MAIN CONTENT ====== */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Toolbar */}
        <motion.div
          initial={{ y: -56 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            {leftCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setLeftCollapsed(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all mr-1"
              >
                <PanelLeftOpen size={16} />
              </motion.button>
            )}
            <span className="text-xs text-muted-foreground hidden md:block">{selectedTemplate.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              <Zap size={9} /> AI
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { icon: Target, label: "ATS Score", panel: "ats" as RightPanel },
              { icon: Briefcase, label: "JD Match", panel: "jd" as RightPanel },
              { icon: MessageSquare, label: "AI Coach", panel: "chat" as RightPanel },
            ].map(item => (
              <motion.button
                key={item.panel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleRightPanel(item.panel)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  rightPanel === item.panel
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon size={13} />
                <span className="hidden md:inline">{item.label}</span>
                {item.panel === "ats" && atsResult && (
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">
                    {atsResult.overallScore}
                  </span>
                )}
              </motion.button>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <Upload size={14} /> Import
            </motion.button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowColorPalette(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: colorPalette.accent }} />
              <span className="hidden sm:inline">Colors</span>
            </motion.button>

            {changedFields.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowChanges(!showChanges)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showChanges ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                {showChanges ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden sm:inline">{showChanges ? "Hide" : "Show"} Changes</span>
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 text-[9px] font-bold flex items-center justify-center">{changedFields.size}</span>
              </motion.button>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={async () => {
                toast({ title: "Exporting DOCX..." });
                await exportToDOCX(orderedResumeData, `${resumeData.header.name.replace(/\s+/g, '_')}_Resume.docx`);
                toast({ title: "DOCX downloaded!" });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <FileDown size={14} /> DOCX
            </motion.button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={async () => {
                toast({ title: "Exporting PDF..." });
                await exportToPDF("resume-preview", `${resumeData.header.name.replace(/\s+/g, '_')}_Resume.pdf`);
                toast({ title: "PDF downloaded!" });
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity" id="export-btn">
              <Download size={14} /> PDF
            </motion.button>
          </div>
        </motion.div>

        {/* Formatting Toolbar + Keyboard shortcuts */}
        <div className="shrink-0 flex items-center justify-center px-4 py-1.5 border-b border-border bg-card/60">
          <FloatingToolbar containerRef={previewContainerRef} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
        </div>
        <LinkContextMenu containerRef={previewContainerRef} />

        {/* Preview Area */}
        <div ref={previewContainerRef} className="flex-1 overflow-auto flex justify-center items-start py-8 px-4 bg-muted/30 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 25 }}
            className="origin-top"
            style={{ transform: `scale(${previewScale})` }}
          >
            <MultiPageResume colorPalette={colorPalette}>
              <InlineEditWrapper data={orderedResumeData} onEdit={updateField}>
                <TemplateComponent
                  data={orderedResumeData}
                  sectionOrder={sectionItems.map(s => ({ id: s.id, visible: s.visible }))}
                  changedFields={changedFields}
                  showChanges={showChanges}
                  onInlineEdit={updateField}
                />
              </InlineEditWrapper>
              {showChanges && changedFields.size > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 right-2 flex flex-col gap-1 pointer-events-auto">
                    <div className="px-2 py-1 rounded bg-foreground/80 text-background text-[9px] font-medium shadow-lg">
                      {changedFields.size} AI changes highlighted
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(changedFields.values())].map(type => {
                        const colors: Record<string, string> = {
                          grammar: "bg-blue-400", content: "bg-amber-400", keyword: "bg-emerald-400", formatting: "bg-violet-400"
                        };
                        return (
                          <span key={type} className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${colors[type] || "bg-amber-400"} text-white`}>
                            {type.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </MultiPageResume>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="h-11 flex items-center justify-between px-4 border-t border-border bg-card/80">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPreviewScale(s => Math.max(0.3, s - 0.1))} className="w-6 h-6 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">−</button>
            <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(previewScale * 100)}%</span>
            <button onClick={() => setPreviewScale(s => Math.min(1.2, s + 0.1))} className="w-6 h-6 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">+</button>
          </div>
          <div />
        </div>
      </div>

      {/* ====== RIGHT PANEL ====== */}
      <AnimatePresence>
        {rightPanel !== "none" && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="shrink-0 flex flex-col bg-card border-l border-border overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {rightPanel === "ats" && (
                <motion.div key="ats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <ATSScorePanel result={atsResult} loading={atsLoading} onAnalyze={analyzeATS} />
                </motion.div>
              )}
              {rightPanel === "jd" && (
                <motion.div key="jd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <JDMatchPanel
                    result={jdResult}
                    loading={jdLoading}
                    onMatch={matchJD}
                    onTailor={handleTailorResume}
                    tailorLoading={tailorLoading}
                  />
                </motion.div>
              )}
              {rightPanel === "chat" && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <AIChatPanel
                    messages={chatMessages}
                    loading={chatLoading}
                    onSend={handleChatSend}
                    resumeName={resumeStore.activeResume?.name || "Resume"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
