import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Lấy các tham số VNPay trả về trên URL
  const responseCode = searchParams.get("vnp_ResponseCode");
  const transactionNo = searchParams.get("vnp_TransactionNo");
  const amountInfo = searchParams.get("vnp_Amount");

  useEffect(() => {
    // Phân tích mã phản hồi từ VNPay
    if (responseCode === "00") {
      setStatus("success");
    } else if (responseCode) {
      // Các mã lỗi khác (VD: 24 - Khách hủy giao dịch, 51 - Tài khoản không đủ tiền...)
      setStatus("error");
    } else {
      // Nếu truy cập thẳng vào trang này mà không có tham số VNPay
      navigate("/");
    }
  }, [responseCode, navigate]);

  const formattedAmount = amountInfo 
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amountInfo) / 100) 
    : "";

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Đang kiểm tra kết quả giao dịch...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === "success" ? (
          <>
            {/* GIAO DIỆN THÀNH CÔNG (Giống với CheckoutPage của bạn) */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Đặt Phòng Thành Công!</h2>
            <p className="text-slate-600 mb-6">
              Giao dịch qua VNPAY đã được xác nhận. Kỳ nghỉ dưỡng xa hoa của quý khách đã sẵn sàng.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Mã giao dịch VNPay:</span>
                <span className="font-mono font-bold text-slate-900">{transactionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Số tiền:</span>
                <span className="font-bold text-amber-500">{formattedAmount}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> Về Bảng Điều Khiển
            </button>
          </>
        ) : (
          <>
            {/* GIAO DIỆN THẤT BẠI / HỦY GIAO DỊCH */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Thanh Toán Thất Bại</h2>
            <p className="text-slate-600 mb-8">
              Giao dịch của quý khách đã bị hủy hoặc xảy ra sự cố (Mã lỗi: {responseCode}). Vui lòng thử lại.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-1/2 bg-slate-200 text-slate-800 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Trang chủ
              </button>
              <button
                // Trong thực tế, bạn có thể truyền ID về lại trang checkout, ở đây mình cho về trang chủ tìm lại tàu
                onClick={() => navigate(-1)} 
                className="w-1/2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> Thử lại
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}