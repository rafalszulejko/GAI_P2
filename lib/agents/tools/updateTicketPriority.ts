import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const updateTicketPriorityTool = new DynamicStructuredTool({
  name: "update_ticket_priority",
  description: "Updates the priority of a specified ticket",
  schema: z.object({
    ticketId: z.string().describe("The ID of the ticket to update"),
    newPriority: z.string().describe("The new priority to set for the ticket"),
  }),
  func: async ({ ticketId, newPriority }) => {
    const supabase = await createClient();
    
    // First, validate that the priority value exists in metadata_dict
    const uppercasedPriority = newPriority.toUpperCase();
    
    const { data: validPriorities, error: dictError } = await supabase
      .from("metadata_dict")
      .select("value")
      .eq("metadata_type", "PRIORITY");

    if (dictError) {
      return JSON.stringify({
        success: false,
        error: `Failed to fetch valid priorities: ${dictError.message}`
      });
    }

    if (!validPriorities.some(p => p.value === uppercasedPriority)) {
      return JSON.stringify({
        success: false,
        error: `Invalid priority value. Valid values are: ${validPriorities.map(p => p.value).join(", ")}`
      });
    }

    // Update or insert the priority metadata value
    const { data: existingMetadata } = await supabase
      .from("metadata_value")
      .select()
      .eq("ticket_id", ticketId)
      .eq("metadata_type", "PRIORITY")
      .single();

    let updateResult;
    
    if (existingMetadata) {
      // Update existing priority
      updateResult = await supabase
        .from("metadata_value")
        .update({ value: uppercasedPriority })
        .eq("ticket_id", ticketId)
        .eq("metadata_type", "PRIORITY")
        .select()
        .single();
    } else {
      // Insert new priority
      updateResult = await supabase
        .from("metadata_value")
        .insert({
          ticket_id: ticketId,
          metadata_type: "PRIORITY",
          value: uppercasedPriority
        })
        .select()
        .single();
    }

    const { error: updateError } = updateResult;

    if (updateError) {
      return JSON.stringify({
        success: false,
        error: updateError.message
      });
    }

    return JSON.stringify({
      success: true,
      data: {
        id: ticketId,
        priority: uppercasedPriority
      }
    });
  },
});

export function createUpdateTicketPriorityTool(ticketId: string) {
  return new DynamicStructuredTool({
    name: "update_ticket_priority",
    description: "Updates the priority of the current ticket",
    schema: z.object({
      newPriority: z.string().describe("The new priority to set for the ticket"),
    }),
    func: async ({ newPriority }) => {
      // Reuse the existing tool's logic
      return updateTicketPriorityTool.func({ ticketId, newPriority });
    },
  });
} 