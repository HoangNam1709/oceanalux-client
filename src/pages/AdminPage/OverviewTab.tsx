// OverviewTab.tsx
import {
  Calendar,
  Ship,
  Users,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import {
  AdminTab,
  DashboardStats,
  Booking,
  Cruise,
  formatCompactCurrency,
  formatCurrency,
  getStatusBadge,
} from "./AdminShared";

interface Props {
  stats: DashboardStats;
  monthlyRevenue: { month: string; value: number }[];
  cruises: Cruise[];
  bookings: Booking[];
  setActiveTab: (tab: AdminTab) => void;
  setSelectedBooking: (b: Booking) => void;
}

export function OverviewTab({
  stats,
  monthlyRevenue,
  cruises,
  bookings,
  setActiveTab,
  setSelectedBooking,
}: Props) {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

  return (
    <div className="space-y-6">
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
              <div
                className={`text-xs font-bold mt-2 flex items-center gap-1 text-${s.color}-600`}
              >
                <TrendingUp className="w-3 h-3" /> {s.trend} so với tháng trước
              </div>
            </div>
            <div
              className={`w-14 h-14 rounded-full bg-${s.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <s.icon className={`w-7 h-7 text-${s.color}-500`} />
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
              <TrendingUp className="w-4 h-4" /> +24.5% tăng trưởng
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
                {item.value * 10} Tr
              </div>
              <div
                className="w-full max-w-[40px] rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${(item.value / maxRevenue) * 100}%`,
                  background:
                    idx === monthlyRevenue.length - 1
                      ? "linear-gradient(180deg, #D4AF37 0%, #e8c84a 100%)"
                      : "linear-gradient(180deg, #0A192F 0%, #1e3a68 100%)",
                }}
              />
              <div className="text-xs font-semibold text-slate-400 mt-3">
                {item.month}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK NAV & RECENT BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab("cruises")}
            className="w-full group flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3.5 rounded-xl transition-colors"
                style={{ background: `#D4AF3715`, color: "#D4AF37" }}
              >
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-[#0A192F]">
                  Quản lý Du thuyền
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Đang có {cruises.length} hải trình
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
          </button>
          {/* Nút Cabins Nav tương tự */}
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
