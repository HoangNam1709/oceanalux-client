import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

export function AccessConfirm({
  title = "Xác Nhận Thành Công",
  label,
  confirmText = "Đồng Ý",
  cancelText = "Trở Về",
  isProcessing = false,
  onConfirm,
  onClose,
}: {
  title?: string;
  label: ReactNode | string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#FDFBF7] rounded-[24px] p-8 max-w-sm w-full shadow-2xl text-center relative"
      >
        <div className="w-16 h-16 mx-auto bg-[#0A192F] rounded-full border-[3px] border-[#D4AF37] flex items-center justify-center mb-5 shadow-md">
          <CheckCircle className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#0A192F] mb-3 tracking-wide">
          {title}
        </h3>

        <div className="text-slate-600 text-sm mb-7 px-2 leading-relaxed">
          {label}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-[#0A192F] transition-colors shadow-sm disabled:opacity-50"
            style={{ backgroundColor: "#EBE5D9" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#DFD8C9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#EBE5D9")
            }
          >
            {cancelText}
          </button>
          <button
            disabled={isProcessing}
            onClick={() => {
              if (!isProcessing) onConfirm();
            }}
            className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-[#0A192F] text-[#D4AF37] rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
