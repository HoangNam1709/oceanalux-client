import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  Download,
  ChevronDown,
  Eye,
  RotateCcw,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Booking,
  BookingStatus,
  formatCurrency,
  getStatusBadge,
  Pagination,
} from "./adminShared";

// ==========================================
// COMPONENT: MODAL HỦY & HOÀN TIỀN CHO ADMIN
// ==========================================
const AdminCancelRefundModal = ({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminRefund = async () => {
    if (!agreed) {
      toast.error("Vui lòng xác nhận đồng ý với chính sách hoàn hủy!");
      return;
    }
    if (!reason.trim()) {
      toast.error("Vui lòng nhập nội dung/lý do hoàn tiền!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      // GỌI API ADMIN HỦY & HOÀN TIỀN
      const res = await fetch(
        `http://localhost:8081/api/admin/bookings/${booking.id}/cancel-refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        },
      );

      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success("Đã chuyển đơn sang trạng thái Chờ Hoàn Tiền!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Lỗi khi xử lý hoàn tiền");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Admin: Xử lý Hủy & Hoàn tiền
          </h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700">
            <p className="mb-2">
              Bạn đang thực hiện thao tác Hủy đơn và tính toán Hoàn tiền cho mã
              vé:{" "}
              <strong className="text-[#0A192F]">{booking.bookingRef}</strong>.
            </p>
            <p>
              Hệ thống sẽ tự động tính toán số tiền được hoàn dựa trên ngày khởi
              hành (
              <strong className="text-amber-600">
                {booking.departureDate}
              </strong>
              ) và chuyển đơn này sang danh sách{" "}
              <strong>Chờ Kế Toán Hoàn Tiền</strong>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nội dung / Lý do hoàn tiền (Bắt buộc){" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border-slate-200 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500 min-h-[80px]"
              placeholder="Ghi chú nội bộ cho kế toán..."
            ></textarea>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded text-red-500 focus:ring-red-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-slate-600 font-medium">
              Tôi xác nhận Hủy đơn hàng này và giải phóng kho phòng. Thao tác
              này không thể hoàn tác.
            </span>
          </label>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm"
          >
            Hủy bỏ
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleAdminRefund}
            className="px-5 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Xác nhận Hủy & Hoàn tiền
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT CHÍNH: BOOKINGS TAB
// ==========================================
interface Props {
  bookings: Booking[];
  updatingId: string | number | null;
  handleUpdateStatus: (id: string, status: BookingStatus) => void;
  setSelectedBooking: (b: Booking) => void;
  refreshData?: () => void; // Thêm prop này để load lại data sau khi admin hủy
}

export function BookingsTab({
  bookings,
  updatingId,
  handleUpdateStatus,
  setSelectedBooking,
  refreshData,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isExporting, setIsExporting] = useState(false);

  // 🚀 STATE QUẢN LÝ MODAL HOÀN TIỀN
  const [bookingToRefund, setBookingToRefund] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingRef.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.cruiseName.toLowerCase().includes(q)) &&
      (statusFilter === "all" || b.status === statusFilter)
    );
  });

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

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8081/api/admin/revenue/export",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Không thể xuất file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OceanaLux_BaoCaoDoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
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
    <div className="space-y-6 relative">
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
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 🚀 NÚT HỦY & HOÀN TIỀN (CHỈ HIỆN KHI ĐÃ THANH TOÁN) */}
                        {b.status === "paid" && (
                          <button
                            onClick={() => setBookingToRefund(b)}
                            className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-transparent hover:border-red-200"
                            title="Hủy đơn & Yêu cầu hoàn tiền"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

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

      {/* 🚀 GỌI MODAL TẠI ĐÂY */}
      {bookingToRefund && (
        <AdminCancelRefundModal
          booking={bookingToRefund}
          onClose={() => setBookingToRefund(null)}
          onSuccess={() => {
            if (refreshData) refreshData();
          }}
        />
      )}
    </div>
  );
}
