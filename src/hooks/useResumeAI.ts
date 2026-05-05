import { useState, useCallback, useRef, useEffect } from "react";
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
  arguments: Record<string, unknown>;
}

// Per-tool argument shape used to narrow arguments when dispatching tool calls
// from the chat handler. The server-side Gemini tool schema enforces these.
type ToolArgs = {
  update_section: { field: string; value: unknown; change_type?: string };
  reorder_sections: { section_order: string[] };
  toggle_section: { section_id: string; visible: boolean };
  add_item: { section: string; item: unknown };
  remove_item: { section: string; index: number };
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  tool_calls?: ToolCallAction[];
  appliedActions?: string[]; // human-readable descriptions of applied actions
};

export function useResumeAI(resumeData: ResumeData, resumeId: string) {
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Mirror state in refs so sendChatMessage's identity stays stable. Without
  // these the callback would be recreated on every keystroke (resumeData),
  // every message (chatMessages), and every loading toggle, cascading
  // unnecessary re-renders down to AIChatPanel.
  // resumeIdRef gates the in-flight chat response: if the user switches
  // resumes mid-call, the response (and any tool-call dispatch) is dropped
  // so it doesn't apply to a different resume.
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const chatLoadingRef = useRef(false);
  const resumeDataRef = useRef(resumeData);
  const resumeIdRef = useRef(resumeId);
  useEffect(() => { chatMessagesRef.current = chatMessages; }, [chatMessages]);
  useEffect(() => { chatLoadingRef.current = chatLoading; }, [chatLoading]);
  useEffect(() => { resumeDataRef.current = resumeData; }, [resumeData]);
  useEffect(() => { resumeIdRef.current = resumeId; }, [resumeId]);

  const analyzeATS = useCallback(async () => {
    setAtsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "ats-score", resumeData: resumeDataRef.current },
      });
      if (error) throw error;
      setAtsResult(data);
    } catch (e) {
      toast({ title: "ATS Analysis Failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setAtsLoading(false);
    }
  }, []);

  const matchJD = useCallback(async (jobDescription: string) => {
    setJdLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "jd-match", resumeData: resumeDataRef.current, jobDescription },
      });
      if (error) throw error;
      setJdResult(data);
    } catch (e) {
      toast({ title: "JD Match Failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setJdLoading(false);
    }
  }, []);

  const tailorResume = useCallback(async (jobDescription: string): Promise<ResumeData | null> => {
    setTailorLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "tailor-resume", resumeData: resumeDataRef.current, jobDescription },
      });
      if (error) throw error;
      toast({ title: "Resume Tailored!", description: "Your resume has been optimized for this job. Review the changes." });
      return data as ResumeData;
    } catch (e) {
      toast({ title: "Tailoring Failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      return null;
    } finally {
      setTailorLoading(false);
    }
  }, []);

  const sendChatMessage = useCallback(async (
    userMessage: string,
    handlers?: {
      onUpdateField?: (field: string, value: unknown) => void;
      onReorderSections?: (order: string[]) => void;
      onToggleSection?: (sectionId: string, visible: boolean) => void;
      onAddItem?: (section: string, item: unknown) => void;
      onRemoveItem?: (section: string, index: number) => void;
      onMarkChanged?: (field: string, changeType?: string) => void;
      onSetShowChanges?: (show: boolean) => void;
    }
  ) => {
    if (chatLoadingRef.current) return;
    // Snapshot the active resume id at send time. If the user switches
    // resumes before the response arrives, we drop it instead of letting
    // the assistant message + tool-call dispatch land on the wrong resume.
    const sentForResumeId = resumeIdRef.current;
    const userMsg: ChatMessage = { role: "user", content: userMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const allMessages = [...chatMessagesRef.current, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "chat", resumeData: resumeDataRef.current, messages: allMessages },
      });

      // Drop the response if the user has switched resumes mid-call. The
      // user message was already persisted to the original resume's chat
      // history before the switch; the orphaned reply just doesn't land.
      if (resumeIdRef.current !== sentForResumeId) return;

      if (error) {
        console.error("Chat invoke error:", error);
        throw new Error(typeof error === "object" && error.message ? error.message : "Failed to get AI response");
      }

      if (!data) throw new Error("No response from AI");

      const appliedActions: string[] = [];
      const toolCalls: ToolCallAction[] = data.tool_calls || [];

      // Execute tool calls
      for (const tc of toolCalls) {
        switch (tc.name) {
          case "update_section": {
            const a = tc.arguments as ToolArgs["update_section"];
            if (handlers?.onUpdateField) {
              handlers.onUpdateField(a.field, a.value);
              const changeType = a.change_type || "content";
              // Store the FULL field path for granular highlighting
              handlers?.onMarkChanged?.(a.field, changeType);
              const typeLabels: Record<string, string> = { grammar: "📝", content: "✏️", keyword: "🔑", formatting: "🎨" };
              appliedActions.push(`${typeLabels[changeType] || "✏️"} Updated **${a.field}** (${changeType})`);
            }
            break;
          }
          case "reorder_sections": {
            const a = tc.arguments as ToolArgs["reorder_sections"];
            if (handlers?.onReorderSections) {
              handlers.onReorderSections(a.section_order);
              appliedActions.push(`🔀 Reordered sections: ${a.section_order.join(" → ")}`);
            }
            break;
          }
          case "toggle_section": {
            const a = tc.arguments as ToolArgs["toggle_section"];
            if (handlers?.onToggleSection) {
              handlers.onToggleSection(a.section_id, a.visible);
              appliedActions.push(`${a.visible ? "👁️ Showed" : "🙈 Hidden"} **${a.section_id}** section`);
            }
            break;
          }
          case "add_item": {
            const a = tc.arguments as ToolArgs["add_item"];
            if (handlers?.onAddItem) {
              handlers.onAddItem(a.section, a.item);
              handlers?.onMarkChanged?.(a.section);
              appliedActions.push(`➕ Added new item to **${a.section}**`);
            }
            break;
          }
          case "remove_item": {
            const a = tc.arguments as ToolArgs["remove_item"];
            if (handlers?.onRemoveItem) {
              handlers.onRemoveItem(a.section, a.index);
              handlers?.onMarkChanged?.(a.section);
              appliedActions.push(`🗑️ Removed item ${a.index} from **${a.section}**`);
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

    } catch (e) {
      // Only surface the error toast if we're still on the resume that
      // sent the request — a "Chat Error" pop on resume B for a failure
      // that happened on A would be confusing.
      if (resumeIdRef.current === sentForResumeId) {
        toast({ title: "Chat Error", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    } finally {
      if (resumeIdRef.current === sentForResumeId) {
        setChatLoading(false);
      }
    }
  }, []);

  return {
    atsResult, atsLoading, analyzeATS,
    jdResult, jdLoading, matchJD,
    tailorLoading, tailorResume,
    chatMessages, chatLoading, sendChatMessage,
    setChatMessages,
  };
}
