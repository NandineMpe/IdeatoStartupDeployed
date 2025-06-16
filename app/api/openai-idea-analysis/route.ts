import { NextResponse } from "next/server"
import OpenAI from "openai"
import { env } from "@/lib/env"
// ⇢ Load system prompt from a markdown file at runtime
import fs from "fs"
import path from "path"

// Explicitly use the Node.js runtime since this route relies on Node APIs
export const runtime = "nodejs"

// Load system prompt at runtime from the markdown file. Using fs avoids bundler
// issues with the `?raw` loader when building the project.
const businessIdeaAnalyzerPrompt = fs.readFileSync(
  path.join(process.cwd(), "prompts", "businessIdeaAnalyzer.md"),
  "utf8",
)

// Default sections structure
const defaultSections = [
  {
    title: "1. PROBLEM DEFINITION & HYPOTHESIS VALIDATION",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "2. MARKET NEED & DEMAND DYNAMICS",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "3. ALTERNATIVES & CUSTOMER SENTIMENT",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "4. USER BENEFITS & STRATEGIC GAP ANALYSIS",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "5. TRENDS & ENABLING TECHNOLOGIES",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "6. RISK & BARRIER ASSESSMENT",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "7. MONETIZATION & BUSINESS MODEL VALIDATION",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "8. TIMING & COMPETITION",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "9. MACROFORCES (Regulatory, Cultural, Economic, Demographic)",
    content: "Analysis not available due to an error. Please try again later.",
  },
  {
    title: "10. CONCLUSIONS & RECOMMENDATIONS",
    content: "Analysis not available due to an error. Please try again later.",
  },
]

// The system prompt for the OpenAI analysis
const SYSTEM_PROMPT = Buffer.from(businessIdeaAnalyzerPrompt)

// Function to clean markdown from text
function cleanMarkdown(text: string): string {
  return (
    text
      // Remove heading markers
      .replace(/#{1,6}\s/g, "")
      // Remove bold/italic markers
      .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
      // Remove underscores for emphasis
      .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
      // Remove bullet points
      .replace(/^\s*[-*+]\s/gm, "")
      // Remove numbered lists but keep the numbers
      .replace(/^\s*(\d+)\.\s/gm, "$1. ")
      // Remove blockquotes
      .replace(/^\s*>\s/gm, "")
      // Remove code blocks but keep content
      .replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, "$1").trim()
      })
      // Remove inline code but keep content
      .replace(/`([^`]+)`/g, "$1")
      // Normalize multiple newlines to double newlines
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim()
  )
}

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
