import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ATSResult } from "@/hooks/useResumeAI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Loader2, CheckCircle2, AlertTriangle, Zap, ChevronDown } from "lucide-react";

interface Props {
  result: ATSResult | null;
  loading: boolean;
  onAnalyze: () => void;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "hsl(var(--primary))" : score >= 60 ? "hsl(45, 90%, 50%)" : "hsl(var(--destructive))";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="absolute text-2xl font-bold"
        style={{ color }}
      >
        {score}
      </motion.span>
    </div>
  );
}

function CategoryBar({ name, score, feedback, suggestions }: ATSResult["categories"][0]) {
  const [open, setOpen] = useState(false);
  const color = score >= 80 ? "bg-primary" : score >= 60 ? "bg-yellow-500" : "bg-destructive";

  return (
    <div className="space-y-1">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left">
        <span className="text-xs font-medium text-foreground flex-1">{name}</span>
        <span className="text-xs text-muted-foreground">{score}/100</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={12} className="text-muted-foreground" /></motion.div>
      </button>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="text-xs text-muted-foreground mt-1">{feedback}</p>
            {suggestions.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <Zap size={10} className="text-primary mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ATSScorePanel({ result, loading, onAnalyze }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target size={16} className="text-primary" /> ATS Score Analysis
          </h3>
          <button
            onClick={onAnalyze}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <><Loader2 size={12} className="animate-spin" /> Analyzing...</> : "Analyze Resume"}
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {!result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target size={28} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Click "Analyze Resume" to get your ATS compatibility score</p>
              <p className="text-xs text-muted-foreground mt-1">Our AI will check formatting, keywords, and structure</p>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing your resume...</p>
              <div className="mt-4 space-y-2 max-w-xs mx-auto">
                {["Checking format", "Scanning keywords", "Evaluating structure"].map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.5 + 0.3 }}>
                      <CheckCircle2 size={14} className="text-primary" />
                    </motion.div>
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center">
                <ScoreRing score={result.overallScore} />
                <p className="text-xs text-muted-foreground mt-2">
                  {result.overallScore >= 80 ? "Excellent! Your resume is ATS-ready" : result.overallScore >= 60 ? "Good, but could use improvements" : "Needs significant improvements"}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</h4>
                {result.categories.map((cat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <CategoryBar {...cat} />
                  </motion.div>
                ))}
              </div>

              {result.topStrengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-primary" /> Strengths
                  </h4>
                  <ul className="space-y-1">
                    {result.topStrengths.map((s, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5"><span className="text-primary">✓</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.criticalIssues.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-destructive" /> Critical Issues
                  </h4>
                  <ul className="space-y-1">
                    {result.criticalIssues.map((s, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5"><span className="text-destructive">!</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.quickWins.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Zap size={12} className="text-yellow-500" /> Quick Wins
                  </h4>
                  <ul className="space-y-1">
                    {result.quickWins.map((s, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-1.5"><span className="text-yellow-500">⚡</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
