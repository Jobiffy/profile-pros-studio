import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGemini, transientGeminiResponse } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

class UserError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// Block obvious SSRF targets: loopback, link-local, RFC 1918 / ULA, cloud metadata.
// Hostname-form check (no DNS resolution); pairs with the per-request fetch timeout.
function assertPublicHttpUrl(raw: string): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new UserError("Invalid URL"); }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new UserError("Only http(s) URLs are allowed");
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "::" ||
    host === "169.254.169.254" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^fc[0-9a-f]{2}:/i.test(host) ||
    /^fd[0-9a-f]{2}:/i.test(host) ||
    /^fe80:/i.test(host)
  ) throw new UserError("URL host not allowed");
  return u;
}

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
        },
        customSections: {
          type: "array",
          description: "Any content that does not fit into the standard sections above. Use this for awards, publications, volunteer work, languages, hobbies, references, or any unrecognized sections. Label each with the original section title.",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Original section heading from the resume" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    subtitle: { type: "string" },
                    description: { type: "string" },
                    bullets: { type: "array", items: { type: "string" } }
                  }
                }
              }
            },
            required: ["title", "items"]
          }
        }
      },
      required: ["header", "summary", "experience", "education", "skills"]
    }
  }
};

// Chat tools for the AI assistant to modify the resume
const chatTools = [
  {
    type: "function",
    function: {
      name: "update_section",
      description: "Update a specific section or field of the resume. Use this when the user asks to modify, rewrite, improve, or change any part of their resume.",
      parameters: {
        type: "object",
        properties: {
          field: {
            type: "string",
            description: "The field path to update. Examples: 'summary', 'header.title', 'header.name', 'experience[0].bullets', 'experience[1].title', 'skills[0].items', 'education[0].degree', 'projects[0].description', 'certifications', 'leadership[0].bullets'"
          },
          value: {
            description: "The new value. Can be a string, array of strings, or object depending on the field."
          },
          change_type: {
            type: "string",
            enum: ["grammar", "content", "keyword", "formatting"],
            description: "Type of change: 'grammar' for grammar/spelling fixes, 'content' for content additions/rewrites, 'keyword' for keyword optimizations, 'formatting' for structural/formatting changes"
          }
        },
        required: ["field", "value", "change_type"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reorder_sections",
      description: "Reorder resume sections. Use when user asks to move a section up/down or rearrange the order.",
      parameters: {
        type: "object",
        properties: {
          section_order: {
            type: "array",
            items: { type: "string" },
            description: "Ordered list of section IDs. Available: summary, experience, education, skills, projects, certifications, leadership"
          }
        },
        required: ["section_order"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_section",
      description: "Show or hide a resume section. Use when user asks to hide, show, remove, or add back a section.",
      parameters: {
        type: "object",
        properties: {
          section_id: {
            type: "string",
            description: "Section to toggle: summary, experience, education, skills, projects, certifications, leadership"
          },
          visible: { type: "boolean", description: "true to show, false to hide" }
        },
        required: ["section_id", "visible"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_item",
      description: "Add a new item to a section (new experience entry, education entry, skill category, project, certification, or bullet point).",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["experience", "education", "skills", "projects", "certifications", "leadership"],
            description: "Which section to add to"
          },
          item: {
            description: "The item to add. For experience: {title, company, location, startDate, endDate, bullets}. For education: {degree, school, location, startDate, endDate}. For skills: {category, items}. For projects: {name, description, tech, bullets}. For certifications: a string. For leadership: {role, org, date, bullets}."
          }
        },
        required: ["section", "item"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "remove_item",
      description: "Remove an item from a section by index.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["experience", "education", "skills", "projects", "certifications", "leadership"],
            description: "Which section to remove from"
          },
          index: { type: "number", description: "Zero-based index of the item to remove" }
        },
        required: ["section", "index"],
        additionalProperties: false
      }
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: { action?: string; resumeData?: unknown; jobDescription?: string; messages?: unknown[]; rawText?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { action, resumeData, jobDescription, messages, rawText, url } = body;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("resume-ai: GEMINI_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resumeText = resumeData ? formatResumeForAI(resumeData) : "";

    let systemPrompt = "";
    let userPrompt = "";
    let useTools = false;
    type Tool = { type: "function"; function: { name: string; description?: string; parameters: Record<string, unknown> } };
    let tools: Tool[] = [];
    let toolChoice: { type: "function"; function: { name: string } } | undefined = undefined;

    if (action === "fetch-jd") {
      if (!url) throw new UserError("URL is required");
      const safeUrl = assertPublicHttpUrl(url);
      const pageResp = await fetch(safeUrl.href, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Jobiffy/1.0)" },
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!pageResp.ok) throw new UserError(`Failed to fetch URL: ${pageResp.status}`, 502);
      const html = (await pageResp.text()).slice(0, 1_000_000);
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000);

      const { text: jdText } = await callGemini({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.5-flash-lite",
        system: "Extract the job description from the following webpage text. Return ONLY the job description text, including job title, requirements, responsibilities, and qualifications. Remove any navigation, footer, or unrelated content.",
        messages: [{ role: "user", content: textContent }],
      });
      return new Response(JSON.stringify({ jobDescription: jdText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "parse-resume") {
      if (!rawText) throw new UserError("Raw text is required for parsing");
      useTools = true;
      systemPrompt = `You are an expert resume parser. Your job is to extract ALL information from the provided resume text with 100% accuracy.

CRITICAL RULES:
1. Extract data from ALL pages — the text may span multiple pages. Do not stop at the first page.
2. Parse every section completely — every bullet point, every date, every detail.
3. Handle various layouts: single-column, two-column, tables, creative/Canva templates, Word templates.
4. Clean up formatting artifacts: fix broken words, merge split lines, remove page numbers/headers/footers.
5. For the header: extract name, job title/headline, email, phone, LinkedIn URL, GitHub URL, portfolio/website URL, and location. Look for these across the entire document — some resumes put contact info in sidebars or footers.
6. For experience: extract ALL positions with full bullet points. Preserve the original meaning and metrics.
7. For education: extract degree, school, dates, GPA if present, and any honors/details.
8. For skills: group by category if the resume does so, otherwise create logical categories (e.g., "Programming Languages", "Tools & Frameworks", "Soft Skills").
9. For projects: extract name, description, technologies used, and bullet points.
10. For certifications: extract all certifications, licenses, and professional development items.
11. For leadership: extract volunteer roles, club leadership, organizational roles.
12. IMPORTANT: If any content does NOT fit into the standard sections (summary, experience, education, skills, projects, certifications, leadership), place it in "customSections" with the original section title. Examples: Awards, Publications, Languages, Volunteer Work, Interests, References, Honors.
13. NEVER drop or skip any content. Every piece of information must appear somewhere in the output.
14. If a section heading is ambiguous, use your best judgment to categorize it, or put it in customSections.`;
      userPrompt = `Parse the following resume text into structured data. Extract EVERYTHING from ALL pages. Do not skip any content.\n\n---\n${rawText}\n---`;
      tools = [resumeToolSchema];
      toolChoice = { type: "function", function: { name: "parsed_resume" } };

    } else if (action === "tailor-resume") {
      if (!jobDescription) throw new UserError("Job description is required");
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
      if (!jobDescription) throw new UserError("Job description is required");
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
      // Non-streaming tool-calling chat
      const sectionOrderInfo = resumeData?.sectionOrder
        ? `\n\nCurrent section order: ${JSON.stringify(resumeData.sectionOrder)}`
        : "";

      systemPrompt = `You are Jobiffy AI Resume Coach — a friendly, expert resume assistant. You help users improve their resumes through conversation and direct modifications.

PERSONALITY:
- Be warm, approachable, and encouraging
- Respond naturally to greetings like "Hi", "Hello", "How are you?" — introduce yourself and offer to help
- For casual messages, respond conversationally but always steer toward resume improvement
- Be proactive — suggest improvements when you see opportunities

CAPABILITIES - You can:
1. **Modify any section** — rewrite summaries, improve bullet points, update titles, add metrics
2. **Reorder sections** — move sections up or down (e.g., put skills before experience)
3. **Show/hide sections** — toggle sections on or off
4. **Add new items** — add experience entries, skills, projects, certifications, etc.
5. **Remove items** — remove specific entries from any section

CURRENT RESUME DATA:
${resumeText}${sectionOrderInfo}

INSTRUCTIONS:
- When the user asks to change something, USE THE TOOLS to make the changes directly. Don't just describe what to change.
- You can call multiple tools at once for complex requests.
- Always explain what you changed in your text response.
- Use strong action verbs, quantify achievements, and follow resume best practices.
- For field paths, use dot notation: "header.title", "experience[0].bullets", "skills[1].items", etc.
- IMPORTANT: Always specify the change_type for update_section: 'grammar' for grammar/spelling, 'content' for rewrites/additions, 'keyword' for keyword optimization, 'formatting' for structural changes.`;

      const turns: { role: "user" | "assistant"; content: string }[] = [];
      if (messages) {
        for (const m of messages) {
          // Skip the legacy multi-turn tool_calls/tool_results path — the client
          // doesn't send those; each turn is fresh role+content.
          if (m.role === "user" || m.role === "assistant") {
            turns.push({ role: m.role, content: m.content });
          }
        }
      }

      try {
        const { text, toolCalls } = await callGemini({
          apiKey: GEMINI_API_KEY,
          model: "gemini-2.5-flash",
          system: systemPrompt,
          messages: turns,
          tools: chatTools,
        });

        const result = {
          content: text || "",
          tool_calls: toolCalls.map((tc) => ({
            id: crypto.randomUUID(),
            name: tc.name,
            arguments: tc.args,
          })),
        };

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const transient = transientGeminiResponse(e, corsHeaders);
        if (transient) return transient;
        console.error("Gemini error:", e instanceof Error ? e.message : e);
        throw new Error("AI gateway error");
      }

    } else {
      throw new UserError(`Unknown action: ${action}`);
    }

    try {
      const { text, toolCalls } = await callGemini({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.5-flash",
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: useTools ? tools : undefined,
        forcedTool: toolChoice?.function?.name,
      });

      if (useTools) {
        const toolCall = toolCalls[0];
        if (toolCall) {
          return new Response(JSON.stringify(toolCall.args), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ content: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const transient = transientGeminiResponse(e, corsHeaders);
      if (transient) return transient;
      console.error("Gemini error:", e instanceof Error ? e.message : e);
      throw new Error("AI gateway error");
    }

  } catch (e) {
    if (e instanceof UserError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("resume-ai error:", e instanceof Error ? e.message : e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface ResumeShape {
  header?: { name?: string; title?: string; email?: string; phone?: string; location?: string; linkedin?: string };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; startDate?: string; endDate?: string; bullets?: string[] }>;
  education?: Array<{ degree?: string; school?: string; startDate?: string; endDate?: string; gpa?: string }>;
  skills?: Array<{ category?: string; items?: string[] }>;
  projects?: Array<{ name?: string; description?: string; bullets?: string[] }>;
  certifications?: string[];
  leadership?: Array<{ role?: string; org?: string; date?: string; bullets?: string[] }>;
}

function formatResumeForAI(data: unknown): string {
  if (!data || typeof data !== "object") return "No resume data provided";
  const r = data as ResumeShape;
  const lines: string[] = [];
  const h = r.header || {};
  lines.push(`Name: ${h.name || ""}`);
  lines.push(`Title: ${h.title || ""}`);
  lines.push(`Email: ${h.email || ""} | Phone: ${h.phone || ""}`);
  if (h.location) lines.push(`Location: ${h.location}`);
  if (h.linkedin) lines.push(`LinkedIn: ${h.linkedin}`);
  lines.push("");
  if (r.summary) lines.push(`SUMMARY\n${r.summary}\n`);
  if (r.experience?.length) {
    lines.push("EXPERIENCE");
    r.experience.forEach((exp, i) => {
      lines.push(`[${i}] ${exp.title} at ${exp.company} (${exp.startDate}–${exp.endDate})`);
      (exp.bullets || []).forEach((b, j) => lines.push(`  [${j}] • ${b}`));
    });
    lines.push("");
  }
  if (r.education?.length) {
    lines.push("EDUCATION");
    r.education.forEach((edu, i) => {
      lines.push(`[${i}] ${edu.degree} – ${edu.school} (${edu.startDate}–${edu.endDate})${edu.gpa ? ` GPA: ${edu.gpa}` : ""}`);
    });
    lines.push("");
  }
  if (r.skills?.length) {
    lines.push("SKILLS");
    r.skills.forEach((s, i) => lines.push(`[${i}] ${s.category}: ${(s.items || []).join(", ")}`));
    lines.push("");
  }
  if (r.projects?.length) {
    lines.push("PROJECTS");
    r.projects.forEach((p, i) => {
      lines.push(`[${i}] ${p.name} – ${p.description}`);
      (p.bullets || []).forEach((b, j) => lines.push(`  [${j}] • ${b}`));
    });
    lines.push("");
  }
  if (r.certifications?.length) {
    lines.push("CERTIFICATIONS");
    r.certifications.forEach((c, i) => lines.push(`[${i}] • ${c}`));
  }
  if (r.leadership?.length) {
    lines.push("LEADERSHIP");
    r.leadership.forEach((l, i) => {
      lines.push(`[${i}] ${l.role} at ${l.org} (${l.date})`);
      (l.bullets || []).forEach((b, j) => lines.push(`  [${j}] • ${b}`));
    });
  }
  return lines.join("\n");
}
