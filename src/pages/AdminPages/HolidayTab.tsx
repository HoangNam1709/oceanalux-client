import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Sparkles,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteConfirm } from "./Modals"; // 🚀 Import DeleteConfirm

export function HolidayTab() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [deletingData, setDeletingData] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHolidays = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/admin/holidays", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) setHolidays(data.data || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách ngày lễ");
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const startDateStr = formData.get("start_date") as string;
    const endDateStr = formData.get("end_date") as string;

    const payload = {
      name: formData.get("name"),
      start_date: startDateStr,
      end_date: endDateStr,
      default_multiplier: parseFloat(
        formData.get("default_multiplier") as string,
      ),
      description: formData.get("description"),
      is_active: true,
    };

    if (new Date(startDateStr) > new Date(endDateStr)) {
      return toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
    }

    try {
      const url = editingData
        ? `http://localhost:8081/api/admin/holidays/${editingData.id}`
        : `http://localhost:8081/api/admin/holidays`;
      const method = editingData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingData ? "Đã cập nhật!" : "Đã thêm ngày lễ mới!");
        setIsModalOpen(false);
        setEditingData(null);
        fetchHolidays();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const executeDelete = async () => {
    if (!deletingData) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/holidays/${deletingData.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.ok) {
        toast.success("Đã xóa thành công!");
        fetchHolidays();
      } else {
        toast.error("Không thể xóa lúc này");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsDeleting(false);
      setDeletingData(null);
    }
  };

  const filteredHolidays = holidays.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên dịp lễ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>
        <button
          onClick={() => {
            setEditingData(null);
            setIsModalOpen(true);
          }}
          className="bg-[#0A192F] text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Thêm Ngày Lễ
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-6 font-bold">Tên Dịp Lễ</th>
                <th className="py-4 px-6 font-bold">Thời gian áp dụng</th>
                <th className="py-4 px-6 font-bold text-center">Hệ số Giá</th>
                <th className="py-4 px-6 font-bold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredHolidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    Chưa có dữ liệu ngày lễ nào.
                  </td>
                </tr>
              ) : (
                filteredHolidays.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0A192F] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />{" "}
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600">
                      {new Date(item.start_date).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(item.end_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold ${
                          item.default_multiplier > 1
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        x{parseFloat(item.default_multiplier)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setEditingData(item);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-colors ml-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeletingData({ id: item.id, name: item.name })
                        }
                        className="p-2 text-slate-400 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-[#0A192F]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#D4AF37]" />
                  {editingData ? "Cập Nhật Ngày Lễ" : "Thêm Ngày Lễ Mới"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Tên Dịp Lễ / Sự kiện
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingData?.name || ""}
                    placeholder="VD: Lễ Quốc Khánh 2/9"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      defaultValue={
                        editingData?.start_date?.substring(0, 10) || ""
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      defaultValue={
                        editingData?.end_date?.substring(0, 10) || ""
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Hệ số Giá (Mặc định: 1.0)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-3 py-2 rounded-lg font-bold text-slate-500">
                      x
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      name="default_multiplier"
                      required
                      defaultValue={editingData?.default_multiplier || "1.20"}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] font-bold text-[#0A192F]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    VD: Nhập 1.25 nếu muốn tăng 25% giá vé.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Mô tả thêm (Tùy chọn)
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={editingData?.description || ""}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0A192F] text-[#D4AF37] font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Lưu Ngày Lễ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingData && (
          <DeleteConfirm
            title="Xóa Dịp Lễ"
            label={deletingData.name}
            isProcessing={isDeleting}
            onConfirm={executeDelete}
            onClose={() => setDeletingData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
