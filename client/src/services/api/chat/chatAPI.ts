import axios from "axios";
import { BACKEND_API_URL } from "../../../utils/constants";
import { ChatRequestDTO, ChatResponseDTO } from "../../../types/chatType";

export async function sendChatMessage(request: ChatRequestDTO): Promise<ChatResponseDTO> {
  try {
    const response = await axios.post<ChatResponseDTO>(`${BACKEND_API_URL}/chat`, request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Chat API error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to get a response from AI Concierge. Please try again."
      );
    }
    console.error("Unexpected chat error:", error);
    throw error;
  }
}
