import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const updateTicketStateTool = new DynamicStructuredTool({
  name: "update_ticket_state",
  description: "Updates the state of a specified ticket",
  schema: z.object({
    ticketId: z.string().describe("The ID of the ticket to update"),
    newState: z.string().describe("The new state to set for the ticket"),
  }),
  func: async ({ ticketId, newState }) => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("ticket")
      .update({ STATE: newState.toUpperCase() })
      .eq("id", ticketId)
      .select()
      .single();

    if (error) {
      return JSON.stringify({
        success: false,
        error: error.message
      });
    }

    return JSON.stringify({
        success: true,
        data: {
            id: data.id,
            state: data.STATE,
            title: data.title
        }
    });
  },
});

export function createUpdateTicketStateTool(ticketId: string) {
  return new DynamicStructuredTool({
    name: "update_ticket_state",
    description: "Updates the state of the current ticket. Use PENDING when asking customer for more information or when asking him to confirm solution of the ticket.",
    schema: z.object({
      newState: z.string().describe("The new state to set for the ticket"),
    }),
    func: async ({ newState }) => {
      // Reuse the existing tool's logic
      return updateTicketStateTool.func({ ticketId, newState });
    },
  });
} 