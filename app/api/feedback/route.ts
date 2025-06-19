import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "lib/supabase"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }

  return NextResponse.json({ feedback: data })
}

export async function POST(req: NextRequest) {
  const { name, email, feedback_type, message } = await req.json()

  // Basic validation
  if (!name || !email || !feedback_type || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Email validation (basic regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("feedback")
    .insert([{ name, email, feedback_type, message }])
    .select()

  if (error) {
    console.error("Error inserting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }

  return NextResponse.json({ success: true, item: data?.[0] })
}
