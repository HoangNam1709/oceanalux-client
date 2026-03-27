import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Sửa 'react-router' thành 'react-router-dom'
import { Ship, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";

export function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // 2. Kiểm tra đồng ý điều khoản
    if (!formData.agreeToTerms) {
      setError("Vui lòng đồng ý với Điều khoản và Chính sách bảo mật");
      return;
    }

    setLoading(true);

    try {
      // 3. Gửi API đăng ký (Gộp First Name và Last Name thành Name)
      const response = await axios.post("http://localhost/api/register", {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword // Gửi để Laravel validate 'confirmed'
      });

      if (response.data.status === "success") {
        // 4. Lưu Token và thông tin User để tự động đăng nhập
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // Chuyển hướng về trang chủ hoặc dashboard
        window.location.href = "/";
      }
    } catch (err: any) {
      // Hiển thị lỗi từ Laravel (Ví dụ: Email đã tồn tại)
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-[#0A192F] text-[#D4AF37] rounded-full flex items-center justify-center group-hover:bg-[#0A192F]/90 transition-colors">
              <Ship className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0A192F] uppercase">
              Oceana<span className="text-[#D4AF37]">Lux</span>
            </span>
          </Link>
          <h1 className="text-3xl font-light text-[#0A192F] mb-2">Tạo Tài Khoản Thành Viên</h1>
          <p className="text-slate-600">Tham gia để trải nghiệm những chuyến hải trình đẳng cấp</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Hiển thị thông báo lỗi */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text" required disabled={loading}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Nguyễn"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text" required disabled={loading}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Văn A"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email" required disabled={loading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel" required disabled={loading}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required disabled={loading}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận lại</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required disabled={loading}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox" required
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-[#0A192F] border-slate-300 rounded focus:ring-[#0A192F]"
                />
                <span className="ml-2 text-sm text-slate-600">
                  Tôi đồng ý với các{" "}
                  <Link to="/terms" className="text-[#D4AF37] font-bold">Điều khoản</Link> và{" "}
                  <Link to="/privacy" className="text-[#D4AF37] font-bold">Chính sách bảo mật</Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#0A192F] text-white rounded-lg hover:bg-amber-500 hover:text-[#0A192F] transition-all shadow-md font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo tài khoản...
                </>
              ) : (
                "Đăng Ký Hội Viên"
              )}
            </button>
          </form>

          {/* Social Sign Up giữ nguyên... */}

          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Quý khách đã có tài khoản?{" "}
              <Link to="/login" className="text-[#D4AF37] font-bold transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}