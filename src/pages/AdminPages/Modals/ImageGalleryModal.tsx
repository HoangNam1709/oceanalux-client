import React, { useState } from "react";
import {
  X,
  Plus,
  Image as ImageIcon,
  Star,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: "cruise" | "cabin";
  itemId: string | number;
  itemName: string;
  initialImages: any[]; // Danh sách ảnh hiện tại [{id, image_url}]
  currentThumbnail: string; // URL ảnh bìa hiện tại để so sánh
  onUpdate: () => void; // Hàm gọi lại để load lại danh sách cha
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
  const [isSubmitting, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    setIsAdding(true);
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
      if (data.status === "success") {
        setImages([...images, data.data]);
        setNewUrl("");
        toast.success("Đã thêm ảnh vào bộ sưu tập");
        onUpdate(); // Cập nhật lại danh sách cha
      }
    } catch (e) {
      toast.error("Lỗi thêm ảnh");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (imgId: number) => {
    if (!window.confirm("Xóa ảnh này khỏi thư viện?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8081/api/admin/${type}/images/${imgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(images.filter((img) => img.id !== imgId));
      toast.success("Đã xóa ảnh");
      onUpdate();
    } catch (e) {
      toast.error("Lỗi xóa ảnh");
    }
  };

  const handleSetThumbnail = async (url: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
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
      toast.success("Đã đặt làm ảnh bìa!");
      onUpdate();
    } catch (e) {
      toast.error("Lỗi cập nhật ảnh bìa");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0A192F]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
              <ImageIcon className="text-[#D4AF37] w-6 h-6" /> Thư viện ảnh
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
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
          {/* Form thêm ảnh nhanh */}
          <div className="flex gap-3 mb-8 bg-slate-100 p-4 rounded-2xl border border-slate-200">
            <input
              type="text"
              placeholder="Dán link ảnh mới vào đây (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
            />
            <button
              onClick={handleAdd}
              disabled={isSubmitting}
              className="bg-[#0A192F] text-[#D4AF37] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" />{" "}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <AnimatePresence>
                {images.map((img) => {
                  const isMain = img.image_url === currentThumbnail;
                  return (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-100 shadow-sm hover:shadow-xl transition-all"
                    >
                      <img
                        src={img.image_url}
                        className="w-full h-full object-cover"
                        alt="gallery"
                      />

                      {/* Overlay nút bấm */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(img.id)}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleSetThumbnail(img.image_url)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isMain
                              ? "bg-emerald-500 text-white"
                              : "bg-white text-slate-900 hover:bg-[#D4AF37] hover:text-white"
                          }`}
                        >
                          {isMain ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Ảnh bìa hiện
                              tại
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3" /> Đặt làm ảnh bìa
                            </>
                          )}
                        </button>
                      </div>

                      {/* Badge "Ảnh bìa" nhỏ */}
                      {isMain && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase shadow-sm">
                          Main
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
