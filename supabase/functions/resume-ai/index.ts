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

      const aiMessages: any[] = [{ role: "system", content: systemPrompt }];
      if (messages) {
        // Convert tool_calls messages to proper format for context
        for (const m of messages) {
          if (m.role === "assistant" && m.tool_calls) {
            aiMessages.push({ role: "assistant", content: m.content || "", tool_calls: m.tool_calls });
            // Add tool results
            if (m.tool_results) {
              for (const tr of m.tool_results) {
                aiMessages.push({ role: "tool", tool_call_id: tr.tool_call_id, content: tr.content });
              }
            }
          } else {
            aiMessages.push({ role: m.role, content: m.content });
          }
        }
      }

      const body = {
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools: chatTools,
      };

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

      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message;

      // Return structured response with tool calls
      const result: any = {
        content: message?.content || "",
        tool_calls: [],
      };

      if (message?.tool_calls) {
        for (const tc of message.tool_calls) {
          try {
            const args = JSON.parse(tc.function.arguments);
            result.tool_calls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args,
            });
          } catch {
            console.error("Failed to parse tool call:", tc);
          }
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    const aiMessages: any[] = [{ role: "system", content: systemPrompt }];
    aiMessages.push({ role: "user", content: userPrompt });

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
    for (const [i, exp] of data.experience.entries()) {
      lines.push(`[${i}] ${exp.title} at ${exp.company} (${exp.startDate}–${exp.endDate})`);
      for (const [j, b] of (exp.bullets || []).entries()) lines.push(`  [${j}] • ${b}`);
    }
    lines.push("");
  }
  if (data.education?.length) {
    lines.push("EDUCATION");
    for (const [i, edu] of data.education.entries()) {
      lines.push(`[${i}] ${edu.degree} – ${edu.school} (${edu.startDate}–${edu.endDate})${edu.gpa ? ` GPA: ${edu.gpa}` : ""}`);
    }
    lines.push("");
  }
  if (data.skills?.length) {
    lines.push("SKILLS");
    for (const [i, s] of data.skills.entries()) lines.push(`[${i}] ${s.category}: ${s.items.join(", ")}`);
    lines.push("");
  }
  if (data.projects?.length) {
    lines.push("PROJECTS");
    for (const [i, p] of data.projects.entries()) {
      lines.push(`[${i}] ${p.name} – ${p.description}`);
      for (const [j, b] of (p.bullets || []).entries()) lines.push(`  [${j}] • ${b}`);
    }
    lines.push("");
  }
  if (data.certifications?.length) {
    lines.push("CERTIFICATIONS");
    for (const [i, c] of data.certifications.entries()) lines.push(`[${i}] • ${c}`);
  }
  if (data.leadership?.length) {
    lines.push("LEADERSHIP");
    for (const [i, l] of data.leadership.entries()) {
      lines.push(`[${i}] ${l.role} at ${l.org} (${l.date})`);
      for (const [j, b] of (l.bullets || []).entries()) lines.push(`  [${j}] • ${b}`);
    }
  }
  return lines.join("\n");
}
