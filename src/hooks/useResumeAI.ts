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

export interface ToolCallAction {
  id: string;
  name: string;
  arguments: any;
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  tool_calls?: ToolCallAction[];
  appliedActions?: string[]; // human-readable descriptions of applied actions
};

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
    handlers?: {
      onUpdateField?: (field: string, value: any) => void;
      onReorderSections?: (order: string[]) => void;
      onToggleSection?: (sectionId: string, visible: boolean) => void;
      onAddItem?: (section: string, item: any) => void;
      onRemoveItem?: (section: string, index: number) => void;
      onMarkChanged?: (field: string, changeType?: string) => void;
      onSetShowChanges?: (show: boolean) => void;
    }
  ) => {
    const userMsg: ChatMessage = { role: "user", content: userMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const allMessages = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Use supabase.functions.invoke — same as ATS/JD which work fine
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "chat", resumeData, messages: allMessages },
      });

      if (error) {
        console.error("Chat invoke error:", error);
        throw new Error(typeof error === "object" && error.message ? error.message : "Failed to get AI response");
      }

      if (!data) throw new Error("No response from AI");

      const appliedActions: string[] = [];
      const toolCalls: ToolCallAction[] = data.tool_calls || [];

      // Execute tool calls
      for (const tc of toolCalls) {
        const args = tc.arguments;
        switch (tc.name) {
          case "update_section": {
            if (handlers?.onUpdateField) {
              handlers.onUpdateField(args.field, args.value);
              const changeType = args.change_type || "content";
              handlers?.onMarkChanged?.(args.field.split("[")[0].split(".")[0], changeType);
              const typeLabels: Record<string, string> = { grammar: "📝", content: "✏️", keyword: "🔑", formatting: "🎨" };
              appliedActions.push(`${typeLabels[changeType] || "✏️"} Updated **${args.field}** (${changeType})`);
            }
            break;
          }
          case "reorder_sections": {
            if (handlers?.onReorderSections) {
              handlers.onReorderSections(args.section_order);
              appliedActions.push(`🔀 Reordered sections: ${args.section_order.join(" → ")}`);
            }
            break;
          }
          case "toggle_section": {
            if (handlers?.onToggleSection) {
              handlers.onToggleSection(args.section_id, args.visible);
              appliedActions.push(`${args.visible ? "👁️ Showed" : "🙈 Hidden"} **${args.section_id}** section`);
            }
            break;
          }
          case "add_item": {
            if (handlers?.onAddItem) {
              handlers.onAddItem(args.section, args.item);
              handlers?.onMarkChanged?.(args.section);
              appliedActions.push(`➕ Added new item to **${args.section}**`);
            }
            break;
          }
          case "remove_item": {
            if (handlers?.onRemoveItem) {
              handlers.onRemoveItem(args.section, args.index);
              handlers?.onMarkChanged?.(args.section);
              appliedActions.push(`🗑️ Removed item ${args.index} from **${args.section}**`);
            }
            break;
          }
        }
      }

      // Show changes if any actions were applied
      if (appliedActions.length > 0) {
        handlers?.onSetShowChanges?.(true);
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "",
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        appliedActions: appliedActions.length > 0 ? appliedActions : undefined,
      };

      setChatMessages(prev => [...prev, assistantMsg]);

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
