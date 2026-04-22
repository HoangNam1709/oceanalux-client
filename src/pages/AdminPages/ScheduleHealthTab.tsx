import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Activity,
  Ship,
  Calendar,
  AlertTriangle,
  Anchor,
  Filter,
  ChevronDown,
  Eye,
  X,
  BedDouble,
  RefreshCcw,
  CheckCircle,
  Search, // 🚀 THÊM ICON TÌM KIẾM
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, Booking, Pagination } from "./adminShared";

// ─── TYPES ───
interface ScheduleMetrics {
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
  occupancy_rate: number;
}

interface CabinDetail {
  id: number;
  name: string;
  type: string;
  pricePerNight: number;
  total_rooms: number;
  available_rooms: number;
}

interface ScheduleHealthData {
  schedule_id: number;
  cruise_name: string;
  departure_date: string;
  return_date: string;
  status: string;
  metrics: ScheduleMetrics;
  cabin_details?: CabinDetail[];
}

interface Props {
  schedules: ScheduleHealthData[];
  bookings?: Booking[];
  refreshData?: () => void;
}

export function ScheduleHealthTab({
  schedules,
  bookings = [],
  refreshData,
}: Props) {
  // ─── STATES BỘ LỌC VÀ MODAL ───
  const [selectedCruise, setSelectedCruise] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [viewingSchedule, setViewingSchedule] =
    useState<ScheduleHealthData | null>(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState<
    string | number | null
  >(null);

  // 🚀 STATES TÌM KIẾM & PHÂN TRANG (PAGINATION)
  const [refundSearch, setRefundSearch] = useState(""); // STATE TÌM KIẾM HOÀN TIỀN
  const [schedulePage, setSchedulePage] = useState(1);
  const [refundPage, setRefundPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // ─── LOGIC LỌC TÀU & THÁNG ───
  const availableCruises = useMemo(() => {
    return [...new Set(schedules.map((s) => s.cruise_name))];
  }, [schedules]);

  useEffect(() => {
    if (availableCruises.length > 0 && !selectedCruise) {
      setSelectedCruise(availableCruises[0]);
    }
  }, [availableCruises, selectedCruise]);

  const getMonthYear = (dateStr: string) => {
    const parts = dateStr.split("/");
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return dateStr;
  };

  const availableMonths = useMemo(() => {
    if (!selectedCruise) return [];
    const cruiseSchedules = schedules.filter(
      (s) => s.cruise_name === selectedCruise,
    );
    const months = cruiseSchedules.map((s) => getMonthYear(s.departure_date));
    return [...new Set(months)].sort();
  }, [schedules, selectedCruise]);

  useEffect(() => {
    setSelectedMonth("all");
    setSchedulePage(1); // Reset trang về 1 khi đổi bộ lọc
  }, [availableMonths, selectedCruise]);

  // ─── XỬ LÝ DỮ LIỆU LỊCH TRÌNH (BẢNG TRÊN) ───
  const displayedSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchCruise = s.cruise_name === selectedCruise;
      const matchMonth =
        selectedMonth === "all" ||
        getMonthYear(s.departure_date) === selectedMonth;
      return matchCruise && matchMonth;
    });
  }, [schedules, selectedCruise, selectedMonth]);

  const totalSchedulePages = Math.ceil(
    displayedSchedules.length / ITEMS_PER_PAGE,
  );
  const paginatedSchedules = displayedSchedules.slice(
    (schedulePage - 1) * ITEMS_PER_PAGE,
    schedulePage * ITEMS_PER_PAGE,
  );

  // ─── 🚀 XỬ LÝ DỮ LIỆU HOÀN TIỀN CÓ TÌM KIẾM (BẢNG DƯỚI) ───
  const pendingRefunds = (bookings as any[]).filter((b) => {
    const status = b.status;
    const refundStatus = b.refund_status || b.refundStatus;
    const refundAmount = b.refund_amount || b.refundAmount || 0;
    return (
      status === "cancelled" && refundStatus === "pending" && refundAmount > 0
    );
  });

  // Lọc thêm theo Search Box
  const filteredRefunds = useMemo(() => {
    if (!refundSearch.trim()) return pendingRefunds;
    const lowerSearch = refundSearch.toLowerCase();

    return pendingRefunds.filter((b) => {
      const code = (b.bookingRef || b.booking_code || "").toLowerCase();
      const name = (b.guestName || b.customer_name || "").toLowerCase();
      return code.includes(lowerSearch) || name.includes(lowerSearch);
    });
  }, [pendingRefunds, refundSearch]);

  const totalPendingRefundAmount = filteredRefunds.reduce((sum, b) => {
    const amount = b.refund_amount || b.refundAmount || 0;
    return sum + Number(amount);
  }, 0);

  const totalRefundPages = Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE);
  const paginatedRefunds = filteredRefunds.slice(
    (refundPage - 1) * ITEMS_PER_PAGE,
    refundPage * ITEMS_PER_PAGE,
  );

  // Reset trang hoàn tiền về 1 mỗi khi gõ tìm kiếm
  useEffect(() => {
    setRefundPage(1);
  }, [refundSearch]);

  // Nếu xóa hết đơn ở trang cuối thì lùi trang
  useEffect(() => {
    if (refundPage > totalRefundPages && totalRefundPages > 0)
      setRefundPage(totalRefundPages);
  }, [totalRefundPages, refundPage]);

  // ─── HÀM XỬ LÝ HOÀN TIỀN ───
  const handleConfirmRefund = async (bookingId: string | number) => {
    const confirmMsg =
      "Bạn xác nhận đã chuyển khoản thành công cho khách hàng này?";
    if (!window.confirm(confirmMsg)) return;

    setIsProcessingRefund(bookingId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/bookings/${bookingId}/process-refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            admin_note: "Kế toán đã chuyển khoản thành công",
          }),
        },
      );

      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success("Xác nhận hoàn tiền thành công!");
        if (refreshData) refreshData();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xác nhận.");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsProcessingRefund(null);
    }
  };

  // ─── UI HELPERS ───
  const getProgressStyle = (rate: number) => {
    if (rate >= 80)
      return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
    if (rate >= 40)
      return "bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]";
    return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
  };

  const getStatusBadge = (status: string) => {
    const baseCls =
      "px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap inline-block text-center";
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span
            className={`${baseCls} bg-emerald-50 text-emerald-600 border-emerald-200`}
          >
            Mở bán
          </span>
        );
      case "cancelled":
        return (
          <span
            className={`${baseCls} bg-slate-100 text-slate-500 border-slate-200`}
          >
            Đã Huỷ
          </span>
        );
      case "completed":
        return (
          <span
            className={`${baseCls} bg-[#0A192F] text-[#D4AF37] border-[#0A192F]`}
          >
            Đã chạy
          </span>
        );
      default:
        return (
          <span
            className={`${baseCls} bg-gray-50 text-gray-700 border-gray-200`}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── HEADER CHÍNH ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
          <Activity className="w-48 h-48 text-[#0A192F]" />
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-xl font-bold text-[#0A192F]">
            Sức Khỏe Lịch Trình & Vận Hành
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tỷ lệ lấp đầy kho phòng và xử lý các yêu cầu hoàn hủy vé.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          PHẦN 1: QUẢN LÝ LỊCH TRÌNH VÀ TỶ LỆ LẤP ĐẦY
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Ship className="w-12 h-12 mb-3 text-slate-200" />
            <p className="text-slate-500 font-medium">
              Hệ thống chưa có chuyến đi nào đang mở bán.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5" /> Chọn Du Thuyền
                </label>
                <div className="relative">
                  <select
                    value={selectedCruise}
                    onChange={(e) => setSelectedCruise(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 cursor-pointer"
                  >
                    {availableCruises.map((cruise) => (
                      <option key={cruise} value={cruise}>
                        {cruise}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Chọn Tháng Khởi Hành
                </label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 cursor-pointer disabled:opacity-50"
                    disabled={availableMonths.length === 0}
                  >
                    <option value="all">Tất cả các tháng</option>
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        Tháng {month}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-[#0A192F] text-white">
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tl-lg">
                        Thời gian khởi hành
                      </th>
                      <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider">
                        Phòng (Đã Bán / Tổng)
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tr-lg">
                        Tỷ Lệ Lấp Đầy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSchedules.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-slate-400 font-medium"
                        >
                          Không có chuyến đi nào trong khoảng thời gian này.
                        </td>
                      </tr>
                    ) : (
                      paginatedSchedules.map((item) => (
                        <tr
                          key={item.schedule_id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#D4AF37]" />{" "}
                              {item.departure_date}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 ml-6">
                              Ngày về: {item.return_date}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="inline-flex items-baseline gap-1">
                              <span className="text-lg font-bold text-[#0A192F]">
                                {item.metrics.booked_rooms}
                              </span>
                              <span className="text-slate-400 font-medium">
                                /
                              </span>
                              <span className="text-sm font-bold text-slate-500">
                                {item.metrics.total_rooms}
                              </span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                              Còn trống{" "}
                              <span className="text-emerald-500">
                                {item.metrics.available_rooms}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 w-80">
                            <div className="flex items-center gap-5">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-sm font-bold text-[#0A192F]">
                                    {item.metrics.occupancy_rate}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressStyle(item.metrics.occupancy_rate)}`}
                                    style={{
                                      width: `${item.metrics.occupancy_rate}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => setViewingSchedule(item)}
                                className="shrink-0 p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-[#0A192F] hover:border-[#0A192F] hover:text-[#D4AF37] transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                title="Xem chi tiết phòng"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={schedulePage}
                totalPages={totalSchedulePages}
                onPageChange={setSchedulePage}
                totalItems={displayedSchedules.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          PHẦN 2: DANH SÁCH YÊU CẦU HOÀN TIỀN CÓ TÌM KIẾM
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/50 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-rose-500" />
              Danh sách Yêu cầu Hoàn tiền (Pending)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Hệ thống ghi nhận{" "}
              <strong className="text-[#0A192F]">
                {filteredRefunds.length}
              </strong>{" "}
              đơn hàng. Tổng tiền hoàn trên danh sách này:{" "}
              <strong className="text-rose-600">
                {formatCurrency(totalPendingRefundAmount)}
              </strong>
            </p>
          </div>

          {/* 🚀 THANH TÌM KIẾM HOÀN TIỀN */}
          <div className="w-full md:w-72 relative shrink-0">
            <input
              type="text"
              placeholder="Tìm mã đơn hoặc tên khách..."
              value={refundSearch}
              onChange={(e) => setRefundSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-shadow"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {paginatedRefunds.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            {refundSearch ? (
              <>
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-[#0A192F] font-bold mb-1">
                  Không tìm thấy kết quả
                </h4>
                <p className="text-slate-500 text-sm max-w-sm">
                  Không có yêu cầu hoàn tiền nào khớp với từ khóa "
                  {refundSearch}".
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-[#0A192F] font-bold mb-1">
                  Không có khoản hoàn tiền nào
                </h4>
                <p className="text-slate-500 text-sm max-w-sm">
                  Tuyệt vời! Hiện tại không có đơn hàng nào đang tồn đọng chờ xử
                  lý hoàn tiền.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">
                    Mã Vé / Khách Hàng
                  </th>
                  <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">
                    Lý do Hủy / Ghi chú
                  </th>
                  <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">
                    Số Tiền Cần Hoàn
                  </th>
                  <th className="text-center py-4 px-6 font-bold uppercase tracking-wider text-xs">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRefunds.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-100 hover:bg-rose-50/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0A192F] text-base font-mono">
                        {booking.bookingRef || (booking as any).booking_code}
                      </div>
                      <div className="font-medium text-slate-700 mt-1">
                        {booking.guestName || (booking as any).customer_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.guestEmail || (booking as any).customer_email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className="text-slate-600 max-w-sm"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {booking.cancellation_reason ||
                          (booking as any).cancellationReason ||
                          "Khách không để lại ghi chú"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-black text-rose-600 text-lg">
                        {formatCurrency(
                          booking.refund_amount || booking.refundAmount || 0,
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        disabled={isProcessingRefund === booking.id}
                        onClick={() => handleConfirmRefund(booking.id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A192F] text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all disabled:opacity-50 shadow-sm"
                      >
                        {isProcessingRefund === booking.id ? (
                          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Xác nhận Đã Chuyển
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={refundPage}
              totalPages={totalRefundPages}
              onPageChange={setRefundPage}
              totalItems={filteredRefunds.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL XEM CHI TIẾT TỪNG PHÒNG TRONG CHUYẾN ĐI
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewingSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F]">
                <div>
                  <h2 className="text-white font-serif text-xl flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-[#D4AF37]" /> Chi tiết
                    lấp đầy hạng phòng
                  </h2>
                  <p className="text-xs text-[#D4AF37] mt-1 tracking-widest uppercase flex items-center gap-2">
                    {viewingSchedule.cruise_name}{" "}
                    <span className="text-slate-400">|</span>{" "}
                    {viewingSchedule.departure_date}
                  </p>
                </div>
                <button
                  onClick={() => setViewingSchedule(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-7 bg-slate-50">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                      Tổng Số Phòng
                    </div>
                    <div className="text-2xl font-bold text-[#0A192F]">
                      {viewingSchedule.metrics.total_rooms}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                    <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">
                      Còn Trống
                    </div>
                    <div className="text-2xl font-bold text-[#0A192F]">
                      {viewingSchedule.metrics.available_rooms}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                    <div className="text-xs text-rose-600 font-bold uppercase tracking-widest mb-1">
                      Đã Đặt
                    </div>
                    <div className="text-2xl font-bold text-[#0A192F]">
                      {viewingSchedule.metrics.booked_rooms}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-500"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {!viewingSchedule.cabin_details ||
                  viewingSchedule.cabin_details.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-100">
                      Chưa có dữ liệu chi tiết hạng phòng cho chuyến này. <br />
                    </div>
                  ) : (
                    viewingSchedule.cabin_details.map((cabin) => {
                      const booked = cabin.total_rooms - cabin.available_rooms;
                      const isSoldOut = cabin.available_rooms === 0;

                      return (
                        <div
                          key={cabin.id}
                          className={`flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm transition-all ${isSoldOut ? "border-rose-100" : "border-slate-100"}`}
                        >
                          <div>
                            <div className="font-bold text-[#0A192F] text-base">
                              {cabin.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                              <span className="bg-[#0A192F] text-[#D4AF37] px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                {cabin.type}
                              </span>
                              {formatCurrency(cabin.pricePerNight)}/đêm
                            </div>
                          </div>
                          <div className="text-right">
                            {isSoldOut ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                                <AlertTriangle className="w-3 h-3" /> HẾT PHÒNG
                              </span>
                            ) : (
                              <div className="text-sm font-medium">
                                <span className="text-slate-500">Đã bán:</span>{" "}
                                <span className="font-bold text-rose-600">
                                  {booked}
                                </span>
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="text-slate-500">
                                  Trống:
                                </span>{" "}
                                <span className="font-bold text-emerald-600">
                                  {cabin.available_rooms}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
