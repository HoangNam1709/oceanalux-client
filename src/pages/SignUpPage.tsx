import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ship,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Timer,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
export function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // STATE LUỒNG OTP
  const [step, setStep] = useState<1 | 2>(1); // 1: Điền Form, 2: Nhập OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  // Đếm ngược 60s
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // BƯỚC 1: XỬ LÝ GỬI FORM VÀ YÊU CẦU MÃ OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Vui lòng đồng ý với Điều khoản và Chính sách bảo mật");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8081/api/send-otp", {
        email: formData.email,
        type: "register",
      });

      setSuccessMsg(
        response.data.message || "Mã OTP đã được gửi tới email của bạn.",
      );
      setStep(2);
      setCountdown(60); // Bắt đầu đếm ngược 60s chống spam
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(
          err.response.data.message ||
            "Bạn thao tác quá nhanh. Vui lòng đợi 1 phút.",
        );
      } else {
        setError(
          err.response?.data?.message || "Lỗi hệ thống. Không thể gửi mã OTP.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: XỬ LÝ XÁC NHẬN OTP VÀ ĐĂNG KÝ
  const handleVerifyAndRegister = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/api/verify-and-process",
        {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          otp: otpCode,
          type: "register",
        },
      );

      if (response.status === 200) {
        // Đăng ký thành công, chuyển thẳng về trang Login
        toast.success(
          "Chào mừng đến với NamOcen! Tài khoản của bạn đã được tạo thành công.",
        );
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

  // UX: Tự động nhảy ô khi nhập OTP
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0A192F]/5 rounded-full blur-3xl"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-[#0A192F] text-[#D4AF37] rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Ship className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0A192F] uppercase">
              Nam<span className="text-[#D4AF37]">Ocen</span>
            </span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#0A192F] mb-2">
            Tạo Tài Khoản Thành Viên
          </h1>
          <p className="text-slate-600">
            Tham gia để trải nghiệm những chuyến hải trình đẳng cấp
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          {/* HIỂN THỊ LỖI / THÀNH CÔNG */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex items-center gap-2 animate-pulse">
              {error}
            </div>
          )}
          {successMsg && step === 2 && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> {successMsg}
            </div>
          )}

          {/* BƯỚC 1: FORM ĐĂNG KÝ */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* ... Toàn bộ Form Name, Email, Phone, Password của bạn giữ nguyên ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Họ
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Nguyễn"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Văn A"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    disabled={loading}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="09xx xxx xxx"
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={6}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
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
                    Xác nhận lại
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      autoComplete="new-password"
                      className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A192F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
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

              <div>
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeToTerms: e.target.checked,
                      })
                    }
                    className="w-4 h-4 mt-0.5 text-[#0A192F] border-slate-300 rounded focus:ring-[#0A192F] cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    Tôi đồng ý với các{" "}
                    <Link
                      to="/terms"
                      className="text-[#D4AF37] font-bold hover:underline"
                    >
                      Điều khoản
                    </Link>{" "}
                    và{" "}
                    <Link
                      to="/privacy"
                      className="text-[#D4AF37] font-bold hover:underline"
                    >
                      Chính sách bảo mật
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-[#0A192F] text-amber-400 rounded-xl hover:bg-slate-800 transition-all shadow-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang kiểm
                    tra...
                  </>
                ) : (
                  "Tiếp tục xác thực Email"
                )}
              </button>
            </form>
          )}

          {/* BƯỚC 2: NHẬP OTP */}
          {step === 2 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#0A192F]">
                Xác thực Email
              </h3>
              <p className="text-slate-600 text-sm">
                Vui lòng nhập mã gồm 6 chữ số vừa được gửi tới <br />
                <strong className="text-slate-900">{formData.email}</strong>
              </p>

              {/* 6 Ô Nhập OTP */}
              <div className="flex justify-center gap-2 sm:gap-4 my-8">
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
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-[#0A192F] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyAndRegister}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 px-6 bg-amber-500 text-[#0A192F] rounded-xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xác
                    thực...
                  </>
                ) : (
                  "Hoàn Tất Đăng Ký"
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-500 hover:text-[#0A192F] font-medium flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Đổi Email khác
                </button>

                {countdown > 0 ? (
                  <span className="text-sm text-slate-400 font-medium flex items-center gap-1">
                    <Timer className="w-4 h-4" /> Gửi lại mã sau {countdown}s
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-sm text-[#D4AF37] hover:text-amber-600 font-bold transition-colors"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* NÚT ĐĂNG NHẬP (Luôn hiện ở dưới) */}
          {step === 1 && (
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Quý khách đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-[#D4AF37] font-bold hover:underline transition-all"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
