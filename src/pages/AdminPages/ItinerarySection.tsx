import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Map,
  FileText,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Cruise } from "./adminShared";

interface Itinerary {
  id: number | string;
  cruise_id: number | string;
  day_number: number;
  location: string;
  description: string;
  activities: string[] | string;
}

function ItineraryModal({
  isOpen,
  onClose,
  cruiseId,
  editData,
  onSuccess,
  maxDays,
}: {
  isOpen: boolean;
  onClose: () => void;
  cruiseId: string | number;
  editData?: Itinerary | null;
  onSuccess: () => void;
  maxDays: number;
}) {
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setDayNumber(editData.day_number);
      setLocation(editData.location || "");
      setDescription(editData.description || "");
      try {
        if (typeof editData.activities === "string")
          setActivities(JSON.parse(editData.activities));
        else if (Array.isArray(editData.activities))
          setActivities(editData.activities);
        else setActivities([]);
      } catch {
        setActivities([]);
      }
    } else {
      setDayNumber(1);
      setLocation("");
      setDescription("");
      setActivities([]);
      setNewActivity("");
    }
  }, [editData, isOpen]);

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dayNumber > maxDays) {
      toast.error(
        `Lỗi! Du thuyền này chỉ có lịch trình tối đa ${maxDays} ngày.`,
      );
      return;
    }
    if (!location.trim() || !description.trim())
      return toast.error("Vui lòng nhập đủ địa điểm và mô tả!");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = editData
        ? `http://localhost:8081/api/admin/itineraries/${editData.id}`
        : `http://localhost:8081/api/admin/itineraries`;
      const res = await fetch(url, {
        method: editData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cruise_id: cruiseId,
          day_number: dayNumber,
          location,
          description,
          activities,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success(
          editData ? "Cập nhật thành công!" : "Thêm mới thành công!",
        );
        onSuccess();
        onClose();
      } else toast.error(data.message || "Lỗi lưu dữ liệu!");
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#0E1E3A]">
          <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <Map className="w-5 h-5 text-[#E8C96A]" />{" "}
            {editData ? "Sửa Lịch Trình" : "Thêm Ngày Mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
          <form
            id="itinerary-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Ngày Thứ
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxDays}
                  value={dayNumber}
                  onChange={(e) => setDayNumber(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#C9A227]"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Địa Điểm (Tóm tắt)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Bến Tuần Châu - Vịnh Hạ Long..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#C9A227]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Mô tả tổng quan
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#C9A227] resize-none"
                placeholder="Viết mô tả ngắn gọn..."
                required
              />
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Hoạt Động Chi Tiết
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddActivity())
                  }
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  placeholder="VD: Trải nghiệm chèo thuyền Kayak..."
                />
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-[#0E1E3A] text-[#E8C96A] rounded-lg font-bold text-sm hover:bg-[#C9A227] hover:text-[#0E1E3A]"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activities.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-[#FAF7F0] border border-[#E2D9C3] px-3 py-1.5 rounded-full text-xs font-semibold text-[#0E1E3A]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227]" />
                    {act}
                    <button
                      type="button"
                      onClick={() =>
                        setActivities(activities.filter((_, i) => i !== idx))
                      }
                      className="ml-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            form="itinerary-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#0E1E3A", color: "#E8C96A" }}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Lưu Lịch Trình"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ItinerarySection({
  cruise,
  refreshData,
}: {
  cruise: Cruise;
  refreshData: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Itinerary | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);

  // Thêm (cruise as any) thay vì chỉ để cruise
  const itineraries = ((cruise as any)?.itineraries || []) as Itinerary[];
  const sortedItineraries = [...itineraries].sort(
    (a, b) => a.day_number - b.day_number,
  );

  const getActivitiesArray = (data: any) => {
    try {
      return typeof data === "string"
        ? JSON.parse(data)
        : Array.isArray(data)
          ? data
          : [];
    } catch {
      return [];
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Xóa lịch trình ngày này?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/itineraries/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success("Xóa thành công!");
        refreshData();
      } else toast.error(data.message || "Xóa thất bại!");
    } catch {
      toast.error("Lỗi kết nối!");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
      {/* TIÊU ĐỀ NGANG LEVEL VỚI LỊCH TRÌNH MỞ BÁN */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-[#0E1E3A] flex items-center gap-2">
          <Map className="w-5 h-5 text-[#C9A227]" /> Lịch Trình Chi Tiết
        </h3>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="bg-[#0E1E3A] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#C9A227] hover:text-[#0E1E3A] transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm ngày
        </button>
      </div>

      {sortedItineraries.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-400 italic">
            Chưa có lịch trình chi tiết (Ngày 1, Ngày 2...).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItineraries.map((item) => {
            const activities = getActivitiesArray(item.activities);
            return (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-5 group relative hover:border-[#C9A227]/40 transition-colors"
              >
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-[#0E1E3A] text-[#0E1E3A] shrink-0 shadow-sm">
                  <span className="text-[10px] uppercase font-bold leading-none">
                    Ngày
                  </span>
                  <span className="text-xl font-serif font-black leading-none">
                    {item.day_number}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="text-xs font-bold text-[#C9A227] uppercase flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3.5 h-3.5" /> Địa điểm
                      </div>
                      <h4 className="font-bold text-lg text-[#0E1E3A]">
                        {item.location}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditData(item);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#0A192F] hover:bg-slate-200 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        disabled={isDeleting === item.id}
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                      >
                        {isDeleting === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                    {item.description}
                  </p>

                  {activities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/60">
                      {activities.map((act: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E1E3A] bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#C9A227]" />{" "}
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ItineraryModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditData(null);
            }}
            cruiseId={cruise.id}
            maxDays={cruise.durationDays}
            editData={editData}
            onSuccess={refreshData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
