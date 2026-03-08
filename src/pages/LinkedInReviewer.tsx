import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Linkedin, ArrowLeft, Sparkles, TrendingUp, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, Loader2, Target,
  Award, Lightbulb, BarChart3, Star, Zap, User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SectionReview {
  name: string;
  score: number;
  projectedScore: number;
  issues: string[];
  suggestions: string[];
}

interface LinkedInReviewResult {
  overallScore: number;
  projectedOverallScore: number;
  summary: string;
  profileName: string;
  profileHeadline: string;
  sections: SectionReview[];
  topStrengths: string[];
  criticalImprovements: string[];
}

const scoreBg = (score: number) => {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-amber-500";
  return "bg-red-500";
};

const scoreColor = (score: number) => {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-amber-500";
  return "text-red-500";
};

const ScoreRing = ({ score, max = 100, size = 120, label }: { score: number; max?: number; size?: number; label: string }) => {
  const pct = (score / max) * 100;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "stroke-emerald-500" : pct >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="flex flex-col items-center gap-1 relative">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          className={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground">/{max}</span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

const SectionCard = ({ section, index }: { section: SectionReview; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const improvement = section.projectedScore - section.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${scoreBg(section.score)}`}>
            {section.score}
          </div>
          <div className="text-left min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{section.name}</h3>
            {improvement > 0 && (
              <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />+{improvement} possible
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">→ {section.projectedScore}/10</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              {section.issues.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-red-500 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Issues
                  </h4>
                  <ul className="space-y-1">
                    {section.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-red-400">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {section.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {section.suggestions.map((sug, i) => (
                      <li key={i} className="text-xs text-muted-foreground pl-4 relative before:content-['✓'] before:absolute before:left-1 before:text-emerald-500">{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LinkedInReviewer = () => {
  const navigate = useNavigate();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<LinkedInReviewResult | null>(null);

  const handleAnalyze = async () => {
    if (!profileText.trim() || profileText.trim().length < 50) {
      toast({ title: "More content needed", description: "Please paste your full LinkedIn profile content (at least 50 characters).", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    setLoadingStep("Analyzing profile sections with AI...");

    try {
      setTimeout(() => setLoadingStep("Scoring each section..."), 3000);
      setTimeout(() => setLoadingStep("Generating recommendations..."), 6000);

      const { data, error } = await supabase.functions.invoke("linkedin-review", {
        body: { linkedinUrl: linkedinUrl.trim() || undefined, profileText },
      });
      if (error) throw new Error(typeof error === "object" && error.message ? error.message : "Analysis failed");
      if (data?.error) throw new Error(data.error);
      setResult(data as LinkedInReviewResult);
      toast({ title: "Analysis Complete! 🎉", description: "Your LinkedIn profile has been reviewed." });
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">J</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground leading-tight">
                  Job<span className="text-primary">iffy</span> LinkedIn Profile Reviewer
                </h1>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-500" /> Core USP Feature
                </p>
              </div>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" /> AI-Powered
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
            {/* Hero */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Linkedin className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Jobiffy LinkedIn Profile Reviewer
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Just paste your LinkedIn URL — our AI automatically fetches and analyzes every section of your profile with detailed scores and actionable improvements.
              </p>

              {/* USP pills */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  { icon: Target, label: "ATS Score Checker", path: "/" },
                  { icon: Linkedin, label: "LinkedIn Reviewer", path: "/linkedin-reviewer", active: true },
                  { icon: Sparkles, label: "AI Resume Coach", path: "/" },
                ].map((usp) => (
                  <button
                    key={usp.label}
                    onClick={() => navigate(usp.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      usp.active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <usp.icon className="w-3.5 h-3.5" />
                    {usp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">LinkedIn Profile URL (optional)</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Profile Content <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Open your LinkedIn profile → Select all text (Ctrl+A) → Copy (Ctrl+C) → Paste below. Include headline, about, experience, education, skills, etc.
                </p>
                <Textarea
                  placeholder={`Paste your full LinkedIn profile text here...\n\nTip: Go to your LinkedIn profile, press Ctrl+A to select all, then Ctrl+C to copy, and paste here.`}
                  className="min-h-[200px] text-sm"
                  value={profileText}
                  onChange={e => setProfileText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">{profileText.length} characters</p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || profileText.trim().length < 50}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{loadingStep || "Analyzing..."}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Analyze My LinkedIn Profile</>
                )}
              </Button>
            </Card>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-xs text-muted-foreground animate-pulse">{loadingStep}</p>
              </motion.div>
            )}

            {/* How it works */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { step: "1", title: "Paste URL", desc: "Enter your LinkedIn profile link" },
                { step: "2", title: "AI Analyzes", desc: "We fetch & score every section" },
                { step: "3", title: "Get Results", desc: "Detailed feedback & improvements" },
              ].map(s => (
                <div key={s.step} className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mx-auto mb-1.5">{s.step}</div>
                  <p className="text-xs font-semibold text-foreground">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Profile header */}
            {(result.profileName || result.profileHeadline) && (
              <Card className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{result.profileName || "LinkedIn Profile"}</h2>
                  {result.profileHeadline && <p className="text-xs text-muted-foreground">{result.profileHeadline}</p>}
                </div>
              </Card>
            )}

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 flex items-center justify-center">
                <ScoreRing score={result.overallScore} label="Current Score" />
              </Card>
              <Card className="p-6 flex items-center justify-center">
                <ScoreRing score={result.projectedOverallScore} label="Projected Score" />
              </Card>
              <Card className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg font-bold text-emerald-500">
                    +{result.projectedOverallScore - result.overallScore} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{result.summary}</p>
              </Card>
            </div>

            {/* Strengths & Critical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-emerald-500" /> Top Strengths
                </h3>
                <ul className="space-y-1.5">
                  {result.topStrengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-red-500" /> Critical Improvements
                </h3>
                <ul className="space-y-1.5">
                  {result.criticalImprovements.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Section Scores Bar */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" /> Section Scores
              </h3>
              <div className="space-y-2">
                {result.sections.map((sec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-36 truncate">{sec.name}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${scoreBg(sec.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${sec.score * 10}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                      <motion.div
                        className="h-full rounded-full bg-emerald-300/40 absolute top-0 left-0"
                        initial={{ width: 0 }}
                        animate={{ width: `${sec.projectedScore * 10}%` }}
                        transition={{ duration: 1, delay: i * 0.05 + 0.3 }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${scoreColor(sec.score)}`}>{sec.score}</span>
                    <span className="text-xs text-emerald-500 w-10 text-right">→ {sec.projectedScore}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                <span className="inline-block w-3 h-1.5 bg-emerald-300/40 rounded mr-1" /> Projected after improvements
              </p>
            </Card>

            {/* Detailed Section Reviews */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Detailed Section Reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.sections.map((sec, i) => (
                  <SectionCard key={i} section={sec} index={i} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => setResult(null)} className="gap-2">
                <Sparkles className="w-4 h-4" /> Analyze Another Profile
              </Button>
              <Button onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Resume Builder
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LinkedInReviewer;
