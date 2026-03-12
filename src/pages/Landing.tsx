import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Target, Briefcase, MessageSquare, Sparkles, ArrowRight,
  CheckCircle2, Star, Zap, Shield, FileText, TrendingUp,
  Users, ChevronRight, Linkedin
} from "lucide-react";
import jobiffyLogo from "@/assets/logo.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "ATS Score Checker",
      description: "Get an instant ATS compatibility score with actionable tips to beat applicant tracking systems.",
      badge: "Core USP",
    },
    {
      icon: Briefcase,
      title: "JD Matcher",
      description: "Match your resume against any job description and see exactly what's missing.",
      badge: "Core USP",
    },
    {
      icon: MessageSquare,
      title: "AI Resume Coach",
      description: "Get real-time AI coaching to transform every bullet point into a hiring magnet.",
      badge: "Core USP",
    },
    {
      icon: Linkedin,
      title: "LinkedIn Profile Reviewer",
      description: "Paste your LinkedIn profile and get a comprehensive review with optimization tips.",
      badge: "Core USP",
    },
  ];

  const stats = [
    { value: "94%", label: "ATS pass rate" },
    { value: "3x", label: "More interviews" },
    { value: "10k+", label: "Resumes optimized" },
    { value: "15+", label: "Pro templates" },
  ];

  const steps = [
    { step: "01", title: "Choose a Template", description: "Pick from 15+ ATS-optimized professional templates" },
    { step: "02", title: "Fill Your Details", description: "Import or type — our AI helps you write every section" },
    { step: "03", title: "Optimize & Score", description: "Use ATS checker, JD matcher, and AI coach to perfect it" },
    { step: "04", title: "Download & Apply", description: "Export as PDF or DOCX and start landing interviews" },
  ];

  const testimonials = [
    { name: "Priya S.", role: "Software Engineer", text: "Jobiffy helped me land 3 interviews in my first week. The ATS score feature is a game-changer!", rating: 5 },
    { name: "Rahul M.", role: "Product Manager", text: "The JD Matcher showed me exactly what keywords I was missing. Got my dream job offer within a month.", rating: 5 },
    { name: "Ananya K.", role: "Data Analyst", text: "The AI Coach rewrote my bullet points and my callback rate jumped from 5% to 40%.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={jobiffyLogo} alt="Jobiffy" className="h-8" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              AI-Powered Resume Builder
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 font-space"
          >
            Build resumes that
            <br />
            <span className="text-primary">actually get hired</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Jobiffy combines ATS optimization, job description matching, and AI coaching
            to give you an unfair advantage in your job search.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="h-14 px-8 text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Start Building — It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="h-14 px-8 text-base rounded-xl"
            >
              See Features
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary font-space">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 font-space">
              Everything you need to
              <br />land your dream job
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group relative bg-card border border-border/60 rounded-2xl p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 font-space">
              Four steps to your
              <br />perfect resume
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/10 font-space mb-3">{step.step}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 font-space">
              Loved by job seekers
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="bg-card border border-border/60 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="relative bg-primary rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(152_60%_40%/0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(152_60%_20%/0.4),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground font-space mb-4">
                Ready to land your
                <br />dream job?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                Join thousands of professionals who've transformed their job search with Jobiffy.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-14 px-10 text-base rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={jobiffyLogo} alt="Jobiffy" className="h-7" />
            <span className="text-sm text-muted-foreground">© 2025 Jobiffy. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
