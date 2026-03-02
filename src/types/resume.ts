export interface ResumeData {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    location?: string;
    website?: string;
  };
  summary: string;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    details?: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects?: {
    name: string;
    description: string;
    tech?: string;
    bullets: string[];
  }[];
  certifications?: string[];
  leadership?: {
    role: string;
    org: string;
    date: string;
    bullets: string[];
  }[];
  customSections?: {
    title: string;
    items: {
      subtitle?: string;
      description?: string;
      bullets?: string[];
    }[];
  }[];
}

export interface TemplateInfo {
  id: string;
  name: string;
  category: 'mba' | 'tech' | 'generic';
  description: string;
  preview: string; // color accent for preview card
}

export interface ResumeColorPalette {
  id: string;
  name: string;
  accent: string;       // main accent color (hex)
  accentLight: string;  // lighter version
  accentDark: string;   // darker version
  headerBg?: string;    // optional header background
  sidebarBg?: string;   // optional sidebar background
}

export const COLOR_PALETTES: ResumeColorPalette[] = [
  {
    id: "emerald",
    name: "Emerald Professional",
    accent: "#0B6E4F",
    accentLight: "#E6F5F0",
    accentDark: "#084C37",
  },
  {
    id: "navy",
    name: "Navy Executive",
    accent: "#1B3A5C",
    accentLight: "#E8EEF5",
    accentDark: "#0F2440",
  },
  {
    id: "burgundy",
    name: "Burgundy Classic",
    accent: "#7A1B3D",
    accentLight: "#F5E6EC",
    accentDark: "#5A1230",
  },
  {
    id: "slate",
    name: "Slate Modern",
    accent: "#3D4F5F",
    accentLight: "#EDF0F3",
    accentDark: "#2A3640",
  },
  {
    id: "golden",
    name: "Golden Prestige",
    accent: "#B8860B",
    accentLight: "#FDF5E6",
    accentDark: "#8B6508",
  },
];
