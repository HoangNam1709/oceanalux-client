import { useState, useEffect } from "react";
import {
  Calendar,
  Ship,
  Users,
  TrendingUp,
  BarChart3,
  ChevronRight,
  RefreshCcw,
  Bed,
  Activity,
} from "lucide-react";
import {
  AdminTab,
  DashboardStats,
  Booking,
  Cruise,
  formatCompactCurrency,
  formatCurrency,
  getStatusBadge,
} from "./adminShared";

interface Props {
  // Loại bỏ stats và monthlyRevenue khỏi Props, chỉ giữ lại cruises và bookings cho phần hiển thị nhanh
  cruises: Cruise[];
  bookings: Booking[];
  setActiveTab: (tab: AdminTab) => void;
  setSelectedBooking: (b: Booking) => void;
}

interface OverviewData {
  stats: DashboardStats;
  monthlyRevenue: { month: string; value: number }[];
}

export function OverviewTab({
  cruises,
  bookings,
  setActiveTab,
  setSelectedBooking,
}: Props) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8081/api/admin/overview/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();

        if (result.status === "success") {
          setData(result.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center space-y-4">
        <RefreshCcw className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-slate-500 font-medium">
          Đang tải dữ liệu tổng quan...
        </p>
      </div>
    );
  }

  const { stats, monthlyRevenue } = data;
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value)) || 1; // Tránh chia cho 0 nếu chưa có doanh thu

  return (
    <div className="space-y-6 relative">
      {/* 3 Ô CHỈ SỐ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Calendar,
            label: "Tổng đặt vé",
            value: stats.totalBookings,
            trend: "+12%",
            color: "blue",
          },
          {
            icon: Ship,
            label: "Đã xác nhận",
            value: stats.confirmedBookings,
            trend: "+5%",
            color: "emerald",
          },
          {
            icon: Users,
            label: "Tổng hành khách",
            value: stats.totalGuests,
            trend: "+18%",
            color: "purple",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1">
                {s.label}
              </div>
              <div className="text-3xl font-bold text-[#0A192F]">{s.value}</div>
              <div className="text-xs font-bold mt-2 flex items-center gap-1 text-slate-400">
                <TrendingUp className="w-3 h-3" /> Cập nhật theo thời gian thực
              </div>
            </div>
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
              style={{ backgroundColor: `var(--color-${s.color}-50, #f8fafc)` }} // Đảm bảo fallback color
            >
              <s.icon
                className={`w-7 h-7`}
                style={{ color: `var(--color-${s.color}-500, #94a3b8)` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* BIỂU ĐỒ DOANH THU */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="font-serif text-xl text-[#0A192F] font-bold">
                Tổng doanh thu năm nay
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Thống kê dòng tiền từ các lượt đặt phòng thành công
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-[#D4AF37] tracking-tight">
              {formatCompactCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm font-medium text-emerald-600 flex items-center justify-end gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> Dữ liệu trực tiếp từ hệ thống
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
          <div className="absolute inset-0 flex flex-col justify-between pb-8 z-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full border-t border-slate-50 border-dashed flex-1"
              />
            ))}
          </div>
          {monthlyRevenue.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center flex-1 group z-10 h-full justify-end"
            >
              <div className="absolute -top-10 bg-[#0A192F] text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {formatCompactCurrency(item.value)}
              </div>
              <div
                className="w-full max-w-[40px] rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${(item.value / maxRevenue) * 100}%`,
                  minHeight: item.value > 0 ? "4px" : "0px", // Hiển thị 1 viền nhỏ nếu có doanh thu nhưng quá bé
                  background:
                    idx === monthlyRevenue.length - 1
                      ? "linear-gradient(180deg, #D4AF37 0%, #e8c84a 100%)"
                      : "linear-gradient(180deg, #0A192F 0%, #1e3a68 100%)",
                }}
              />
              <div className="text-xs font-semibold text-slate-400 mt-3">
                T{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK NAV & RECENT BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-lg font-bold text-[#0A192F] mb-2 px-1">
            Điều hướng nhanh
          </h2>
          {[
            {
              id: "cruises",
              label: "Quản lý Du thuyền",
              desc: `Đang vận hành ${cruises.length} tàu`,
              icon: Ship,
              theme: "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20",
            },
            {
              id: "cabins",
              label: "Phòng & Cabin",
              desc: "Cấu hình & Bảng giá",
              icon: Bed,
              theme: "text-blue-600 bg-blue-50 border-blue-100",
            },
            {
              id: "revenue",
              label: "Trung tâm tài chính",
              desc: "Báo cáo & Xuất Excel",
              icon: BarChart3,
              theme: "text-rose-600 bg-rose-50 border-rose-100",
            },
            {
              id: "accounts",
              label: "Quản lý tài khoản",
              desc: "Nhân sự & Phân quyền",
              icon: Users,
              theme: "text-purple-600 bg-purple-50 border-purple-100",
            },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id as AdminTab)}
              className="group flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-xl border transition-colors ${nav.theme}`}
                >
                  <nav.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0A192F] group-hover:text-[#D4AF37] transition-colors">
                    {nav.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {nav.desc}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg font-bold text-[#0A192F]">
              Giao dịch gần đây
            </h2>
            <button
              onClick={() => setActiveTab("bookings")}
              className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Chưa có giao dịch nào.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="flex items-center justify-between p-3.5 border border-slate-50 bg-slate-50/50 rounded-xl hover:bg-white hover:border-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0A192F] font-bold text-sm shadow-sm">
                      {b.guestName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#0A192F]">
                        {b.guestName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.cruiseName} • {b.bookingRef}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-[#D4AF37] text-sm">
                        {formatCurrency(b.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        {b.paymentMethod}
                      </div>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
