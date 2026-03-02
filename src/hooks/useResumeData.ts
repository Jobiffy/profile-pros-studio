import { useState, useCallback } from "react";
import { ResumeData } from "@/types/resume";
import { sampleResume } from "@/data/sampleResume";

export function useResumeData() {
  const [resumeData, setResumeData] = useState<ResumeData>({ ...sampleResume });

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
  }, []);

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

  return {
    resumeData,
    setResumeData,
    updateField,
    updateHeader,
    updateSummary,
    updateExperience,
    updateEducation,
  };
}
