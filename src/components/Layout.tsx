import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Ship, User, Menu, Bell, Shield, LogOut } from "lucide-react";

export function Layout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. CHUYỂN STATE MÔ PHỎNG THÀNH STATE THẬT
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{ name: string; role: string } | null>(null);

  // 2. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP KHI TRANG LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // 3. HÀM ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserData(null);
    navigate("/");
    window.location.reload(); // Reload để đảm bảo các component khác cập nhật lại state sạch
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-slate-800">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[#0A192F] text-[#D4AF37] rounded-full flex items-center justify-center group-hover:bg-[#0A192F]/90 transition-colors">
                <Ship className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0A192F] uppercase">
                Nam<span className="text-[#D4AF37]">ocen</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors">
                Trang Chủ
              </Link>
              <Link to="/search" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors">
                Du Thuyền
              </Link>
              <Link to="/offers" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors">
                Ưu Đãi
              </Link>
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors">
                Về Chúng Tôi
              </Link>
              {/* PHÂN QUYỀN ADMIN THẬT */}
              {userData?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
                  Quản Trị Hệ Thống
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
                    <Bell className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Thành viên</p>
                      <p className="text-sm font-bold text-slate-700 leading-none">{userData?.name}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all border border-slate-200"
                    >
                      <User className="w-5 h-5" />
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-[#0A192F] text-white rounded-xl hover:bg-amber-500 hover:text-[#0A192F] transition-all shadow-lg text-sm font-bold"
                >
                  Đăng Nhập
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Nav (Đã cập nhật logic auth) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top duration-300">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {/* ... (Các link trang chủ, điểm đến giữ nguyên) */}
              
              {isAuthenticated ? (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="px-3 py-2 text-sm font-bold text-slate-400 uppercase">Tài khoản: {userData?.name}</div>
                  <Link to="/dashboard" className="block px-3 py-2 text-slate-900 font-medium">Bảng điều khiển</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-500 font-bold font-medium">Đăng xuất</button>
                </div>
              ) : (
                <Link to="/login" className="block px-3 py-2 text-amber-600 font-bold">Đăng Nhập</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#0A192F] text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ship className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-lg font-bold text-white uppercase">
                OceanaLux
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Kiến tạo những chuyến hải trình sang trọng bậc nhất thế giới từ năm 2004.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/search"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Vịnh Hạ Long
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Đảo Phú Quốc
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Vịnh Lan Hạ
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Hải Trình Xuyên Á
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">
              Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Liên Hệ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Câu Hỏi Thường Gặp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Quản Lý Đặt Phòng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">
              Bản Tin
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Đăng ký để nhận ưu đãi và tin tức độc quyền mới nhất.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:border-[#D4AF37] text-sm"
              />
              <button className="bg-[#D4AF37] text-[#0A192F] px-4 py-2 rounded-md font-medium hover:bg-[#D4AF37]/90 transition-colors text-sm shrink-0">
               <Link 
                to="/signup" 
                className="flex items-center gap-2"
              >
                Đăng Ký
              </Link>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
          © {new Date().getFullYear()} NamOcen Cruises. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
}