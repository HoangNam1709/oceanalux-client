import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Sửa 'react-router' thành 'react-router-dom'
import { Ship, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy đường dẫn cần quay lại sau khi login (Ví dụ: quay lại trang Checkout)
  const redirectPath = searchParams.get("redirect") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Gửi yêu cầu đăng nhập đến Laravel
      const response = await axios.post(
        "http://localhost:8081/api/login",
        formData,
      );

      if (response.data.status === "success") {
        // 2. Lưu Token và thông tin User vào localStorage
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // 3. Điều hướng về trang trước đó (ví dụ Checkout) hoặc Dashboard
        // Sử dụng window.location để force reload toàn bộ app, cập nhật lại trạng thái Auth ở Layout
        window.location.href = redirectPath;
      }
    } catch (err: any) {
      // Xử lý lỗi từ Server trả về (ví dụ sai pass, email không tồn tại)
      setError(
        err.response?.data?.message || "Thông tin đăng nhập không chính xác.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-[#0A192F] text-[#D4AF37] rounded-full flex items-center justify-center group-hover:bg-[#0A192F]/90 transition-colors">
              <Ship className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0A192F] uppercase">
              Nam<span className="text-[#D4AF37]">Ocen</span>
            </span>
          </Link>
          <h1 className="text-3xl font-light text-[#0A192F] mb-2">
            Chào mừng quý khách
          </h1>
          <p className="text-slate-600">
            Đăng nhập để bắt đầu hành trình nghỉ dưỡng
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#0A192F] border-slate-300 rounded focus:ring-[#0A192F]"
                />
                <span className="ml-2 text-sm text-slate-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#0A192F] text-white rounded-lg hover:bg-[#0A192F]/90 transition-all shadow-md font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Đăng Nhập Ngay"
              )}
            </button>
          </form>

          {/* Divider & Social Login (Giữ nguyên giao diện của bạn) */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Social buttons giữ nguyên... */}
          </div>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Quý khách chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-bold transition-colors"
              >
                Đăng ký thành viên
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
