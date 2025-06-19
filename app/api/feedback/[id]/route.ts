import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "lib/supabase"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    // This case should ideally be caught by Next.js routing if id is a required param
    return NextResponse.json({ error: "Feedback ID is missing in URL path" }, { status: 400 })
  }

  // Optional: Add UUID validation if your IDs are UUIDs
  // const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  // if (!uuidRegex.test(id)) {
  //   return NextResponse.json({ error: "Invalid feedback ID format" }, { status: 400 });
  // }

  const { error } = await supabaseAdmin
    .from("feedback")
    .delete()
    .eq("id", id) // Changed from match({ id }) to eq("id", id) for clarity with single column PK

  if (error) {
    console.error("Error deleting feedback:", error)
    // Check for specific errors, e.g., if the ID format is wrong for the DB
    if (error.code === '22P02') { // Invalid text representation for UUID
        return NextResponse.json({ error: "Invalid feedback ID format for database" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 })
  }

  // Check if any row was actually deleted.
  // Note: Supabase delete().eq() doesn't directly return the count of deleted rows in the 'error' or 'data' object in the same way an insert/select might.
  // A common pattern is to assume success if no error, or to perform a select prior to delete if confirmation of existence is critical.
  // For now, we'll assume success if no error. A more robust check might be needed depending on requirements.

  return NextResponse.json({ success: true, message: `Feedback item with ID ${id} deleted` })
}
