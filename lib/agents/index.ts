import { createClient } from "@/utils/supabase/server"
import { AgentResponse } from "./types"
import { ChatOpenAI } from "@langchain/openai"
import { createUpdateTicketStateTool } from "./tools/updateTicketState";
import { createUpdateTicketPriorityTool } from "./tools/updateTicketPriority";
import { createSendPublicMessageTool } from "./tools/sendPublicMessage";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export async function promptAgent({ ticketId, prompt }: { ticketId: string, prompt: string }) {
  const supabase = await createClient()
  const llm = new ChatOpenAI({
    model: "gpt-4o",
  });

  // Fetch ticket
  const { data: ticket } = await supabase
    .from("ticket")
    .select("title, description")
    .eq("id", ticketId)
    .single()

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const agent = createReactAgent({ 
    llm: llm, 
    tools: [
      createUpdateTicketStateTool(ticketId),
      createUpdateTicketPriorityTool(ticketId),
      createSendPublicMessageTool(ticketId)
    ] 
  });

  let inputs = { messages: [{ role: "user", content: `Context: Ticket title: ${ticket.title}, Description: ${ticket.description}\n\nUser request: ${prompt}` }] };

  // Get summary
  let stream = await agent.stream(inputs, {
    streamMode: "values",
    });

  for await (const { messages } of stream) {
    let msg = messages[messages?.length - 1];
    if (msg?.content) {
      console.log(msg.content);
      await pushAgentResponse({
        ticketId,
        message: msg.content,
        reasoning: "Response",
        isFinal: false
      });
    } else if (msg?.tool_calls?.length > 0) {
      console.log(msg.tool_calls);
      for (const toolCall of msg.tool_calls) {
        await pushAgentResponse({
          ticketId,
          message: undefined,
          reasoning: "Tool call",
          proposedTool: toolCall.name,
          toolArguments: toolCall.args,
          isFinal: false
        });
      }
    } else {
      await pushAgentResponse({
        ticketId,
        message: msg,
        reasoning: "Response",
        isFinal: true
      });
    }
  }
} 

export async function pushAgentResponse({ 
  ticketId, 
  message, 
  reasoning, 
  proposedTool,
  toolArguments,
  isFinal = true 
}: { 
  ticketId: string, 
  message?: string,
  reasoning: string,
  proposedTool?: string,
  toolArguments?: Record<string, any>,
  isFinal?: boolean 
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("message")
    .insert({
      ticket_id: ticketId,
      content: JSON.stringify({
        message,
        reasoning,
        proposedTool,
        toolArguments,
        isFinal
      } satisfies AgentResponse),
      type: "agent_response"
    });

  if (error) {
    console.error("Error pushing agent response:", error.message, error.details);
    throw error;
  }
}

