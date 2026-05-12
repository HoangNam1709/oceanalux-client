import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Bed, ChevronDown, Save } from "lucide-react";
import { Cabin } from "../adminShared";
import { Field, inputCls, blankCabin, CABIN_TYPES } from "./ModalShared";

interface CabinModalProps {
  cabin: Cabin | null;
  cruiseName: string;
  onSave: (data: Cabin | any) => void;
  onClose: () => void;
}

export function CabinModal({
  cabin,
  cruiseName,
  onSave,
  onClose,
}: CabinModalProps) {
  const isEdit = !!cabin;

  const initialData = cabin
    ? {
        ...cabin,
        pricePerNight: String(cabin.pricePerNight),
        capacity: String(cabin.capacity),
        available: String(cabin.available),
        area: String((cabin as any).area || 20),
        deck: String((cabin as any).deck || 1),
      }
    : blankCabin();

  const [form, setForm] = useState<any>(initialData);
  const [amenitiesText, setAmenitiesText] = useState(
    (cabin?.amenities ?? []).join(", "),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: unknown) =>
    setForm((prev: any) => ({ ...prev, [k]: v }));

  const handleNumberInput = (k: string, val: string) => {
    const onlyNums = val.replace(/[^0-9]/g, "");
    set(k, onlyNums);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Tên phòng là bắt buộc";
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0)
      e.pricePerNight = "Giá phải lớn hơn 0";
    if (!form.capacity || Number(form.capacity) < 1)
      e.capacity = "Sức chứa tối thiểu 1";
    if (!form.area || Number(form.area) <= 0) e.area = "Diện tích phải > 0";
    if (!form.deck || Number(form.deck) <= 0) e.deck = "Vị trí tầng phải > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const submitData = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      available: Number(form.available),
      area: Number(form.area),
      deck: Number(form.deck),
      amenities: amenitiesText
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    };
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/20">
              <Bed className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-white font-serif">
                {isEdit ? "Chỉnh sửa Phòng" : "Thêm Phòng mới"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Du thuyền: {cruiseName}
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

        <div className="overflow-y-auto flex-1 p-7 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Loại phòng">
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={inputCls(false) + " appearance-none pr-10"}
                >
                  {CABIN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Tên phòng *" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ocean Suite..."
                className={inputCls(!!errors.name)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Field label="Giá/đêm (VNĐ) *" error={errors.pricePerNight}>
              <input
                type="text"
                value={form.pricePerNight}
                onChange={(e) =>
                  handleNumberInput("pricePerNight", e.target.value)
                }
                className={inputCls(!!errors.pricePerNight)}
              />
            </Field>
            <Field label="Sức chứa *" error={errors.capacity}>
              <input
                type="text"
                value={form.capacity}
                onChange={(e) => handleNumberInput("capacity", e.target.value)}
                className={inputCls(!!errors.capacity)}
              />
            </Field>
            <Field label="Còn trống">
              <input
                type="text"
                value={form.available}
                onChange={(e) => handleNumberInput("available", e.target.value)}
                className={inputCls(false)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Diện tích (m²) *" error={errors.area}>
              <input
                type="text"
                value={form.area}
                onChange={(e) => handleNumberInput("area", e.target.value)}
                className={inputCls(!!errors.area)}
              />
            </Field>
            <Field label="Vị trí Tầng *" error={errors.deck}>
              <input
                type="text"
                value={form.deck}
                onChange={(e) => handleNumberInput("deck", e.target.value)}
                className={inputCls(!!errors.deck)}
              />
            </Field>
          </div>

          <Field label="Tiện ích (phân cách bằng dấu phẩy)">
            <input
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="Ban công riêng, Bồn tắm,..."
              className={inputCls(false)}
            />
          </Field>

          <Field label="URL ảnh phòng">
            <div className="space-y-2">
              <input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputCls(false) + " font-mono text-xs"}
              />
              {form.imageUrl && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={form.imageUrl}
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

        <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
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
            {isEdit ? "Lưu thay đổi" : "Thêm Phòng"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
