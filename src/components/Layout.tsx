import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Ship, User, Menu, Bell, Shield, LogOut, X } from "lucide-react";

export function Layout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. STATE THẬT
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    role: string;
  } | null>(null);

  // 2. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
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
    setIsMobileMenuOpen(false);
    navigate("/");
    window.location.reload();
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
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors"
              >
                Trang Chủ
              </Link>
              <Link
                to="/search"
                className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors"
              >
                Du Thuyền
              </Link>
              <Link
                to="/offers"
                className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors"
              >
                Ưu Đãi
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors"
              >
                Về Chúng Tôi
              </Link>

              {/* PHÂN QUYỀN ADMIN THẬT */}
              {userData?.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
                >
                  {" "}
                  Quản Trị Hệ Thống
                </Link>
              )}
            </nav>

            {/* User Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">
                        Thành viên
                      </p>
                      <p className="text-sm font-bold text-slate-700 leading-none">
                        {userData?.name}
                      </p>
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
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top duration-300 shadow-xl absolute w-full">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
              >
                Trang Chủ
              </Link>
              <Link
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
              >
                Du Thuyền
              </Link>
              <Link
                to="/offers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
              >
                Ưu Đãi
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
              >
                Về Chúng Tôi
              </Link>

              {isAuthenticated ? (
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 px-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">
                        Thành viên
                      </p>
                      <p className="text-sm font-bold text-slate-900 leading-none">
                        {userData?.name}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
                  >
                    Bảng điều khiển
                  </Link>

                  {/* ADMIN LINK TRÊN MOBILE */}
                  {userData?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 text-amber-600 font-bold hover:bg-amber-50 rounded-lg flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> Quản Trị Hệ Thống
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 text-red-500 font-bold hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 bg-[#0A192F] text-white rounded-xl hover:bg-amber-500 hover:text-[#0A192F] transition-all font-bold"
                  >
                    Đăng Nhập
                  </Link>
                </div>
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
          {/* Cột 1: Thông tin thương hiệu */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ship className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-lg font-bold text-white uppercase">
                NamOcen
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Kiến tạo những chuyến hải trình sang trọng bậc nhất thế giới từ
              năm 2004.
            </p>
          </div>

          {/* Cột 2: Khám Phá */}
          <div>
            <h4 className="text-white font-semibold mb-4">Khám Phá</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/search?location=Vịnh+hạ+long"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Vịnh Hạ Long
                </Link>
              </li>
              <li>
                <Link
                  to="/search?location=Vịnh+lan+hạ"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Vịnh Lan Hạ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ Trợ */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Ưu Đãi & Khuyến Mãi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Theo dõi chúng tôi trên
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                >
                  <img
                    src="public\icon\facebook.png"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                >
                  <img
                    src="public\icon\instagram_2111421.png"
                    className="w-5 h-5"
                  />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                >
                  <img
                    src="public\icon\tik-tok.png"
                    alt="TikTok"
                    className="w-5 h-5"
                  />{" "}
                  {/* Thay đường dẫn ảnh thực tế */}
                  <span>TikTok</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
          © {new Date().getFullYear()} NamOcen Cruises. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
}
