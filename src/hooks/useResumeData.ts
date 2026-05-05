import { useState, useCallback, useRef } from "react";
import { ResumeData, ResumeColorPalette, COLOR_PALETTES } from "@/types/resume";
import { sampleResume } from "@/data/sampleResume";

const MAX_HISTORY = 50;

export function useResumeData() {
  const [resumeData, setResumeData] = useState<ResumeData>({ ...sampleResume });
  const [colorPalette, setColorPalette] = useState<ResumeColorPalette>(COLOR_PALETTES[0]);
  const [customColor, setCustomColor] = useState("#0B6E4F");
  const [changedFields, setChangedFields] = useState<Map<string, string>>(new Map());
  const [showChanges, setShowChanges] = useState(false);
  const prevDataRef = useRef<string>(JSON.stringify(sampleResume));

  // Undo/Redo history
  const historyRef = useRef<string[]>([JSON.stringify(sampleResume)]);
  const historyIndexRef = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0); // trigger re-render for canUndo/canRedo

  const pushHistory = useCallback((data: ResumeData) => {
    const serialized = JSON.stringify(data);
    const current = historyRef.current[historyIndexRef.current];
    if (serialized === current) return; // no change
    // Truncate any redo history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(serialized);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
    setHistoryVersion(v => v + 1);
  }, []);

  const setResumeDataWithHistory = useCallback((updater: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const data = JSON.parse(historyRef.current[historyIndexRef.current]);
    setResumeData(data);
    setHistoryVersion(v => v + 1);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const data = JSON.parse(historyRef.current[historyIndexRef.current]);
    setResumeData(data);
    setHistoryVersion(v => v + 1);
  }, []);

  const resetHistory = useCallback((data?: ResumeData) => {
    const snapshot = data ? JSON.stringify(data) : JSON.stringify(sampleResume);
    historyRef.current = [snapshot];
    historyIndexRef.current = 0;
    setHistoryVersion(v => v + 1);
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const markChanged = useCallback((field: string, changeType: string = "content") => {
    setChangedFields(prev => new Map([...prev, [field, changeType]]));
  }, []);

  const clearChanges = useCallback(() => {
    setChangedFields(new Map());
  }, []);

  const updateField = useCallback((field: string, value: unknown) => {
    setResumeDataWithHistory(prev => {
      const next = structuredClone(prev);
      const parts = field.match(/([^[.\]]+)/g);
      if (!parts) return prev;
      let target: unknown = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
        target = (target as Record<string, unknown>)[key as string];
        if (target == null) return prev;
      }
      const lastKey = isNaN(Number(parts[parts.length - 1])) ? parts[parts.length - 1] : Number(parts[parts.length - 1]);
      (target as Record<string, unknown>)[lastKey as string] = value;
      return next;
    });
    markChanged(field);
  }, [markChanged, setResumeDataWithHistory]);

  const updateHeader = useCallback((key: keyof ResumeData["header"], value: string) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      header: { ...prev.header, [key]: value },
    }));
  }, [setResumeDataWithHistory]);

  const updateSummary = useCallback((value: string) => {
    setResumeDataWithHistory(prev => ({ ...prev, summary: value }));
  }, [setResumeDataWithHistory]);

  const updateExperience = useCallback((index: number, field: string, value: unknown) => {
    setResumeDataWithHistory(prev => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experience: exp };
    });
  }, [setResumeDataWithHistory]);

  const updateEducation = useCallback((index: number, field: string, value: unknown) => {
    setResumeDataWithHistory(prev => {
      const edu = [...prev.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...prev, education: edu };
    });
  }, [setResumeDataWithHistory]);

  const addExperience = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      experience: [...prev.experience, { title: "", company: "", location: "", startDate: "", endDate: "Present", bullets: [""] }],
    }));
  }, [setResumeDataWithHistory]);

  const removeExperience = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

  const addEducation = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", school: "", location: "", startDate: "", endDate: "" }],
    }));
  }, [setResumeDataWithHistory]);

  const removeEducation = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

  const addSkillCategory = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      skills: [...prev.skills, { category: "New Category", items: [] }],
    }));
  }, [setResumeDataWithHistory]);

  const removeSkillCategory = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

  const addProject = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { name: "", description: "", tech: "", bullets: [""] }],
    }));
  }, [setResumeDataWithHistory]);

  const removeProject = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

  const addCertification = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), ""],
    }));
  }, [setResumeDataWithHistory]);

  const removeCertification = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

  const addLeadership = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      leadership: [...(prev.leadership || []), { role: "", org: "", date: "", bullets: [""] }],
    }));
  }, [setResumeDataWithHistory]);

  const removeLeadership = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      leadership: (prev.leadership || []).filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

  const addBullet = useCallback((section: "experience" | "projects" | "leadership", index: number) => {
    setResumeDataWithHistory(prev => {
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
  }, [setResumeDataWithHistory]);

  const removeBullet = useCallback((section: "experience" | "projects" | "leadership", itemIndex: number, bulletIndex: number) => {
    setResumeDataWithHistory(prev => {
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
  }, [setResumeDataWithHistory]);

  const addCustomSection = useCallback(() => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), { title: "New Section", items: [{ subtitle: "", description: "", bullets: [""] }] }],
    }));
  }, [setResumeDataWithHistory]);

  const removeCustomSection = useCallback((index: number) => {
    setResumeDataWithHistory(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter((_, i) => i !== index),
    }));
  }, [setResumeDataWithHistory]);

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
    setResumeData: setResumeDataWithHistory,
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
    // Undo/Redo
    undo, redo, canUndo, canRedo, resetHistory,
  };
}
