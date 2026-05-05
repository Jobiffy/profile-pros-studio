import { useState, useCallback, useEffect } from "react";
import { ResumeData } from "@/types/resume";
import { ChatMessage } from "@/hooks/useResumeAI";
import { sampleResume } from "@/data/sampleResume";

export interface SavedResume {
  id: string;
  name: string;
  data: ResumeData;
  chatMessages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "jobiffy-resumes";
const ACTIVE_KEY = "jobiffy-active-resume";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadResumes(): SavedResume[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* localStorage unavailable; fall through to default */ }
  // Default: one resume
  const defaultResume: SavedResume = {
    id: generateId(),
    name: "My Resume",
    data: { ...sampleResume },
    chatMessages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return [defaultResume];
}

function saveResumes(resumes: SavedResume[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch { /* localStorage unavailable; fall through to default */ }
}

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveActiveId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch { /* localStorage unavailable; fall through to default */ }
}

export function useResumeStore() {
  const [resumes, setResumes] = useState<SavedResume[]>(loadResumes);
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = loadActiveId();
    const list = loadResumes();
    if (saved && list.find(r => r.id === saved)) return saved;
    return list[0]?.id || "";
  });

  // Persist on change
  useEffect(() => {
    saveResumes(resumes);
  }, [resumes]);

  useEffect(() => {
    saveActiveId(activeId);
  }, [activeId]);

  const activeResume = resumes.find(r => r.id === activeId) || resumes[0];

  const updateActiveResume = useCallback((update: Partial<SavedResume>) => {
    setResumes(prev => prev.map(r => r.id === activeId ? { ...r, ...update, updatedAt: Date.now() } : r));
  }, [activeId]);

  const updateActiveData = useCallback((data: ResumeData) => {
    updateActiveResume({ data });
  }, [updateActiveResume]);

  const updateActiveChatMessages = useCallback((chatMessages: ChatMessage[]) => {
    updateActiveResume({ chatMessages });
  }, [updateActiveResume]);

  const addResume = useCallback((name: string, data?: ResumeData) => {
    const newResume: SavedResume = {
      id: generateId(),
      name,
      data: data || { ...sampleResume },
      chatMessages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setResumes(prev => [...prev, newResume]);
    setActiveId(newResume.id);
    return newResume.id;
  }, []);

  const deleteResume = useCallback((id: string) => {
    setResumes(prev => {
      if (prev.length <= 1) return prev; // Don't delete last resume
      const next = prev.filter(r => r.id !== id);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  const renameResume = useCallback((id: string, name: string) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, name, updatedAt: Date.now() } : r));
  }, []);

  const switchResume = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return {
    resumes,
    activeResume,
    activeId,
    updateActiveData,
    updateActiveChatMessages,
    addResume,
    deleteResume,
    renameResume,
    switchResume,
  };
}
