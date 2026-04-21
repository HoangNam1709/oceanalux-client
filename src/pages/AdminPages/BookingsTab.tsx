import { useState } from "react";
import { Search, Download, ChevronDown, Eye } from "lucide-react";
import {
  Booking,
  BookingStatus,
  formatCurrency,
  getStatusBadge,
  Pagination,
} from "./adminShared";

interface Props {
  bookings: Booking[];
  updatingId: string | number | null;
  handleUpdateStatus: (id: string, status: BookingStatus) => void;
  setSelectedBooking: (b: Booking) => void;
}

export function BookingsTab({
  bookings,
  updatingId,
  handleUpdateStatus,
  setSelectedBooking,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );

  // ─── THÊM STATE PHÂN TRANG ───
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─── THÊM STATE LOADING CHO NÚT EXCEL ───
  const [isExporting, setIsExporting] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingRef.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.cruiseName.toLowerCase().includes(q)) &&
      (statusFilter === "all" || b.status === statusFilter)
    );
  });

  // ─── LOGIC CẮT MẢNG DỮ LIỆU ───
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentItems = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as BookingStatus | "all");
    setCurrentPage(1);
  };

  // ─── LOGIC TẢI FILE BẢO MẬT BẰNG BLOB ───
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");

      // Gọi API xuất file của Laravel
      const response = await fetch(
        "http://localhost:8081/api/admin/revenue/export",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Đính kèm token
          },
        },
      );

      if (!response.ok) throw new Error("Không thể xuất file");

      // Biến đổi dữ liệu trả về thành dạng File nhị phân (Blob)
      const blob = await response.blob();

      // Tạo một đường dẫn ảo (URL) cho file này trên trình duyệt
      const url = window.URL.createObjectURL(blob);

      // Tạo một thẻ <a> ảo, gắn link và tự động click để tải về
      const a = document.createElement("a");
      a.href = url;
      a.download = `OceanaLux_BaoCaoDoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Dọn dẹp rác bộ nhớ sau khi tải xong
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Đã có lỗi xảy ra khi xuất báo cáo!");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã vé, tên khách..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
            />
          </div>
          <div className="relative min-w-[160px]">
            <select
              value={statusFilter}
              onChange={handleFilter}
              className="w-full appearance-none px-5 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 bg-white cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="paid">Đã thanh toán</option>
              <option value="holding">Chờ xử lý</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* NÚT XUẤT EXCEL ĐÃ ĐƯỢC KÍCH HOẠT */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-[#0A192F] transition-all bg-gradient-to-br from-[#D4AF37] to-[#e8c84a] shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-wait shrink-0"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Xuất Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#0A192F] text-white">
                {[
                  "Mã vé / Ngày đặt",
                  "Khách hàng",
                  "Hải trình",
                  "Thời gian",
                  "Hạng phòng",
                  "Tổng tiền",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-4 px-5 text-xs font-bold uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                currentItems.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0A192F]">
                        {b.bookingRef}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {b.bookedDate}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm font-bold text-slate-900">
                        {b.guestName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.guestEmail}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm font-medium text-slate-700 max-w-[180px]">
                      {b.cruiseName}
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm font-semibold text-slate-900">
                        {b.departureDate}
                      </div>
                      <div className="text-xs text-slate-500">
                        đến {b.returnDate}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-700">
                      <div>{b.cabinType}</div>
                      <div className="text-xs text-slate-500">
                        {b.guests} khách
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm font-bold text-[#D4AF37]">
                        {formatCurrency(b.totalAmount)}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 uppercase">
                        {b.paymentMethod}
                      </div>
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(b.status)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-2 rounded-md bg-[#0A192F]/5 text-[#0A192F] hover:bg-[#0A192F]/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) =>
                              handleUpdateStatus(
                                b.id,
                                e.target.value as BookingStatus,
                              )
                            }
                            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold border rounded-md cursor-pointer disabled:opacity-50 shadow-sm focus:ring-1 focus:ring-[#D4AF37]"
                          >
                            <option value="holding">Giữ chỗ</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Hủy đơn</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {updatingId === b.id && (
                          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredBookings.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
