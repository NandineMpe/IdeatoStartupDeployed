import { NextResponse } from "next/server"
import OpenAI from "openai"
import { env } from "@/lib/env"
// ⇢ Load system prompt from a markdown file at runtime
import fs from "fs"
import path from "path"

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

// Function to extract sections from text response
function extractSectionsFromText(text: string) {
  try {
    const sections = []
    const sectionRegex = /## (\d+\.\s+[A-Z\s&()]+)\n([\s\S]*?)(?=## \d+\.|$)/g
    let match

    while ((match = sectionRegex.exec(text)) !== null) {
      const title = match[1].trim()
      const content = cleanMarkdown(match[2].trim())
      sections.push({ title, content })
    }

    if (sections.length > 0) {
      return { sections }
    }

    return null
  } catch (error) {
    console.error("Failed to extract sections from text:", error)
    return null
  }
}

export async function POST(request: Request) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers })
  }

  try {
    // Parse the request body
    const requestBody = await request.text()
    let body

    try {
      body = JSON.parse(requestBody)
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request body",
          analysis: {
            sections: defaultSections,
          },
        },
        { status: 400, headers },
      )
    }

    const { ideaDescription, proposedSolution, intendedUsers, geographicFocus } = body

    // Validate required fields
    if (!ideaDescription) {
      return NextResponse.json(
        {
          error: "Problem description is required",
          analysis: {
            sections: defaultSections,
          },
        },
        { status: 400, headers },
      )
    }

    // Check if API key is available
    if (!env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.",
          analysis: {
            sections: defaultSections,
          },
        },
        { status: 500, headers },
      )
    }

    // Check if the idea description is too long
    if (ideaDescription.length > 5000) {
      return NextResponse.json(
        {
          error: "Problem description is too long. Please keep it under 5000 characters.",
          analysis: {
            sections: defaultSections,
          },
        },
        { status: 400, headers },
      )
    }

    // Prepare the user message with all available information
    const userMessage = `
Idea Description (What idea are you thinking about?): ${ideaDescription}
${proposedSolution ? `Proposed Solution (What solution are you thinking of?): ${proposedSolution}` : ""}
${intendedUsers ? `Intended Users (Who is it for?): ${intendedUsers}` : ""}
${geographicFocus ? `Geographic Focus (Where is it for?): ${geographicFocus}` : ""}
`

    try {
      // Initialize the OpenAI client with explicit configuration
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      // Call OpenAI API with explicit error handling
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT.toString() },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 4000, // Reduced to avoid potential issues
        top_p: 0.95,
      })

      // Extract the text from the response
      const text = completion.choices[0].message.content

      if (!text) {
        throw new Error("Empty response from OpenAI API")
      }

      // Extract sections from the response
      const analysis = extractSectionsFromText(text)

      // If extraction failed, create a structured response manually
      if (!analysis || !analysis.sections || analysis.sections.length === 0) {
        console.log("Section extraction failed, structuring response manually")

        // Create a structured response based on the section titles
        const structuredSections = defaultSections.map((defaultSection) => {
          const sectionTitle = defaultSection.title
          const titleRegex = new RegExp(
            `${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?(?=\\d+\\.|$)`,
            "i",
          )
          const match = text.match(titleRegex)

          return {
            title: sectionTitle,
            content: match ? cleanMarkdown(match[0].replace(sectionTitle, "").trim()) : defaultSection.content,
          }
        })

        return NextResponse.json({ analysis: { sections: structuredSections } }, { headers })
      }

      // Return the analysis
      return NextResponse.json({ analysis }, { headers })
    } catch (apiError) {
      console.error("API error:", apiError)

      // Return a fallback analysis with detailed error information
      return NextResponse.json(
        {
          error: apiError instanceof Error ? apiError.message : "Unknown API error",
          analysis: {
            sections: defaultSections,
          },
        },
        { status: 500, headers },
      )
    }
  } catch (error) {
    console.error("Error analyzing business idea:", error)

    // Always return a valid JSON response with detailed error information
    return NextResponse.json(
      {
        error: "Failed to analyze business idea",
        details: error instanceof Error ? error.message : "Unknown error",
        analysis: {
          sections: defaultSections,
        },
      },
      {
        status: 500,
        headers,
      },
    )
  }
}
