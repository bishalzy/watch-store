import * as React from "react";
import Backdrop from "../Backdrop/Backdrop";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm",
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  function handleClose() {
    setIsVisible(false);
    setTimeout(() => {
      if (isOpen) onCancel();
    }, 300)
  }

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 0);
  }, [])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] px-4">
      <Backdrop handleOnClick={handleClose} isVisible={isVisible} />
      <div className={`flex items-center justify-center duration-300 z-[200] ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="bg-[#111113] text-[#F2EDE4] border border-[#F2EDE4]/10 p-6 md:p-7 rounded-sm w-[320px] md:w-[400px]">
          <h2 className="text-xl mb-2">{title}</h2>
          <p className="text-sm text-[#F2EDE4]/70 mb-6 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs border border-[#F2EDE4]/20 text-[#F2EDE4]/70 rounded-sm hover:border-[#F2EDE4]/40 hover:text-[#F2EDE4] transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-xs border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500 hover:text-[#0A0A0B] hover:border-red-500 transition-colors duration-150"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
