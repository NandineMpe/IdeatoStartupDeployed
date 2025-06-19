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
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
  };

  // Return mock data with the correct structure
  console.log('Returning mock data');
  return NextResponse.json({ analysis: MOCK_RESPONSE }, { headers });
}
