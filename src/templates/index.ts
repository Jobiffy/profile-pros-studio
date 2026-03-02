import { TemplateInfo } from "@/types/resume";
import { ClassicExecutive } from "./ClassicExecutive";
import { ConsultingPro } from "./ConsultingPro";
import { StrategyMinimal } from "./StrategyMinimal";
import { FinanceSidebar } from "./FinanceSidebar";
import { LeadershipBold } from "./LeadershipBold";
import { DeveloperCode } from "./DeveloperCode";
import { StartupModern } from "./StartupModern";
import { EngineeringGrid } from "./EngineeringGrid";
import { DataScience } from "./DataScience";
import { DevOpsTerminal } from "./DevOpsTerminal";
import { ModernClean } from "./ModernClean";
import { CreativeColor } from "./CreativeColor";
import { ProfessionalClassic } from "./ProfessionalClassic";
import { MinimalistType } from "./MinimalistType";
import { ElegantRefined } from "./ElegantRefined";
import { ResumeData } from "@/types/resume";
import React from "react";

export const templateComponents: Record<string, React.FC<{ data: ResumeData }>> = {
  "classic-executive": ClassicExecutive,
  "consulting-pro": ConsultingPro,
  "strategy-minimal": StrategyMinimal,
  "finance-sidebar": FinanceSidebar,
  "leadership-bold": LeadershipBold,
  "developer-code": DeveloperCode,
  "startup-modern": StartupModern,
  "engineering-grid": EngineeringGrid,
  "data-science": DataScience,
  "devops-terminal": DevOpsTerminal,
  "modern-clean": ModernClean,
  "creative-color": CreativeColor,
  "professional-classic": ProfessionalClassic,
  "minimalist-type": MinimalistType,
  "elegant-refined": ElegantRefined,
};

export const templateList: TemplateInfo[] = [
  { id: "classic-executive", name: "Classic Executive", category: "mba", description: "Traditional serif layout, conservative and professional", preview: "#1a1a1a" },
  { id: "consulting-pro", name: "Consulting Pro", category: "mba", description: "Structured format with green accents and impact focus", preview: "#0B3D2E" },
  { id: "strategy-minimal", name: "Strategy Minimal", category: "mba", description: "Modern minimalist with gold accent bars", preview: "#C4975C" },
  { id: "finance-sidebar", name: "Finance Sidebar", category: "mba", description: "Two-column dark sidebar for finance roles", preview: "#0a1628" },
  { id: "leadership-bold", name: "Leadership Bold", category: "mba", description: "Bold headers with career timeline layout", preview: "#8B0000" },
  { id: "developer-code", name: "Developer Code", category: "tech", description: "Code editor inspired with syntax highlighting", preview: "#1e1e2e" },
  { id: "startup-modern", name: "Startup Modern", category: "tech", description: "Colorful modern design with skill tags", preview: "#3b63f7" },
  { id: "engineering-grid", name: "Engineering Grid", category: "tech", description: "Clean grid layout for technical roles", preview: "#2563eb" },
  { id: "data-science", name: "Data Science", category: "tech", description: "Metrics-focused with data visualization style", preview: "#059669" },
  { id: "devops-terminal", name: "DevOps Terminal", category: "tech", description: "Terminal/CLI inspired dark theme", preview: "#0d0d0d" },
  { id: "modern-clean", name: "Modern Clean", category: "generic", description: "Minimalist with generous whitespace", preview: "#f5f5f5" },
  { id: "creative-color", name: "Creative Color", category: "generic", description: "Asymmetric layout with gradient accents", preview: "#f97316" },
  { id: "professional-classic", name: "Professional Classic", category: "generic", description: "Classic two-column with skill bars", preview: "#2d3748" },
  { id: "minimalist-type", name: "Minimalist Type", category: "generic", description: "Ultra-clean typography-focused design", preview: "#333333" },
  { id: "elegant-refined", name: "Elegant Refined", category: "generic", description: "Refined serif typography with gold accents", preview: "#d4af37" },
];
