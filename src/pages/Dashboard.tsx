import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Anchor,
  Settings,
  LogOut,
  MapPin,
  Calendar as CalIcon,
  Clock,
  Ship,
  CheckCircle2,
  Star,
  AlertCircle,
  X,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReviewModal } from "./ReviewModal";
import { toast } from "react-hot-toast";

// ==========================================
// COMPONENT: COMPONENT PHÂN TRANG (DÙNG CHUNG)
// ==========================================
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-bold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
        Trang {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ==========================================
// COMPONENT: MODAL HỦY ĐƠN & HOÀN TIỀN
// ==========================================
const CancelBookingModal = ({
  booking,
  onClose,
  onSuccess,
}: {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departureDate = new Date(
    booking?.schedule?.departure_date || Date.now(),
  );
  const today = new Date();
  const diffTime = departureDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let estimatedRefund = 0;
  if (booking.status === "paid") {
    if (diffDays >= 7) estimatedRefund = booking.total_price;
    else if (diffDays >= 3 && diffDays <= 6)
      estimatedRefund = booking.total_price * 0.5;
    else estimatedRefund = 0;
  }

  const handleCancel = async () => {
    if (!agreed) {
      toast.error("Vui lòng tích chọn đồng ý với chính sách!");
      return;
    }
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy vé!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const endpoint =
        booking.status === "holding"
          ? `/api/bookings/${booking.id}/cancel-holding`
          : `/api/bookings/${booking.id}/request-refund`;

      const res = await fetch(`http://localhost:8081${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success(
          booking.status === "paid"
            ? "Yêu cầu hoàn tiền đã được gửi!"
            : "Đã hủy đơn thành công!",
        );
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi hủy đơn");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Yêu cầu hủy chuyến đi
          </h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            {diffDays <= 0 ? (
              <p className="text-red-600 font-bold">
                Rất tiếc, tour đã khởi hành. Không thể hủy vé!
              </p>
            ) : (
              <>
                <p className="text-slate-700 text-sm mb-2">
                  Bạn đang yêu cầu hủy vé trước ngày khởi hành{" "}
                  <strong className="text-red-600">{diffDays} ngày</strong>.
                </p>
                {booking.status === "paid" ? (
                  <p className="text-slate-700 text-sm">
                    Theo chính sách, bạn sẽ được hoàn lại: <br />
                    <strong className="text-2xl text-amber-500 block mt-1">
                      {new Intl.NumberFormat("vi-VN").format(estimatedRefund)}{" "}
                      VNĐ
                    </strong>
                    {estimatedRefund === 0 && (
                      <span className="text-xs text-red-500 mt-1 block">
                        (Hủy dưới 3 ngày sẽ không được hoàn tiền)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-emerald-600 font-medium text-sm mt-2">
                    Đơn hàng chưa thanh toán. Không phát sinh phí phạt hủy.
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Lý do hủy vé <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border-slate-200 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500 min-h-[80px]"
              placeholder="Vui lòng cho chúng tôi biết lý do..."
            ></textarea>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded text-red-500 focus:ring-red-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              Tôi đã đọc và đồng ý với chính sách hoàn hủy. Tôi hiểu rằng hành
              động này là không thể hoàn tác.
            </span>
          </label>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm"
          >
            Giữ lại vé
          </button>
          <button
            disabled={isSubmitting || diffDays <= 0}
            onClick={handleCancel}
            className="px-5 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận Hủy"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPONENT CHÍNH: DASHBOARD
// ==========================================
export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");

  const [user, setUser] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any>(null);

  const [bookingToCancel, setBookingToCancel] = useState<any>(null);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 🚀 STATE PHÂN TRANG (PAGINATION)
  const [pageUpcoming, setPageUpcoming] = useState(1);
  const [pagePast, setPagePast] = useState(1);
  const [pageRefunds, setPageRefunds] = useState(1);

  const UPCOMING_PER_PAGE = 3;
  const PAST_PER_PAGE = 5;
  const REFUNDS_PER_PAGE = 5;

  const handleReviewSuccess = (bookingId: number) => {
    setAllBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, is_reviewed: true } : b)),
    );
  };

  const fetchBookingsData = async (token: string) => {
    try {
      const bookingRes = await axios.get(
        "http://localhost:8081/api/my-bookings",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAllBookings(bookingRes.data.data || []);
    } catch (error) {
      console.error("Lỗi cập nhật bookings:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get("http://localhost:8081/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userRes.data.data || userRes.data;
        setUser(userData);
        setEditName(userData.name || "");
        setEditPhone(userData.phone || "");

        await fetchBookingsData(token);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // PHÂN LOẠI VÀ LỌC ĐƠN HÀNG
  const upcomingBookings = useMemo(() => {
    return allBookings.filter((b: any) =>
      ["holding", "confirmed", "paid"].includes(b.status),
    );
  }, [allBookings]);

  // Đơn trong quá khứ (Đã đi xong, HOẶC đã hủy nhưng KHÔNG được hoàn tiền)
  const pastBookings = useMemo(() => {
    return allBookings.filter(
      (b: any) =>
        b.status === "completed" ||
        (b.status === "cancelled" &&
          (!b.refund_amount || b.refund_amount <= 0)),
    );
  }, [allBookings]);

  // 🚀 TÁCH RIÊNG CÁC ĐƠN YÊU CẦU HOÀN TIỀN (Chỉ lấy đơn bị hủy VÀ có tiền hoàn > 0)
  const refundBookings = useMemo(() => {
    return allBookings.filter(
      (b: any) => b.status === "cancelled" && b.refund_amount > 0,
    );
  }, [allBookings]);

  // TÍNH TOÁN DỮ LIỆU ĐỂ HIỂN THỊ TRÊN TRANG HIỆN TẠI
  const totalUpcomingPages = Math.ceil(
    upcomingBookings.length / UPCOMING_PER_PAGE,
  );
  const paginatedUpcoming = useMemo(() => {
    const start = (pageUpcoming - 1) * UPCOMING_PER_PAGE;
    return upcomingBookings.slice(start, start + UPCOMING_PER_PAGE);
  }, [upcomingBookings, pageUpcoming]);

  const totalPastPages = Math.ceil(pastBookings.length / PAST_PER_PAGE);
  const paginatedPast = useMemo(() => {
    const start = (pagePast - 1) * PAST_PER_PAGE;
    return pastBookings.slice(start, start + PAST_PER_PAGE);
  }, [pastBookings, pagePast]);

  const totalRefundPages = Math.ceil(refundBookings.length / REFUNDS_PER_PAGE);
  const paginatedRefunds = useMemo(() => {
    const start = (pageRefunds - 1) * REFUNDS_PER_PAGE;
    return refundBookings.slice(start, start + REFUNDS_PER_PAGE);
  }, [refundBookings, pageRefunds]);

  // Sửa lỗi trang trống khi xóa hết phần tử ở trang cuối
  useEffect(() => {
    if (pageUpcoming > totalUpcomingPages && totalUpcomingPages > 0)
      setPageUpcoming(totalUpcomingPages);
  }, [totalUpcomingPages, pageUpcoming]);
  useEffect(() => {
    if (pagePast > totalPastPages && totalPastPages > 0)
      setPagePast(totalPastPages);
  }, [totalPastPages, pagePast]);
  useEffect(() => {
    if (pageRefunds > totalRefundPages && totalRefundPages > 0)
      setPageRefunds(totalRefundPages);
  }, [totalRefundPages, pageRefunds]);

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
      const res = await axios.put(
        "http://localhost:8081/api/user/profile",
        { name: editName, phone: editPhone },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Cập nhật thông tin thành công!");
      setUser(res.data.user || res.data.data);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg font-serif text-slate-600">
          Đang tải dữ liệu hồ sơ...
        </div>
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
              <h1 className="text-3xl font-serif font-bold text-white mb-2">
                Xin chào, {user?.name || "Khách Hàng"}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Ship className="w-4 h-4 text-amber-500" /> Thành viên NamOcen
                </span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>
                  Tham gia:{" "}
                  {new Date(user?.created_at || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 sticky top-28">
              {[
                { id: "bookings", icon: Anchor, label: "Chuyến Đi Của Tôi" },
                { id: "refunds", icon: RefreshCcw, label: "Lịch Sử Hoàn Tiền" }, // 🚀 MENU MỚI
                { id: "profile", icon: User, label: "Thông Tin Cá Nhân" },
                { id: "settings", icon: Settings, label: "Cài Đặt" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === item.id
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Đăng Xuất
                </button>
              </div>
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            {/* TAB: CHUYẾN ĐI CỦA TÔI */}
            {activeTab === "bookings" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* ĐƠN HÀNG SẮP TỚI */}
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CalIcon className="w-5 h-5 text-amber-500" /> Chuyến Đi Sắp
                    Tới
                  </h2>

                  {paginatedUpcoming.length > 0 ? (
                    <>
                      {paginatedUpcoming.map((booking: any) => (
                        <div
                          key={booking.id}
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row mb-6"
                        >
                          <div className="w-full md:w-2/5 h-48 md:h-auto relative">
                            <img
                              src={
                                booking?.schedule?.cruise?.images?.[0]
                                  ?.image_url || "/images/tau-1.jpg"
                              }
                              alt="Tàu"
                              className="w-full h-full object-cover"
                            />
                            <div
                              className={`absolute top-4 left-4 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${booking.status === "holding" ? "bg-blue-400" : "bg-amber-500"}`}
                            >
                              {booking.status === "holding"
                                ? "Đang giữ chỗ"
                                : "Đã thanh toán"}
                            </div>
                          </div>
                          <div className="p-6 md:p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {booking?.schedule?.cruise?.destination ||
                                    "Vịnh Hạ Long"}
                                </div>
                                <h3 className="text-2xl font-bold font-serif text-slate-900">
                                  {booking?.schedule?.cruise?.name ||
                                    "Du thuyền 5 Sao"}
                                </h3>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase font-bold block mb-1">
                                  Mã Đơn
                                </span>
                                <span className="font-mono font-bold text-slate-900">
                                  {booking.booking_code}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
                                  Khởi hành
                                </span>
                                <span className="font-medium text-slate-900">
                                  {booking?.schedule?.departure_date
                                    ? new Date(
                                        booking.schedule.departure_date,
                                      ).toLocaleDateString("vi-VN")
                                    : "Đang cập nhật"}
                                </span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
                                  Tổng tiền
                                </span>
                                <span className="font-medium text-amber-600">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(booking.total_price || 0)}
                                </span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
                                  Hạng phòng
                                </span>
                                <span className="font-medium text-slate-900 text-sm truncate block">
                                  {booking?.details?.[0]?.cabin_class?.name ||
                                    booking?.details?.[0]?.cabinClass?.name ||
                                    "Đang cập nhật"}
                                </span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
                                  Trạng thái
                                </span>
                                <span
                                  className={`font-medium flex items-center gap-1 text-sm ${booking.status === "holding" ? "text-blue-600" : "text-green-600"}`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  {booking.status === "holding"
                                    ? "Chưa thanh toán"
                                    : "Thành công"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-auto flex flex-col md:flex-row gap-3">
                              <button
                                onClick={() =>
                                  navigate(`/booking/${booking.id}`)
                                }
                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-sm"
                              >
                                Quản Lý
                              </button>

                              {/* 🚀 CHỈ ĐƠN PAID MỚI ĐƯỢC PHÉP HỦY Ở ĐÂY */}
                              {booking.status === "paid" && (
                                <button
                                  onClick={() => setBookingToCancel(booking)}
                                  className="flex-1 bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors shadow-sm"
                                >
                                  Hủy Vé
                                </button>
                              )}

                              {booking.status === "holding" && (
                                <button
                                  onClick={() => {
                                    try {
                                      const cruiseId =
                                        booking?.schedule?.cruise_id ||
                                        booking?.schedule?.cruise?.id ||
                                        "";
                                      const cabinId =
                                        booking?.details?.[0]?.cabin_class_id ||
                                        booking?.details?.[0]?.cabinClass?.id ||
                                        booking?.details?.[0]?.cabin_class
                                          ?.id ||
                                        "";
                                      navigate(
                                        `/checkout/payment/${booking.id}?cruise=${cruiseId}&cabin=${cabinId}`,
                                      );
                                    } catch (err) {}
                                  }}
                                  className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors shadow-sm"
                                >
                                  Thanh Toán
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <PaginationControls
                        currentPage={pageUpcoming}
                        totalPages={totalUpcomingPages}
                        onPageChange={setPageUpcoming}
                      />
                    </>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                      <p className="text-slate-500">
                        Bạn chưa có chuyến đi nào sắp tới.
                      </p>
                      <button
                        onClick={() => navigate("/search")}
                        className="mt-4 text-amber-600 font-bold hover:underline"
                      >
                        Khám phá du thuyền ngay!
                      </button>
                    </div>
                  )}
                </section>

                {/* ĐƠN HÀNG TRONG QUÁ KHỨ (ĐÃ TÁCH HOÀN TIỀN RA) */}
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" /> Lịch Sử Chuyến
                    Đi
                  </h2>
                  <div className="space-y-4">
                    {paginatedPast.length > 0 ? (
                      <>
                        {paginatedPast.map((booking: any) => (
                          <div
                            key={booking.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow"
                          >
                            <img
                              src={
                                booking?.schedule?.cruise?.images?.[0]
                                  ?.image_url || "/images/tau-1.jpg"
                              }
                              alt="Past"
                              className="w-24 h-24 rounded-xl object-cover shrink-0"
                            />
                            <div className="flex-1 text-center md:text-left w-full">
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Mã đơn: {booking.booking_code}
                              </div>
                              <h3 className="text-lg font-bold font-serif text-slate-900 mb-1">
                                {booking?.schedule?.cruise?.name ||
                                  "Du thuyền 5 Sao"}
                              </h3>
                              <p className="text-sm text-slate-600">
                                Trạng thái:{" "}
                                <span
                                  className={
                                    booking.status === "cancelled"
                                      ? "text-slate-500 font-medium"
                                      : "text-green-500 font-medium"
                                  }
                                >
                                  {booking.status === "cancelled"
                                    ? "Đã hủy (Không phí)"
                                    : "Hoàn thành"}
                                </span>
                              </p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                              <button
                                onClick={() =>
                                  navigate(`/booking/${booking.id}`)
                                }
                                className="text-sm font-semibold text-slate-600 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center"
                              >
                                Xem Biên Lai
                              </button>

                              {booking.status === "completed" &&
                                !booking.is_reviewed && (
                                  <button
                                    onClick={() =>
                                      setSelectedReviewBooking(booking)
                                    }
                                    className="text-sm font-bold text-white bg-amber-500 px-5 py-2.5 rounded-xl shadow-sm shadow-amber-200 hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    <Star className="w-4 h-4 fill-white" /> Đánh
                                    Giá
                                  </button>
                                )}

                              {booking.status === "completed" &&
                                booking.is_reviewed && (
                                  <span className="text-sm font-medium text-green-600 px-4 py-2 flex items-center justify-center gap-1.5 bg-green-50 rounded-xl border border-green-100">
                                    <CheckCircle2 className="w-4 h-4" /> Đã đánh
                                    giá
                                  </span>
                                )}
                            </div>
                          </div>
                        ))}
                        <PaginationControls
                          currentPage={pagePast}
                          totalPages={totalPastPages}
                          onPageChange={setPagePast}
                        />
                      </>
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        Chưa có lịch sử chuyến đi nào.
                      </p>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {/* 🚀 TAB MỚI: LỊCH SỬ HOÀN TIỀN */}
            {activeTab === "refunds" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-amber-500" /> Danh Sách
                  Hoàn Tiền
                </h2>

                <div className="space-y-4">
                  {paginatedRefunds.length > 0 ? (
                    <>
                      {paginatedRefunds.map((booking: any) => (
                        <div
                          key={booking.id}
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow"
                        >
                          <img
                            src={
                              booking?.schedule?.cruise?.images?.[0]
                                ?.image_url || "/images/tau-1.jpg"
                            }
                            alt="Refund"
                            className="w-24 h-24 rounded-xl object-cover shrink-0 grayscale opacity-70"
                          />
                          <div className="flex-1 text-center md:text-left w-full">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Mã đơn: {booking.booking_code}
                            </div>
                            <h3 className="text-lg font-bold font-serif text-slate-900 mb-1">
                              {booking?.schedule?.cruise?.name ||
                                "Du thuyền 5 Sao"}
                            </h3>
                            <p className="text-sm text-slate-600 mb-3">
                              Trạng thái:{" "}
                              <span className="text-red-500 font-medium">
                                Đã hủy
                              </span>
                            </p>

                            {/* THANH TRẠNG THÁI HOÀN TIỀN (GIAO DIỆN LỚN) */}
                            <div
                              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center gap-3 text-sm font-bold w-full
                                ${booking.refund_status !== "refund" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}
                              `}
                            >
                              {booking.refund_status !== "refund" ? (
                                <>
                                  <RefreshCcw className="w-5 h-5 animate-spin-slow shrink-0" />
                                  <span>
                                    Đang chờ kế toán xử lý hoàn trả số tiền:{" "}
                                    <br className="md:hidden" />
                                    <span className="text-xl md:ml-1 text-amber-600">
                                      {new Intl.NumberFormat("vi-VN").format(
                                        booking.refund_amount,
                                      )}{" "}
                                      VNĐ
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                                  <span>
                                    Hệ thống đã hoàn trả thành công số tiền:{" "}
                                    <br className="md:hidden" />
                                    <span className="text-xl md:ml-1 text-emerald-600">
                                      {new Intl.NumberFormat("vi-VN").format(
                                        booking.refund_amount,
                                      )}{" "}
                                      VNĐ
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                            <button
                              onClick={() => navigate(`/booking/${booking.id}`)}
                              className="text-sm font-semibold text-slate-600 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center"
                            >
                              Xem Chi Tiết
                            </button>
                          </div>
                        </div>
                      ))}
                      <PaginationControls
                        currentPage={pageRefunds}
                        totalPages={totalRefundPages}
                        onPageChange={setPageRefunds}
                      />
                    </>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                      <p className="text-slate-500">
                        Bạn không có yêu cầu hoàn tiền nào.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: THÔNG TIN CÁ NHÂN */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
              >
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                  Thông Tin Cá Nhân
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Họ và Tên
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Vai trò
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          user?.role === "admin"
                            ? "Quản Trị Viên"
                            : "Khách Hàng"
                        }
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Số điện thoại
                      </label>
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
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md disabled:opacity-70"
                    >
                      {isUpdating ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB: CÀI ĐẶT */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
              >
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                  Cài Đặt Thông Báo
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Email Marketing
                      </h4>
                      <p className="text-sm text-slate-500">
                        Nhận thông báo về các ưu đãi và chuyến đi mới.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL HỦY ĐƠN HÀNG NẰM Ở ĐÂY */}
      <AnimatePresence>
        {bookingToCancel && (
          <CancelBookingModal
            booking={bookingToCancel}
            onClose={() => setBookingToCancel(null)}
            onSuccess={() => {
              const token = localStorage.getItem("token");
              if (token) fetchBookingsData(token);
            }}
          />
        )}
      </AnimatePresence>

      <ReviewModal
        isOpen={!!selectedReviewBooking}
        onClose={() => setSelectedReviewBooking(null)}
        booking={selectedReviewBooking}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
