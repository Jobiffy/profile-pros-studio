import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, profileText } = await req.json();

    if (!profileText || profileText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Please paste your LinkedIn profile content (at least 50 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
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
                      additionalProperties: false,
                    },
                  },
                  topStrengths: { type: "array", items: { type: "string" } },
                  criticalImprovements: { type: "array", items: { type: "string" } },
                },
                required: ["overallScore", "projectedOverallScore", "summary", "profileName", "profileHeadline", "sections", "topStrengths", "criticalImprovements"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "linkedin_review" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let result;
    try {
      result = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("linkedin-review error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
