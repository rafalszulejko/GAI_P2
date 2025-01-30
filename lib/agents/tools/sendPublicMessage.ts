import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const sendPublicMessageTool = new DynamicStructuredTool({
  name: "send_public_message",
  description: "Sends a public message on behalf of the company employee in the ticket chat",
  schema: z.object({
    ticketId: z.string().describe("The ID of the ticket to send message to"),
    message: z.string().describe("The message content to send"),
  }),
  func: async ({ ticketId, message }) => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("message")
      .insert({
        ticket_id: ticketId,
        content: message,
        type: "public"
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending public message:", error.message, error.details);
      return JSON.stringify({
        success: false,
        error: error.message
      });
    }

    return JSON.stringify({
      success: true,
      data: {
        id: data.id,
        content: data.content,
        type: data.type
      }
    });
  },
});

export function createSendPublicMessageTool(ticketId: string) {
  return new DynamicStructuredTool({
    name: "send_public_message",
    description: "Sends a public message on behalf of the company employee in the current ticket chat",
    schema: z.object({
      message: z.string().describe("The message content to send"),
    }),
    func: async ({ message }) => {
      // Reuse the existing tool's logic
      return sendPublicMessageTool.func({ ticketId, message });
    },
  });
} 