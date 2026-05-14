import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, Send, ImagePlus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export function ReviewModal({ isOpen, onClose, booking, onSuccess }: any) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 THÊM STATES CHO ẢNH
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Dọn dẹp bộ nhớ rác khi component unmount hoặc đóng modal
  useEffect(() => {
    if (!isOpen) {
      setRating(5);
      setComment("");
      setImages([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // 🚀 XỬ LÝ KHI NGƯỜI DÙNG CHỌN ẢNH
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Backend giới hạn tối đa 5 ảnh
      if (images.length + filesArray.length > 5) {
        toast.error("Bạn chỉ được tải lên tối đa 5 ảnh!");
        return;
      }

      // Check dung lượng từng file (Max 5MB)
      const oversizedFile = filesArray.find((f) => f.size > 5 * 1024 * 1024);
      if (oversizedFile) {
        toast.error("Mỗi ảnh không được vượt quá 5MB!");
        return;
      }

      setImages((prev) => [...prev, ...filesArray]);

      // Tạo URL xem trước cho ảnh
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // 🚀 XỬ LÝ XÓA ẢNH ĐANG CHỌN
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]); // Giải phóng bộ nhớ
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // 🚀 CHUYỂN SANG DÙNG FORMDATA ĐỂ GỬI FILE
      const formData = new FormData();
      formData.append("booking_id", booking.id.toString());
      formData.append(
        "cruise_id",
        (
          booking.schedule?.cruise_id || booking.schedule?.cruise?.id
        ).toString(),
      );
      formData.append("rating", rating.toString());
      formData.append("comment", comment);

      // Gắn từng file ảnh vào mảng images[]
      images.forEach((image) => {
        formData.append("images[]", image);
      });

      await axios.post("http://localhost:8081/api/reviews", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Quan trọng
        },
      });

      toast.success("Cảm ơn bạn đã đánh giá chuyến đi!");
      onSuccess(booking.id);
      onClose();
    } catch (error: any) {
      console.error("Lỗi gửi đánh giá:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Lớp phủ mờ nền */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        ></motion.div>

        {/* Khối Nội Dung Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Nút Đóng */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Đánh Giá Chuyến Đi
              </h3>
              <p className="text-slate-500 text-sm">
                Bạn cảm thấy thế nào về hành trình cùng{" "}
                <span className="font-bold text-amber-600">
                  {booking?.schedule?.cruise?.name}
                </span>
                ?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chọn Sao */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors duration-200 ${
                          (hoverRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">
                  {rating === 5
                    ? "Tuyệt Vời"
                    : rating === 4
                      ? "Rất Tốt"
                      : rating === 3
                        ? "Bình Thường"
                        : rating === 2
                          ? "Kém"
                          : "Rất Tệ"}
                </span>
              </div>

              {/* Ô nhập nội dung */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  <MessageSquare className="w-4 h-4 text-amber-500" /> Nhận Xét
                  Của Bạn
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn (phục vụ, phòng ốc, đồ ăn...)"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none text-sm"
                  required
                ></textarea>
              </div>

              {/* 🚀 KHU VỰC UPLOAD ẢNH */}
              <div>
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  <span className="flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-amber-500" /> Thêm Ảnh
                  </span>
                  <span className="text-xs text-slate-400 normal-case font-normal">
                    {images.length}/5 ảnh
                  </span>
                </label>

                <div className="flex flex-wrap gap-3">
                  {/* Danh sách ảnh Preview */}
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Trash2 className="w-5 h-5 text-rose-400" />
                      </button>
                    </div>
                  ))}

                  {/* Nút Upload (Ẩn khi đủ 5 ảnh) */}
                  {images.length < 5 && (
                    <label className="w-20 h-20 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                      <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Nút Gửi */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-lg disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Gửi Đánh Giá
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
