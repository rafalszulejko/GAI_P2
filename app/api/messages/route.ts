import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { promptAgent } from "@/lib/agents"

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

    // If this is an agent prompt, trigger the agent
    if (type === "agent_prompt") {
      try {
        await promptAgent({
          ticketId: ticket_id,
          prompt: content
        })
      } catch (agentError) {
        console.error("Error processing agent prompt:", agentError)
        // We don't return error here since the original message was already saved
      }
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
