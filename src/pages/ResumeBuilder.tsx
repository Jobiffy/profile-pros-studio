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
import {
  FileText, Sparkles, MessageSquare, Target, Briefcase,
  Download, Upload, PanelLeftClose, PanelLeftOpen, Zap
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type RightPanel = "none" | "ats" | "jd" | "chat";
type LeftPanel = "edit" | "templates";

const leftNavItems = [
  { icon: FileText, label: "Edit", panel: "edit" as LeftPanel },
  { icon: Sparkles, label: "Templates", panel: "templates" as LeftPanel },
];

const rightNavItems = [
  { icon: Target, label: "ATS", panel: "ats" as RightPanel },
  { icon: Briefcase, label: "JD Match", panel: "jd" as RightPanel },
  { icon: MessageSquare, label: "AI Chat", panel: "chat" as RightPanel },
];

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(templateList[0]);
  const [leftPanel, setLeftPanel] = useState<LeftPanel>("edit");
  const [rightPanel, setRightPanel] = useState<RightPanel>("none");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.7);

  const { resumeData, updateHeader, updateSummary, updateExperience, updateEducation, updateField } = useResumeData();
  const {
    atsResult, atsLoading, analyzeATS,
    jdResult, jdLoading, matchJD,
    chatMessages, chatLoading, sendChatMessage,
  } = useResumeAI(resumeData);

  const TemplateComponent = templateComponents[selectedTemplate.id];

  useEffect(() => {
    const visited = localStorage.getItem("jobiffy-onboarded");
    if (!visited) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("jobiffy-onboarded", "true");
  };

  const handleOnboardingNavigate = (panel: string) => {
    if (panel === "edit" || panel === "templates") setLeftPanel(panel as LeftPanel);
    else if (panel === "ats" || panel === "jd" || panel === "chat") setRightPanel(panel as RightPanel);
  };

  const toggleRightPanel = (panel: RightPanel) => {
    setRightPanel(prev => prev === panel ? "none" : panel);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} onNavigate={handleOnboardingNavigate} />
      )}

      {/* Left Navigation Rail */}
      <motion.div
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-14 shrink-0 flex flex-col items-center py-3 gap-1 bg-sidebar border-r border-sidebar-border"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-3"
        >
          <span className="text-primary-foreground font-bold text-sm">J</span>
        </motion.div>

        {leftNavItems.map((item, i) => (
          <motion.button
            key={item.panel}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => setLeftPanel(item.panel)}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all text-[9px]"
            style={{
              background: leftPanel === item.panel ? 'hsl(var(--sidebar-primary))' : 'transparent',
              color: leftPanel === item.panel ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-foreground) / 0.6)',
            }}
          >
            <item.icon size={16} />
            <span className="leading-none">{item.label}</span>
          </motion.button>
        ))}

        <div className="flex-1" />

        {rightNavItems.map((item, i) => (
          <motion.button
            key={item.panel}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            onClick={() => toggleRightPanel(item.panel)}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all text-[9px] relative"
            style={{
              background: rightPanel === item.panel ? 'hsl(var(--sidebar-primary))' : 'transparent',
              color: rightPanel === item.panel ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-foreground) / 0.6)',
            }}
          >
            <item.icon size={16} />
            <span className="leading-none">{item.label}</span>
            {item.panel === "ats" && atsResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[7px] font-bold flex items-center justify-center"
              >
                {atsResult.overallScore}
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Left Panel */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 300, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="shrink-0 flex flex-col bg-card border-r border-border overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {leftPanel === "edit" ? (
            <motion.div key="edit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-hidden">
              <ResumeEditPanel
                data={resumeData}
                onUpdateHeader={updateHeader}
                onUpdateSummary={updateSummary}
                onUpdateExperience={updateExperience}
                onUpdateEducation={updateEducation}
                onUpdateField={updateField}
              />
            </motion.div>
          ) : (
            <motion.div key="templates" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-hidden">
              <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -56 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-border bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-base font-semibold text-foreground">
              Job<span className="text-primary">iffy</span> Resume Builder
            </motion.h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              <Zap size={10} /> AI Powered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{selectedTemplate.name}</span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
              id="export-btn"
            >
              <Download size={14} /> Export PDF
            </motion.button>
          </div>
        </motion.div>

        {/* Resume Preview Area */}
        <div className="flex-1 overflow-auto flex justify-center items-start py-6 px-4 bg-muted/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", damping: 20 }}
            className="origin-top"
            style={{ transform: `scale(${previewScale})` }}
          >
            <div className="w-[794px] min-h-[1123px] shadow-2xl rounded-sm overflow-hidden bg-card" style={{ boxShadow: '0 8px 40px -8px hsl(var(--foreground) / 0.15)' }}>
              <TemplateComponent data={resumeData} />
            </div>
          </motion.div>
        </div>

        {/* Zoom Controls */}
        <div className="h-10 flex items-center justify-center gap-2 border-t border-border bg-card/80">
          <button onClick={() => setPreviewScale(s => Math.max(0.3, s - 0.1))} className="w-7 h-7 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">−</button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(previewScale * 100)}%</span>
          <button onClick={() => setPreviewScale(s => Math.min(1.2, s + 0.1))} className="w-7 h-7 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">+</button>
        </div>
      </div>

      {/* Right Panel */}
      <AnimatePresence>
        {rightPanel !== "none" && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="shrink-0 flex flex-col bg-card border-l border-border overflow-hidden"
          >
            {rightPanel === "ats" && (
              <ATSScorePanel result={atsResult} loading={atsLoading} onAnalyze={analyzeATS} />
            )}
            {rightPanel === "jd" && (
              <JDMatchPanel result={jdResult} loading={jdLoading} onMatch={matchJD} />
            )}
            {rightPanel === "chat" && (
              <AIChatPanel
                messages={chatMessages}
                loading={chatLoading}
                onSend={(msg) => sendChatMessage(msg, updateField)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
