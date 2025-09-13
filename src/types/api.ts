// API Message types
export interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

// Chat API request payload
export interface ChatRequest {
  messages: ApiMessage[];
  temperature?: number;
  max_tokens?: number;
  summary?: string;
}

// Chat API response
export interface ChatResponse {
  reply: string;
}

// UI Message types (for component state)
export interface UiMessage {
  role: "user" | "ai";
  text: string;
}

// Utility type for API endpoints
export interface ApiEndpoints {
  chat: "/api/ai/chat";
}

// Common API error response
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}
