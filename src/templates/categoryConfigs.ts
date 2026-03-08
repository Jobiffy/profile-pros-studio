import { TemplateStyleConfig } from "./TemplateFactory";

export interface CategoryTemplateConfig extends TemplateStyleConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
}

// ═══════════════════════════════════════
// MARKETING TEMPLATES (10)
// ═══════════════════════════════════════
export const marketingTemplates: CategoryTemplateConfig[] = [
  { id: "mkt-brand-story", name: "Brand Storyteller", category: "marketing", description: "Narrative-driven layout for brand marketers", preview: "#E91E63", layout: "banner", fontBody: "'Verdana', sans-serif", fontHeading: "'Georgia', serif", defaultAccent: "#E91E63", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow", sidebarSide: "left" },
  { id: "mkt-digital-pro", name: "Digital Marketing Pro", category: "marketing", description: "Modern layout with metrics focus", preview: "#00BCD4", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#00BCD4", headerAlign: "center", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "mkt-content-craft", name: "Content Strategist", category: "marketing", description: "Clean layout emphasizing content skills", preview: "#FF5722", layout: "sidebar", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Georgia', serif", defaultAccent: "#FF5722", headerAlign: "left", sectionStyle: "bold", bulletStyle: "dash", sidebarSide: "left", sidebarBg: "#FF5722" },
  { id: "mkt-growth-hack", name: "Growth Hacker", category: "marketing", description: "Data-driven startup marketing style", preview: "#4CAF50", layout: "banner", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#4CAF50", headerAlign: "left", sectionStyle: "line", bulletStyle: "arrow" },
  { id: "mkt-creative-dir", name: "Creative Director", category: "marketing", description: "Bold creative layout with color accents", preview: "#9C27B0", layout: "minimal", fontBody: "'Palatino', serif", fontHeading: "'Palatino', serif", defaultAccent: "#9C27B0", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "mkt-social-media", name: "Social Media Manager", category: "marketing", description: "Vibrant modern design for social roles", preview: "#FF4081", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#FF4081", headerAlign: "center", sectionStyle: "accent", bulletStyle: "disc" },
  { id: "mkt-seo-analyst", name: "SEO Specialist", category: "marketing", description: "Analytical layout with clean hierarchy", preview: "#2196F3", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#2196F3", headerAlign: "left", sectionStyle: "line", bulletStyle: "square" },
  { id: "mkt-pr-comm", name: "PR & Communications", category: "marketing", description: "Elegant professional layout for PR", preview: "#795548", layout: "sidebar", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#795548", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#795548" },
  { id: "mkt-email-auto", name: "Email & Automation", category: "marketing", description: "Tech-savvy marketing automation focus", preview: "#607D8B", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#607D8B", headerAlign: "left", sectionStyle: "dot", bulletStyle: "arrow" },
  { id: "mkt-brand-mgr", name: "Brand Manager", category: "marketing", description: "Polished executive marketing layout", preview: "#3F51B5", layout: "single", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#3F51B5", headerAlign: "center", sectionStyle: "bold", bulletStyle: "disc" },
];

// ═══════════════════════════════════════
// SALES TEMPLATES (10)
// ═══════════════════════════════════════
export const salesTemplates: CategoryTemplateConfig[] = [
  { id: "sales-closer", name: "Deal Closer", category: "sales", description: "Bold results-driven sales layout", preview: "#D32F2F", layout: "banner", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#D32F2F", headerAlign: "left", sectionStyle: "bold", bulletStyle: "arrow" },
  { id: "sales-pipeline", name: "Pipeline Pro", category: "sales", description: "Metrics-focused for pipeline builders", preview: "#1565C0", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#1565C0", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "sales-enterprise", name: "Enterprise Sales", category: "sales", description: "Executive-level enterprise sales layout", preview: "#1B5E20", layout: "sidebar", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1B5E20", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#1B5E20" },
  { id: "sales-saas", name: "SaaS Sales Rep", category: "sales", description: "Modern tech sales focused design", preview: "#6200EA", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#6200EA", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "sales-account-exec", name: "Account Executive", category: "sales", description: "Professional relationship-focused layout", preview: "#00695C", layout: "banner", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#00695C", headerAlign: "left", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "sales-bdr", name: "BDR / SDR", category: "sales", description: "Entry-level sales development rep", preview: "#F57C00", layout: "minimal", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#F57C00", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "sales-retail", name: "Retail Sales", category: "sales", description: "Clean retail and in-store sales layout", preview: "#E65100", layout: "single", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#E65100", headerAlign: "center", sectionStyle: "line", bulletStyle: "square" },
  { id: "sales-channel", name: "Channel Partner Sales", category: "sales", description: "Partnership and channel sales design", preview: "#004D40", layout: "sidebar", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#004D40", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#004D40" },
  { id: "sales-director", name: "Sales Director", category: "sales", description: "Executive leadership in sales", preview: "#263238", layout: "banner", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#263238", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "sales-hunter", name: "Sales Hunter", category: "sales", description: "Aggressive new business hunter style", preview: "#BF360C", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#BF360C", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
];

// ═══════════════════════════════════════
// CONSULTING TEMPLATES (10)
// ═══════════════════════════════════════
export const consultingTemplates: CategoryTemplateConfig[] = [
  { id: "consult-mckinsey", name: "Strategy Consultant", category: "consulting", description: "MBB-style clean professional layout", preview: "#1A237E", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1A237E", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "consult-analytics", name: "Analytics Consultant", category: "consulting", description: "Data-driven consulting layout", preview: "#0D47A1", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#0D47A1", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "consult-mgmt", name: "Management Consultant", category: "consulting", description: "Structured management consulting format", preview: "#1B3A5C", layout: "sidebar", fontBody: "'Palatino', serif", fontHeading: "'Palatino', serif", defaultAccent: "#1B3A5C", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#1B3A5C" },
  { id: "consult-tech", name: "Technology Consultant", category: "consulting", description: "Tech consulting with modern flair", preview: "#00838F", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#00838F", headerAlign: "left", sectionStyle: "dot", bulletStyle: "arrow" },
  { id: "consult-ops", name: "Operations Consultant", category: "consulting", description: "Process-focused operational layout", preview: "#33691E", layout: "single", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#33691E", headerAlign: "center", sectionStyle: "line", bulletStyle: "square" },
  { id: "consult-finance", name: "Financial Consultant", category: "consulting", description: "Conservative financial advisory layout", preview: "#0a1628", layout: "sidebar", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#0a1628", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#0a1628" },
  { id: "consult-hr", name: "HR Consultant", category: "consulting", description: "People-focused HR consulting layout", preview: "#AD1457", layout: "minimal", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#AD1457", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "consult-digital", name: "Digital Consultant", category: "consulting", description: "Digital transformation consulting", preview: "#311B92", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#311B92", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "consult-risk", name: "Risk & Compliance", category: "consulting", description: "Risk management consulting layout", preview: "#4E342E", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#4E342E", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "consult-change", name: "Change Management", category: "consulting", description: "Organizational change consulting", preview: "#006064", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'Georgia', serif", defaultAccent: "#006064", headerAlign: "left", sectionStyle: "dot", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#006064" },
];

// ═══════════════════════════════════════
// PRODUCT MANAGER TEMPLATES (10)
// ═══════════════════════════════════════
export const pmTemplates: CategoryTemplateConfig[] = [
  { id: "pm-product-lead", name: "Product Lead", category: "pm", description: "Strategic product leadership layout", preview: "#5C6BC0", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#5C6BC0", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "pm-tech-pm", name: "Technical PM", category: "pm", description: "Technical product manager focus", preview: "#0277BD", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#0277BD", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "pm-growth", name: "Growth PM", category: "pm", description: "Growth-focused product management", preview: "#2E7D32", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#2E7D32", headerAlign: "center", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "pm-data", name: "Data Product Manager", category: "pm", description: "Data and analytics PM layout", preview: "#00695C", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#00695C", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#00695C" },
  { id: "pm-ux", name: "UX Product Manager", category: "pm", description: "Design-focused product management", preview: "#E91E63", layout: "minimal", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#E91E63", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "pm-platform", name: "Platform PM", category: "pm", description: "Platform and infrastructure PM", preview: "#37474F", layout: "banner", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#37474F", headerAlign: "left", sectionStyle: "bold", bulletStyle: "square" },
  { id: "pm-agile", name: "Agile PM", category: "pm", description: "Agile and scrum-focused layout", preview: "#F57F17", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#F57F17", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "pm-enterprise", name: "Enterprise PM", category: "pm", description: "Enterprise product management", preview: "#1A237E", layout: "sidebar", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1A237E", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#1A237E" },
  { id: "pm-b2b", name: "B2B Product Manager", category: "pm", description: "B2B SaaS product focus", preview: "#4527A0", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#4527A0", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "pm-director", name: "Director of Product", category: "pm", description: "Executive product director layout", preview: "#212121", layout: "banner", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#212121", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
];

// ═══════════════════════════════════════
// TECH TEMPLATES (10 — 5 existing + 5 new)
// ═══════════════════════════════════════
export const newTechTemplates: CategoryTemplateConfig[] = [
  { id: "tech-fullstack", name: "Full Stack Dev", category: "tech", description: "Comprehensive full-stack developer layout", preview: "#00BFA5", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#00BFA5", headerAlign: "left", sectionStyle: "dot", bulletStyle: "arrow" },
  { id: "tech-cloud-arch", name: "Cloud Architect", category: "tech", description: "Cloud and infrastructure architect style", preview: "#FF6F00", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#FF6F00", headerAlign: "left", sectionStyle: "accent", bulletStyle: "disc" },
  { id: "tech-ml-eng", name: "ML Engineer", category: "tech", description: "Machine learning and AI engineer focus", preview: "#7B1FA2", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#7B1FA2", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#7B1FA2" },
  { id: "tech-mobile", name: "Mobile Developer", category: "tech", description: "iOS/Android mobile developer layout", preview: "#0097A7", layout: "minimal", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#0097A7", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "tech-security", name: "Security Engineer", category: "tech", description: "Cybersecurity and infosec focus", preview: "#B71C1C", layout: "single", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#B71C1C", headerAlign: "center", sectionStyle: "line", bulletStyle: "square" },
];

// ═══════════════════════════════════════
// HR PICKS TEMPLATES (10)
// ═══════════════════════════════════════
export const hrTemplates: CategoryTemplateConfig[] = [
  { id: "hr-classic", name: "HR Classic", category: "hr", description: "Traditional ATS-optimized format", preview: "#37474F", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#37474F", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "hr-modern", name: "HR Modern", category: "hr", description: "Modern clean ATS-friendly design", preview: "#1565C0", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#1565C0", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "hr-exec", name: "HR Executive", category: "hr", description: "Senior-level HR professional layout", preview: "#4E342E", layout: "banner", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#4E342E", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "hr-recruiter", name: "Recruiter Favorite", category: "hr", description: "Format recruiters love to read", preview: "#00695C", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#00695C", headerAlign: "center", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "hr-clean", name: "Clean Scan", category: "hr", description: "Ultra-scannable for quick review", preview: "#455A64", layout: "minimal", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#455A64", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "disc" },
  { id: "hr-structured", name: "Structured Format", category: "hr", description: "Well-organized structured layout", preview: "#1B5E20", layout: "single", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#1B5E20", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "hr-sidebar", name: "HR Sidebar", category: "hr", description: "Professional sidebar format", preview: "#283593", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#283593", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#283593" },
  { id: "hr-timeline", name: "Career Timeline", category: "hr", description: "Chronological career progression", preview: "#5D4037", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#5D4037", headerAlign: "left", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "hr-impact", name: "Impact Resume", category: "hr", description: "Achievement and impact focused", preview: "#C62828", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#C62828", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "hr-balanced", name: "Balanced Format", category: "hr", description: "Balanced two-column professional", preview: "#0D47A1", layout: "sidebar", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#0D47A1", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#0D47A1" },
];

// ═══════════════════════════════════════
// FRESHERS / GRADUATE TEMPLATES (10)
// ═══════════════════════════════════════
export const freshersTemplates: CategoryTemplateConfig[] = [
  { id: "fresh-graduate", name: "Fresh Graduate", category: "freshers", description: "Education-first graduate layout", preview: "#43A047", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#43A047", headerAlign: "center", sectionStyle: "accent", bulletStyle: "disc" },
  { id: "fresh-intern", name: "Internship Ready", category: "freshers", description: "Internship application focused", preview: "#1E88E5", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#1E88E5", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "fresh-projects", name: "Project Showcase", category: "freshers", description: "Projects and skills focused", preview: "#F4511E", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#F4511E", headerAlign: "left", sectionStyle: "dot", bulletStyle: "arrow" },
  { id: "fresh-academic", name: "Academic Focus", category: "freshers", description: "Academic achievements focused layout", preview: "#6A1B9A", layout: "sidebar", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#6A1B9A", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#6A1B9A" },
  { id: "fresh-starter", name: "Career Starter", category: "freshers", description: "Clean entry-level professional", preview: "#00897B", layout: "minimal", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#00897B", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "fresh-creative", name: "Creative Graduate", category: "freshers", description: "Creative design graduate layout", preview: "#D81B60", layout: "banner", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#D81B60", headerAlign: "left", sectionStyle: "accent", bulletStyle: "disc" },
  { id: "fresh-tech", name: "Tech Graduate", category: "freshers", description: "CS and engineering graduate layout", preview: "#0288D1", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#0288D1", headerAlign: "left", sectionStyle: "bold", bulletStyle: "square" },
  { id: "fresh-simple", name: "Simple & Clean", category: "freshers", description: "Minimalist first resume template", preview: "#546E7A", layout: "single", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#546E7A", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "fresh-modern", name: "Modern Graduate", category: "freshers", description: "Modern design for new graduates", preview: "#FF6F00", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#FF6F00", headerAlign: "left", sectionStyle: "dot", bulletStyle: "arrow", sidebarSide: "right", sidebarBg: "#FF6F00" },
  { id: "fresh-impact", name: "Impact Starter", category: "freshers", description: "Impact-focused entry level resume", preview: "#2E7D32", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#2E7D32", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
];

// ═══════════════════════════════════════
// GENERIC TEMPLATES (5 new + 5 existing)
// ═══════════════════════════════════════
export const newGenericTemplates: CategoryTemplateConfig[] = [
  { id: "gen-executive", name: "Executive Suite", category: "generic", description: "C-suite executive professional layout", preview: "#212121", layout: "banner", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#212121", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "gen-contemporary", name: "Contemporary", category: "generic", description: "Modern contemporary all-purpose design", preview: "#5E35B1", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#5E35B1", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow", sidebarSide: "left", sidebarBg: "#5E35B1" },
  { id: "gen-serif", name: "Serif Classic", category: "generic", description: "Traditional serif typography layout", preview: "#3E2723", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Palatino', serif", defaultAccent: "#3E2723", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "gen-swiss", name: "Swiss Design", category: "generic", description: "Swiss-inspired clean typography", preview: "#D32F2F", layout: "minimal", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#D32F2F", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "gen-twotone", name: "Two-Tone Pro", category: "generic", description: "Two-tone professional sidebar layout", preview: "#004D40", layout: "sidebar", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#004D40", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#004D40" },
];

// ═══════════════════════════════════════
// FINANCE TEMPLATES (10)
// ═══════════════════════════════════════
export const financeTemplates: CategoryTemplateConfig[] = [
  { id: "fin-investment-banker", name: "Investment Banker", category: "finance", description: "Conservative Wall Street banking layout", preview: "#0D1B2A", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#0D1B2A", headerAlign: "center", sectionStyle: "line", bulletStyle: "disc" },
  { id: "fin-equity-analyst", name: "Equity Analyst", category: "finance", description: "Metrics-driven equity research layout", preview: "#1B3A5C", layout: "single", fontBody: "'Palatino', serif", fontHeading: "'Palatino', serif", defaultAccent: "#1B3A5C", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "fin-pe-vc", name: "PE / Venture Capital", category: "finance", description: "Private equity and VC deal-focused", preview: "#263238", layout: "banner", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#263238", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "fin-fp-analyst", name: "FP&A Analyst", category: "finance", description: "Financial planning and analysis layout", preview: "#004D40", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#004D40", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc", sidebarSide: "left", sidebarBg: "#004D40" },
  { id: "fin-risk-mgr", name: "Risk Manager", category: "finance", description: "Risk and compliance management focus", preview: "#4E342E", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#4E342E", headerAlign: "center", sectionStyle: "line", bulletStyle: "square" },
  { id: "fin-cfo-exec", name: "CFO Executive", category: "finance", description: "C-suite financial executive layout", preview: "#1A237E", layout: "banner", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1A237E", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "fin-wealth-mgmt", name: "Wealth Management", category: "finance", description: "Wealth advisory and client-facing", preview: "#B8860B", layout: "sidebar", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#B8860B", headerAlign: "left", sectionStyle: "dot", bulletStyle: "disc", sidebarSide: "right", sidebarBg: "#5D4037" },
  { id: "fin-quant", name: "Quantitative Analyst", category: "finance", description: "Quant and algorithmic trading focus", preview: "#0277BD", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#0277BD", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "fin-audit", name: "Audit & Compliance", category: "finance", description: "Auditing and regulatory compliance", preview: "#37474F", layout: "minimal", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#37474F", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "fin-controller", name: "Financial Controller", category: "finance", description: "Accounting and controllership layout", preview: "#1B5E20", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1B5E20", headerAlign: "center", sectionStyle: "bold", bulletStyle: "disc" },
];

// ═══════════════════════════════════════
// OPERATIONS TEMPLATES (10)
// ═══════════════════════════════════════
export const operationsTemplates: CategoryTemplateConfig[] = [
  { id: "ops-supply-chain", name: "Supply Chain Manager", category: "operations", description: "Logistics and supply chain management", preview: "#00695C", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#00695C", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "ops-lean-six", name: "Lean Six Sigma", category: "operations", description: "Process improvement and lean methodology", preview: "#2E7D32", layout: "banner", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#2E7D32", headerAlign: "left", sectionStyle: "line", bulletStyle: "arrow" },
  { id: "ops-director", name: "Operations Director", category: "operations", description: "Senior operations leadership layout", preview: "#1A237E", layout: "banner", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1A237E", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "ops-logistics", name: "Logistics Coordinator", category: "operations", description: "Logistics and distribution focus", preview: "#E65100", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#E65100", headerAlign: "center", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "ops-manufacturing", name: "Manufacturing Ops", category: "operations", description: "Manufacturing operations management", preview: "#37474F", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#37474F", headerAlign: "left", sectionStyle: "bold", bulletStyle: "square", sidebarSide: "left", sidebarBg: "#37474F" },
  { id: "ops-procurement", name: "Procurement Manager", category: "operations", description: "Procurement and vendor management", preview: "#4E342E", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#4E342E", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "ops-quality", name: "Quality Assurance", category: "operations", description: "Quality control and assurance focus", preview: "#0D47A1", layout: "minimal", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#0D47A1", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "ops-warehouse", name: "Warehouse Manager", category: "operations", description: "Warehouse and inventory management", preview: "#5D4037", layout: "single", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#5D4037", headerAlign: "center", sectionStyle: "accent", bulletStyle: "disc" },
  { id: "ops-business", name: "Business Operations", category: "operations", description: "Cross-functional business ops layout", preview: "#283593", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#283593", headerAlign: "left", sectionStyle: "dot", bulletStyle: "arrow", sidebarSide: "right", sidebarBg: "#283593" },
  { id: "ops-facilities", name: "Facilities Manager", category: "operations", description: "Facilities and office management", preview: "#33691E", layout: "banner", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#33691E", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
];

// ═══════════════════════════════════════
// PROJECT MANAGEMENT TEMPLATES (10)
// ═══════════════════════════════════════
export const projectManagementTemplates: CategoryTemplateConfig[] = [
  { id: "projm-pmp", name: "PMP Certified", category: "project_management", description: "PMP-focused project management layout", preview: "#1565C0", layout: "single", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#1565C0", headerAlign: "center", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "projm-agile-master", name: "Agile Scrum Master", category: "project_management", description: "Scrum master and agile coach layout", preview: "#F57F17", layout: "banner", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#F57F17", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow" },
  { id: "projm-it-pm", name: "IT Project Manager", category: "project_management", description: "IT and software project management", preview: "#0277BD", layout: "single", fontBody: "'Verdana', sans-serif", fontHeading: "'Verdana', sans-serif", defaultAccent: "#0277BD", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "projm-construction", name: "Construction PM", category: "project_management", description: "Construction and infrastructure project", preview: "#E65100", layout: "sidebar", fontBody: "'Arial', sans-serif", fontHeading: "'Arial', sans-serif", defaultAccent: "#E65100", headerAlign: "left", sectionStyle: "bold", bulletStyle: "square", sidebarSide: "left", sidebarBg: "#E65100" },
  { id: "projm-senior", name: "Senior PM", category: "project_management", description: "Senior project manager leadership", preview: "#1A237E", layout: "banner", fontBody: "'Palatino', serif", fontHeading: "'Georgia', serif", defaultAccent: "#1A237E", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
  { id: "projm-program", name: "Program Manager", category: "project_management", description: "Multi-project program management", preview: "#4A148C", layout: "single", fontBody: "'Georgia', serif", fontHeading: "'Georgia', serif", defaultAccent: "#4A148C", headerAlign: "center", sectionStyle: "dot", bulletStyle: "disc" },
  { id: "projm-waterfall", name: "Waterfall PM", category: "project_management", description: "Traditional waterfall methodology PM", preview: "#37474F", layout: "minimal", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#37474F", headerAlign: "left", sectionStyle: "minimal", bulletStyle: "dash" },
  { id: "projm-digital", name: "Digital PM", category: "project_management", description: "Digital transformation PM layout", preview: "#311B92", layout: "sidebar", fontBody: "'system-ui', sans-serif", fontHeading: "'system-ui', sans-serif", defaultAccent: "#311B92", headerAlign: "left", sectionStyle: "accent", bulletStyle: "arrow", sidebarSide: "right", sidebarBg: "#311B92" },
  { id: "projm-healthcare", name: "Healthcare PM", category: "project_management", description: "Healthcare industry project manager", preview: "#00695C", layout: "single", fontBody: "'Trebuchet MS', sans-serif", fontHeading: "'Trebuchet MS', sans-serif", defaultAccent: "#00695C", headerAlign: "left", sectionStyle: "line", bulletStyle: "disc" },
  { id: "projm-pmo", name: "PMO Director", category: "project_management", description: "PMO leadership and governance", preview: "#212121", layout: "banner", fontBody: "'Georgia', serif", fontHeading: "'Palatino', serif", defaultAccent: "#212121", headerAlign: "left", sectionStyle: "bold", bulletStyle: "disc" },
];

// All factory-generated templates combined
export const allCategoryTemplates = [
  ...marketingTemplates,
  ...salesTemplates,
  ...consultingTemplates,
  ...pmTemplates,
  ...newTechTemplates,
  ...hrTemplates,
  ...freshersTemplates,
  ...newGenericTemplates,
  ...financeTemplates,
  ...operationsTemplates,
  ...projectManagementTemplates,
];
