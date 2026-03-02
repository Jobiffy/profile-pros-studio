import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, MessageSquare, Target, Briefcase, Download, X } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Edit Your Resume",
    description: "Click the edit icon to open the form panel. Fill in your personal info, experience, education, and skills.",
    highlight: "edit-panel",
    position: "right" as const,
  },
  {
    icon: Sparkles,
    title: "Choose a Template",
    description: "Browse 15 stunning templates across MBA, Tech, and Generic categories. Click any template to preview instantly.",
    highlight: "template-panel",
    position: "right" as const,
  },
  {
    icon: Target,
    title: "Check ATS Score",
    description: "Our AI analyzes your resume for ATS compatibility. Get actionable feedback to improve your pass rate.",
    highlight: "ats-panel",
    position: "left" as const,
  },
  {
    icon: Briefcase,
    title: "Match Job Descriptions",
    description: "Paste any job description and see how well your resume matches. Get keyword suggestions to boost your score.",
    highlight: "jd-panel",
    position: "left" as const,
  },
  {
    icon: MessageSquare,
    title: "AI Resume Coach",
    description: "Chat with our AI to improve your resume in real-time. It can rewrite bullets, enhance your summary, and more!",
    highlight: "chat-panel",
    position: "left" as const,
  },
  {
    icon: Download,
    title: "Export & Apply",
    description: "When you're satisfied, export your resume as a PDF. You're ready to land your dream job!",
    highlight: "export-btn",
    position: "center" as const,
  },
];

interface Props {
  onComplete: () => void;
  onNavigate: (panel: string) => void;
}

export function OnboardingTour({ onComplete, onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      // Navigate to relevant panel
      const panelMap: Record<string, string> = {
        "edit-panel": "edit",
        "template-panel": "templates",
        "ats-panel": "ats",
        "jd-panel": "jd",
        "chat-panel": "chat",
      };
      if (panelMap[steps[step + 1].highlight]) {
        onNavigate(panelMap[steps[step + 1].highlight]);
      }
    } else {
      setVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <current.icon size={24} className="text-primary" />
            </motion.div>
            <button onClick={() => { setVisible(false); onComplete(); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold text-foreground mb-2"
          >
            {current.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {current.description}
          </motion.p>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === step ? 24 : 6,
                    backgroundColor: i === step ? "hsl(var(--primary))" : i < step ? "hsl(var(--primary))" : "hsl(var(--border))",
                  }}
                  className="h-1.5 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setVisible(false); onComplete(); }} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                Skip tour
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {step === steps.length - 1 ? "Get Started!" : "Next"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
