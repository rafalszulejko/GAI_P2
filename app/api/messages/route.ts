import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { ticket_id, content, type } = body

    if (!ticket_id || !content || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("message")
      .insert([
        {
          ticket_id,
          content: content.trim(),
          type,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error inserting message:", error)
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing message creation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
