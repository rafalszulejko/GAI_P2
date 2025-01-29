import { createClient } from "@/utils/supabase/server"
import { AgentResponse } from "./types"
import { ChatOpenAI } from "@langchain/openai"

export async function promptAgent({ ticketId, prompt }: { ticketId: string, prompt: string }) {
  const supabase = await createClient()
  const llm = new ChatOpenAI()

  // Fetch ticket
  const { data: ticket } = await supabase
    .from("ticket")
    .select("title, description")
    .eq("id", ticketId)
    .single()

  // Get summary
  const result = await llm.invoke(`${prompt} Context: Title: ${ticket?.title} Description: ${ticket?.description ?? "No description"}`)

  // Save response
  await supabase
    .from("message")
    .insert({
      ticket_id: ticketId,
      content: JSON.stringify({
        message: result.content.toString(),
        reasoning: "Basic ticket summary",
        isFinal: true
      } satisfies AgentResponse),
      type: "agent_response"
    })
} 
