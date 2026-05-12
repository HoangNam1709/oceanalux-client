import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function DeleteConfirm({
  label,
  onConfirm,
  onClose,
}: {
  label: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xoá</h3>
        <p className="text-slate-500 text-sm mb-7">
          Bạn có chắc muốn xoá{" "}
          <span className="font-semibold text-slate-800">"{label}"</span>? Hành
          động này không thể hoàn tác.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
          >
            Xoá
          </button>
        </div>
      </motion.div>
    </div>
  );
}
