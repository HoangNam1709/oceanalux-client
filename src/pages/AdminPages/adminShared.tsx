import { ChevronLeft, ChevronRight } from "lucide-react";

export type AdminTab =
  | "overview"
  | "bookings"
  | "cruises"
  | "cabins"
  | "accounts"
  | "schedules-health"
  | "revenue";
export type BookingStatus = "paid" | "holding" | "cancelled" | "completed";

export interface Account {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface Cabin {
  id: string;
  type: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  available: number;
  area: number;
  deck: number;
  amenities: string[];
  imageUrl: string;
  images_objects?: { id: number; image_url: string }[];
}

export interface Cruise {
  id: string;
  name: string;
  thumbnail: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  starRating: number;
  basePrice: number;
  images: string[];
  description: string;
  facilities: string[];
  cabins: Cabin[];
  featured: boolean;
  schedules?: any[];
  facilityIds?: number[];
  images_objects?: { id: number; image_url: string }[];
  itineraries?: string[];
}

export interface Booking {
  id: string;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  cruiseName: string;
  departureDate: string;
  returnDate: string;
  cabinType: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: string;
  bookedDate: string;
  cancellation_reason?: string | null;
  cancellation_fee?: number;
  refund_amount?: number;
  refund_status?: "pending" | "refund" | null;
  cancelled_at?: string | null;
}

export interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalGuests: number;
}

export const formatCurrency = (amount: number | string) => {
  if (amount === undefined || amount === null || amount === "") return "0 VNĐ";

  // Ép kiểu về số và làm tròn (cắt bỏ đuôi .00)
  const numericAmount = Math.round(Number(amount));

  if (isNaN(numericAmount)) return "0 VNĐ";

  // Dùng Intl.NumberFormat chuẩn của Việt Nam
  return new Intl.NumberFormat("vi-VN").format(numericAmount) + " VNĐ";
};

export const formatCompactCurrency = (amount: number | string) => {
  if (amount === undefined || amount === null || amount === "") return "0 VNĐ";

  const numericAmount = Math.round(Number(amount));
  if (isNaN(numericAmount)) return "0 VNĐ";

  if (numericAmount >= 1000000000)
    return (
      (numericAmount / 1000000000).toFixed(2).replace(/\.00$/, "") + " Tỷ VNĐ"
    );
  if (numericAmount >= 1000000)
    return (
      (numericAmount / 1000000).toFixed(2).replace(/\.00$/, "") + " Tr VNĐ"
    );

  return new Intl.NumberFormat("vi-VN").format(numericAmount) + " VNĐ";
};

export const getStatusBadge = (status: BookingStatus) => {
  const baseCls =
    "px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap inline-block text-center";
  switch (status) {
    case "paid":
      return (
        <span
          className={`${baseCls} bg-[#0A192F] text-[#D4AF37] border-[#0A192F] shadow-sm`}
        >
          Đã thanh toán
        </span>
      );
    case "holding":
      return (
        <span
          className={`${baseCls} bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30`}
        >
          Chờ xử lý
        </span>
      );
    case "cancelled":
      return (
        <span
          className={`${baseCls} bg-slate-100 text-slate-500 border-slate-200`}
        >
          Đã huỷ
        </span>
      );
    case "completed":
      return (
        <span
          className={`${baseCls} bg-emerald-50 text-emerald-600 border-emerald-200`}
        >
          Hoàn thành
        </span>
      );
    default:
      return (
        <span className={`${baseCls} bg-gray-50 text-gray-700 border-gray-200`}>
          Không rõ
        </span>
      );
  }
}; // ĐÃ ĐÓNG NGOẶC HÀM GETSTATUSBADGE Ở ĐÂY

// ─── COMPONENT PHÂN TRANG DÙNG CHUNG ───
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Tính toán số lượng item đang hiển thị
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Hiển thị{" "}
            <span className="font-bold text-[#0A192F]">{startItem}</span> đến{" "}
            <span className="font-bold text-[#0A192F]">{endItem}</span> trong
            tổng số{" "}
            <span className="font-bold text-[#0A192F]">{totalItems}</span> kết
            quả
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Hiển thị số trang */}
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrent = page === currentPage;

              // Logic rút gọn số trang
              if (
                totalPages > 5 &&
                page !== 1 &&
                page !== totalPages &&
                Math.abs(page - currentPage) > 1
              ) {
                if (page === 2 || page === totalPages - 1)
                  return (
                    <span
                      key={`ellipsis-${page}`}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
                    >
                      ...
                    </span>
                  );
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 transition-all ${
                    isCurrent
                      ? "z-10 bg-[#0A192F] text-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A192F]"
                      : "text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
