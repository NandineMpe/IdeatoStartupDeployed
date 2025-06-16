import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────────────
//  CONSTANTS & SCHEMAS
// ──────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `# Business Idea Analysis System

You are an expert business analyst specializing in evaluating startup ideas. Your task is to analyze the provided business idea and generate a comprehensive, structured analysis that helps entrepreneurs understand the viability and potential of their idea.

## Analysis Structure

Your analysis MUST follow this exact structure and include ALL of the following sections:
1. PROBLEM DEFINITION & HYPOTHESIS VALIDATION
2. MARKET NEED & DEMAND DYNAMICS
3. ALTERNATIVES & CUSTOMER SENTIMENT
4. USER BENEFITS & STRATEGIC GAP ANALYSIS
5. TRENDS & ENABLING TECHNOLOGIES
6. RISK & BARRIER ASSESSMENT
7. MONETIZATION & BUSINESS MODEL VALIDATION
8. TIMING & COMPETITION
9. MACROFORCES (Regulatory, Cultural, Economic, Demographic)
10. CONCLUSIONS & RECOMMENDATIONS

For each section, provide a detailed analysis of at least 200 words. Be specific, data-driven, and actionable in your recommendations.`;

const DEFAULT_TITLES = [
  "PROBLEM DEFINITION & HYPOTHESIS VALIDATION",
  "MARKET NEED & DEMAND DYNAMICS",
  "ALTERNATIVES & CUSTOMER SENTIMENT",
  "USER BENEFITS & STRATEGIC GAP ANALYSIS",
  "TRENDS & ENABLING TECHNOLOGIES",
  "RISK & BARRIER ASSESSMENT",
  "MONETIZATION & BUSINESS MODEL VALIDATION",
  "TIMING & COMPETITION",
  "MACROFORCES (Regulatory, Cultural, Economic, Demographic)",
  "CONCLUSIONS & RECOMMENDATIONS",
] as const;

const DEFAULT_SECTIONS = DEFAULT_TITLES.map((t, i) => ({
  title: `${i + 1}. ${t}`,
  content: "Analysis not available due to an error. Please try again later.",
}));

const MIN_SECTION_LENGTH = 1200;

// AJV schema for AI response
const aiSchema = {
  type: "object",
  required: ["analysis"],
  properties: {
    analysis: {
      type: "object",
      required: ["sections"],
      properties: {
        sections: {
          type: "array",
          minItems: 10,
          items: {
            type: "object",
            required: ["title", "content"],
            properties: {
              title: { type: "string" },
              content: { type: "string", minLength: MIN_SECTION_LENGTH },
            },
          },
        },
      },
    },
  },
} as const;

const ajv = new Ajv({ allErrors: true, strict: false });
const validateAI = ajv.compile(aiSchema);

// Zod request schema
const BodySchema = z.object({
  ideaDescription: z.string().trim().min(20).max(5000),
  proposedSolution: z.string().trim().max(3000).optional().or(z.literal("")),
  intendedUsers: z.string().trim().max(2500).optional().or(z.literal("")),
  geographicFocus: z.string().trim().max(1500).optional().or(z.literal("")),
});

type BodyInput = z.infer<typeof BodySchema>;

// Basic sanitiser
const sanitize = (v: string) => v.replace(/```[\s\S]*?```/g, "").replace(/[\u0000-\u001F\u007F]+/g, " ").trim();

// Markdown cleaning helper
const cleanMarkdown = (t: string) =>
  t.replace(/#{1,6}\s/g, "")
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/^\s*(\d+)\.\s/gm, "$1. ")
    .replace(/^\s*>\s/gm, "")
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, "$1"))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function extractSectionsFromText(text: string) {
  const arr: { title: string; content: string }[] = [];
  const re = /##\s+(\d+\.\s+[A-Z\s&()]+)\n([\s\S]*?)(?=##\s+\d+\.|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) arr.push({ title: m[1].trim(), content: cleanMarkdown(m[2].trim()) });
  return arr.length ? { sections: arr } : null;
}

function ensureCompleteness(analysis: { sections: { title: string; content: string }[] }) {
  const map = new Map(analysis.sections.map((s) => [s.title.toUpperCase(), s]));
  return {
    sections: DEFAULT_TITLES.map((t, i) => {
      const key = `${i + 1}. ${t}`;
      const found = map.get(key.toUpperCase());
      if (found && found.content.length >= MIN_SECTION_LENGTH) return found;
      return {
        title: key,
        content: found
          ? `${found.content}\n\n— Section too short (<${MIN_SECTION_LENGTH}). Expand.`
          : DEFAULT_SECTIONS[i].content,
      };
    }),
  };
}

// OpenAI config - using gpt-4.1 as the primary model
const MODELS = ["gpt-4.1"] as const;
const TEMPERATURE = 0.12;
const MAX_TOKENS = 4000; // Increased to allow for more detailed responses
const TOP_P = 0.1;
const TIMEOUT_MS = 60_000;

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  } as const;

  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });

  // Validate body
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", analysis: { sections: DEFAULT_SECTIONS } }, { status: 400, headers });
  }
  const parseRes = BodySchema.safeParse(payload);
  if (!parseRes.success) {
    return NextResponse.json({ error: "Validation error", details: parseRes.error.flatten() }, { status: 400, headers });
  }
  const b: BodyInput = parseRes.data;

  const OPENAI_KEY = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY)
    return NextResponse.json({ error: "OPENAI_API_KEY not configured", analysis: { sections: DEFAULT_SECTIONS } }, { status: 500, headers });

  // Compose prompt
  const msg = [
    "I have a business idea and need rigorous feedback.",
    `Problem description:\n${sanitize(b.ideaDescription)}`,
    `Proposed solution:\n${sanitize(b.proposedSolution || "(none specified)")}`,
    `Intended users:\n${sanitize(b.intendedUsers || "(unspecified)")}`,
    `Geographic focus:\n${sanitize(b.geographicFocus || "(global/unspecified)")}`,
    "Please analyse according to the system prompt and output the required JSON structure.",
  ].join("\n\n");

  console.log('Initializing OpenAI client...');
  const openai = new OpenAI({ 
    apiKey: OPENAI_KEY,
    timeout: 30000, // 30 second timeout for initial connection
  });

  const timeout = setTimeout(() => {
    throw new Error('Request timed out after 60 seconds');
  }, TIMEOUT_MS);

  try {
    // Test the API key first
    try {
      await openai.models.list();
      console.log('OpenAI API key is valid');
    } catch (authError) {
      console.error('OpenAI Authentication Error:', authError);
      throw new Error('Invalid OpenAI API key or authentication failed');
    }

    // FIRST CALL – normal generation loop
    for (const model of MODELS) {
      console.log(`Attempting to generate completion with model: ${model}`);
      const completion = await openai.chat.completions.create({
        model,
        temperature: TEMPERATURE,
        top_p: TOP_P,
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: msg },
        ]
      }, {
        timeout: 45000 // 45 second timeout for the completion
      });

      const raw = completion.choices[0].message.content;
      try {
        const parsedAI = JSON.parse(raw);
        if (validateAI(parsedAI)) {
        clearTimeout(timeout);
        return NextResponse.json(parsedAI, { headers });
      }
        // If JSON invalid -> attempt repair via function‑call
        const repair = await repairWithFunctionCalling(openai, model, msg, raw);
        if (repair) {
          clearTimeout(timeout);
          return NextResponse.json(repair, { headers });
        }
      } catch {/* fallthrough to regex extraction */}

      const extracted = extractSectionsFromText(raw);
      if (extracted) {
        clearTimeout(timeout);
        return NextResponse.json(ensureCompleteness(extracted), { headers });
      }
    }
    clearTimeout(timeout);
    return NextResponse.json({ error: "AI analysis unavailable", analysis: { sections: DEFAULT_SECTIONS } }, { status: 502, headers });
  } catch (err) {
    clearTimeout(timeout);
    const error = err as any;
    console.error('OpenAI API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    let status = 500;
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timed out')) {
      status = 504;
      errorMessage = 'Request to AI service timed out';
    } else if (error.status === 401) {
      status = 401;
      errorMessage = 'Invalid API key or authentication failed';
    } else if (error.status === 429) {
      status = 429;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 503) {
      status = 503;
      errorMessage = 'AI service is currently unavailable';
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      analysis: { sections: DEFAULT_SECTIONS } 
    }, { 
      status,
      headers 
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  FUNCTION‑CALL BASED REPAIR
// ──────────────────────────────────────────────────────────────────────────────
async function repairWithFunctionCalling(openai: OpenAI, model: string, originalUserMsg: string, badJson: string) {
  try {
    const fnSchema = {
      name: "patch_analysis",
      description: "Return a corrected JSON that conforms to the analysis schema.",
      parameters: aiSchema,
    } as const;

    const result = await openai.chat.completions.create({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: originalUserMsg },
        { role: "assistant", content: badJson },
        { role: "user", content: "The previous JSON is invalid. Please call patch_analysis with a fixed object." },
      ],
      tools: [{ type: "function", function: fnSchema }],
      tool_choice: { type: "function", function: { name: "patch_analysis" } },
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const toolCall = result.choices[0].message.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const fixed = JSON.parse(toolCall.function.arguments);
      if (validateAI(fixed)) return fixed;
    }
  } catch {/* ignore repair failures */}
  return null;
}
