import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JDMatchResult } from "@/hooks/useResumeAI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Props {
  result: JDMatchResult | null;
  loading: boolean;
  onMatch: (jd: string) => void;
}

function MatchRing({ score }: { score: number }) {
  const size = 100;
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "hsl(var(--primary))" : score >= 50 ? "hsl(45, 90%, 50%)" : "hsl(var(--destructive))";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={5} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="absolute text-xl font-bold" style={{ color }}>{score}%</motion.span>
    </div>
  );
}

export function JDMatchPanel({ result, loading, onMatch }: Props) {
  const [jd, setJd] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Briefcase size={16} className="text-primary" /> Job Description Matcher
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Paste Job Description</label>
            <Textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              rows={6}
              placeholder="Paste the job description here to see how well your resume matches..."
              className="text-sm bg-background border-border/60 focus:border-primary resize-none"
            />
            <button
              onClick={() => jd.trim() && onMatch(jd)}
              disabled={loading || !jd.trim()}
              className="w-full py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Matching...</> : <><ArrowRight size={14} /> Analyze Match</>}
            </button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="text-center">
                <MatchRing score={result.matchScore} />
                <p className="text-xs text-muted-foreground mt-1">{result.experienceMatch}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><CheckCircle2 size={12} className="text-primary" /> Matched Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.matchedKeywords.map((k, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">{k}</motion.span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><XCircle size={12} className="text-destructive" /> Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.missingKeywords.map((k, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">{k}</motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {result.skillsGap.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2">Skills Gap</h4>
                  <ul className="space-y-1">
                    {result.skillsGap.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-destructive">−</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2">Recommendations</h4>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((r, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="text-xs text-foreground p-2 rounded bg-muted/50 border border-border/40">{r}</motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {result.sectionFeedback.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2">Section Scores</h4>
                  <div className="space-y-2">
                    {result.sectionFeedback.map((sf, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-foreground">{sf.section}</span>
                          <span className="text-muted-foreground">{sf.score}/100</span>
                        </div>
                        <div className="h-1 rounded-full bg-border overflow-hidden">
                          <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${sf.score}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sf.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
