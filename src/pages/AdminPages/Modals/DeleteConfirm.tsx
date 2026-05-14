import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";

export function DeleteConfirm({
  title = "Xác Nhận Xóa",
  label,
  warningText = "Thao tác này sẽ đánh dấu dữ liệu là đã hủy/xoá và không thể hoàn tác. Vui lòng xác nhận trước khi tiếp tục.",
  confirmText = "Xác Nhận Xóa",
  isProcessing = false,
  onConfirm,
  onClose,
}: {
  title?: string;
  label: ReactNode | string;
  warningText?: string;
  confirmText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A192F]/55 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="bg-[#FDFBF7] rounded-[20px] w-full max-w-md shadow-2xl text-center relative overflow-hidden"
      >
        {/* Gold accent bar ở đầu modal */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4AF37]" />

        <div className="px-9 pt-8 pb-7">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-5 bg-[#0A192F] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
            <Ban className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-bold text-[#0A192F] mb-2 tracking-wide">
            {title}
          </h3>

          {/* Label */}
          <div className="text-slate-500 text-sm mb-5 px-1 leading-relaxed">
            {typeof label === "string" ? (
              <>
                Bạn chắc chắn muốn xoá{" "}
                <strong className="text-[#0A192F] font-semibold">
                  {label}
                </strong>
                ?
              </>
            ) : (
              label
            )}
          </div>

          {/* Warning box — left border thay vì full border */}
          <div className="flex items-start gap-2.5 bg-[#D4AF37]/8 border-l-[3px] border-[#D4AF37] rounded-r-lg px-3 py-2.5 mb-6 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#A07C1E]" />
            <p className="text-xs text-[#A07C1E] leading-relaxed font-medium">
              {warningText}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5">
            <button
              disabled={isProcessing}
              onClick={onClose}
              className="flex-1 py-3 rounded-[10px] text-sm font-bold text-[#0A192F] bg-[#EBE5D9] hover:bg-[#DDD6C6] transition-colors disabled:opacity-50"
            >
              Giữ Lại
            </button>
            <button
              disabled={isProcessing}
              onClick={() => {
                if (!isProcessing) onConfirm();
              }}
              className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#0A192F] hover:bg-[#142438] text-[#D4AF37] rounded-[10px] text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
