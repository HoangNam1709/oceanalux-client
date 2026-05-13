import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Image as ImageIcon,
  Star,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle, // Thêm icon cảnh báo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: "cruise" | "cabin";
  itemId: string | number;
  itemName: string;
  initialImages: { id: number; image_url: string }[];
  currentThumbnail: string;
  onUpdate: () => void;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  type,
  itemId,
  itemName,
  initialImages,
  currentThumbnail,
  onUpdate,
}: Props) {
  const [images, setImages] = useState(initialImages);
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localThumbnail, setLocalThumbnail] = useState(currentThumbnail);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setImages(initialImages);
      setLocalThumbnail(currentThumbnail);
      setImageToDelete(null); // Reset lại trạng thái xóa khi mở
    }
  }, [initialImages, currentThumbnail, isOpen]);

  if (!isOpen) return null;

  const safeUpdate = () => {
    if (typeof onUpdate === "function") {
      try {
        onUpdate();
      } catch (err) {
        console.error("Lỗi hàm onUpdate từ cha:", err);
      }
    }
  };

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    setIsSubmitting(true);
    let isSuccess = false;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/${type}/${itemId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: newUrl }),
        },
      );
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setImages([...images, data.data]);
        setNewUrl("");
        toast.success("Đã thêm ảnh vào bộ sưu tập");
        isSuccess = true;
      } else {
        toast.error(data.message || "Lỗi từ máy chủ");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }

    if (isSuccess) safeUpdate();
  };

  // 👉 HÀM XÓA THẬT SỰ (Được gọi khi bấm Xác nhận ở Popup)
  const executeDelete = async () => {
    if (imageToDelete === null) return;

    const imgId = imageToDelete;
    setImageToDelete(null); // Đóng ngay popup xác nhận cho mượt

    // Xóa tạm trên UI
    const oldImages = [...images];
    setImages(images.filter((img) => img.id !== imgId));
    let isSuccess = false;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/${type}/images/${imgId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success("Đã xóa ảnh");
        isSuccess = true;
      } else {
        throw new Error(data.message || "Lỗi từ server");
      }
    } catch (e: any) {
      setImages(oldImages); // Lỗi thì trả lại ảnh
      toast.error("Lỗi xóa ảnh: " + e.message);
    }

    if (isSuccess) safeUpdate();
  };

  const handleSetThumbnail = async (url: string) => {
    const loadingToast = toast.loading("Đang cập nhật ảnh bìa...");
    let isSuccess = false;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/${type}/${itemId}/set-thumbnail`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        },
      );
      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.dismiss(loadingToast);
        toast.success("Đã đặt làm ảnh bìa!");
        setLocalThumbnail(url);
        isSuccess = true;
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Lỗi từ máy chủ");
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error("Lỗi kết nối máy chủ");
    }

    if (isSuccess) safeUpdate();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0A192F]/80 backdrop-blur-md">
      {/* Container chính: Có relative để chứa Popup Xóa */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
      >
        {/* 👉 POPUP XÁC NHẬN XÓA (Hiển thị đè lên bên trong Modal) */}
        <AnimatePresence>
          {imageToDelete !== null && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] p-8 text-center max-w-sm w-full mx-4 border border-slate-100"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Xóa ảnh này?
                </h3>
                <p className="text-slate-500 text-sm mb-8">
                  Ảnh sẽ bị xóa vĩnh viễn khỏi thư viện và không thể khôi phục
                  lại được.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setImageToDelete(null)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
                  >
                    Xóa ngay
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
              <ImageIcon className="text-[#D4AF37] w-6 h-6" /> Thư viện ảnh
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">
              {itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Form thêm ảnh */}
          <div className="flex gap-3 mb-8 bg-slate-100 p-4 rounded-2xl border border-slate-200">
            <input
              type="text"
              placeholder="Dán link ảnh mới vào đây (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-[#D4AF37] text-sm outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={isSubmitting}
              className="bg-[#0A192F] text-[#D4AF37] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isSubmitting ? "Đang lưu..." : "Thêm ảnh"}
            </button>
          </div>

          {/* Grid hiển thị ảnh */}
          {images.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">
                Chưa có ảnh nào trong thư viện.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((img) => {
                  const isMain = img.image_url === localThumbnail;
                  return (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={img.image_url}
                        className="w-full h-full object-cover"
                        alt="gallery"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://placehold.co/400x300/e2e8f0/64748b?text=Image+Error";
                        }}
                      />

                      <button
                        onClick={() => setImageToDelete(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Nút Đặt làm ảnh bìa */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSetThumbnail(img.image_url)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                            isMain
                              ? "bg-emerald-500 text-white"
                              : "bg-white text-slate-900 hover:bg-[#D4AF37] hover:text-white"
                          }`}
                        >
                          {isMain ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Ảnh bìa
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3" /> Làm ảnh bìa
                            </>
                          )}
                        </button>
                      </div>

                      {/* Badge "Ảnh bìa" */}
                      {isMain && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase shadow-sm tracking-wider">
                          Bìa
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
