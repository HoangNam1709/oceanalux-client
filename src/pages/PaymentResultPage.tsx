import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios"; // Đảm bảo đã import axios
import {
  CheckCircle2,
  XCircle,
  Home,
  ArrowRight,
  Receipt,
  Calendar,
  CreditCard,
  Ship,
  RotateCcw,
} from "lucide-react";

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  // ─── Lấy tham số VNPay trả về trên URL để hiển thị UI ────────────────────
  const responseCode = searchParams.get("vnp_ResponseCode");
  const transactionNo = searchParams.get("vnp_TransactionNo");
  const amountInfo = searchParams.get("vnp_Amount");
  const bankCode = searchParams.get("vnp_BankCode");
  const payDate = searchParams.get("vnp_PayDate"); // yyyyMMddHHmmss

  // ─── 🚀 GỌI API BACKEND ĐỂ CẬP NHẬT DATABASE ─────────────────────────────
  useEffect(() => {
    const queryString = searchParams.toString();

    // Nếu URL không có tham số VNPay, đá về trang chủ
    if (!queryString) {
      navigate("/");
      return;
    }

    // Gửi toàn bộ tham số URL của VNPAY về cho Laravel xác thực và cập nhật DB
    axios
      .get(`http://localhost:8081/api/payment/verify?${queryString}`)
      .then((res) => {
        if (res.data.status === "success") {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch((err) => {
        console.error("Lỗi xác thực thanh toán:", err);
        setStatus("error");
      });
  }, [searchParams, navigate]);

  // ─── Format tiền (VNPay gửi amount * 100) ───────────────────────────────
  const formattedAmount = amountInfo
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(amountInfo) / 100)
    : "—";

  // ─── Format ngày giờ từ chuỗi VNPay yyyyMMddHHmmss ──────────────────────
  const formattedDate = (() => {
    if (!payDate || payDate.length < 14)
      return new Date().toLocaleString("vi-VN");
    const y = payDate.slice(0, 4);
    const mo = payDate.slice(4, 6);
    const d = payDate.slice(6, 8);
    const h = payDate.slice(8, 10);
    const mi = payDate.slice(10, 12);
    const s = payDate.slice(12, 14);
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`).toLocaleString("vi-VN");
  })();

  // ─── Tên ngân hàng / phương thức ────────────────────────────────────────
  const getMethodName = (code: string | null) => {
    if (!code) return "VNPAY";
    const map: Record<string, string> = {
      VNPAYQR: "VNPAY QR",
      NCB: "Ngân hàng NCB",
      AGRIBANK: "Agribank",
      SCB: "SCB",
      SACOMBANK: "Sacombank",
      EXIMBANK: "Eximbank",
      MSBANK: "Maritime Bank",
      NAMABANK: "Nam A Bank",
      VISA: "Thẻ Quốc Tế Visa",
      MASTERCARD: "Thẻ Quốc Tế Mastercard",
      JCB: "Thẻ Quốc Tế JCB",
    };
    return map[code] ?? code;
  };

  // ─── Lấy mô tả lỗi chuẩn xác từ VNPAY ──────────────────────────────────
  const getErrorMessage = (code: string | null) => {
    const errors: Record<string, string> = {
      "24": "Quý khách đã chủ động hủy giao dịch.",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
      "10": "Giao dịch không thành công do: Quý khách xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Quý khách vui lòng thực hiện lại giao dịch.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản bị khóa.",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    };
    return (
      errors[code || ""] || "Giao dịch bị từ chối hoặc có lỗi hệ thống xảy ra."
    );
  };

  // ─── Xử lý hành động "Thử lại thanh toán" ──────────────────────────────
  const handleRetry = () => {
    const retryUrl = localStorage.getItem("retryCheckoutUrl");

    if (retryUrl) {
      // Bỏ qua lịch sử trình duyệt, bay thẳng về trang Checkout mới tinh
      navigate(retryUrl);
    } else {
      // Khách không có link dự phòng thì cho về Trang chủ cho an toàn
      navigate("/");
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full"
        />
        <p className="text-[#0A192F] font-medium tracking-wide">
          Đang đồng bộ kết quả từ VNPAY…
        </p>
      </div>
    );
  }

  const isSuccess = status === "success";

  // ─── Animation variants ──────────────────────────────────────────────────
  const containerVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { delay: 0.2, type: "spring" as const, stiffness: 150 },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* ── Header Banner ─────────────────────────────────────────────── */}
        <div
          className={`p-8 text-center ${isSuccess ? "bg-[#0A192F]" : "bg-red-50"}`}
        >
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isSuccess ? "bg-[#D4AF37]/20" : "bg-red-100"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-12 h-12 text-[#D4AF37]" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </motion.div>

          <h1
            className={`text-3xl font-serif font-bold mb-2 ${
              isSuccess ? "text-white" : "text-red-700"
            }`}
          >
            {isSuccess ? "Đặt Vé Thành Công!" : "Giao Dịch Thất Bại"}
          </h1>
          <p className={isSuccess ? "text-gray-300" : "text-red-500"}>
            {isSuccess
              ? "Cảm ơn quý khách đã tin tưởng lựa chọn dịch vụ du thuyền đẳng cấp của chúng tôi."
              : getErrorMessage(responseCode)}
          </p>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="p-8 space-y-8">
          {/* Order Info Card */}
          <div className="bg-[#F8F9FA] rounded-xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-[#0A192F] mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
              <Receipt className="w-5 h-5 text-[#D4AF37]" />
              Chi Tiết Giao Dịch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {/* Mã giao dịch VNPay */}
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Mã Giao Dịch
                </p>
                <p className="font-mono font-bold text-[#0A192F] text-lg">
                  {transactionNo && transactionNo !== "0" ? transactionNo : "—"}
                </p>
              </div>

              {/* Tổng tiền */}
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Tổng Tiền
                </p>
                <p
                  className={`font-bold text-xl ${isSuccess ? "text-[#D4AF37]" : "text-[#0A192F]"}`}
                >
                  {formattedAmount}
                </p>
              </div>

              {/* Thời gian */}
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Thời Gian
                </p>
                <div className="flex items-center gap-2 font-medium text-[#0A192F]">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formattedDate}
                </div>
              </div>

              {/* Phương thức */}
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Thanh toán qua
                </p>
                <div className="flex items-center gap-2 font-medium text-[#0A192F]">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  {getMethodName(bankCode)}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps – chỉ hiện khi thành công */}
          {isSuccess && (
            <div className="bg-[#0A192F]/5 p-5 rounded-xl border border-[#0A192F]/10 flex gap-4 items-start">
              <div className="p-2 bg-[#0A192F] rounded-lg shrink-0">
                <Ship className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="font-bold text-[#0A192F] mb-1">
                  Bước Tiếp Theo
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Email xác nhận cùng vé điện tử đã được gửi tới hòm thư của quý
                  khách. Quý khách có thể xem lại thông tin hành trình và quản
                  lý dịch vụ tại bảng điều khiển cá nhân.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#0A192F] text-[#0A192F] rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5" />
              Về Trang Chủ
            </button>

            <button
              onClick={isSuccess ? () => navigate("/dashboard") : handleRetry}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A192F] text-white rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all"
            >
              {isSuccess ? (
                <>
                  Hành Trình Của Tôi <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5" /> Thử Lại Thanh Toán
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
