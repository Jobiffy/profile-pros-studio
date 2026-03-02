import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const resumeToolSchema = {
  type: "function",
  function: {
    name: "parsed_resume",
    description: "Return the parsed/optimized resume data",
    parameters: {
      type: "object",
      properties: {
        header: {
          type: "object",
          properties: {
            name: { type: "string" }, title: { type: "string" }, email: { type: "string" },
            phone: { type: "string" }, linkedin: { type: "string" }, github: { type: "string" },
            location: { type: "string" }, website: { type: "string" },
          },
          required: ["name", "title", "email", "phone"]
        },
        summary: { type: "string" },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" }, company: { type: "string" }, location: { type: "string" },
              startDate: { type: "string" }, endDate: { type: "string" },
              bullets: { type: "array", items: { type: "string" } }
            },
            required: ["title", "company", "location", "startDate", "endDate", "bullets"]
          }
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" }, school: { type: "string" }, location: { type: "string" },
              startDate: { type: "string" }, endDate: { type: "string" }, gpa: { type: "string" }
            },
            required: ["degree", "school", "location", "startDate", "endDate"]
          }
        },
        skills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              items: { type: "array", items: { type: "string" } }
            },
            required: ["category", "items"]
          }
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" }, description: { type: "string" },
              tech: { type: "string" }, bullets: { type: "array", items: { type: "string" } }
            },
            required: ["name", "description", "bullets"]
          }
        },
        certifications: { type: "array", items: { type: "string" } },
        leadership: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" }, org: { type: "string" },
              date: { type: "string" }, bullets: { type: "array", items: { type: "string" } }
            },
            required: ["role", "org", "date", "bullets"]
          }
        }
      },
      required: ["header", "summary", "experience", "education", "skills"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, resumeData, jobDescription, messages, rawText, url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resumeText = resumeData ? formatResumeForAI(resumeData) : "";

    let systemPrompt = "";
    let userPrompt = "";
    let useStream = false;
    let useTools = false;
    let tools: any[] = [];
    let toolChoice: any = undefined;

    if (action === "fetch-jd") {
      if (!url) throw new Error("URL is required");
      const pageResp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Jobiffy/1.0)" },
      });
      if (!pageResp.ok) throw new Error(`Failed to fetch URL: ${pageResp.status}`);
      const html = await pageResp.text();
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000);

      const extractResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "Extract the job description from the following webpage text. Return ONLY the job description text, including job title, requirements, responsibilities, and qualifications. Remove any navigation, footer, or unrelated content." },
            { role: "user", content: textContent },
          ],
        }),
      });

      if (!extractResp.ok) throw new Error("Failed to extract job description");
      const extractData = await extractResp.json();
      const jdText = extractData.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ jobDescription: jdText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "parse-resume") {
      if (!rawText) throw new Error("Raw text is required for parsing");
      useTools = true;
      systemPrompt = `You are an expert resume parser. Extract all information from the raw resume text and structure it precisely. Be thorough — extract every section, every bullet point, every detail.`;
      userPrompt = `Parse the following resume text into structured data. Extract EVERYTHING:\n\n${rawText}`;
      tools = [resumeToolSchema];
      toolChoice = { type: "function", function: { name: "parsed_resume" } };

    } else if (action === "tailor-resume") {
      if (!jobDescription) throw new Error("Job description is required");
      useTools = true;
      systemPrompt = `You are an expert resume optimizer. Given a resume and a job description, optimize the resume to maximize the match with the job. Rules:
1. Keep the same person's real experience — do NOT fabricate roles, companies, or degrees.
2. Rewrite bullet points to emphasize relevant skills and use keywords from the JD.
3. Reorder skills to prioritize those mentioned in the JD.
4. Enhance the summary to align with the target role.
5. Add missing keywords naturally where truthful.
6. Keep the same structure (header, experience, education, skills, etc.)
7. Make bullet points more quantified and impactful where possible.`;
      userPrompt = `Optimize this resume to match the following job description.\n\nCurrent Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nReturn the optimized resume data.`;
      tools = [resumeToolSchema];
      toolChoice = { type: "function", function: { name: "parsed_resume" } };

    } else if (action === "ats-score") {
      useTools = true;
      systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume and provide a detailed ATS compatibility score.`;
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
                    name: { type: "string" }, score: { type: "number" },
                    feedback: { type: "string" }, suggestions: { type: "array", items: { type: "string" } }
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
      userPrompt = `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nAnalyze the match.`;
      tools = [{
        type: "function",
        function: {
          name: "jd_match_analysis",
          description: "Return JD match analysis",
          parameters: {
            type: "object",
            properties: {
              matchScore: { type: "number" },
              matchedKeywords: { type: "array", items: { type: "string" } },
              missingKeywords: { type: "array", items: { type: "string" } },
              experienceMatch: { type: "string" },
              skillsGap: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              sectionFeedback: {
                type: "array",
                items: {
                  type: "object",
                  properties: { section: { type: "string" }, score: { type: "number" }, feedback: { type: "string" } },
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

Be conversational, helpful, and proactive. When making changes, ALWAYS include the resume-update JSON block so changes are applied automatically.`;
      userPrompt = "";

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    const aiMessages: any[] = [{ role: "system", content: systemPrompt }];

    if (action === "chat" && messages) {
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
  if (data.leadership?.length) {
    lines.push("LEADERSHIP");
    for (const l of data.leadership) {
      lines.push(`${l.role} at ${l.org} (${l.date})`);
      for (const b of l.bullets || []) lines.push(`  • ${b}`);
    }
  }
  return lines.join("\n");
}
