import { create } from "zustand";
import { ChatMessage, ChatMessageDTO } from "../types/chatType";
import { sendChatMessage } from "../services/api/chat/chatAPI";

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  setIsOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  sender: "ai",
  text: "Hello! I am your AI Watch Concierge. Tell me what kind of watch you're looking for (e.g., style, occasion, budget, or features), and I'll find the best matches from our collection.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [INITIAL_GREETING],
  isLoading: false,
  error: null,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  clearChat: () =>
    set({
      messages: [INITIAL_GREETING],
      error: null,
      isLoading: false,
    }),

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || get().isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const currentMessages = get().messages;
    set({
      messages: [...currentMessages, userMessage],
      isLoading: true,
      error: null,
    });

    try {
      // Build history for Gemini (last 8 messages, mapped to 'user' / 'model')
      const history: ChatMessageDTO[] = currentMessages
        .slice(-8)
        .map((msg) => ({
          role: msg.sender === "user" ? ("user" as const) : ("model" as const),
          text: msg.text,
        }));

      const response = await sendChatMessage({
        message: trimmed,
        history,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.reply,
        products: response.recommendedProducts,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to connect to the AI Assistant. Please try again.";

      const fallbackAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I'm temporarily having trouble connecting to my service. Please try again in a moment, or browse our Watches on the Products page.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      set((state) => ({
        messages: [...state.messages, fallbackAiMessage],
        isLoading: false,
        error: errorMessage,
      }));
    }
  },
}));
