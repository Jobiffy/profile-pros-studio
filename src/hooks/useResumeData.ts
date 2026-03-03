import { useState, useCallback, useRef } from "react";
import { ResumeData, ResumeColorPalette, COLOR_PALETTES } from "@/types/resume";
import { sampleResume } from "@/data/sampleResume";

export function useResumeData() {
  const [resumeData, setResumeData] = useState<ResumeData>({ ...sampleResume });
  const [colorPalette, setColorPalette] = useState<ResumeColorPalette>(COLOR_PALETTES[0]);
  const [customColor, setCustomColor] = useState("#0B6E4F");
  const [changedFields, setChangedFields] = useState<Map<string, string>>(new Map());
  const [showChanges, setShowChanges] = useState(false);
  const prevDataRef = useRef<string>(JSON.stringify(sampleResume));

  const markChanged = useCallback((field: string, changeType: string = "content") => {
    setChangedFields(prev => new Map([...prev, [field, changeType]]));
  }, []);

  const clearChanges = useCallback(() => {
    setChangedFields(new Map());
  }, []);

  const updateField = useCallback((field: string, value: any) => {
    setResumeData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = field.match(/([^[.\]]+)/g);
      if (!parts) return prev;
      let target: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
        target = target[key];
        if (!target) return prev;
      }
      const lastKey = isNaN(Number(parts[parts.length - 1])) ? parts[parts.length - 1] : Number(parts[parts.length - 1]);
      target[lastKey] = value;
      return next;
    });
    markChanged(field);
  }, [markChanged]);

  const updateHeader = useCallback((key: keyof ResumeData["header"], value: string) => {
    setResumeData(prev => ({
      ...prev,
      header: { ...prev.header, [key]: value },
    }));
  }, []);

  const updateSummary = useCallback((value: string) => {
    setResumeData(prev => ({ ...prev, summary: value }));
  }, []);

  const updateExperience = useCallback((index: number, field: string, value: any) => {
    setResumeData(prev => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experience: exp };
    });
  }, []);

  const updateEducation = useCallback((index: number, field: string, value: any) => {
    setResumeData(prev => {
      const edu = [...prev.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...prev, education: edu };
    });
  }, []);

  // Add/Remove operations
  const addExperience = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: "", company: "", location: "", startDate: "", endDate: "Present", bullets: [""] }],
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", school: "", location: "", startDate: "", endDate: "" }],
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const addSkillCategory = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { category: "New Category", items: [] }],
    }));
  }, []);

  const removeSkillCategory = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const addProject = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { name: "", description: "", tech: "", bullets: [""] }],
    }));
  }, []);

  const removeProject = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));
  }, []);

  const addCertification = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), ""],
    }));
  }, []);

  const removeCertification = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }));
  }, []);

  const addLeadership = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      leadership: [...(prev.leadership || []), { role: "", org: "", date: "", bullets: [""] }],
    }));
  }, []);

  const removeLeadership = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      leadership: (prev.leadership || []).filter((_, i) => i !== index),
    }));
  }, []);

  const addBullet = useCallback((section: "experience" | "projects" | "leadership", index: number) => {
    setResumeData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (section === "experience") {
        next.experience[index].bullets.push("");
      } else if (section === "projects" && next.projects) {
        next.projects[index].bullets.push("");
      } else if (section === "leadership" && next.leadership) {
        next.leadership[index].bullets.push("");
      }
      return next;
    });
  }, []);

  const removeBullet = useCallback((section: "experience" | "projects" | "leadership", itemIndex: number, bulletIndex: number) => {
    setResumeData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (section === "experience") {
        next.experience[itemIndex].bullets.splice(bulletIndex, 1);
      } else if (section === "projects" && next.projects) {
        next.projects[itemIndex].bullets.splice(bulletIndex, 1);
      } else if (section === "leadership" && next.leadership) {
        next.leadership[itemIndex].bullets.splice(bulletIndex, 1);
      }
      return next;
    });
  }, []);

  const addCustomSection = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), { title: "New Section", items: [{ subtitle: "", description: "", bullets: [""] }] }],
    }));
  }, []);

  const removeCustomSection = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter((_, i) => i !== index),
    }));
  }, []);

  const applyCustomColor = useCallback((hex: string) => {
    setCustomColor(hex);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setColorPalette({
      id: "custom",
      name: "Custom",
      accent: hex,
      accentLight: `rgba(${r}, ${g}, ${b}, 0.08)`,
      accentDark: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`,
    });
  }, []);

  return {
    resumeData,
    setResumeData,
    updateField,
    updateHeader,
    updateSummary,
    updateExperience,
    updateEducation,
    // Add/Remove
    addExperience, removeExperience,
    addEducation, removeEducation,
    addSkillCategory, removeSkillCategory,
    addProject, removeProject,
    addCertification, removeCertification,
    addLeadership, removeLeadership,
    addBullet, removeBullet,
    addCustomSection, removeCustomSection,
    // Color
    colorPalette, setColorPalette,
    customColor, applyCustomColor,
    // Changes
    changedFields, showChanges, setShowChanges, clearChanges, markChanged,
  };
}
