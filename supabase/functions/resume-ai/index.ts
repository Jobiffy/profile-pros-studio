import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, resumeData, jobDescription, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resumeText = formatResumeForAI(resumeData);

    let systemPrompt = "";
    let userPrompt = "";
    let useStream = false;
    let useTools = false;
    let tools: any[] = [];
    let toolChoice: any = undefined;

    if (action === "ats-score") {
      useTools = true;
      systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume and provide a detailed ATS compatibility score. Consider formatting, keyword optimization, section organization, quantified achievements, and overall readability.`;
      userPrompt = `Analyze this resume for ATS compatibility:\n\n${resumeText}`;
      tools = [{
        type: "function",
        function: {
          name: "ats_analysis",
          description: "Return ATS analysis results",
          parameters: {
            type: "object",
            properties: {
              overallScore: { type: "number", description: "Overall ATS score 0-100" },
              categories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    score: { type: "number" },
                    feedback: { type: "string" },
                    suggestions: { type: "array", items: { type: "string" } }
                  },
                  required: ["name", "score", "feedback", "suggestions"]
                }
              },
              topStrengths: { type: "array", items: { type: "string" } },
              criticalIssues: { type: "array", items: { type: "string" } },
              quickWins: { type: "array", items: { type: "string" } }
            },
            required: ["overallScore", "categories", "topStrengths", "criticalIssues", "quickWins"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "ats_analysis" } };

    } else if (action === "jd-match") {
      if (!jobDescription) throw new Error("Job description is required");
      useTools = true;
      systemPrompt = `You are an expert resume-job description matching analyst. Compare the resume against the job description and provide a detailed match analysis.`;
      userPrompt = `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nAnalyze the match between this resume and job description.`;
      tools = [{
        type: "function",
        function: {
          name: "jd_match_analysis",
          description: "Return JD match analysis",
          parameters: {
            type: "object",
            properties: {
              matchScore: { type: "number", description: "Match percentage 0-100" },
              matchedKeywords: { type: "array", items: { type: "string" } },
              missingKeywords: { type: "array", items: { type: "string" } },
              experienceMatch: { type: "string" },
              skillsGap: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              sectionFeedback: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    section: { type: "string" },
                    score: { type: "number" },
                    feedback: { type: "string" }
                  },
                  required: ["section", "score", "feedback"]
                }
              }
            },
            required: ["matchScore", "matchedKeywords", "missingKeywords", "experienceMatch", "skillsGap", "recommendations", "sectionFeedback"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "jd_match_analysis" } };

    } else if (action === "chat") {
      useStream = true;
      systemPrompt = `You are an AI resume assistant for Jobiffy. You help users improve their resumes. When the user asks to modify their resume, provide the updated content clearly.

When you need to suggest resume modifications, wrap them in a JSON code block like this:
\`\`\`json:resume-update
{
  "field": "summary",
  "value": "new summary text"
}
\`\`\`

Or for array fields like experience bullets:
\`\`\`json:resume-update
{
  "field": "experience[0].bullets",
  "value": ["bullet 1", "bullet 2", "bullet 3"]
}
\`\`\`

Be conversational, helpful, and proactive. Suggest improvements even if not asked.`;
      userPrompt = ""; // will use messages array

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    const aiMessages: any[] = [{ role: "system", content: systemPrompt }];

    if (action === "chat" && messages) {
      // Add resume context as first user message
      aiMessages.push({ role: "user", content: `Here is my current resume data:\n${resumeText}` });
      aiMessages.push({ role: "assistant", content: "I've reviewed your resume. How can I help you improve it?" });
      aiMessages.push(...messages);
    } else {
      aiMessages.push({ role: "user", content: userPrompt });
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: aiMessages,
    };

    if (useStream) body.stream = true;
    if (useTools) {
      body.tools = tools;
      body.tool_choice = toolChoice;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    if (useStream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();

    if (useTools) {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const result = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ content: data.choices?.[0]?.message?.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("resume-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatResumeForAI(data: any): string {
  if (!data) return "No resume data provided";
  const lines: string[] = [];
  const h = data.header || {};
  lines.push(`Name: ${h.name || ""}`);
  lines.push(`Title: ${h.title || ""}`);
  lines.push(`Email: ${h.email || ""} | Phone: ${h.phone || ""}`);
  if (h.location) lines.push(`Location: ${h.location}`);
  if (h.linkedin) lines.push(`LinkedIn: ${h.linkedin}`);
  lines.push("");
  if (data.summary) lines.push(`SUMMARY\n${data.summary}\n`);
  if (data.experience?.length) {
    lines.push("EXPERIENCE");
    for (const exp of data.experience) {
      lines.push(`${exp.title} at ${exp.company} (${exp.startDate}–${exp.endDate})`);
      for (const b of exp.bullets || []) lines.push(`  • ${b}`);
    }
    lines.push("");
  }
  if (data.education?.length) {
    lines.push("EDUCATION");
    for (const edu of data.education) {
      lines.push(`${edu.degree} – ${edu.school} (${edu.startDate}–${edu.endDate})${edu.gpa ? ` GPA: ${edu.gpa}` : ""}`);
    }
    lines.push("");
  }
  if (data.skills?.length) {
    lines.push("SKILLS");
    for (const s of data.skills) lines.push(`${s.category}: ${s.items.join(", ")}`);
    lines.push("");
  }
  if (data.projects?.length) {
    lines.push("PROJECTS");
    for (const p of data.projects) {
      lines.push(`${p.name} – ${p.description}`);
      for (const b of p.bullets || []) lines.push(`  • ${b}`);
    }
    lines.push("");
  }
  if (data.certifications?.length) {
    lines.push("CERTIFICATIONS");
    for (const c of data.certifications) lines.push(`  • ${c}`);
  }
  return lines.join("\n");
}
