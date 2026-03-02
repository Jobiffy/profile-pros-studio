import { useState, useCallback } from "react";
import { ResumeData } from "@/types/resume";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ATSResult {
  overallScore: number;
  categories: { name: string; score: number; feedback: string; suggestions: string[] }[];
  topStrengths: string[];
  criticalIssues: string[];
  quickWins: string[];
}

export interface JDMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  experienceMatch: string;
  skillsGap: string[];
  recommendations: string[];
  sectionFeedback: { section: string; score: number; feedback: string }[];
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function useResumeAI(resumeData: ResumeData) {
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const analyzeATS = useCallback(async () => {
    setAtsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "ats-score", resumeData },
      });
      if (error) throw error;
      setAtsResult(data);
    } catch (e: any) {
      toast({ title: "ATS Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      setAtsLoading(false);
    }
  }, [resumeData]);

  const matchJD = useCallback(async (jobDescription: string) => {
    setJdLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "jd-match", resumeData, jobDescription },
      });
      if (error) throw error;
      setJdResult(data);
    } catch (e: any) {
      toast({ title: "JD Match Failed", description: e.message, variant: "destructive" });
    } finally {
      setJdLoading(false);
    }
  }, [resumeData]);

  const tailorResume = useCallback(async (jobDescription: string): Promise<ResumeData | null> => {
    setTailorLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "tailor-resume", resumeData, jobDescription },
      });
      if (error) throw error;
      toast({ title: "Resume Tailored!", description: "Your resume has been optimized for this job. Review the changes." });
      return data as ResumeData;
    } catch (e: any) {
      toast({ title: "Tailoring Failed", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setTailorLoading(false);
    }
  }, [resumeData]);

  const sendChatMessage = useCallback(async (
    userMessage: string,
    onResumeUpdate?: (field: string, value: any) => void
  ) => {
    const userMsg: ChatMessage = { role: "user", content: userMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    let assistantContent = "";
    const allMessages = [...chatMessages, userMsg];

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "chat",
          resumeData,
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Chat request failed");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* partial json */ }
        }
      }

      // Parse resume updates from the response
      if (onResumeUpdate && assistantContent) {
        const updateRegex = /```json:resume-update\n([\s\S]*?)```/g;
        let match;
        while ((match = updateRegex.exec(assistantContent)) !== null) {
          try {
            const update = JSON.parse(match[1]);
            if (update.field && update.value !== undefined) {
              onResumeUpdate(update.field, update.value);
            }
          } catch { /* ignore parse errors */ }
        }
      }

    } catch (e: any) {
      toast({ title: "Chat Error", description: e.message, variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  }, [chatMessages, resumeData]);

  return {
    atsResult, atsLoading, analyzeATS,
    jdResult, jdLoading, matchJD,
    tailorLoading, tailorResume,
    chatMessages, chatLoading, sendChatMessage,
    setChatMessages,
  };
}
