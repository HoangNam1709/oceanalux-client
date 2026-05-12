import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Ship, ChevronDown, Save, Check } from "lucide-react";
import { Cruise } from "../adminShared";
import { Field, inputCls } from "./ModalShared";

interface CruiseModalProps {
  cruise: Cruise | null;
  onSave: (data: Cruise | any) => void;
  onClose: () => void;
}

export function CruiseModal({ cruise, onSave, onClose }: CruiseModalProps) {
  const isEdit = !!cruise;

  const initialData = cruise
    ? {
        id: cruise.id,
        name: cruise.name,
        thumbnail: cruise.thumbnail ?? "",
        destination: cruise.destination,
        durationDays: String(cruise.durationDays),
        durationNights: String(cruise.durationNights),
        description: cruise.description,
        starRating: String(cruise.starRating),
        status: cruise.featured ? "active" : "inactive",
        facilityIds: cruise.facilityIds || [],
      }
    : {
        name: "",
        destination: "",
        durationDays: "3",
        durationNights: "2",
        description: "",
        starRating: "5",
        status: "active",
        facilityIds: [],
      };

  const [form, setForm] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amenitySearch, setAmenitySearch] = useState("");

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8081/api/admin/amenities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "success") {
          setAvailableAmenities(data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách tiện ích", error);
      }
    };
    fetchAmenities();
  }, []);

  const set = (k: string, v: unknown) =>
    setForm((prev: any) => ({ ...prev, [k]: v }));

  const handleNumberInput = (k: string, val: string) => {
    const onlyNums = val.replace(/[^0-9]/g, "");
    set(k, onlyNums);
  };

  const toggleFacility = (id: number) => {
    const currentIds = form.facilityIds || [];
    if (currentIds.includes(id)) {
      set(
        "facilityIds",
        currentIds.filter((fid: number) => fid !== id),
      );
    } else {
      set("facilityIds", [...currentIds, id]);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Tên du thuyền là bắt buộc";
    if (!form.destination?.trim()) e.destination = "Điểm đến là bắt buộc";
    if (!form.durationDays || Number(form.durationDays) < 1)
      e.durationDays = "Tối thiểu 1 ngày";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const submitData = {
      ...form,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      starRating: Number(form.starRating),
    };
    onSave(submitData);
  };

  const filteredAmenities = availableAmenities.filter((am) =>
    am.name.toLowerCase().includes(amenitySearch.toLowerCase()),
  );

  const selectedAmenities = availableAmenities.filter((am) =>
    (form.facilityIds || []).includes(am.id),
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col relative"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F] relative z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/20">
              <Ship className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-white font-serif">
                {isEdit ? "Chỉnh sửa Du thuyền" : "Thêm Du thuyền mới"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEdit ? `ID: ${cruise!.id}` : "Nhập thông tin cơ bản"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-7 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Tên du thuyền *" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="VD: OceanaLux Victoria"
                className={inputCls(!!errors.name)}
              />
            </Field>
            <Field label="Điểm đến *" error={errors.destination}>
              <input
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
                placeholder="VD: Vịnh Hạ Long"
                className={inputCls(!!errors.destination)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-4 gap-5">
            <Field label="Số ngày" error={errors.durationDays}>
              <input
                type="text"
                value={form.durationDays}
                onChange={(e) =>
                  handleNumberInput("durationDays", e.target.value)
                }
                className={inputCls(!!errors.durationDays)}
              />
            </Field>
            <Field label="Số đêm">
              <input
                type="text"
                value={form.durationNights}
                onChange={(e) =>
                  handleNumberInput("durationNights", e.target.value)
                }
                className={inputCls(false)}
              />
            </Field>
            <Field label="Xếp hạng sao">
              <div className="relative">
                <select
                  value={form.starRating}
                  onChange={(e) => set("starRating", e.target.value)}
                  className={inputCls(false) + " appearance-none pr-10"}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v} ★
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Trạng thái">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className={inputCls(false) + " appearance-none pr-10"}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <Field label="Tiện ích tàu (Amenities)">
            <div className="relative">
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}
              <div
                onClick={() => setIsDropdownOpen(true)}
                className={`min-h-[44px] w-full px-3 py-2 text-sm rounded-lg border cursor-text flex flex-wrap gap-2 items-center transition-colors relative z-20 bg-white ${isDropdownOpen ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/40" : "border-slate-200 hover:border-[#D4AF37]"}`}
              >
                {selectedAmenities.length === 0 ? (
                  <span className="text-slate-400 select-none">
                    Nhấn để chọn tiện ích...
                  </span>
                ) : (
                  selectedAmenities.map((am) => (
                    <span
                      key={am.id}
                      className="flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#A67C00] border border-[#D4AF37]/30 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm"
                    >
                      {am.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFacility(am.id);
                        }}
                        className="hover:text-red-500 transition-colors p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 ml-auto shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-60">
                  <div className="p-3 border-b border-slate-100 shrink-0 bg-slate-50">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Tìm nhanh tiện ích..."
                      value={amenitySearch}
                      onChange={(e) => setAmenitySearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {filteredAmenities.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4 italic">
                        Không tìm thấy tiện ích phù hợp!
                      </p>
                    ) : (
                      filteredAmenities.map((am) => {
                        const isSelected = (form.facilityIds || []).includes(
                          am.id,
                        );
                        return (
                          <div
                            key={am.id}
                            onClick={() => toggleFacility(am.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-[#D4AF37]/10" : "hover:bg-slate-50"}`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-white border-slate-300"}`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white stroke-[3]" />
                              )}
                            </div>
                            <span
                              className={
                                isSelected
                                  ? "font-bold text-[#A67C00]"
                                  : "text-slate-700 font-medium"
                              }
                            >
                              {am.name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </Field>

          <Field label="Mô tả">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Nhập mô tả về con tàu..."
              className={inputCls(false) + " resize-none"}
            />
          </Field>
          <Field label="URL Ảnh đại diện (Thumbnail)">
            <div className="space-y-2">
              <textarea
                rows={2}
                value={form.thumbnail}
                onChange={(e) => set("thumbnail", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputCls(false) + " font-mono text-xs"}
              />
              {form.thumbnail && (
                <div className="relative h-32 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={form.thumbnail}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>
          </Field>
        </div>

        <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 relative z-20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#0A192F] transition-all bg-gradient-to-br from-[#D4AF37] to-[#e8c84a] shadow-[0_4px_16px_rgba(212,175,55,0.35)]"
          >
            <Save className="w-4 h-4" />{" "}
            {isEdit ? "Lưu thay đổi" : "Tạo Du thuyền"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
