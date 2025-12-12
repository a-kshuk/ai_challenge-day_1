import { MessageRole } from "gigachat/interfaces";

export interface ChatMessage {
  role: MessageRole;
  content?: string;
}

export interface ChatResponse {
  message: string;
  prompt_tokens: number;
  completion_tokens: number;
}
