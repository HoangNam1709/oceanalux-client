import { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  Ship,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  RefreshCcw,
  PieChart as PieIcon,
} from "lucide-react";
import { Cruise, formatCompactCurrency, formatCurrency } from "./adminShared";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Props {
  cruises: Cruise[];
}

const COLORS = ["#0A192F", "#D4AF37", "#1E293B", "#94A3B8"];

export function RevenueTab({ cruises }: Props) {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  );
  const [selectedCruise, setSelectedCruise] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8081/api/admin/revenue/stats?start_date=${startDate}&end_date=${endDate}&cruise_id=${selectedCruise}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const json = await res.json();
        if (json.status === "success") setStats(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [startDate, endDate, selectedCruise]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/revenue/export?start_date=${startDate}&end_date=${endDate}&cruise_id=${selectedCruise}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OceanaLux_Revenue_${startDate}_${endDate}.xlsx`;
      a.click();
    } catch (e) {
      alert("Lỗi xuất file");
    } finally {
      setIsExporting(false);
    }
  };

  if (!stats)
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCcw className="animate-spin text-[#D4AF37]" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* FILTER BAR - LUXURY STYLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <Ship className="w-4 h-4 text-[#0A192F]" />
            <select
              value={selectedCruise}
              onChange={(e) => setSelectedCruise(e.target.value)}
              className="bg-transparent text-sm font-bold text-[#0A192F] focus:outline-none"
            >
              <option value="all">Tất cả du thuyền</option>
              {cruises.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-[#0A192F]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-[#0A192F] focus:outline-none"
            />
            <span className="text-slate-300">-</span>
            <input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-[#0A192F] focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-[#0A192F] text-[#D4AF37] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />{" "}
          {isExporting ? "Đang xử lý..." : "Xuất Báo Cáo"}
        </button>
      </div>

      {/* METRIC CARDS - CLEAN & PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Tổng Thực Thu",
            val: stats.metrics.totalCashIn,
            icon: Wallet,
            color: "#D4AF37",
            trend: stats.metrics.growth,
          },
          {
            label: "Doanh Thu Chốt",
            val: stats.metrics.recognizedRevenue,
            icon: TrendingUp,
            color: "#0A192F",
            sub: "Chuyến đã hoàn thành",
          },
          {
            label: "Thất Thoát / Hủy",
            val: stats.metrics.refundedAmount,
            icon: ArrowDownRight,
            color: "#64748b",
          },
        ].map((m, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: m.color }}
            ></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-slate-50 text-[#0A192F] group-hover:bg-[#0A192F] group-hover:text-[#D4AF37] transition-all">
                <m.icon className="w-5 h-5" />
              </div>
              {m.trend !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${m.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                >
                  {m.trend >= 0 ? "▲" : "▼"} {Math.abs(m.trend)}%
                </span>
              )}
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              {m.label}
            </h3>
            <div className="text-2xl font-bold text-[#0A192F]">
              {formatCompactCurrency(m.val)}
            </div>
            {m.sub && (
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {m.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ đường (2/3 chiều rộng) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-[#0A192F] mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Hiệu suất Năm{" "}
            {stats.year}
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(v) => `${v / 1e9}B`}
                />
                <Tooltip
                  formatter={(v: any) => [
                    formatCurrency(Number(v)),
                    "Doanh thu",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn (1/3 chiều rộng) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-[#0A192F] mb-6 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#D4AF37]" /> Cơ cấu Theo Tàu
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.cruisesData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.cruisesData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => formatCompactCurrency(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stats.cruisesData.map((c: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></div>
                  <span className="text-slate-500 font-medium">{c.name}</span>
                </div>
                <span className="font-bold text-[#0A192F]">
                  {formatCompactCurrency(c.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
