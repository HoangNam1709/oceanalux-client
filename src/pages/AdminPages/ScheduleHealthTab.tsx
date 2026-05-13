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
  Search,
  Ban,
  Loader2,
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

// 🚀 TYPE CHUNG CHO CẢ 2 POPUP (HỦY & XÁC NHẬN)
interface RefundActionTarget {
  id: string | number;
  bookingRef: string;
  guestName: string;
  refundAmount: number;
}

interface Props {
  schedules: ScheduleHealthData[];
  bookings?: Booking[];
  refreshData?: () => void;
}

// ══════════════════════════════════════════════════════════════════════════
// 🚀 COMPONENT POPUP HỦY YÊU CẦU HOÀN TIỀN (NAVY / GOLD / PEARL)
// ══════════════════════════════════════════════════════════════════════════
function CancelRefundModal({
  target,
  onConfirm,
  onClose,
  isProcessing,
}: {
  target: RefundActionTarget;
  onConfirm: () => void;
  onClose: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FAF7F0", border: "1px solid #E2D9C3" }}
      >
        <div
          className="px-6 pt-6 pb-5 flex flex-col items-center text-center"
          style={{ background: "#FAF7F0" }}
        >
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4 relative"
            style={{ background: "#0E1E3A", border: "2px solid #C9A227" }}
          >
            <div
              className="absolute inset-[4px] rounded-full"
              style={{ border: "1px solid rgba(201,162,39,0.18)" }}
            />
            <Ban
              className="w-[26px] h-[26px] relative z-10"
              style={{ color: "#E8C96A", strokeWidth: 1.75 }}
            />
          </div>
          <h3
            className="font-serif text-xl font-semibold mb-1 tracking-wide"
            style={{ color: "#0E1E3A" }}
          >
            Hủy Yêu Cầu Hoàn Tiền
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
            Bạn chắc chắn muốn hủy yêu cầu hoàn tiền cho đơn{" "}
            <span className="font-bold font-mono" style={{ color: "#0E1E3A" }}>
              {target.bookingRef}
            </span>{" "}
            của khách{" "}
            <span className="font-semibold" style={{ color: "#0E1E3A" }}>
              {target.guestName}
            </span>{" "}
            với số tiền{" "}
            <span className="font-black" style={{ color: "#B8912A" }}>
              {formatCurrency(target.refundAmount)}
            </span>
            ?
          </p>
          <div
            className="mt-4 w-full flex items-start gap-2 px-4 py-3 rounded-xl text-xs text-left"
            style={{
              background: "rgba(201,162,39,0.08)",
              border: "1px solid rgba(201,162,39,0.25)",
            }}
          >
            <AlertTriangle
              className="w-3.5 h-3.5 mt-0.5 shrink-0"
              style={{ color: "#C9A227" }}
            />
            <span style={{ color: "#7A6020" }}>
              Thao tác này sẽ đánh dấu yêu cầu là <strong>đã hủy</strong>. Vui
              lòng xác nhận trước khi tiếp tục.
            </span>
          </div>
        </div>

        <div
          className="mx-6"
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, transparent, #E8C96A, transparent)",
            opacity: 0.6,
          }}
        />

        <div className="px-6 py-5 flex gap-3">
          <button
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all"
            style={{
              background: "#F0EAD6",
              border: "1.5px solid #E2D9C3",
              color: "#0E1E3A",
            }}
          >
            Giữ Lại
          </button>
          <button
            disabled={isProcessing}
            onClick={onConfirm}
            className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all"
            style={{
              background: "#0E1E3A",
              border: "1.5px solid #C9A227",
              color: "#E8C96A",
            }}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Xác Nhận Hủy"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// 🚀 COMPONENT POPUP XÁC NHẬN ĐÃ CHUYỂN TIỀN (NAVY / GOLD / PEARL)
