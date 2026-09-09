import { useChatStore } from "../../../store/chatStore";
import AIChatWindow from "./AIChatWindow";
import { IoSparkles } from "react-icons/io5";

export default function AIChatWidget() {
  const isOpen = useChatStore((state) => state.isOpen);
  const toggleChat = useChatStore((state) => state.toggleChat);

  return (
    <>
      <AIChatWindow />
      <div className="fixed bottom-6 right-4 md:right-8 z-40">
        <button
          onClick={toggleChat}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1a1a1a] text-white border-2 border-white/60 hover:border-white rounded-sm shadow-2xl transition-all duration-200 hover:bg-black active:scale-95 group"
          aria-label={isOpen ? "Close AI Concierge" : "Open AI Concierge"}
        >
          <span className="text-[#1bddf3] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <IoSparkles />
          </span>

          <span className="text-xs md:text-sm uppercase font-bold tracking-wider text-white group-hover:text-[#1bddf3] transition-colors">
            AI Concierge
          </span>

          <span className="w-2 h-2 rounded-full bg-[#1bddf3]"></span>
        </button>
      </div>
    </>
  );
}
