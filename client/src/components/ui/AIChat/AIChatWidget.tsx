import * as React from "react";
import { useChatStore } from "../../../store/chatStore";
import AIChatWindow from "./AIChatWindow";
import { IoSparkles } from "react-icons/io5";

export default function AIChatWidget() {
  const isOpen = useChatStore((state) => state.isOpen);
  const toggleChat = useChatStore((state) => state.toggleChat);

  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const dragging = React.useRef(false);
  const moved = React.useRef(false);
  const offset = React.useRef({ x: 0, y: 0 });
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const clamp = (x: number, y: number) => {
    const el = btnRef.current;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    return {
      x: Math.min(Math.max(x, 0), window.innerWidth - w),
      y: Math.min(Math.max(y, 0), window.innerHeight - h),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragging.current = true;
    moved.current = false;
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    moved.current = true;
    const next = clamp(e.clientX - offset.current.x, e.clientY - offset.current.y);
    setPosition(next);
  }, []);

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    btnRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleClick = () => {
    if (!moved.current) toggleChat();
  };

  return (
    <>
      <AIChatWindow />
      <div
        className="fixed z-40"
        style={
          position
            ? { left: position.x, top: position.y }
            : { bottom: "1.5rem", right: "1rem" }
        }
      >
        <button
          ref={btnRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={handleClick}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1a1a1a] text-white border-2 border-white/60 hover:border-white rounded-sm shadow-2xl transition-all duration-200 hover:bg-black active:scale-95 group cursor-grab active:cursor-grabbing touch-none"
          aria-label={isOpen ? "Close AI Assistance" : "Open AI Assistance"}
        >
          <span className="text-[#1bddf3] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <IoSparkles />
          </span>

          <span className="text-xs md:text-sm uppercase font-bold tracking-wider text-white group-hover:text-[#1bddf3] transition-colors">
            AI Assistance
          </span>

          <span className="w-2 h-2 rounded-full bg-[#1bddf3]"></span>
        </button>
      </div>
    </>
  );
}
