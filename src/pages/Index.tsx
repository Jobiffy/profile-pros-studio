import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Target,
  FileSearch,
  MessageSquareText,
  UserCheck,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "ATS Score Analyzer",
    description:
      "Get an instant, detailed breakdown of how your resume performs against Applicant Tracking Systems. Fix critical issues before they cost you interviews.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
    tag: "Beat the bots",
  },
  {
    icon: FileSearch,
    title: "JD Match Engine",
    description:
      "Paste any job description and see exactly how well your resume matches. Discover missing keywords and get tailored recommendations to close the gap.",
    gradient: "from-sky-500/20 to-blue-500/20",
    iconColor: "text-sky-500",
    borderColor: "border-sky-500/30",
    tag: "Keyword precision",
  },
  {
    icon: MessageSquareText,
    title: "AI Resume Chat",
    description:
      "Talk to your resume like a co-pilot. Ask it to rewrite bullets, adjust tone, add metrics — and watch it update in real-time on the canvas.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/30",
    tag: "Live editing",
  },
  {
    icon: UserCheck,
    title: "Profile Optimiser",
    description:
      "Link your LinkedIn or Naukri profile and receive an AI-generated audit report with actionable improvements for headline, summary, skills, and more.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
    tag: "Coming soon",
  },
];

const stats = [
  { value: "15+", label: "Resume Templates" },
  { value: "95%", label: "ATS Pass Rate" },
  { value: "10s", label: "Instant Analysis" },
  { value: "Free", label: "To Get Started" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-space font-bold text-xl text-foreground tracking-tight">
              ProfilePros
            </span>
          </div>
          <Button onClick={() => navigate("/builder")} size="sm" className="gap-1.5 font-space">
            Open Builder <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Career Tools
            </div>
            <h1 className="text-5xl md:text-7xl font-space font-bold text-foreground tracking-tight leading-[1.1] mb-6">
              Your resume,
              <br />
              <span className="text-primary">engineered to win.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-source leading-relaxed">
              Build, score, and tailor your resume with AI that understands what
              recruiters and ATS systems are really looking for.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/builder")}
                className="gap-2 text-base px-8 h-12 font-space shadow-lg shadow-primary/20"
              >
                Start Building <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="gap-2 text-base px-8 h-12 font-space"
              >
                See Features <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          className="max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-space font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-space font-bold text-foreground mb-4">
              Four tools. One unfair advantage.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto font-source">
              Everything you need to craft a resume that lands interviews — and a profile that attracts recruiters.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={cardVariants}>
                <div
                  className={`group relative rounded-2xl border ${f.borderColor} bg-gradient-to-br ${f.gradient} p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`shrink-0 p-3 rounded-xl bg-background/80 border border-border ${f.iconColor}`}>
                      <f.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-space font-bold text-foreground">{f.title}</h3>
                        <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">
                          {f.tag}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-source leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-12 md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-space font-bold text-foreground mb-4">
            Ready to land more interviews?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 font-source max-w-lg mx-auto">
            Stop guessing. Let AI tell you exactly what to fix — in your resume and your online profile.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/builder")}
            className="gap-2 text-base px-10 h-12 font-space shadow-lg shadow-primary/20"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-space">© 2026 ProfilePros</span>
          <span>Built with AI, designed for humans.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
