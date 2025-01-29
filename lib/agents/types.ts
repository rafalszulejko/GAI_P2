export interface AgentResponse {
  // Free-form text the agent wants to convey to the user, e.g. explanation or summary
  message: string

  // A place to store any relevant "thought process" or "reasoning" 
  // that might be surfaced to the user or used for logging
  reasoning: string

  // The suggested tool to use, if any. 
  // Example values: "ADD_PUBLIC_MESSAGE", "CHANGE_TICKET_STATE", "CHANGE_METADATA_VALUE"
  proposedTool?: string

  // Optional arguments that the chosen tool will need. 
  // For example, to change the ticket state:
  // { newState: "OPEN" }
  // For adding a new public message:
  // { content: "Here is a new user-facing message" }
  // For changing metadata:
  // { metadataType: "XYZ", metadataValue: "123" }
  toolArguments?: Record<string, any>

  // Whether the agent wants to "finalize" the conversation or remain open for more Q&A
  isFinal?: boolean
} 