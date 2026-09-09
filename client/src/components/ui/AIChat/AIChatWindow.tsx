import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../../store/chatStore";
import AIChatProductCard from "./AIChatProductCard";
import { RxCross1 } from "react-icons/rx";
import { IoSend, IoTrashOutline, IoSparkles } from "react-icons/io5";

const SUGGESTIONS = [
  "Water-resistant sports watches",
  "Elegant dress watch for formal wear",
  "Watches under Rs. 20,000",
  "Classic everyday leather strap watch",
];

function FormattedMessageText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        return (
          <div key={pIdx}>
            {lines.map((line, lIdx) => {
              const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
              const cleanedLine = isBullet ? line.trim().substring(2) : line;
              const parts = cleanedLine.split(/(\*\*.*?\*\*)/g);
              const formattedParts = parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={i} className="text-white font-bold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              });

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex gap-2 items-start ml-1 my-1">
                    <span className="text-[#1bddf3] font-bold text-xs mt-0.5">•</span>
                    <span className="text-neutral-200">{formattedParts}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} className="text-neutral-200">
                  {formattedParts}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AIChatWindow() {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messageRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const lastScrolledMsgId = useRef<string | null>("greeting");

  const isOpen = useChatStore((state) => state.isOpen);
  const setIsOpen = useChatStore((state) => state.setIsOpen);
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const clearChat = useChatStore((state) => state.clearChat);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll to the start/top of the newly added message (never auto-scroll to the bottom of the response)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.id === "greeting") return;

    if (lastScrolledMsgId.current !== lastMsg.id) {
      lastScrolledMsgId.current = lastMsg.id;
      requestAnimationFrame(() => {
        const el = messageRefs.current[lastMsg.id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div
      className="fixed bottom-20 right-4 md:right-8 z-50 w-[92vw] sm:w-[420px] md:w-[470px] h-[580px] max-h-[82vh] bg-[#1a1a1a] text-white border-2 border-white/60 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-label="AI Watch Assistance Chat"
    >
      {/* Header - Matching store SidePanelContainer style */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black border-b-2 border-b-white">
        <div className="flex items-center gap-2.5">
          <span className="text-[#1bddf3] text-lg">
            <IoSparkles />
          </span>
          <div>
            <h2 className="text-white text-sm md:text-base uppercase font-bold tracking-wider">
              AI Watch Assistance
            </h2>
            <span className="text-[11px] text-[#c7c7c7] uppercase tracking-wide block">
              Powered by Gemini
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            title="Clear conversation"
            className="p-1.5 text-gray-400 hover:text-red-500 duration-150 transition-colors"
            aria-label="Clear chat"
          >
            <IoTrashOutline size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Close chat"
            className="p-1.5 text-white hover:text-red-500 duration-150 transition-colors"
            aria-label="Close chat"
          >
            <RxCross1 size={20} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/[0.95]">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              ref={(el) => {
                messageRefs.current[msg.id] = el;
              }}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`text-sm shadow-md rounded-sm ${
                  isUser
                    ? "max-w-[85%] bg-[#1bddf3] text-black font-semibold px-4 py-2.5"
                    : "max-w-[92%] bg-[#1a1a1a] text-neutral-100 border border-white/30 px-4 py-3"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <FormattedMessageText text={msg.text} />
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                {msg.timestamp}
              </span>

              {/* Product recommendations attached to this message */}
              {msg.products && msg.products.length > 0 && (
                <div className="w-full mt-3 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1bddf3] px-1 block">
                    Recommended Watches ({msg.products.length})
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.products.map((prod) => (
                      <AIChatProductCard key={prod.id} product={prod} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-gray-300 text-xs px-3.5 py-2 bg-[#1a1a1a] border border-white/20 rounded-sm w-fit">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1bddf3] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1bddf3] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1bddf3] animate-bounce"></span>
            </div>
            <span className="uppercase tracking-wider text-[11px] font-semibold">
              Consulting watch catalog...
            </span>
          </div>
        )}

        {/* Icebreaker Suggestions */}
        {showSuggestions && !isLoading && (
          <div className="pt-2">
            <span className="text-xs text-[#c7c7c7] uppercase tracking-wider font-semibold block mb-2">
              Suggested queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="text-xs bg-black text-neutral-200 border border-white/40 hover:border-[#1bddf3] hover:text-[#1bddf3] px-3 py-1.5 rounded-sm transition-all duration-150 text-left uppercase tracking-wide font-medium"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Matching store form inputs and buttons */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#1a1a1a] border-t-2 border-white/40 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask in plain English (e.g., diver watch under Rs. 15,000)..."
          disabled={isLoading}
          className="flex-1 bg-black text-white text-sm px-3.5 py-2.5 rounded-sm border-2 border-white/40 focus:border-[#1bddf3] focus:outline-none placeholder-gray-500 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="h-[42px] px-4 rounded-sm bg-[#1bddf3] text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-80 active:scale-95 flex items-center justify-center transition-all flex-shrink-0"
          aria-label="Send message"
        >
          <IoSend size={16} />
        </button>
      </form>
    </div>
  );
}
