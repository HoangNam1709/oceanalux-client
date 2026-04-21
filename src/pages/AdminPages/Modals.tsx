import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Ship,
  ChevronDown,
  Save,
  Bed,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Import các Types dùng chung
import { Cruise, Cabin, Account } from "./adminShared";

// HÀM BỔ TRỢ UI (Chỉ dùng riêng trong file Modal này)

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-300 focus:ring-red-300 bg-red-50"
      : "border-slate-200 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
  }`;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

const blankCabin = (): Omit<Cabin, "id"> => ({
  type: "Ocean View",
  name: "",
  pricePerNight: 1500000,
  capacity: 2,
  available: 5,
  amenities: [],
  imageUrl: "",
});

const CABIN_TYPES = [
  "Interior",
  "Ocean View",
  "Balcony",
  "Suite",
  "Deluxe Suite",
  "Royal Suite",
  "Penthouse",
];

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CRUISE MODAL (THÊM / SỬA TÀU)
// ═══════════════════════════════════════════════════════════════════════════════

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
        durationDays: cruise.durationDays,
        durationNights: cruise.durationNights,
        description: cruise.description,
        starRating: cruise.starRating,
        status: cruise.featured ? "active" : "inactive",
      }
    : {
        name: "",
        destination: "",
        durationDays: 3,
        durationNights: 2,
        description: "",
        starRating: 5,
        status: "active",
      };

  const [form, setForm] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: unknown) =>
    setForm((prev: any) => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Tên du thuyền là bắt buộc";
    if (!form.destination?.trim()) e.destination = "Điểm đến là bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F]">
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
            <Field label="Số ngày">
              <input
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(e) => set("durationDays", Number(e.target.value))}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Số đêm">
              <input
                type="number"
                min={0}
                value={form.durationNights}
                onChange={(e) => set("durationNights", Number(e.target.value))}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Xếp hạng sao">
              <div className="relative">
                <select
                  value={form.starRating}
                  onChange={(e) => set("starRating", Number(e.target.value))}
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
            {isEdit ? "Lưu thay đổi" : "Tạo Du thuyền"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CABIN MODAL (THÊM / SỬA PHÒNG)
// ═══════════════════════════════════════════════════════════════════════════════

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
  const [form, setForm] = useState<any>(cabin ?? blankCabin());
  const [amenitiesText, setAmenitiesText] = useState(
    (cabin?.amenities ?? []).join(", "),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: unknown) =>
    setForm((prev: any) => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Tên phòng là bắt buộc";
    if (form.pricePerNight <= 0) e.pricePerNight = "Giá phải lớn hơn 0";
    if (form.capacity < 1) e.capacity = "Sức chứa tối thiểu là 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const submitData = { ...form };
    submitData.amenities = amenitiesText
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
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
                type="number"
                min={0}
                value={form.pricePerNight}
                onChange={(e) => set("pricePerNight", Number(e.target.value))}
                className={inputCls(!!errors.pricePerNight)}
              />
            </Field>
            <Field label="Sức chứa *" error={errors.capacity}>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set("capacity", Number(e.target.value))}
                className={inputCls(!!errors.capacity)}
              />
            </Field>
            <Field label="Còn trống">
              <input
                type="number"
                min={0}
                value={form.available}
                onChange={(e) => set("available", Number(e.target.value))}
                className={inputCls(false)}
              />
            </Field>
          </div>
          <Field label="Tầng / Tiện ích (phân cách bằng dấu phẩy)">
            <input
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="Tầng 1, Ban công riêng,..."
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

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ACCOUNT MODAL (THÊM / SỬA TÀI KHOẢN)
// ═══════════════════════════════════════════════════════════════════════════════

export function AccountModal({
  account,
  onSave,
  onClose,
}: {
  account: Account | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const isEdit = !!account;
  const initialData = account
    ? {
        ...account,
        password: "",
        role:
          (account.role || "").toLowerCase() === "admin" ||
          (account.role || "").toLowerCase() === "super admin"
            ? "admin"
            : "customer",
      }
    : { name: "", email: "", phone: "", password: "", role: "customer" };

  const [form, setForm] = useState<any>(initialData);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    if (!form.name || !form.email || (!isEdit && !form.password))
      return toast.error("Vui lòng điền các trường bắt buộc!");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#0A192F]">
          <h2 className="text-white font-serif text-lg">
            {isEdit ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Họ và tên *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Số điện thoại">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls(false)}
              />
            </Field>
          </div>
          <Field label="Email *">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls(false)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Field
              label={
                isEdit ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu *"
              }
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={inputCls(false) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0A192F] focus:outline-none"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Field>
            <Field label="Phân quyền (Role)">
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputCls(false) + " appearance-none pr-10"}
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#0A192F] text-[#D4AF37] rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800"
          >
            Lưu Tài Khoản
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DELETE CONFIRM MODAL (XÁC NHẬN XÓA CHUNG)
// ═══════════════════════════════════════════════════════════════════════════════

export function DeleteConfirm({
  label,
  onConfirm,
  onClose,
}: {
  label: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xoá</h3>
        <p className="text-slate-500 text-sm mb-7">
          Bạn có chắc muốn xoá{" "}
          <span className="font-semibold text-slate-800">"{label}"</span>? Hành
          động này không thể hoàn tác.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
          >
            Xoá
          </button>
        </div>
      </motion.div>
    </div>
  );
}
