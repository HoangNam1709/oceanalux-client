import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Dùng react-router-dom
import {
  Ship,
  Mail,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Timer,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // STATE ĐIỀU HƯỚNG & LOADING
  const [step, setStep] = useState<1 | 2>(1); // 1: Nhập Email, 2: Nhập OTP & MK mới
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // STATE DỮ LIỆU FORM
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STATE ĐẾM NGƯỢC
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Effect chạy đồng hồ đếm ngược
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // BƯỚC 1: GỬI EMAIL YÊU CẦU OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8081/api/send-otp", {
        email: email,
        type: "reset_password",
      });

      setSuccessMsg(
        response.data.message || "Mã OTP đã được gửi tới email của bạn.",
      );
      setStep(2);
      setCountdown(60); // Bắt đầu đếm ngược 60s
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(
          err.response.data.message ||
            "Bạn thao tác quá nhanh. Vui lòng đợi 1 phút.",
        );
      } else {
        setError(
          err.response?.data?.message || "Email không tồn tại trong hệ thống.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: GỬI OTP VÀ MẬT KHẨU MỚI ĐỂ XÁC NHẬN
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/api/verify-and-process",
        {
          email: email,
          otp: otpCode,
          password: newPassword,
          password_confirmation: confirmPassword,
          type: "reset_password",
        },
      );

      if (response.status === 200) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.",
      );
    } finally {
      setLoading(false);
    }
  };

  // UX: Xử lý nhập OTP mượt mà (Tự động đè số mới lên số cũ)
  const handleOtpChange = (index: number, value: string) => {
    // Chỉ giữ lại các ký tự là số (0-9) và luôn lấy số nằm ở cuối cùng
    const cleanValue = value.replace(/[^0-9]/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Nếu gõ thành công 1 số, lập tức nhảy con trỏ sang ô tiếp theo
    if (cleanValue !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Trang trí */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0A192F]/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-[#0A192F] text-[#D4AF37] rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Ship className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0A192F] uppercase">
              Oceana<span className="text-[#D4AF37]">Lux</span>
            </span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#0A192F] mb-2">
            Phục Hồi Mật Khẩu
          </h1>
          <p className="text-slate-600">
            {step === 1
              ? "Nhập email của bạn để nhận mã xác thực an toàn"
              : "Tạo mật khẩu mới cho tài khoản của bạn"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {/* HIỂN THỊ LỖI / THÀNH CÔNG */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex items-center gap-2 animate-pulse">
              ⚠️ {error}
            </div>
          )}
          {successMsg && step === 2 && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> {successMsg}
            </div>
          )}

          {/* BƯỚC 1: NHẬP EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-[#0A192F] text-amber-400 rounded-xl hover:bg-slate-800 transition-all shadow-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang kiểm
                    tra...
                  </>
                ) : (
                  "Nhận Mã Xác Thực"
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-[#0A192F] font-medium transition-colors mt-4"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
              </Link>
            </form>
          )}

          {/* BƯỚC 2: NHẬP OTP & ĐẶT LẠI MK */}
          {step === 2 && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">
                  Mã OTP (6 chữ số)
                </label>
                <div className="flex justify-center gap-2 my-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      // ✅ ĐÃ THÊM: Tự động bôi đen (select) khi khách hàng click vào ô
                      onFocus={(e) => e.target.select()}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-[#0A192F] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 px-6 bg-amber-500 text-[#0A192F] rounded-xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang cập
                    nhật...
                  </>
                ) : (
                  "Xác nhận Đổi Mật Khẩu"
                )}
              </button>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-500 hover:text-[#0A192F] font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>

                {countdown > 0 ? (
                  <span className="text-sm text-slate-400 font-medium flex items-center gap-1">
                    <Timer className="w-4 h-4" /> Gửi lại mã sau {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-sm text-[#D4AF37] hover:text-amber-600 font-bold"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
