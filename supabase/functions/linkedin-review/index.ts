import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGemini, GeminiError } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body: { linkedinUrl?: string; profileText?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { linkedinUrl, profileText } = body;

    if (!profileText || profileText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Please paste your LinkedIn profile content (at least 50 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Jobiffy, an expert LinkedIn profile reviewer and career coach. 
You analyze LinkedIn profiles and provide detailed, actionable feedback.
You MUST respond using the "linkedin_review" tool call. Do NOT respond with plain text.`;

    const userPrompt = `Analyze this LinkedIn profile and score each section out of 10.
${linkedinUrl ? `LinkedIn URL: ${linkedinUrl}` : ""}

PROFILE CONTENT:
${profileText}

Evaluate every section thoroughly. For each section, identify specific issues and provide concrete improvement suggestions. Then project what the scores could be after implementing your suggestions.`;

    const linkedinReviewTool = {
      type: "function" as const,
      function: {
        name: "linkedin_review",
        description: "Return a comprehensive LinkedIn profile review with scores, feedback, and projected improvements.",
        parameters: {
          type: "object",
          properties: {
            overallScore: { type: "number", description: "Overall profile score out of 100" },
            projectedOverallScore: { type: "number", description: "Projected overall score after implementing all suggestions, out of 100" },
            summary: { type: "string", description: "A brief 2-3 sentence executive summary" },
            profileName: { type: "string", description: "The name extracted from the LinkedIn profile" },
            profileHeadline: { type: "string", description: "The headline extracted from the LinkedIn profile" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Section name (Headline, About/Summary, Experience, Skills, Projects, Education, Profile Completeness, Keywords/ATS Relevance, Impact & Achievements)" },
                  score: { type: "number", description: "Score out of 10" },
                  projectedScore: { type: "number", description: "Projected score after improvements out of 10" },
                  issues: { type: "array", items: { type: "string" } },
                  suggestions: { type: "array", items: { type: "string" } },
                },
                required: ["name", "score", "projectedScore", "issues", "suggestions"],
              },
            },
            topStrengths: { type: "array", items: { type: "string" } },
            criticalImprovements: { type: "array", items: { type: "string" } },
          },
          required: ["overallScore", "projectedOverallScore", "summary", "profileName", "profileHeadline", "sections", "topStrengths", "criticalImprovements"],
        },
      },
    };

    let toolCalls;
    try {
      ({ toolCalls } = await callGemini({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.5-flash",
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [linkedinReviewTool],
        forcedTool: "linkedin_review",
      }));
    } catch (e) {
      if (e instanceof GeminiError && e.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("Gemini error:", e instanceof Error ? e.message : e);
      return new Response(JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const toolCall = toolCalls[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(toolCall.args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("linkedin-review error:", e instanceof Error ? e.message : e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