// ══════════════════════════════════════════════════════════════════════════
function ConfirmRefundModal({
  target,
  onConfirm,
  onClose,
  isProcessing,
}: {
  target: RefundActionTarget;
  onConfirm: () => void;
  onClose: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FAF7F0", border: "1px solid #E2D9C3" }}
      >
        <div
          className="px-6 pt-6 pb-5 flex flex-col items-center text-center"
          style={{ background: "#FAF7F0" }}
        >
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4 relative"
            style={{ background: "#0E1E3A", border: "2px solid #C9A227" }}
          >
            <div
              className="absolute inset-[4px] rounded-full"
              style={{ border: "1px solid rgba(201,162,39,0.18)" }}
            />
            <CheckCircle
              className="w-[28px] h-[28px] relative z-10"
              style={{ color: "#E8C96A", strokeWidth: 1.75 }}
            />
          </div>
          <h3
            className="font-serif text-xl font-semibold mb-1 tracking-wide"
            style={{ color: "#0E1E3A" }}
          >
            Xác Nhận Đã Chuyển
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
            Xác nhận Kế toán đã chuyển khoản số tiền{" "}
            <span className="font-black" style={{ color: "#B8912A" }}>
              {formatCurrency(target.refundAmount)}
            </span>{" "}
            cho đơn{" "}
            <span className="font-bold font-mono" style={{ color: "#0E1E3A" }}>
              {target.bookingRef}
            </span>{" "}
            của khách{" "}
            <span className="font-semibold" style={{ color: "#0E1E3A" }}>
              {target.guestName}
            </span>
            ?
          </p>
        </div>

        <div
          className="mx-6"
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, transparent, #E8C96A, transparent)",
            opacity: 0.6,
          }}
        />

        <div className="px-6 py-5 flex gap-3">
          <button
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all"
            style={{
              background: "#F0EAD6",
              border: "1.5px solid #E2D9C3",
              color: "#0E1E3A",
            }}
          >
            Trở Về
          </button>
          <button
            disabled={isProcessing}
            onClick={onConfirm}
            className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wide transition-all"
            style={{
              background: "#0E1E3A",
              border: "1.5px solid #C9A227",
              color: "#E8C96A",
            }}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Đã Chuyển Tiền"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH
