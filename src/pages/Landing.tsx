import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { JobiffyLogo } from "@/components/JobiffyLogo";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import {
  Target, Briefcase, MessageSquare, Sparkles, ArrowRight,
  Star, Linkedin, Check, Zap, Shield, Globe,
  ChevronDown
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], [0, 1]);
  const [navOpaque, setNavOpaque] = useState(false);

  useEffect(() => {
    const unsub = navBg.on("change", (v) => setNavOpaque(v > 0.5));
    return unsub;
  }, [navBg]);

  const heroWords = ["interviews", "callbacks", "offers", "careers"];
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setWordIndex((i) => (i + 1) % heroWords.length), 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Target,
      title: "ATS Score Checker",
      description: "Beat applicant tracking systems with instant compatibility scoring and actionable optimization tips.",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: Briefcase,
      title: "JD Matcher",
      description: "Match your resume against any job description — see exactly which keywords and skills you're missing.",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: MessageSquare,
      title: "AI Resume Coach",
      description: "Real-time AI coaching transforms weak bullet points into powerful achievement statements.",
      gradient: "from-teal-500/20 to-cyan-500/20",
    },
    {
      icon: Linkedin,
      title: "LinkedIn Reviewer",
      description: "Get a comprehensive LinkedIn profile review with section-by-section scoring and optimization tips.",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
  ];

  const stats = [
    { value: "94%", label: "ATS pass rate", icon: Shield },
    { value: "3x", label: "More interviews", icon: Zap },
    { value: "10k+", label: "Resumes built", icon: Globe },
    { value: "15+", label: "Pro templates", icon: Star },
  ];

  const steps = [
    { step: "01", title: "Pick a Template", description: "Choose from 15+ ATS-optimized, professionally designed templates", color: "bg-primary" },
    { step: "02", title: "Add Your Story", description: "Import from LinkedIn or type — AI assists every section", color: "bg-accent" },
    { step: "03", title: "Optimize & Score", description: "Run ATS checker, JD matcher, and AI coach to perfect your resume", color: "bg-primary" },
    { step: "04", title: "Download & Win", description: "Export as PDF or DOCX and start landing interviews", color: "bg-accent" },
  ];

  const testimonials = [
    { name: "Priya S.", role: "Software Engineer @ Google", text: "Jobiffy helped me land 3 interviews in my first week. The ATS score feature is a game-changer!", avatar: "PS" },
    { name: "Rahul M.", role: "Product Manager @ Meta", text: "The JD Matcher showed me exactly what keywords I was missing. Got my dream job offer within a month.", avatar: "RM" },
    { name: "Ananya K.", role: "Data Analyst @ Amazon", text: "The AI Coach rewrote my bullet points and my callback rate jumped from 5% to 40%.", avatar: "AK" },
    { name: "David L.", role: "UX Designer @ Figma", text: "Beautiful templates and the LinkedIn reviewer gave me insights I never would have caught myself.", avatar: "DL" },
    { name: "Sara T.", role: "Marketing Lead @ HubSpot", text: "I went from zero callbacks to 6 interviews in 2 weeks. This tool is absolutely worth it.", avatar: "ST" },
    { name: "James W.", role: "DevOps Engineer @ Stripe", text: "The real-time AI suggestions while editing are incredible. It's like having a career coach by your side.", avatar: "JW" },
  ];

  const trustedBy = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Floating Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navOpaque ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <JobiffyLogo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors duration-200">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <ProfileDropdown />
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm font-medium">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-24 px-6 min-h-[90vh] flex items-center">
        {/* Animated grid background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent blur-[120px]"
          />
          {/* Floating shapes */}
          <motion.div
            animate={{ y: [-20, 20, -20], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] right-[15%] w-8 h-8 rounded-lg border-2 border-primary/20 bg-primary/5"
          />
          <motion.div
            animate={{ y: [15, -15, 15], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[60%] left-[10%] w-6 h-6 rounded-full border-2 border-primary/15 bg-primary/5"
          />
          <motion.div
            animate={{ y: [-10, 25, -10] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] right-[8%] w-4 h-4 rounded-full bg-primary/10"
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Resume Builder
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl sm:text-6xl md:text-[5rem] font-bold tracking-tight leading-[1.05] mt-8 mb-6 font-space"
          >
            Build resumes that
            <br />
            land more{" "}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWords[wordIndex]}
                  initial={{ y: 30, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -30, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4 }}
                  className="text-primary inline-block"
                >
                  {heroWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/30 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Jobiffy combines ATS optimization, job description matching, and AI coaching
            to give you an unfair advantage in your job search.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="group h-14 px-8 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Building — It's Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="h-14 px-8 text-base rounded-full border-border/60 hover:bg-secondary/80"
            >
              See How It Works
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 font-medium">
              Trusted by professionals at
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
              {trustedBy.map((company, i) => (
                <motion.span
                  key={company}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="text-muted-foreground/40 font-semibold text-sm md:text-base tracking-wide font-space"
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative -mt-8 z-10 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-xl shadow-primary/5 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground font-space">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-bold uppercase tracking-[0.15em]">Core Features</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 font-space leading-tight">
              Everything you need to
              <br /><span className="text-primary">land your dream job</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Four powerful AI tools working together to give your resume the edge it needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-card border border-border/60 rounded-2xl p-8 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden cursor-pointer"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        USP
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-28 px-6 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-primary text-sm font-bold uppercase tracking-[0.15em]">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 font-space">
              Four steps to your
              <br /><span className="text-primary">perfect resume</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative text-center lg:text-left"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-[72px] h-[72px] rounded-2xl ${step.color} flex items-center justify-center mx-auto lg:mx-0 mb-5 shadow-lg relative z-10`}
                  >
                    <span className="text-primary-foreground font-bold text-xl font-space">{step.step}</span>
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-bold uppercase tracking-[0.15em]">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 font-space">
              Loved by <span className="text-primary">10,000+</span> job seekers
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -3 }}
                className="bg-card border border-border/60 rounded-2xl p-7 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed text-[15px]">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[2rem] overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-primary" />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,hsl(152_60%_40%/0.3)_60deg,transparent_120deg)]"
            />
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />

            <div className="relative z-10 p-12 md:p-20 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground font-space mb-4 leading-tight">
                Ready to land your
                <br />dream job?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-10">
                Join thousands of professionals who've transformed their job search with Jobiffy. It's free to start.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="group h-14 px-10 text-base rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-primary-foreground/60 text-sm">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Free forever plan</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 15+ templates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <JobiffyLogo size="lg" />
              <p className="text-sm text-muted-foreground">AI-powered resume builder for modern job seekers.</p>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Jobiffy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
