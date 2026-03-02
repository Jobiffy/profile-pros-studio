import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { templateList, templateComponents } from "@/templates";
import { TemplateInfo } from "@/types/resume";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeAI } from "@/hooks/useResumeAI";
import { ResumeEditPanel } from "@/components/resume/ResumeEditPanel";
import { ATSScorePanel } from "@/components/resume/ATSScorePanel";
import { JDMatchPanel } from "@/components/resume/JDMatchPanel";
import { AIChatPanel } from "@/components/resume/AIChatPanel";
import { TemplateGallery } from "@/components/resume/TemplateGallery";
import { OnboardingTour } from "@/components/resume/OnboardingTour";
import { ResumeImport } from "@/components/resume/ResumeImport";
import { ColorPalettePanel } from "@/components/resume/ColorPalette";
import {
  FileText, Sparkles, MessageSquare, Target, Briefcase,
  Download, Upload, Palette, Zap, Eye, EyeOff,
  PanelLeftClose, PanelLeftOpen, ChevronLeft
} from "lucide-react";

type RightPanel = "none" | "ats" | "jd" | "chat";
type LeftTab = "edit" | "templates";

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(templateList[0]);
  const [leftTab, setLeftTab] = useState<LeftTab>("edit");
  const [rightPanel, setRightPanel] = useState<RightPanel>("none");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.65);

  const resumeState = useResumeData();
  const {
    resumeData, setResumeData, updateHeader, updateSummary, updateExperience, updateEducation, updateField,
    colorPalette, setColorPalette, customColor, applyCustomColor,
    changedFields, showChanges, setShowChanges, clearChanges, markChanged,
  } = resumeState;

  const {
    atsResult, atsLoading, analyzeATS,
    jdResult, jdLoading, matchJD,
    chatMessages, chatLoading, sendChatMessage,
  } = useResumeAI(resumeData);

  const TemplateComponent = templateComponents[selectedTemplate.id];

  useEffect(() => {
    const visited = localStorage.getItem("jobiffy-onboarded");
    if (!visited) setShowOnboarding(true);
  }, []);

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

  const handleChatSend = (msg: string) => {
    sendChatMessage(msg, (field, value) => {
      updateField(field, value);
      markChanged(field);
    });
  };

  const handleImport = (data: any) => {
    setResumeData(data);
  };

  const rightPanelLabels: Record<RightPanel, string> = {
    none: "", ats: "ATS Score", jd: "JD Matcher", chat: "AI Assistant"
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} onNavigate={handleOnboardingNavigate} />
      )}

      {/* Import Modal */}
      <ResumeImport open={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />

      {/* Color Palette Modal */}
      <ColorPalettePanel
        open={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        current={colorPalette}
        onSelect={setColorPalette}
        customColor={customColor}
        onCustomColor={applyCustomColor}
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

            {/* Tabs */}
            <div className="flex border-b border-border/40">
              {[
                { id: "edit" as LeftTab, icon: FileText, label: "Editor" },
                { id: "templates" as LeftTab, icon: Sparkles, label: "Templates" },
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

            {/* Sidebar Content */}
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
                ) : (
                  <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
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
            {/* Import */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Upload size={14} /> Import
            </motion.button>

            {/* Color Palette */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowColorPalette(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: colorPalette.accent }} />
              <span className="hidden sm:inline">Colors</span>
            </motion.button>

            {/* Show AI Changes */}
            {changedFields.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowChanges(!showChanges)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showChanges
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {showChanges ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden sm:inline">{showChanges ? "Hide" : "Show"} Changes</span>
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 text-[9px] font-bold flex items-center justify-center">
                  {changedFields.size}
                </span>
              </motion.button>
            )}

            {/* Export */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
              id="export-btn"
            >
              <Download size={14} /> Export PDF
            </motion.button>
          </div>
        </motion.div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto flex justify-center items-start py-8 px-4 bg-muted/30 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 25 }}
            className="origin-top"
            style={{ transform: `scale(${previewScale})` }}
          >
            <div
              className="w-[794px] min-h-[1123px] shadow-2xl rounded-sm overflow-hidden relative"
              style={{
                boxShadow: '0 8px 40px -8px hsl(var(--foreground) / 0.12)',
                background: 'white',
                // Set CSS variables for template accent colors
                ['--resume-accent' as any]: colorPalette.accent,
                ['--resume-accent-light' as any]: colorPalette.accentLight,
                ['--resume-accent-dark' as any]: colorPalette.accentDark,
              }}
            >
              <TemplateComponent data={resumeData} />
              {/* AI Change Overlay */}
              {showChanges && changedFields.size > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-amber-500 text-white text-[9px] font-medium shadow-lg pointer-events-auto">
                    {changedFields.size} AI changes highlighted
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="h-11 flex items-center justify-between px-4 border-t border-border bg-card/80">
          {/* Zoom */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPreviewScale(s => Math.max(0.3, s - 0.1))} className="w-6 h-6 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">−</button>
            <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(previewScale * 100)}%</span>
            <button onClick={() => setPreviewScale(s => Math.min(1.2, s + 0.1))} className="w-6 h-6 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">+</button>
          </div>

          {/* AI Tool Buttons */}
          <div className="flex items-center gap-1">
            {[
              { icon: Target, label: "ATS Score", panel: "ats" as RightPanel, color: "text-emerald-500" },
              { icon: Briefcase, label: "JD Match", panel: "jd" as RightPanel, color: "text-blue-500" },
              { icon: MessageSquare, label: "AI Chat", panel: "chat" as RightPanel, color: "text-violet-500" },
            ].map(item => (
              <motion.button
                key={item.panel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleRightPanel(item.panel)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
          </div>
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
                  <JDMatchPanel result={jdResult} loading={jdLoading} onMatch={matchJD} />
                </motion.div>
              )}
              {rightPanel === "chat" && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <AIChatPanel
                    messages={chatMessages}
                    loading={chatLoading}
                    onSend={handleChatSend}
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
