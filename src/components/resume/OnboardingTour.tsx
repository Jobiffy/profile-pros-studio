import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Briefcase, MessageSquare, FileText, Sparkles, Download, X, ArrowRight, Star, Zap, Linkedin, type LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
  isUSP: boolean;
  uspLabel?: string;
  uspColor?: string;
}

const steps: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to Jobiffy! 🎉",
    description: "Your AI-powered resume builder that helps you land more interviews. Let's take a quick tour of the features that make Jobiffy special.",
    highlight: "",
    isUSP: false,
  },
  {
    icon: FileText,
    title: "Edit & Customize",
    description: "Import your resume or start from scratch. Choose from 15+ templates across MBA, Tech, HR-friendly, and Freshers categories. Customize colors, fonts, and every detail.",
    highlight: "edit-panel",
    isUSP: false,
  },
  {
    icon: Target,
    title: "⭐ Resume Score — Your Secret Weapon",
    description: "Get an instant ATS compatibility score. Our AI analyzes formatting, keywords, quantified achievements, and readability. Most resumes score under 60 — we help you hit 90+.",
    highlight: "ats-panel",
    isUSP: true,
    uspLabel: "CORE USP",
    uspColor: "from-emerald-500 to-primary",
  },
  {
    icon: Briefcase,
    title: "⭐ JD Matcher — Land More Interviews",
    description: "Paste a job link or description and see your match score instantly. Get missing keywords, skills gap analysis, and exact recommendations to increase your match rate by 40%+.",
    highlight: "jd-panel",
    isUSP: true,
    uspLabel: "CORE USP",
    uspColor: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "⭐ AI Coach — Rewrite in Seconds",
    description: "Chat with your personal AI resume coach. It rewrites bullets with metrics, tailors your resume for specific roles, and applies changes to your resume in real-time. Like having an expert career counselor 24/7.",
    highlight: "chat-panel",
    isUSP: true,
    uspLabel: "CORE USP",
    uspColor: "from-violet-500 to-purple-600",
  },
  {
    icon: Linkedin,
    title: "⭐ LinkedIn Profile Reviewer",
    description: "Paste your LinkedIn URL and get an instant AI-powered review. Every section is scored out of 10 with specific issues and improvement suggestions. See your projected score after applying changes.",
    highlight: "linkedin-panel",
    isUSP: true,
    uspLabel: "CORE USP",
    uspColor: "from-blue-600 to-cyan-500",
  },
  {
    icon: Download,
    title: "Export & Apply",
    description: "Download your polished resume as PDF or DOCX. Every formatting detail is preserved. You're ready to apply with confidence!",
    highlight: "export-btn",
    isUSP: false,
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
        className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-md flex items-center justify-center"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`bg-card border rounded-2xl p-6 max-w-md mx-4 shadow-2xl relative overflow-hidden ${
            current.isUSP ? "border-primary/40" : "border-border"
          }`}
        >
          {/* USP badge */}
          {current.isUSP && (
            <motion.div
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-bold text-white tracking-wider bg-gradient-to-r ${current.uspColor}`}
            >
              <Star size={8} className="inline mr-1" />
              {current.uspLabel}
            </motion.div>
          )}

          {/* Decorative glow for USP steps */}
          {current.isUSP && (
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 bg-gradient-to-br ${current.uspColor} blur-3xl`} />
          )}

          <div className="flex justify-between items-start mb-4 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                current.isUSP 
                  ? `bg-gradient-to-br ${current.uspColor} shadow-lg`
                  : "bg-primary/10"
              }`}
            >
              <current.icon size={26} className={current.isUSP ? "text-white" : "text-primary"} />
            </motion.div>
            <button onClick={() => { setVisible(false); onComplete(); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-lg font-bold mb-2 ${current.isUSP ? "text-primary" : "text-foreground"}`}
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
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === step ? 24 : 6,
                    backgroundColor: i === step 
                      ? (steps[i].isUSP ? "hsl(var(--primary))" : "hsl(var(--primary))") 
                      : i < step ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))",
                  }}
                  className="h-1.5 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setVisible(false); onComplete(); }} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                Skip
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  current.isUSP 
                    ? `bg-gradient-to-r ${current.uspColor} text-white shadow-md` 
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {step === steps.length - 1 ? (
                  <><Zap size={12} /> Start Building!</>
                ) : (
                  <><span>Next</span> <ArrowRight size={12} /></>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
