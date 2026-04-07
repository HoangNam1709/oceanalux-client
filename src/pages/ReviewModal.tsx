import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, Send } from "lucide-react";
import axios from "axios";

export function ReviewModal({ isOpen, onClose, booking, onSuccess }: any) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      // Gọi API gửi đánh giá xuống Backend
      await axios.post("http://localhost/api/reviews", {
        booking_id: booking.id,
        cruise_id: booking.schedule?.cruise_id || booking.schedule?.cruise?.id,
        rating: rating,
        comment: comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Cảm ơn bạn đã đánh giá chuyến đi!");
      onSuccess(booking.id); // Gọi hàm update lại UI ở Dashboard
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Lớp phủ mờ nền */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        ></motion.div>

        {/* Khối Nội Dung Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10"
        >
          {/* Nút Đóng */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Đánh Giá Chuyến Đi</h3>
              <p className="text-slate-500 text-sm">
                Bạn cảm thấy thế nào về hành trình cùng <span className="font-bold text-amber-600">{booking?.schedule?.cruise?.name}</span>?
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
                  {rating === 5 ? "Tuyệt Vời" : rating === 4 ? "Rất Tốt" : rating === 3 ? "Bình Thường" : rating === 2 ? "Kém" : "Rất Tệ"}
                </span>
              </div>

              {/* Ô nhập nội dung */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  <MessageSquare className="w-4 h-4 text-amber-500" /> Nhận Xét Của Bạn
                </label>
                <textarea 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn (phục vụ, phòng ốc, đồ ăn...)"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-lg disabled:opacity-70"
              >
                {isSubmitting ? "Đang gửi..." : <><Send className="w-4 h-4" /> Gửi Đánh Giá</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}