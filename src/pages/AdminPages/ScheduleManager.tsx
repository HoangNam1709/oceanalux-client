import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Trash2,
  Plus,
  AlertCircle,
  Save,
  Edit,
  X,
} from "lucide-react";
import { Pagination } from "./adminShared";

export function ScheduleManager({
  cruiseId,
  initialSchedules = [],
  durationDays,
}: {
  cruiseId: string | number;
  initialSchedules?: any[];
  durationDays: number;
}) {
  const sortSchedules = (list: any[]) => {
    return [...list].sort(
      (a, b) =>
        new Date(a.departure_date).getTime() -
        new Date(b.departure_date).getTime(),
    );
  };

  const [schedules, setSchedules] = useState(() =>
    sortSchedules(initialSchedules),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newSchedule, setNewSchedule] = useState({
    departure_date: "",
    return_date: "",
    status: "upcoming",
  });

  const todayStr = new Date().toLocaleDateString("en-CA");

  const calculateReturnDate = (depDateStr: string) => {
    const returnDateObj = new Date(depDateStr);
    returnDateObj.setDate(returnDateObj.getDate() + (durationDays - 1));
    return returnDateObj.toLocaleDateString("en-CA");
  };

  const handleAddDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const depDate = e.target.value;
    if (!depDate) return;
    setNewSchedule({
      ...newSchedule,
      departure_date: depDate,
      return_date: calculateReturnDate(depDate),
    });
  };

  const handleEditDepartureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const depDate = e.target.value;
    if (!depDate) return;
    setEditingSchedule({
      ...editingSchedule,
      departure_date: depDate,
      return_date: calculateReturnDate(depDate),
    });
  };

  // ================= API CALLS =================
  const handleAddSchedule = async () => {
    if (!newSchedule.departure_date) {
      toast.error("Vui lòng chọn ngày khởi hành!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/api/admin/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cruise_id: cruiseId, ...newSchedule }),
      });
      const data = await res.json();

      if (res.status === 400) {
        toast.error(data.message, { duration: 5000 });
        return;
      }

      if (res.ok && data.status === "success") {
        const updatedList = sortSchedules([...schedules, data.data]);
        setSchedules(updatedList);
        setIsAdding(false);
        setNewSchedule({
          departure_date: "",
          return_date: "",
          status: "upcoming",
        });
        const newItemIndex = updatedList.findIndex(
          (s) => s.id === data.data.id,
        );
        setCurrentPage(Math.floor(newItemIndex / itemsPerPage) + 1);
        toast.success("Mở bán lịch trình mới thành công!");
      } else {
        toast.error(data.message || "Lỗi tạo lịch trình");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule.departure_date) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/schedules/${editingSchedule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingSchedule),
        },
      );
      const data = await res.json();

      if (res.status === 400) {
        toast.error(data.message, { duration: 5000 });
        return;
      }

      if (res.ok && data.status === "success") {
        const updatedList = sortSchedules(
          schedules.map((s) => (s.id === editingSchedule.id ? data.data : s)),
        );
        setSchedules(updatedList);
        setEditingSchedule(null);
        toast.success("Đã cập nhật Lịch trình!");
      } else {
        toast.error(data.message || "Lỗi cập nhật lịch trình");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  const handleDeleteSchedule = async () => {
    const depDateStr = new Date(
      editingSchedule.departure_date,
    ).toLocaleDateString("vi-VN");
    if (
      !window.confirm(
        `⚠️ Bạn có chắc muốn xóa lịch trình ngày ${depDateStr} không?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/schedules/${editingSchedule.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      if (res.status === 400) {
        toast.error(data.message, { duration: 5000 });
        return;
      }

      if (res.ok && data.status === "success") {
        const updatedSchedules = schedules.filter(
          (s) => s.id !== editingSchedule.id,
        );
        setSchedules(updatedSchedules);
        setEditingSchedule(null);

        const newTotalPages = Math.ceil(updatedSchedules.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0)
          setCurrentPage(newTotalPages);

        toast.success("Đã xóa lịch trình thành công!");
      } else {
        toast.error(data.message || "Lỗi xóa lịch trình");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  // ================= GIAO DIỆN TỐI ƯU =================
  const totalPages = Math.ceil(schedules.length / itemsPerPage);
  const currentItems = schedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* HEADER TÍNH NĂNG */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
          <Calendar className="text-[#D4AF37] w-6 h-6" />
          Lịch trình Mở bán
        </h3>
        {!isAdding && !editingSchedule && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#0A192F] text-[#D4AF37] px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm lịch trình
          </button>
        )}
      </div>

      {/* FORM THÊM MỚI */}
      {isAdding && (
        <div className="bg-white p-5 rounded-xl mb-6 border-l-4 border-l-[#D4AF37] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-y-slate-100 border-r-slate-100 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-[#0A192F] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Khởi tạo Lịch trình
              mới
            </h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Ngày đi
              </label>
              <input
                type="date"
                min={todayStr}
                value={newSchedule.departure_date}
                onChange={handleAddDepartureChange}
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Ngày về ({durationDays} ngày)
              </label>
              <input
                type="date"
                disabled
                value={newSchedule.return_date}
                className="w-full border-transparent bg-slate-100 text-slate-400 cursor-not-allowed rounded-lg p-2.5 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Trạng thái
              </label>
              <select
                value={newSchedule.status}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, status: e.target.value })
                }
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50"
              >
                <option value="upcoming">Sắp khởi hành (Upcoming)</option>
                <option value="active">Đang chạy (Active)</option>
                <option value="cancelled">Đã hủy (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="bg-[#D4AF37]/10 text-[#0A192F] p-3.5 rounded-lg text-xs font-medium mb-5 flex gap-2 border border-[#D4AF37]/20">
            <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <p>
              Hệ thống sẽ tự động tính ngày về, quét các Hạng phòng của tàu và
              mở kho phòng trống tương ứng.
            </p>
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAddSchedule}
              className="px-5 py-2.5 bg-[#0A192F] text-[#D4AF37] hover:bg-slate-800 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" /> Lưu & Mở Kho
            </button>
          </div>
        </div>
      )}

      {/* FORM SỬA LỊCH TRÌNH */}
      {editingSchedule && (
        <div className="bg-white p-5 rounded-xl mb-6 border-l-4 border-l-[#0A192F] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-y-slate-100 border-r-slate-100 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-[#0A192F] flex items-center gap-2">
              <Edit className="w-4 h-4 text-[#D4AF37]" /> Cập nhật Lịch trình
            </h4>
            <button
              onClick={() => setEditingSchedule(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Ngày đi
              </label>
              {/* SỬA LỖI Ở ĐÂY: Dùng substring(0, 10) để luôn lấy đúng YYYY-MM-DD */}
              <input
                type="date"
                value={
                  editingSchedule.departure_date
                    ? editingSchedule.departure_date.substring(0, 10)
                    : ""
                }
                onChange={handleEditDepartureChange}
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-[#0A192F] focus:border-[#0A192F] bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Ngày về ({durationDays} ngày)
              </label>
              {/* SỬA LỖI Ở ĐÂY */}
              <input
                type="date"
                disabled
                value={
                  editingSchedule.return_date
                    ? editingSchedule.return_date.substring(0, 10)
                    : ""
                }
                className="w-full border-transparent bg-slate-100 text-slate-400 cursor-not-allowed rounded-lg p-2.5 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Trạng thái
              </label>
              <select
                value={editingSchedule.status}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    status: e.target.value,
                  })
                }
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-[#0A192F] focus:border-[#0A192F] bg-slate-50"
              >
                <option value="upcoming">Sắp khởi hành (Upcoming)</option>
                <option value="active">Đang chạy (Active)</option>
                <option value="cancelled">Đã hủy (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-4">
            <button
              onClick={handleDeleteSchedule}
              className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Xóa lịch trình
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingSchedule(null)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateSchedule}
                className="px-5 py-2.5 bg-[#0A192F] text-[#D4AF37] hover:bg-slate-800 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DANH SÁCH LỊCH TRÌNH */}
      {schedules.length === 0 ? (
        <div className="text-center py-12 text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          Tàu này chưa có lịch trình nào.
          <br /> Hãy bấm "Thêm lịch trình" để bắt đầu mở bán!
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 text-xs uppercase text-slate-400">
                  <th className="py-3 px-2 font-bold tracking-wider">
                    Ngày Khởi Hành
                  </th>
                  <th className="py-3 px-2 font-bold tracking-wider">
                    Ngày Kết Thúc
                  </th>
                  <th className="py-3 px-2 font-bold text-center tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="py-3 px-2 font-bold text-right tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-2 font-bold text-[#0A192F]">
                      {new Date(schedule.departure_date).toLocaleDateString(
                        "vi-VN",
                      )}
                    </td>
                    <td className="py-4 px-2 text-slate-500 font-medium">
                      {new Date(schedule.return_date).toLocaleDateString(
                        "vi-VN",
                      )}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span
                        className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-md ${
                          schedule.status === "upcoming"
                            ? "bg-indigo-50 text-indigo-600"
                            : schedule.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : schedule.status === "cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setIsAdding(false);
                        }}
                        className="p-2 text-slate-400 group-hover:text-[#0A192F] group-hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        title="Chỉnh sửa lịch trình"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={schedules.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
