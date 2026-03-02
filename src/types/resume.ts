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
}

export interface TemplateInfo {
  id: string;
  name: string;
  category: 'mba' | 'tech' | 'generic';
  description: string;
  preview: string; // color accent for preview card
}
