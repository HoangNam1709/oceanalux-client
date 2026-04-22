import { useState, useEffect } from "react";
import {
  Anchor,
  ArrowLeft,
  LayoutGrid,
  Calendar,
  Ship,
  Bed,
  Users,
  Loader2,
  X,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ScheduleHealthTab } from "../AdminPages/ScheduleHealthTab";
import { RevenueTab } from "../AdminPages/RevenueTab";
// ─── IMPORT TỪ FILE CHUNG (Đảm bảo đường dẫn đúng với cấu trúc thư mục của bạn) ───
import {
  AdminTab,
  Booking,
  Cruise,
  DashboardStats,
  Account,
  BookingStatus,
  Cabin,
  formatCurrency,
  formatCompactCurrency,
  getStatusBadge,
} from "./adminShared";

// ─── IMPORT CÁC TABS ĐÃ TÁCH ───
import { OverviewTab } from "../AdminPages/OverviewTab";
import { BookingsTab } from "../AdminPages/BookingsTab";
import { CruisesTab } from "../AdminPages/CruisesTab";
import { CabinsTab } from "../AdminPages/CabinsTab";
import { AccountsTab } from "../AdminPages/AccountsTab";

// ─── IMPORT CÁC MODALS (Lưu ý: Bạn cần tách các Modal này ra file riêng hoặc để chung trong thư mục AdminPage) ───
// Giả định bạn đã tạo file Modals.tsx chứa các hàm này, nếu chưa, hãy tạo nó và copy code Modal từ file gốc cũ sang.
import { CruiseModal, CabinModal, AccountModal, DeleteConfirm } from "./Modals";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState(true);

  // ─── DATA STATES ───
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalGuests: 0,
  });
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [schedulesHealth, setSchedulesHealth] = useState<any[]>([]);

  // Mẫu dữ liệu ảo cho Biểu đồ
  const monthlyRevenue = [
    { month: "T1", value: 45 },
    { month: "T2", value: 52 },
    { month: "T3", value: 38 },
    { month: "T4", value: 65 },
    { month: "T5", value: 85 },
    { month: "T6", value: 70 },
    { month: "T7", value: 90 },
    { month: "T8", value: 110 },
    { month: "T9", value: 85 },
    { month: "T10", value: 75 },
    { month: "T11", value: 95 },
    { month: "T12", value: 120 },
  ];

  // ─── MODAL & CRUD STATES ───
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [cruiseModal, setCruiseModal] = useState<"create" | Cruise | null>(
    null,
  );
  const [deleteCruise, setDeleteCruise] = useState<Cruise | null>(null);
  const [selectedCruiseId, setSelectedCruiseId] = useState<string>("");
  const [cabinModal, setCabinModal] = useState<"create" | Cabin | null>(null);
  const [deleteCabin, setDeleteCabin] = useState<Cabin | null>(null);
  const [accountModal, setAccountModal] = useState<"create" | Account | null>(
    null,
  );
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);

  // Logic lấy Tàu hiện tại đang xem phòng
  const currentCruise =
    cruises.find((c) => c.id === selectedCruiseId) ?? cruises[0];

  // ─── GỌI API KHỞI TẠO DỮ LIỆU ───
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [statsRes, bookingsRes, cruisesRes, accountsRes, healthRes] =
          await Promise.all([
            fetch("http://localhost:8081/api/admin/dashboard/stats", {
              headers,
            }),
            fetch("http://localhost:8081/api/admin/bookings", { headers }),
            fetch("http://localhost:8081/api/admin/cruises", { headers }),
            fetch("http://localhost:8081/api/admin/accounts", { headers }),
            fetch(
              "http://localhost:8081/api/admin/dashboard/schedules-health",
              { headers },
            ),
          ]);

        // ĐỌC DỮ LIỆU JSON
        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();
        const cruisesData = await cruisesRes.json();
        const accountsData = await accountsRes.json();
        const healthData = await healthRes.json(); // <-- Lúc này healthRes đã có dữ liệu để .json()

        // SET VÀO STATE
        if (statsData.status === "success") setStats(statsData.data);
        if (bookingsData.status === "success") setBookings(bookingsData.data);
        if (cruisesData.status === "success") {
          setCruises(cruisesData.data);
          if (cruisesData.data.length > 0)
            setSelectedCruiseId(cruisesData.data[0].id);
        }
        if (accountsData.status === "success") setAccounts(accountsData.data);
        if (healthData.status === "success")
          setSchedulesHealth(healthData.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Lỗi kết nối Server!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // ─── HÀM XỬ LÝ (API CALLS THÊM, SỬA, XÓA) ───
  // 1. Booking Status
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8081/api/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings((prev) =>
        prev.map((b) =>
          String(b.id) === String(bookingId) ? { ...b, status: newStatus } : b,
        ),
      );
      toast.success("Cập nhật thành công");
    } catch (error) {
      toast.error("Lỗi cập nhật!");
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Tàu (Cruise)
  const handleSaveCruise = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = !!data.id;
      const res = await fetch(
        isEdit
          ? `http://localhost:8081/api/admin/cruises/${data.id}`
          : "http://localhost:8081/api/admin/cruises",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        setCruises((prev) =>
          isEdit
            ? prev.map((c) => (c.id === data.id ? { ...c, ...result.data } : c))
            : [result.data, ...prev],
        );
        setCruiseModal(null);
        toast.success(
          isEdit ? "Cập nhật thành công!" : "Đã tạo Du thuyền mới!",
        );
      } else toast.error("Lỗi: " + result.message);
    } catch (error) {
      toast.error("Lỗi Server!");
    }
  };

  const handleDeleteCruise = async () => {
    if (!deleteCruise) return;

    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/cruises/${deleteCruise.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      // Lấy dữ liệu từ Backend
      const data = await res.json();

      // BẮT LỖI 400 (RÀNG BUỘC DỮ LIỆU)
      if (res.status === 400) {
        // Dùng cú pháp cơ bản nhất để đảm bảo thư viện Toast nào cũng chạy được
        toast.error(data.message);
        setDeleteCruise(null); // Đóng modal
        return; // Dừng hàm tại đây
      }

      // XÓA THÀNH CÔNG
      if (res.ok && data.status === "success") {
        setCruises((prev) => prev.filter((c) => c.id !== deleteCruise.id));
        setDeleteCruise(null);
        toast.success("Xóa Du thuyền thành công!");
      } else {
        // Lỗi logic khác từ Server
        toast.error(data.message || "Lỗi khi xóa du thuyền!");
      }
    } catch (error) {
      console.error("Lỗi catch:", error);
      toast.error("Không thể kết nối đến Server!");
    }
  };

  // 3. Phòng (Cabin)
  const handleSaveCabin = async (data: any) => {
    try {
      const isEdit = !!data.id;
      const res = await fetch(
        isEdit
          ? `http://localhost:8081/api/admin/cabins/${data.id}`
          : "http://localhost:8081/api/admin/cabins",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...data, cruise_id: selectedCruiseId }),
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        setCruises((prev) =>
          prev.map((cruise) => {
            if (cruise.id !== selectedCruiseId) return cruise;
            const updatedCabins = isEdit
              ? cruise.cabins.map((c) =>
                  c.id === data.id ? { ...c, ...result.data } : c,
                )
              : [...cruise.cabins, result.data];
            return {
              ...cruise,
              cabins: updatedCabins,
              basePrice:
                updatedCabins.length > 0
                  ? Math.min(...updatedCabins.map((c) => c.pricePerNight))
                  : 0,
            };
          }),
        );
        setCabinModal(null);
        toast.success("Đã lưu phòng thành công!");
      } else toast.error("Lỗi: " + result.message);
    } catch (error) {
      toast.error("Lỗi Server!");
    }
  };

  const handleDeleteCabin = async () => {
    if (!deleteCabin) return;

    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/cabins/${deleteCabin.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      // 1. Gỡ dữ liệu từ Backend ra trước
      const data = await res.json();

      //  2. BẮT KHIÊN BẢO VỆ (Lỗi 400 - Ràng buộc lịch trình/đơn hàng)
      if (res.status === 400) {
        toast.error(data.message); // Hiển thị nguyên văn lời từ chối của Backend
        setDeleteCabin(null); // Tắt modal xác nhận
        return; // Dừng hàm lại
      }

      //  3. XÓA THÀNH CÔNG
      if (res.ok && data.status === "success") {
        setCruises((prev) =>
          prev.map((cruise) => {
            if (cruise.id !== selectedCruiseId) return cruise;

            // Cập nhật lại danh sách phòng
            const updatedCabins = cruise.cabins.filter(
              (c) => c.id !== deleteCabin.id,
            );

            // Cập nhật lại giá Min của tàu
            return {
              ...cruise,
              cabins: updatedCabins,
              basePrice:
                updatedCabins.length > 0
                  ? Math.min(...updatedCabins.map((c) => c.pricePerNight))
                  : 0,
            };
          }),
        );

        setDeleteCabin(null);
        toast.success("Đã xóa hạng phòng thành công!");
      } else {
        // Lỗi logic khác từ Server
        toast.error(data.message || "Lỗi khi xóa hạng phòng!");
      }
    } catch (error) {
      console.error(error);
      // Xử lý chuẩn TypeScript/ES6 để không bị lỗi error.message
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi Server!";
      toast.error(errorMessage);
    }
  };

  // 4. Tài khoản (Account)
  const handleSaveAccount = async (data: any) => {
    try {
      const isEdit = !!data.id;
      const res = await fetch(
        isEdit
          ? `http://localhost:8081/api/admin/accounts/${data.id}`
          : "http://localhost:8081/api/admin/accounts",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        setAccounts((prev) =>
          isEdit
            ? prev.map((a) => (a.id === data.id ? result.data : a))
            : [result.data, ...prev],
        );
        setAccountModal(null);
        toast.success("Đã lưu tài khoản!");
      } else toast.error("Lỗi: " + result.message);
    } catch (error) {
      toast.error("Lỗi Server!");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccount) return;

    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/accounts/${deleteAccount.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      // 1. Gỡ dữ liệu JSON từ Backend
      const data = await res.json();

      // 2. BẮT KHIÊN BẢO VỆ (Lỗi 400 - Tài khoản đã có lịch sử đặt phòng)
      if (res.status === 400) {
        toast.error(data.message);
        setDeleteAccount(null); // Đóng modal xác nhận để Admin đỡ phải tự bấm tắt
        return; // Dừng hàm, không chạy lệnh xóa State bên dưới
      }

      //  3. XÓA THÀNH CÔNG
      if (res.ok && data.status === "success") {
        setAccounts((prev) => prev.filter((a) => a.id !== deleteAccount.id));
        setDeleteAccount(null);
        toast.success("Đã xóa tài khoản thành công!");
      } else {
        // Xử lý nếu Server trả về lỗi khác (VD: 500, 404)
        toast.error(data.message || "Lỗi khi xóa tài khoản!");
      }
    } catch (error) {
      console.error(error);
      // Xử lý an toàn cho TypeScript
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi Server!";
      toast.error(errorMessage);
    }
  };

  // ─── TABS NAVIGATION ───
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Tổng quan", icon: LayoutGrid },
    { id: "bookings", label: "Đặt chỗ", icon: Calendar },
    { id: "schedules-health", label: "Tình trạng", icon: Activity },
    { id: "revenue", label: "Doanh thu", icon: BarChart3 },
    { id: "cruises", label: "Du thuyền", icon: Ship },
    { id: "cabins", label: "Phòng & Cabin", icon: Bed },
    { id: "accounts", label: "Tài khoản", icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#0A192F] font-semibold font-serif animate-pulse">
          Đang đồng bộ dữ liệu hệ thống...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <div className="mb-8 flex items-end justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm font-bold uppercase tracking-widest text-[#0A192F]">
                OceanaLux Admin
              </span>
            </div>
            <h1 className="font-serif text-[#0A192F] text-3xl">
              Bảng điều khiển
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Quản lý toàn bộ hoạt động du thuyền 5 sao
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-slate-500 hover:text-[#D4AF37] transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Về trang chủ
            </button>
          </div>
        </div>

        {/* TABS MENU */}
        <div className="flex flex-wrap gap-1 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                  active
                    ? "text-[#0A192F] shadow-md bg-gradient-to-r from-[#D4AF37] to-[#e8c84a]"
                    : "text-slate-500 hover:text-[#0A192F] hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* NỘI DUNG TABS */}
        {activeTab === "overview" && (
          <OverviewTab
            cruises={cruises}
            bookings={bookings}
            setActiveTab={setActiveTab}
            setSelectedBooking={setSelectedBooking}
          />
        )}

        {/* NỘI DUNG TABS */}
        {activeTab === "schedules-health" && (
          <ScheduleHealthTab
            schedules={schedulesHealth}
            bookings={bookings}
            refreshData={() => {
              // Hàm gọi lại API nếu Admin bấm nút thao tác
              const token = localStorage.getItem("token");
              fetch("http://localhost:8081/api/admin/bookings", {
                headers: { Authorization: `Bearer ${token}` },
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.status === "success") setBookings(data.data);
                });
            }}
          />
        )}
        {activeTab === "revenue" && <RevenueTab cruises={cruises} />}
        {activeTab === "bookings" && (
          <BookingsTab
            bookings={bookings}
            updatingId={updatingId}
            handleUpdateStatus={handleUpdateStatus}
            setSelectedBooking={setSelectedBooking}
          />
        )}
        {activeTab === "cruises" && (
          <CruisesTab
            cruises={cruises}
            setCruiseModal={setCruiseModal}
            setSelectedCruiseId={setSelectedCruiseId}
            setActiveTab={setActiveTab}
            setDeleteCruise={setDeleteCruise}
          />
        )}
        {activeTab === "cabins" && (
          <CabinsTab
            currentCruise={currentCruise}
            cruises={cruises}
            selectedCruiseId={selectedCruiseId}
            setSelectedCruiseId={setSelectedCruiseId}
            setCabinModal={setCabinModal}
            setDeleteCabin={setDeleteCabin}
          />
        )}
        {activeTab === "accounts" && (
          <AccountsTab
            accounts={accounts}
            setAccountModal={setAccountModal}
            setDeleteAccount={setDeleteAccount}
          />
        )}
      </div>
      {/* END CONTAINER */}

      {/* CÁC MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#0A192F] p-6 flex items-center justify-between rounded-t-2xl z-10 shadow-sm">
                <div>
                  <h2 className="font-serif text-white text-xl">
                    Chi tiết đặt chỗ
                  </h2>
                  <p className="text-xs text-[#D4AF37] mt-1 font-mono tracking-widest">
                    {selectedBooking.bookingRef}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  {getStatusBadge(selectedBooking.status)}
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Tạo lúc{" "}
                    {selectedBooking.bookedDate}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Thông tin khách
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Họ và tên</span>
                      <span className="text-sm font-bold text-[#0A192F]">
                        {selectedBooking.guestName}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Email</span>
                      <span className="text-sm font-bold text-[#0A192F]">
                        {selectedBooking.guestEmail}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Số lượng</span>
                      <span className="text-sm font-bold text-[#0A192F]">
                        {selectedBooking.guests || 2} hành khách
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Thông tin chuyến đi
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Du thuyền</span>
                      <span className="text-sm font-bold text-[#0A192F]">
                        {selectedBooking.cruiseName}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Hạng phòng</span>
                      <span className="text-sm font-bold text-[#0A192F]">
                        {selectedBooking.cabinType}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Thời gian</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {selectedBooking.departureDate} ➝{" "}
                        {selectedBooking.returnDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">
                      Phương thức thanh toán
                    </div>
                    <div className="text-sm font-bold text-[#0A192F] uppercase">
                      {selectedBooking.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Tổng cộng</div>
                    <div className="text-2xl font-bold text-[#D4AF37]">
                      {formatCurrency(selectedBooking.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {cruiseModal !== null && (
          <CruiseModal
            cruise={cruiseModal === "create" ? null : cruiseModal}
            onSave={handleSaveCruise}
            onClose={() => setCruiseModal(null)}
          />
        )}
        {cabinModal !== null && currentCruise && (
          <CabinModal
            cabin={cabinModal === "create" ? null : cabinModal}
            cruiseName={currentCruise.name}
            onSave={handleSaveCabin}
            onClose={() => setCabinModal(null)}
          />
        )}
        {deleteCruise && (
          <DeleteConfirm
            label={`Du thuyền ${deleteCruise.name}`}
            onConfirm={handleDeleteCruise}
            onClose={() => setDeleteCruise(null)}
          />
        )}
        {deleteCabin && (
          <DeleteConfirm
            label={`Hạng phòng ${deleteCabin.name}`}
            onConfirm={handleDeleteCabin}
            onClose={() => setDeleteCabin(null)}
          />
        )}
        {accountModal !== null && (
          <AccountModal
            account={accountModal === "create" ? null : accountModal}
            onSave={handleSaveAccount}
            onClose={() => setAccountModal(null)}
          />
        )}
        {deleteAccount && (
          <DeleteConfirm
            label={`Tài khoản ${deleteAccount.name}`}
            onConfirm={handleDeleteAccount}
            onClose={() => setDeleteAccount(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
