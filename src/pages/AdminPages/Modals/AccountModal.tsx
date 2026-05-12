import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { Account } from "../adminShared";
import { Field, inputCls } from "./ModalShared";

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