// ══════════════════════════════════════════════════════════════════════════
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

  // 🚀 STATES CHO MODAL HÀNH ĐỘNG
  const [confirmTarget, setConfirmTarget] = useState<RefundActionTarget | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<RefundActionTarget | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── STATES TÌM KIẾM & PHÂN TRANG ───
  const [refundSearch, setRefundSearch] = useState("");
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
    setSchedulePage(1);
  }, [availableMonths, selectedCruise]);

  // ─── XỬ LÝ DỮ LIỆU LỊCH TRÌNH ───
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

  // ─── XỬ LÝ DỮ LIỆU HOÀN TIỀN ───
  const pendingRefunds = (bookings as any[]).filter((b) => {
    const status = b.status;
    const refundStatus = b.refund_status || b.refundStatus;
    const refundAmount = b.refund_amount || b.refundAmount || 0;
    return (
      status === "cancelled" && refundStatus === "pending" && refundAmount > 0
    );
  });

  const filteredRefunds = useMemo(() => {
    if (!refundSearch.trim()) return pendingRefunds;
    const lowerSearch = refundSearch.toLowerCase();
    return pendingRefunds.filter((b) => {
      const code = (b.bookingRef || b.booking_code || "").toLowerCase();
      const name = (b.guestName || b.customer_name || "").toLowerCase();
      return code.includes(lowerSearch) || name.includes(lowerSearch);
    });
  }, [pendingRefunds, refundSearch]);

  const totalPendingRefundAmount = filteredRefunds.reduce(
    (sum, b) => sum + Number(b.refund_amount || b.refundAmount || 0),
    0,
  );
  const totalRefundPages = Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE);
  const paginatedRefunds = filteredRefunds.slice(
    (refundPage - 1) * ITEMS_PER_PAGE,
    refundPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setRefundPage(1);
  }, [refundSearch]);
  useEffect(() => {
    if (refundPage > totalRefundPages && totalRefundPages > 0)
      setRefundPage(totalRefundPages);
  }, [totalRefundPages, refundPage]);

  // ─── HÀM MỞ MODALS ───
  const handleOpenConfirmModal = (booking: any) => {
    setConfirmTarget({
      id: booking.id,
      bookingRef: booking.bookingRef || booking.booking_code || "",
      guestName: booking.guestName || booking.customer_name || "",
      // LOGIC: Ưu tiên lấy số tiền đã trừ phạt (refund_amount)
      refundAmount: booking.refund_amount || booking.refundAmount || 0,
    });
  };

  const handleOpenCancelModal = (booking: any) => {
    setCancelTarget({
      id: booking.id,
      bookingRef: booking.bookingRef || booking.booking_code || "",
      guestName: booking.guestName || booking.customer_name || "",
      // LOGIC: Ưu tiên lấy số tiền đã trừ phạt (refund_amount)
      refundAmount: booking.refund_amount || booking.refundAmount || 0,
    });
  };

  // ─── HÀM XỬ LÝ API THỰC TẾ ───
  const executeConfirmRefund = async () => {
    if (!confirmTarget) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/bookings/${confirmTarget.id}/process-refund`,
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
        toast.error(data.message || "Có lỗi xảy ra.");
      }
    } catch {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsProcessing(false);
      setConfirmTarget(null);
    }
  };

  const executeCancelRefund = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/bookings/${cancelTarget.id}/reject-refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            admin_note: "Admin hủy yêu cầu hoàn tiền qua giao diện",
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success(
          `Đã hủy yêu cầu hoàn tiền cho đơn ${cancelTarget.bookingRef}`,
        );
        if (refreshData) refreshData();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi hủy yêu cầu.");
      }
    } catch {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsProcessing(false);
      setCancelTarget(null);
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

      {/* ─── PHẦN 1: QUẢN LÝ LỊCH TRÌNH ─── */}
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
                    {availableCruises.map((c) => (
                      <option key={c} value={c}>
                        {c}
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
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
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

      {/* ─── PHẦN 2: DANH SÁCH YÊU CẦU HOÀN TIỀN ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/50 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-rose-500" /> Danh sách Yêu cầu
              Hoàn tiền (Pending)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Hệ thống ghi nhận{" "}
              <strong className="text-[#0A192F]">
                {filteredRefunds.length}
              </strong>{" "}
              đơn hàng. Tổng tiền hoàn:{" "}
              <strong className="text-rose-600">
                {formatCurrency(totalPendingRefundAmount)}
              </strong>
            </p>
          </div>
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
                      <div className="font-black text-[#B8912A] text-lg">
                        {/* Hiển thị SỐ TIỀN THỰC HOÀN (Đã trừ phạt) */}
                        {formatCurrency(
                          booking.refund_amount || booking.refundAmount || 0,
                        )}
                      </div>
                      {/* LOGIC MỚI: Hiển thị giá gốc nhỏ bên dưới để đối soát */}
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Gốc:{" "}
                        {formatCurrency(
                          booking.originalPrice || booking.totalAmount || 0,
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center w-[220px]">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={
                            confirmTarget?.id === booking.id ||
                            cancelTarget?.id === booking.id ||
                            isProcessing
                          }
                          onClick={() => handleOpenConfirmModal(booking)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-[#0A192F] text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all disabled:opacity-50 shadow-sm text-xs whitespace-nowrap min-w-[90px]"
                        >
                          {confirmTarget?.id === booking.id && isProcessing ? (
                            <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Đã Chuyển"
                          )}
                        </button>
                        <button
                          disabled={
                            confirmTarget?.id === booking.id ||
                            cancelTarget?.id === booking.id ||
                            isProcessing
                          }
                          onClick={() => handleOpenCancelModal(booking)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2.5 font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm text-xs whitespace-nowrap min-w-[70px]"
                          style={{
                            background: "#FAF7F0",
                            border: "1.5px solid #C9A227",
                            color: "#0E1E3A",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0E1E3A";
                            e.currentTarget.style.color = "#E8C96A";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#FAF7F0";
                            e.currentTarget.style.color = "#0E1E3A";
                          }}
                        >
                          Hủy Y/C
                        </button>
                      </div>
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

      {/* ─── MODALS CHI TIẾT VÀ POPUP XÁC NHẬN ─── */}
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
                      Chưa có dữ liệu chi tiết hạng phòng cho chuyến này.
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

      <AnimatePresence>
        {cancelTarget && (
          <CancelRefundModal
            target={cancelTarget}
            isProcessing={isProcessing}
            onConfirm={executeCancelRefund}
            onClose={() => setCancelTarget(null)}
          />
        )}
        {confirmTarget && (
          <ConfirmRefundModal
            target={confirmTarget}
            isProcessing={isProcessing}
            onConfirm={executeConfirmRefund}
            onClose={() => setConfirmTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
