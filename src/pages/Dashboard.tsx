import React, { useState, useEffect, useMemo } from "react";
import { User, Anchor, Settings, LogOut, MapPin, Calendar as CalIcon, Clock, Ship, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReviewModal } from './ReviewModal';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  
  // STATE LƯU DỮ LIỆU
  const [user, setUser] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]); // Lưu tổng hợp tất cả đơn hàng
  const [loading, setLoading] = useState(true);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any>(null);
  
  // STATE PROFILE
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // HÀM CẬP NHẬT TRẠNG THÁI SAU KHI ĐÁNH GIÁ THÀNH CÔNG
  const handleReviewSuccess = (bookingId: number) => {
    setAllBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, is_reviewed: true } : b
    ));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Lấy thông tin User
        const userRes = await axios.get("http://localhost/api/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = userRes.data.data || userRes.data;
        setUser(userData);
        setEditName(userData.name || "");
        setEditPhone(userData.phone || "");

        // 2. Lấy danh sách đặt phòng
        const bookingRes = await axios.get("http://localhost/api/my-bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Lưu toàn bộ vào 1 state duy nhất
        setAllBookings(bookingRes.data.data || []);
        
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Dashboard:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // USEMEMO TỰ ĐỘNG PHÂN LOẠI ĐƠN HÀNG DỰA TRÊN allBookings
  const upcomingBookings = useMemo(() => {
    return allBookings.filter((b: any) => 
      ['completed', 'holding', 'paid'].includes(b.status)
    );
  }, [allBookings]);

  const pastBookings = useMemo(() => {
    return allBookings.filter((b: any) => 
      ['completed', 'cancelled'].includes(b.status)
    );
  }, [allBookings]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost/api/user/profile", {
        name: editName,
        phone: editPhone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Cập nhật thông tin thành công!");
      setUser(res.data.user || res.data.data); 
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      alert("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg font-serif text-slate-600">Đang tải dữ liệu hồ sơ...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER USER */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-900 text-3xl font-bold font-serif shadow-inner border-4 border-slate-800 uppercase">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold text-white mb-2">Xin chào, {user?.name || "Khách Hàng"}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Ship className="w-4 h-4 text-amber-500" /> Thành viên OceanaLux</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>Tham gia: {new Date(user?.created_at || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 sticky top-28">
              {[
                { id: 'bookings', icon: Anchor, label: 'Chuyến Đi Của Tôi' },
                { id: 'profile', icon: User, label: 'Thông Tin Cá Nhân' },
                { id: 'settings', icon: Settings, label: 'Cài Đặt' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" /> Đăng Xuất
                </button>
              </div>
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            
            {/* TAB: CHUYẾN ĐI CỦA TÔI */}
            {activeTab === 'bookings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* ĐƠN HÀNG SẮP TỚI */}
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CalIcon className="w-5 h-5 text-amber-500" /> Chuyến Đi Sắp Tới
                  </h2>
                  
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking: any) => (
                      <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row mb-6">
                        <div className="w-full md:w-2/5 h-48 md:h-auto relative">
                          <img src={booking?.schedule?.cruise?.images?.[0]?.image_url || "/images/tau-1.jpg"} alt="Tàu" className="w-full h-full object-cover" />
                          <div className={`absolute top-4 left-4 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${booking.status === 'holding' ? 'bg-blue-400' : 'bg-amber-500'}`}>
                            {booking.status === 'holding' ? 'Đang giữ chỗ' : 'Đã thanh toán'}
                          </div>
                        </div>
                        <div className="p-6 md:p-8 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {booking?.schedule?.cruise?.destination || "Vịnh Hạ Long"}
                              </div>
                              <h3 className="text-2xl font-bold font-serif text-slate-900">
                                {booking?.schedule?.cruise?.name || "Du thuyền 5 Sao"}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Mã Đơn</span>
                              <span className="font-mono font-bold text-slate-900">{booking.booking_code}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Khởi hành</span>
                              <span className="font-medium text-slate-900">
                                {booking?.schedule?.departure_date ? new Date(booking.schedule.departure_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Tổng tiền</span>
                              <span className="font-medium text-amber-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price || 0)}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Hạng phòng</span>
                              <span className="font-medium text-slate-900 text-sm truncate block">
                                {booking?.details?.[0]?.cabin_class?.name || booking?.details?.[0]?.cabinClass?.name || "Đang cập nhật"}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Trạng thái</span>
                              <span className={`font-medium flex items-center gap-1 text-sm ${booking.status === 'holding' ? 'text-blue-600' : 'text-green-600'}`}>
                                <CheckCircle2 className="w-4 h-4" /> {booking.status === 'holding' ? 'Chưa thanh toán' : 'Thành công'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto flex gap-3">
                            <button 
                              onClick={() => navigate(`/booking/${booking.id}`)} 
                              className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-sm"
                            >
                              Quản Lý
                            </button>
                            
                            {/* NÚT THANH TOÁN NGAY */}
                            {booking.status === 'holding' && (
                              <button 
                                onClick={() => {
                                  try {
                                    const cruiseId = booking?.schedule?.cruise_id || booking?.schedule?.cruise?.id || '';
                                    const cabinId = booking?.details?.[0]?.cabin_class_id || booking?.details?.[0]?.cabinClass?.id || booking?.details?.[0]?.cabin_class?.id || '';
                                    const checkoutUrl = `/checkout/payment/${booking.id}?cruise=${cruiseId}&cabin=${cabinId}`;
                                    navigate(checkoutUrl);
                                  } catch (err) {
                                    alert("Đã xảy ra lỗi hệ thống, không thể chuyển trang!");
                                  }
                                }} 
                                className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors shadow-sm"
                              >
                                Thanh Toán Ngay
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                      <p className="text-slate-500">Bạn chưa có chuyến đi nào sắp tới.</p>
                      <button onClick={() => navigate('/search')} className="mt-4 text-amber-600 font-bold hover:underline">
                        Khám phá du thuyền ngay!
                      </button>
                    </div>
                  )}
                </section>

                {/* ĐƠN HÀNG TRONG QUÁ KHỨ VÀ ĐÁNH GIÁ */}
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" /> Lịch Sử Chuyến Đi
                  </h2>
                  <div className="space-y-4">
                    {pastBookings.length > 0 ? (
                      pastBookings.map((booking: any) => (
                        <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                          <img src={booking?.schedule?.cruise?.images?.[0]?.image_url || "/images/tau-1.jpg"} alt="Past" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 text-center md:text-left">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mã đơn: {booking.booking_code}</div>
                            <h3 className="text-lg font-bold font-serif text-slate-900 mb-1">
                              {booking?.schedule?.cruise?.name || "Du thuyền 5 Sao"}
                            </h3>
                            <p className="text-sm text-slate-600">Trạng thái: <span className={booking.status === 'cancelled' ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>{booking.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'}</span></p>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-2 shrink-0 w-full md:w-auto">
                            <button 
                                onClick={() => navigate(`/booking/${booking.id}`)} 
                                className="text-sm font-semibold text-slate-600 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center"
                            >
                              Xem Biên Lai
                            </button>

                            {/* NÚT ĐÁNH GIÁ (Chỉ hiện nếu chuyến đi đã Completed và chưa đánh giá) */}
                            {booking.status === 'completed' && !booking.is_reviewed && (
                              <button 
                                onClick={() => setSelectedReviewBooking(booking)}
                                className="text-sm font-bold text-white bg-amber-500 px-5 py-2.5 rounded-xl shadow-sm shadow-amber-200 hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Star className="w-4 h-4 fill-white" /> Đánh Giá
                              </button>
                            )}
                            
                            {/* Nếu đã đánh giá rồi thì hiện dòng chữ cảm ơn */}
                            {booking.status === 'completed' && booking.is_reviewed && (
                              <span className="text-sm font-medium text-green-600 px-4 py-2 flex items-center justify-center gap-1.5 bg-green-50 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" /> Đã đánh giá
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">Chưa có lịch sử chuyến đi nào.</p>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {/* TAB: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Thông Tin Cá Nhân</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và Tên</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò</label>
                      <input type="text" disabled value={user?.role === 'admin' ? "Quản Trị Viên" : "Khách Hàng"} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ Email</label>
                      <input type="email" disabled value={user?.email || ""} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        placeholder="Chưa cập nhật" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="pt-6">
                    <button type="submit" disabled={isUpdating} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md disabled:opacity-70">
                      {isUpdating ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB: CÀI ĐẶT */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                 <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Cài Đặt Thông Báo</h2>
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                     <div>
                       <h4 className="font-bold text-slate-900">Email Marketing</h4>
                       <p className="text-sm text-slate-500">Nhận thông báo về các ưu đãi và chuyến đi mới.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                   </div>
                 </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* COMPONENT MODAL ĐÁNH GIÁ (NẰM NGOÀI CÙNG) */}
      <ReviewModal 
        isOpen={!!selectedReviewBooking} 
        onClose={() => setSelectedReviewBooking(null)} 
        booking={selectedReviewBooking}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}