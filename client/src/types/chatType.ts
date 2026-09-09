import { ProductDTO } from "./productType";

export interface ChatMessageDTO {
  role: "user" | "model";
  text: string;
}

export interface ChatRequestDTO {
  message: string;
  history: ChatMessageDTO[];
}

export interface ChatResponseDTO {
  reply: string;
  recommendedProducts: ProductDTO[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  products?: ProductDTO[];
  timestamp: string;
}
