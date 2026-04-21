import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Ship,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Anchor,
  Filter,
  ChevronDown,
  Eye,
  X,
  Users,
  BedDouble,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "./adminShared"; // Đảm bảo import hàm format tiền tệ

// ─── TYPES CẬP NHẬT ───
interface ScheduleMetrics {
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
  occupancy_rate: number;
}

// Bổ sung interface cho chi tiết phòng (Cabin Detail)
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
  // Bổ sung mảng chi tiết phòng từ Backend trả về
  cabin_details?: CabinDetail[];
}

interface Props {
  schedules: ScheduleHealthData[];
}

export function ScheduleHealthTab({ schedules }: Props) {
  // ─── STATES BỘ LỌC VÀ MODAL ───
  const [selectedCruise, setSelectedCruise] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // Mặc định là "all"
  const [viewingSchedule, setViewingSchedule] =
    useState<ScheduleHealthData | null>(null); // State mở Modal chi tiết

  // 1. Lọc danh sách Tàu
  const availableCruises = useMemo(() => {
    return [...new Set(schedules.map((s) => s.cruise_name))];
  }, [schedules]);

  // 2. Auto-select Tàu đầu tiên
  useEffect(() => {
    if (availableCruises.length > 0 && !selectedCruise) {
      setSelectedCruise(availableCruises[0]);
    }
  }, [availableCruises, selectedCruise]);

  // Hàm Helper: Cắt chuỗi "15/04/2026" thành "04/2026"
  const getMonthYear = (dateStr: string) => {
    const parts = dateStr.split("/");
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return dateStr;
  };

  // 3. Lọc danh sách Tháng theo Tàu (THÊM LỰA CHỌN "ALL")
  const availableMonths = useMemo(() => {
    if (!selectedCruise) return [];
    const cruiseSchedules = schedules.filter(
      (s) => s.cruise_name === selectedCruise,
    );
    const months = cruiseSchedules.map((s) => getMonthYear(s.departure_date));
    return [...new Set(months)].sort();
  }, [schedules, selectedCruise]);

  // 4. Reset Tháng khi đổi Tàu
  useEffect(() => {
    if (availableMonths.length > 0) {
      // Khi đổi tàu, tự động nhảy về "Tất cả các tháng" cho thoáng
      setSelectedMonth("all");
    } else {
      setSelectedMonth("all");
    }
  }, [availableMonths, selectedCruise]);

  // 5. Lọc dữ liệu cho Bảng (Xử lý logic "all")
  const displayedSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchCruise = s.cruise_name === selectedCruise;
      const matchMonth =
        selectedMonth === "all" ||
        getMonthYear(s.departure_date) === selectedMonth;
      return matchCruise && matchMonth;
    });
  }, [schedules, selectedCruise, selectedMonth]);

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
    <div className="space-y-6">
      {/* ─── HEADER BẢNG ĐIỀU KHIỂN ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
          <Activity className="w-48 h-48 text-[#0A192F]" />
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-xl font-bold text-[#0A192F]">
            Sức Khỏe Lịch Trình
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tỷ lệ lấp đầy để điều chỉnh chiến dịch Marketing.
          </p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Ship className="w-12 h-12 mb-3 text-slate-200" />
          <p className="text-slate-500 font-medium">
            Hệ thống chưa có chuyến đi nào đang mở bán.
          </p>
        </div>
      ) : (
        <>
          {/* ─── BỘ LỌC THÔNG MINH ─── */}
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
                  {/* BỔ SUNG OPTION ALL */}
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

          {/* ─── BẢNG DỮ LIỆU ĐÃ LỌC ─── */}
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
                    {/* Bỏ cột chi tiết, Cột Tỷ lệ giờ là cột cuối cùng */}
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tr-lg">
                      Tỷ Lệ Lấp Đầy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSchedules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-slate-400 font-medium"
                      >
                        Không có chuyến đi nào trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    displayedSchedules.map((item) => (
                      <tr
                        key={item.schedule_id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        {/* 1. Thời gian khởi hành */}
                        <td className="py-4 px-6">
                          <div className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#D4AF37]" />{" "}
                            {item.departure_date}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 ml-6">
                            Ngày về: {item.return_date}
                          </div>
                        </td>

                        {/* 2. Trạng thái */}
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* 3. Phòng (Bán / Tổng) */}
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

                        {/* 4. Tỷ Lệ Lấp Đầy & Nút Xem Chi Tiết (Gộp chung) */}
                        <td className="py-4 px-6 w-80">
                          <div className="flex items-center gap-5">
                            {/* Khối Progress Bar (Lấy không gian flex-1) */}
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

                            {/* Nút Xem chi tiết (Chỉ hiện khi hover vào thẻ <tr> nhờ class group-hover) */}
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
          </div>
        </>
      )}

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
              {/* Header Modal */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F]">
                <div>
                  <h2 className="text-white font-serif text-xl flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-[#D4AF37]" />
                    Chi tiết lấp đầy hạng phòng
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

              {/* Nội dung chi tiết */}
              <div className="overflow-y-auto flex-1 p-7 bg-slate-50">
                {/* Thanh tổng quan mini - Phong cách Tối giản (Minimalist Accent) */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* 1. Tổng Số Phòng */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                      Tổng Số Phòng
                    </div>
                    <div className="text-2xl font-bold text-[#0A192F]">
                      {viewingSchedule.metrics.total_rooms}
                    </div>
                  </div>

                  {/* 2. Còn Trống (Nhấn viền chân Vàng Champagne) */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                    <div className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-1">
                      Còn Trống
                    </div>
                    <div className="text-2xl font-bold text-[#0A192F]">
                      {viewingSchedule.metrics.available_rooms}
                    </div>
                    {/* Đường line nhấn ở đáy */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37]"></div>
                  </div>

                  {/* 3. Đã Đặt (Nhấn viền chân Deep Navy) */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
                    <div className="text-xs text-[#0A192F] font-bold uppercase tracking-widest mb-1">
                      Đã Đặt
                    </div>
                    <div className="text-2xl font-bold text-[#0A192F]">
                      {viewingSchedule.metrics.booked_rooms}
                    </div>
                    {/* Đường line nhấn ở đáy */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#0A192F]"></div>
                  </div>
                </div>

                {/* Danh sách từng hạng phòng */}
                <div className="space-y-3">
                  {!viewingSchedule.cabin_details ||
                  viewingSchedule.cabin_details.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-100">
                      Chưa có dữ liệu chi tiết hạng phòng cho chuyến này. <br />
                      <span className="text-xs text-slate-400 mt-1 inline-block">
                        (Cần Backend bổ sung mảng cabin_details)
                      </span>
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
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
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
                                <span className="font-bold text-[#0A192F]">
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
