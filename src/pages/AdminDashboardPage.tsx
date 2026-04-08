import { useState, useEffect } from "react";
import {
  Search, Download, Eye, Edit, X, Calendar, Users, DollarSign, Ship,
  ChevronDown, Plus, Trash2, Anchor, Star, MapPin, Clock, Check,
  AlertTriangle, LayoutGrid, Bed, Save, ChevronRight, Image, Bell,EyeOff, Loader2, TrendingUp, BarChart3,ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
// ─── Types ────────────────────────────────────────────────────────────────────
type AdminTab = "overview" | "bookings" | "cruises" | "cabins" | "accounts"; // 👈 Đổi profile thành accounts

// Thêm Interface này vào khu vực khai báo Types
interface Account {
  id: string; name: string; email: string; phone: string; role: string; createdAt: string;
}
type BookingStatus = "paid" | "holding" | "cancelled" | "completed";

interface Cabin {
  id: string; type: string; name: string; pricePerNight: number;
  capacity: number; available: number; amenities: string[]; imageUrl: string;
}

interface Cruise {
  id: string; name: string;thumbnail: string; destination: string; durationDays: number;
  durationNights: number; starRating: number; basePrice: number;
  images: string[]; description: string; facilities: string[];
  cabins: Cabin[]; featured: boolean;
}

interface Booking {
  id: string; bookingRef: string; guestName: string; guestEmail: string;
  cruiseName: string; departureDate: string; returnDate: string;
  cabinType: string; guests: number; totalAmount: number;
  status: BookingStatus; paymentMethod: string; bookedDate: string;
}

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalGuests: number;
}

// ─── Blank templates ──────────────────────────────────────────────────────────
const blankCruise = (): Omit<Cruise, "id" | "cabins"> => ({
  name: "", thumbnail: "", destination: "", durationDays: 3, durationNights: 2,
  starRating: 5, basePrice: 2500000, images: [], description: "",
  facilities: [], featured: false,
});

const blankCabin = (): Omit<Cabin, "id"> => ({
  type: "Ocean View", name: "", pricePerNight: 1500000, capacity: 2,
  available: 5, amenities: [], imageUrl: "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Hàm định dạng tiền đầy đủ (dùng cho chi tiết đơn hàng)
const formatCurrency = (amount: number) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 VNĐ";
  return amount.toLocaleString('vi-VN') + " VNĐ";
};

const formatCompactCurrency = (amount: number) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 VNĐ";
  
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(2).replace(/\.00$/, '') + " Tỷ VNĐ";
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2).replace(/\.00$/, '') + " Tr VNĐ";
  }
  return amount.toLocaleString('vi-VN') + " VNĐ";
};

const getStatusBadge = (status: BookingStatus) => {
  // Thêm whitespace-nowrap để chữ không rớt dòng
  const baseCls = "px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap inline-block text-center";
  
  switch (status) {
    case "paid": 
      // MỚI: Nền Deep Navy, Chữ Champagne Gold, viền mỏng bóng bẩy
      return <span className={`${baseCls} bg-[#0A192F] text-[#D4AF37] border-[#0A192F] shadow-sm`}>Đã thanh toán</span>;
    case "holding":   
      // Vàng Champagne nhạt
      return <span className={`${baseCls} bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30`}>Chờ xử lý</span>;
    case "cancelled": 
      // Xám nhạt, làm chìm đi vì là đơn đã huỷ
      return <span className={`${baseCls} bg-slate-100 text-slate-500 border-slate-200`}>Đã huỷ</span>;
    case "completed": 
      // Xanh ngọc
      return <span className={`${baseCls} bg-emerald-50 text-emerald-600 border-emerald-200`}>Hoàn thành</span>;
    default:
      return <span className={`${baseCls} bg-gray-50 text-gray-700 border-gray-200`}>Không rõ</span>;
  }
};
const inputCls = (hasError: boolean) =>
  `w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-300 focus:ring-red-300 bg-red-50"
      : "border-slate-200 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
  }`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁC COMPONENT MODAL TÁCH RỜI
// ═══════════════════════════════════════════════════════════════════════════════

interface CruiseModalProps {
  cruise: Cruise | null;
  onSave: (data: Cruise) => void;
  onClose: () => void;
}

function CruiseModal({ cruise, onSave, onClose }: CruiseModalProps) {
  const isEdit = !!cruise;
  
  // 1. Khởi tạo dữ liệu form 
  const initialData = cruise ? {
    id: cruise.id,
    name: cruise.name,
    thumbnail: cruise.thumbnail ?? "",
    destination: cruise.destination,
    durationDays: cruise.durationDays,
    durationNights: cruise.durationNights,
    description: cruise.description,
    starRating: cruise.starRating,
    status: cruise.featured ? "active" : "inactive"
  } : {
    name: "", destination: "", durationDays: 3, durationNights: 2,
    description: "", starRating: 5, status: "active"
  };

  const [form, setForm] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const set = (k: string, v: unknown) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: Record<string,string> = {};
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.94, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/20"><Ship className="w-5 h-5 text-[#D4AF37]" /></div>
            <div>
              <h2 className="text-white font-serif">{isEdit ? "Chỉnh sửa Du thuyền" : "Thêm Du thuyền mới"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? `ID: ${cruise!.id}` : "Nhập thông tin cơ bản"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-7 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Tên du thuyền *" error={errors.name}>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="VD: OceanaLux Victoria" className={inputCls(!!errors.name)} />
            </Field>
            <Field label="Điểm đến *" error={errors.destination}>
              <input value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="VD: Vịnh Hạ Long" className={inputCls(!!errors.destination)} />
            </Field>
            
          </div>
          
          <div className="grid grid-cols-4 gap-5">
            <Field label="Số ngày">
              <input type="number" min={1} value={form.durationDays} onChange={e => set("durationDays", Number(e.target.value))} className={inputCls(false)} />
            </Field>
            <Field label="Số đêm">
              <input type="number" min={0} value={form.durationNights} onChange={e => set("durationNights", Number(e.target.value))} className={inputCls(false)} />
            </Field>
            <Field label="Xếp hạng sao">
              <div className="relative">
                <select value={form.starRating} onChange={e => set("starRating", Number(e.target.value))} className={inputCls(false) + " appearance-none pr-10"}>
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} ★</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Trạng thái">
              <div className="relative">
                <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls(false) + " appearance-none pr-10"}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <Field label="Mô tả">
            <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Nhập mô tả về con tàu..." className={inputCls(false) + " resize-none"} />
          </Field>
          <Field label="URL Ảnh đại diện (Thumbnail)">
            <div className="space-y-2">
              <textarea rows={4} value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls(false) + " font-mono text-xs"} />
              {form.thumbnail && (
                <div className="relative h-32 rounded-lg overflow-hidden border border-slate-200">
                  <img src={form.thumbnail} alt="preview" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                </div>
              )}
            </div>
          </Field>
        </div>

        <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">Huỷ</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#0A192F] transition-all bg-gradient-to-br from-[#D4AF37] to-[#e8c84a] shadow-[0_4px_16px_rgba(212,175,55,0.35)]">
            <Save className="w-4 h-4" /> {isEdit ? "Lưu thay đổi" : "Tạo Du thuyền"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
function AccountModal({ account, onSave, onClose }: { account: Account | null; onSave: (data: any) => void; onClose: () => void }) {
  const isEdit = !!account;
  const initialData = account 
  ? { 
      ...account, 
      password: "", 
      role: ((account.role || '').toLowerCase() === 'admin' || (account.role || '').toLowerCase() === 'super admin') ? 'admin' : 'customer' 
    } 
  : { name: "", email: "", phone: "", password: "", role: "customer" };
  const [form, setForm] = useState<any>(initialData);
  const [showPassword, setShowPassword] = useState(false);
  const handleSave = () => {
    if (!form.name || !form.email || (!isEdit && !form.password)) return toast.error("Vui lòng điền các trường bắt buộc!");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#0A192F]">
          <h2 className="text-white font-serif text-lg">{isEdit ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Họ và tên *"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls(false)} /></Field>
            <Field label="Số điện thoại"><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputCls(false)} /></Field>
          </div>
          <Field label="Email *"><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls(false)} /></Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label={isEdit ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu *"}>
              <div className="relative">
                <input 
                  // Đổi type linh hoạt dựa vào biến showPassword
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  // Thêm pr-10 để chữ không bị lẹm vào icon con mắt
                  className={inputCls(false) + " pr-10"} 
                />
                
                {/* Nút bật/tắt mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0A192F] transition-colors focus:outline-none"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Field label="Phân quyền (Role)">
              <div className="relative">
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inputCls(false) + " appearance-none pr-10"}>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">Hủy</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-[#0A192F] text-[#D4AF37] rounded-lg text-sm font-bold shadow-sm">Lưu Tài Khoản</button>
        </div>
      </motion.div>
    </div>
  );
}
interface CabinModalProps {
  cabin: Cabin | null; cruiseName: string;
  onSave: (data: Cabin) => void; onClose: () => void;
}
const CABIN_TYPES = ["Interior", "Ocean View", "Balcony", "Suite", "Deluxe Suite", "Royal Suite", "Penthouse"];

function CabinModal({ cabin, cruiseName, onSave, onClose }: CabinModalProps) {
  const isEdit = !!cabin;
  const [form, setForm] = useState<any>(cabin ?? blankCabin());
  const [amenitiesText, setAmenitiesText] = useState((cabin?.amenities ?? []).join(", "));
  const [errors, setErrors] = useState<Record<string,string>>({});

  const set = (k: string, v: unknown) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name?.trim())        e.name          = "Tên phòng là bắt buộc";
    if (form.pricePerNight <= 0) e.pricePerNight = "Giá phải lớn hơn 0";
    if (form.capacity < 1)       e.capacity      = "Sức chứa tối thiểu là 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    // Gửi dữ liệu đi, KHÔNG được tự sinh ID ảo (uid) nữa để Backend hiểu là Thêm mới
    const submitData = { ...form };
    submitData.amenities = amenitiesText.split(",").map((s: string) => s.trim()).filter(Boolean);
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.94, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 24 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#0A192F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4AF37]/20"><Bed className="w-5 h-5 text-[#D4AF37]" /></div>
            <div>
              <h2 className="text-white font-serif">{isEdit ? "Chỉnh sửa Phòng" : "Thêm Phòng mới"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Du thuyền: {cruiseName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-7 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Loại phòng">
              <div className="relative">
                <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls(false) + " appearance-none pr-10"}>
                  {CABIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Tên phòng *" error={errors.name}>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ocean Suite..." className={inputCls(!!errors.name)} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Field label="Giá/đêm (VNĐ) *" error={errors.pricePerNight}>
              <input type="number" min={0} value={form.pricePerNight} onChange={e => set("pricePerNight", Number(e.target.value))} className={inputCls(!!errors.pricePerNight)} />
            </Field>
            <Field label="Sức chứa *" error={errors.capacity}>
              <input type="number" min={1} value={form.capacity} onChange={e => set("capacity", Number(e.target.value))} className={inputCls(!!errors.capacity)} />
            </Field>
            <Field label="Còn trống">
              <input type="number" min={0} value={form.available} onChange={e => set("available", Number(e.target.value))} className={inputCls(false)} />
            </Field>
            <Field label="Diện tích (m²)">
              <input type="number" min={0} value={form.area} onChange={e => set("area", Number(e.target.value))} className={inputCls(false)} />
            </Field>

          </div>
          <Field label="Tầng (phân cách bằng dấu phẩy)">
            <input value={amenitiesText} onChange={e => setAmenitiesText(e.target.value)} placeholder="Tầng 1, Mũi tàu,..." className={inputCls(false)} />
          </Field>
          <Field label="URL ảnh phòng">
            <div className="space-y-2">
              <input value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls(false) + " font-mono text-xs"} />
              {form.imageUrl && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200">
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                </div>
              )}
            </div>
          </Field>
        </div>
        <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">Huỷ</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#0A192F] transition-all bg-gradient-to-br from-[#D4AF37] to-[#e8c84a] shadow-[0_4px_16px_rgba(212,175,55,0.35)]">
            <Save className="w-4 h-4" /> {isEdit ? "Lưu thay đổi" : "Thêm Phòng"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteConfirm({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xoá</h3>
        <p className="text-slate-500 text-sm mb-7">Bạn có chắc muốn xoá <span className="font-semibold text-slate-800">"{label}"</span>? Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
          <button onClick={onConfirm} className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">Xoá</button>
        </div>
      </motion.div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ── Dữ liệu ──
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalBookings: 0, confirmedBookings: 0, totalRevenue: 0, totalGuests: 0 });
  const [cruises, setCruises] = useState<Cruise[]>([]);
  // ── State cho Quản lý tài khoản ──
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountModal, setAccountModal] = useState<"create" | Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchAccountTerm, setSearchAccountTerm] = useState("");
  // ── CRUD States ──
  const [cruiseModal, setCruiseModal] = useState<"create" | Cruise | null>(null);
  const [deleteCruise, setDeleteCruise] = useState<Cruise | null>(null);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [selectedCruiseId, setSelectedCruiseId] = useState<string>("");
  const [cabinModal, setCabinModal] = useState<"create" | Cabin | null>(null);
  const [deleteCabin, setDeleteCabin] = useState<Cabin | null>(null);

  const currentCruise = cruises.find(c => c.id === selectedCruiseId) ?? cruises[0];
  
  // ── GỌI API LẤY DỮ LIỆU ──
useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token"); 
        
        const headers = {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        };

        // 👉 SỬA LỖI 1: Thêm biến accountsRes vào để hứng kết quả thứ 4
        const [statsRes, bookingsRes, cruisesRes, accountsRes] = await Promise.all([
          fetch("http://localhost/api/admin/dashboard/stats", { headers }),
          fetch("http://localhost/api/admin/bookings", { headers }),
          fetch("http://localhost/api/admin/cruises", { headers }),
          fetch("http://localhost/api/admin/accounts", { headers })
        ]);

        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();
        const cruisesData = await cruisesRes.json();
        
        // 👉 SỬA LỖI 2: Phân tích JSON của accounts
        const accountsData = await accountsRes.json();

        if (statsData.status === "success") setStats(statsData.data);
        if (bookingsData.status === "success") setBookings(bookingsData.data);
        
        if (cruisesData.status === "success") {
          setCruises(cruisesData.data);
          if (cruisesData.data.length > 0) {
            setSelectedCruiseId(cruisesData.data[0].id);
          }
        }

        // 👉 SỬA LỖI 3: Lưu vào State để in ra màn hình
        if (accountsData.status === "success") {
          setAccounts(accountsData.data);
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Admin:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);
const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
  // Hiển thị loading cho dòng đang sửa
  setUpdatingId(bookingId);
  
  try {
    const token = localStorage.getItem("token");
    
    // 1. Gọi API cập nhật xuống Database
    const response = await axios.put(`http://localhost/api/admin/bookings/${bookingId}/status`, {
      status: newStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

   // 2. CẬP NHẬT TRỰC TIẾP VÀO MẢNG BOOKINGS (Đã fix lỗi ép kiểu)
    setBookings((prevBookings) => 
      prevBookings.map((b) => {
        // Dùng String() để ép kiểu, đảm bảo 11 === "11"
        if (String(b.id) === String(bookingId)) {
          return { ...b, status: newStatus };
        }
        return b;
      })
    );

    console.log("Cập nhật thành công:", response.data.message);

  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    toast.error("Không thể cập nhật trạng thái. Vui lòng kiểm tra lại Backend!");
  } finally {
    setUpdatingId(null);
  }
};
  // ── Đã nối dây API: THÊM & SỬA DU THUYỀN ──
  const handleSaveCruise = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      // Xác định là Sửa hay Thêm mới dựa vào việc data có id hay không
      const isEdit = !!data.id; 
      const url = isEdit 
        ? `http://localhost/api/admin/cruises/${data.id}` 
        : "http://localhost/api/admin/cruises";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.status === "success") {
        if (isEdit) {
          // Nếu Sửa: Tìm trong mảng và đè dữ liệu mới lên
          setCruises(prev => prev.map(c => c.id === data.id ? { ...c, ...result.data } : c));
        } else {
          // Nếu Thêm: Đẩy lên đầu danh sách
          setCruises(prev => [result.data, ...prev]);
        }
        setCruiseModal(null);
      } else {
        toast.error("Có lỗi xảy ra: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      toast.error("Lỗi kết nối đến Server!");
    }
  };

  // ── Đã nối dây API: XÓA DU THUYỀN ──
  const handleDeleteCruise = async () => {
    if (!deleteCruise) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost/api/admin/cruises/${deleteCruise.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();

      if (result.status === "success") {
        // Loại bỏ con tàu khỏi giao diện
        setCruises(prev => prev.filter(c => c.id !== deleteCruise.id));
        setDeleteCruise(null);
      } else {
        toast.error("Không thể xóa: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Lỗi kết nối đến Server!");
    }
  };

  // ── Đã nối dây API: THÊM & SỬA PHÒNG (Kèm thuật toán tự động cập nhật Giá Tàu) ──
  const handleSaveCabin = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = !!data.id;
      const url = isEdit ? `http://localhost/api/admin/cabins/${data.id}` : `http://localhost/api/admin/cabins`;
      const method = isEdit ? "PUT" : "POST";

      // Gắn thêm ID của tàu đang được chọn để Backend biết phòng này thuộc tàu nào
      const payload = { ...data, cruise_id: selectedCruiseId };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === "success") {
        setCruises(prev => prev.map(cruise => {
          if (cruise.id !== selectedCruiseId) return cruise;
          
          // Cập nhật mảng phòng
          const updatedCabins = isEdit 
            ? cruise.cabins.map(c => c.id === data.id ? { ...c, ...result.data } : c)
            : [...cruise.cabins, result.data];
          
          const newBasePrice = updatedCabins.length > 0 
            ? Math.min(...updatedCabins.map(c => c.pricePerNight)) 
            : 0;

          return { ...cruise, cabins: updatedCabins, basePrice: newBasePrice };
        }));      
        setCabinModal(null);
      } else {
        toast.error("Có lỗi xảy ra: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu phòng:", error);
      toast.error("Lỗi kết nối Server!");
    }
  };

  // ── Đã nối dây API: XÓA PHÒNG ──
  const handleDeleteCabin = async () => {
    if (!deleteCabin) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost/api/admin/cabins/${deleteCabin.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const result = await res.json();

      if (result.status === "success") {
        setCruises(prev => prev.map(cruise => {
          if (cruise.id !== selectedCruiseId) return cruise;
          
          // Xóa phòng khỏi mảng
          const updatedCabins = cruise.cabins.filter(c => c.id !== deleteCabin.id);
          
          // Tự động cập nhật lại giá Tàu sau khi xóa
          const newBasePrice = updatedCabins.length > 0 
            ? Math.min(...updatedCabins.map(c => c.pricePerNight)) 
            : 0;

          return { ...cruise, cabins: updatedCabins, basePrice: newBasePrice };
        }));
        setDeleteCabin(null);

      }
    } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);
      toast.error("Lỗi kết nối Server!");
    }
  };
  // ── Đã nối dây API: LƯU TÀI KHOẢN ──
  const handleSaveAccount = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = !!data.id;
      const url = isEdit ? `http://localhost/api/admin/accounts/${data.id}` : `http://localhost/api/admin/accounts`;
      
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.status === "success") {
        setAccounts(prev => isEdit ? prev.map(a => a.id === data.id ? result.data : a) : [result.data, ...prev]);
        setAccountModal(null);
        toast.success(isEdit ? "Cập nhật tài khoản thành công!" : "Đã tạo tài khoản mới!");
      } else toast.error("Lỗi: " + result.message);
    } catch (error) { console.error(error); }
  };

  // ── Đã nối dây API: XÓA TÀI KHOẢN ──
  const handleDeleteAccount = async () => {
    if (!deleteAccount) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost/api/admin/accounts/${deleteAccount.id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if ((await res.json()).status === "success") {
        setAccounts(prev => prev.filter(a => a.id !== deleteAccount.id));
        setDeleteAccount(null);
      }
    } catch (error) { console.error(error); }
  };
  // ── Filters ──
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingRef.toLowerCase().includes(q) || b.guestName.toLowerCase().includes(q) ||
       b.guestEmail.toLowerCase().includes(q) || b.cruiseName.toLowerCase().includes(q)) &&
      (statusFilter === "all" || b.status === statusFilter)
    );
  });

  const filteredCruises = cruises.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── Tabs ──
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id:"overview",  label:"Tổng quan",       icon: LayoutGrid },
    { id:"bookings",  label:"Đặt chỗ",         icon: Calendar },
    { id:"cruises",   label:"Du thuyền",        icon: Ship },
    { id:"cabins",    label:"Phòng & Cabin",    icon: Bed },
    { id:"accounts",   label:"Tài khoản",     icon: Users },
  ];
// Dữ liệu mẫu cho biểu đồ doanh thu 12 tháng
  const monthlyRevenue = [
    { month: 'T1', value: 45 }, { month: 'T2', value: 52 }, { month: 'T3', value: 38 },
    { month: 'T4', value: 65 }, { month: 'T5', value: 85 }, { month: 'T6', value: 70 },
    { month: 'T7', value: 90 }, { month: 'T8', value: 110 }, { month: 'T9', value: 85 },
    { month: 'T10', value: 75 }, { month: 'T11', value: 95 }, { month: 'T12', value: 120 },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value));
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#0A192F] font-semibold font-serif animate-pulse">Đang đồng bộ dữ liệu hệ thống...</p>
      </div>
    );
  }
  // Mỗi khi searchAccountTerm hoặc accounts thay đổi, filteredAccounts sẽ tự tính toán lại
  const filteredAccounts = accounts.filter(acc => {
    const term = searchAccountTerm.toLowerCase();
    return (
      (acc.name || "").toLowerCase().includes(term) ||
      (acc.email || "").toLowerCase().includes(term) ||
      (acc.phone && acc.phone.includes(term))
    );
  });
  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Page Header ── */}
        <div className="mb-8 flex items-end justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="w-5 h-5" style={{ color:'#D4AF37' }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color:'#0A192F' }}>
                OceanaLux Admin
              </span>
            </div>
            <h1 className="font-serif text-[#0A192F] text-3xl">Bảng điều khiển</h1>
            <p className="text-slate-500 mt-1 text-sm">Quản lý toàn bộ hoạt động du thuyền 5 sao</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống Online
            </div>
          </div>
        </div>
{/* ── Nút Back (QUAY LẠI TRANG CHỦ HOẶC TRANG TRƯỚC) ── */}
        <button 
          onClick={() => navigate("/")} // Truyền "/" để về trang chủ, hoặc truyền -1 để về trang trước đó
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-[#D4AF37] transition-colors font-semibold text-sm group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-[#D4AF37] shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Về trang chủ
        </button>
        {/* ── Tab Navigation ── */}
        <div className="flex flex-wrap gap-1 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                  active ? "text-[#0A192F] shadow-md" : "text-slate-500 hover:text-[#0A192F] hover:bg-slate-50"
                }`}
                style={active ? { background:'linear-gradient(135deg,#D4AF37,#e8c84a)' } : {}}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

       {/* ══════════════════════════════════════════════════════════════
            TAB: OVERVIEW (ĐÃ ĐƯỢC REDESIGN UI/UX)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* DÒNG 1: 3 Ô CHỈ SỐ NHỎ GỌN HƠN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Calendar, label: "Tổng đặt vé", value: stats.totalBookings, trend: "+12%", color: "blue" },
                { icon: Ship, label: "Đã xác nhận", value: stats.confirmedBookings, trend: "+5%", color: "emerald" },
                { icon: Users, label: "Tổng hành khách", value: stats.totalGuests, trend: "+18%", color: "purple" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between hover:shadow-md transition-all group">
                  <div>
                    <div className="text-slate-500 text-sm font-medium mb-1">{s.label}</div>
                    <div className="text-3xl font-bold text-[#0A192F]">{s.value}</div>
                    <div className={`text-xs font-bold mt-2 flex items-center gap-1 text-${s.color}-600`}>
                      <TrendingUp className="w-3 h-3" /> {s.trend} so với tháng trước
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-full bg-${s.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <s.icon className={`w-7 h-7 text-${s.color}-500`} />
                  </div>
                </div>
              ))}
            </div>

            {/* DÒNG 2: BIỂU ĐỒ DOANH THU TO NGANG */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg"><BarChart3 className="w-5 h-5 text-amber-500" /></div>
                    <h2 className="font-serif text-xl text-[#0A192F] font-bold">Tổng doanh thu năm nay</h2>
                  </div>
                  <p className="text-sm text-slate-500">Thống kê dòng tiền từ các lượt đặt phòng thành công</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#D4AF37] tracking-tight">{formatCompactCurrency(stats.totalRevenue)}</div>
                  <div className="text-sm font-medium text-emerald-600 flex items-center justify-end gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" /> +24.5% tăng trưởng
                  </div>
                </div>
              </div>

              {/* Vẽ biểu đồ bằng Tailwind */}
              <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
                {/* Đường gióng ngang (Grid lines) */}
                <div className="absolute inset-0 flex flex-col justify-between pb-8 z-0">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-full border-t border-slate-50 border-dashed flex-1" />
                  ))}
                </div>

                {/* Các cột biểu đồ */}
                {monthlyRevenue.map((item, idx) => (
                  <div key={idx} className="relative flex flex-col items-center flex-1 group z-10 h-full justify-end">
                    {/* Tooltip khi hover */}
                    <div className="absolute -top-10 bg-[#0A192F] text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.value * 10} Tr
                    </div>
                    {/* Cột màu */}
                    <div 
                      className="w-full max-w-[40px] rounded-t-md transition-all duration-500 group-hover:opacity-80"
                      style={{ 
                        height: `${(item.value / maxRevenue) * 100}%`,
                        background: idx === monthlyRevenue.length - 1 ? 'linear-gradient(180deg, #D4AF37 0%, #e8c84a 100%)' : 'linear-gradient(180deg, #0A192F 0%, #1e3a68 100%)'
                      }}
                    />
                    {/* Tên tháng */}
                    <div className="text-xs font-semibold text-slate-400 mt-3">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DÒNG 3: QUICK NAV & RECENT BOOKINGS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Nav chiếm 1 cột */}
              <div className="space-y-4">
                {[
                  { tab:"cruises" as AdminTab, icon: Ship, title:"Quản lý Du thuyền", desc:`Đang có ${cruises.length} hải trình`, color:"#D4AF37" },
                  { tab:"cabins"  as AdminTab, icon: Bed,  title:"Quản lý Phòng",    desc:`Kiểm soát phòng trống`, color:"#0A192F" },
                ].map(card => (
                  <button key={card.tab} onClick={() => setActiveTab(card.tab)}
                    className="w-full group flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all text-left">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-xl transition-colors" style={{ background:`${card.color}15`, color: card.color }}>
                        <card.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0A192F]">{card.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{card.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              {/* Recent Bookings chiếm 2 cột */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-lg font-bold text-[#0A192F]">Giao dịch gần đây</h2>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
                    Xem tất cả <ChevronRight className="w-3 h-3"/>
                  </button>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Chưa có giao dịch nào.</div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 4).map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3.5 border border-slate-50 bg-slate-50/50 rounded-xl hover:bg-white hover:border-slate-200 transition-colors cursor-pointer" onClick={() => setSelectedBooking(b)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0A192F] font-bold text-sm shadow-sm">
                            {b.guestName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#0A192F]">{b.guestName}</div>
                            <div className="text-[11px] text-slate-500">{b.cruiseName} • {b.bookingRef}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <div className="font-bold text-[#D4AF37] text-sm">{formatCurrency(b.totalAmount)}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">{b.paymentMethod}</div>
                          </div>
                          {getStatusBadge(b.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
        {/* ══════════════════════════════════════════════════════════════
            TAB: BOOKINGS
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Tìm theo mã vé, tên khách hàng..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]" />
                </div>
                <div className="relative min-w-[160px]">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as BookingStatus | "all")}
                    className="w-full appearance-none px-5 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 bg-white cursor-pointer">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="holding">Chờ xử lý</option>
                    <option value="cancelled">Đã huỷ</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-[#0A192F] transition-all"
                  style={{ background:'linear-gradient(135deg,#D4AF37,#e8c84a)' }}>
                  <Download className="w-4 h-4" /> Xuất Excel
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-[#0A192F] text-white">
                      {["Mã vé / Ngày đặt","Khách hàng","Hải trình","Thời gian","Hạng phòng","Tổng tiền","Trạng thái","Hành động"].map(h => (
                        <th key={h} className="text-left py-4 px-5 text-xs font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-10 text-slate-500">Không tìm thấy dữ liệu phù hợp.</td></tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-[#0A192F]">{b.bookingRef}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{b.bookedDate}</div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="text-sm font-bold text-slate-900">{b.guestName}</div>
                            <div className="text-xs text-slate-500">{b.guestEmail}</div>
                          </td>
                          <td className="py-4 px-5 text-sm font-medium text-slate-700 max-w-[180px]">{b.cruiseName}</td>
                          <td className="py-4 px-5">
                            <div className="text-sm font-semibold text-slate-900">{b.departureDate}</div>
                            <div className="text-xs text-slate-500">đến {b.returnDate}</div>
                          </td>
                          <td className="py-4 px-5 text-sm text-slate-700">
                             <div>{b.cabinType}</div>
                             <div className="text-xs text-slate-500">{b.guests} khách</div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="text-sm font-bold text-[#D4AF37]">{formatCurrency(b.totalAmount)}</div>
                            <div className="text-[10px] font-medium text-slate-500 uppercase">{b.paymentMethod}</div>
                          </td>
                          
                          {/* CỘT TRẠNG THÁI */}
                          <td className="py-4 px-5">{getStatusBadge(b.status)}</td>
                          
                          {/* CỘT HÀNH ĐỘNG MỚI (Tích hợp đổi trạng thái) */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              {/* Nút Xem chi tiết */}
                              <button 
                                onClick={() => setSelectedBooking(b)} 
                                className="p-2 rounded-md bg-[#0A192F]/5 text-[#0A192F] hover:bg-[#0A192F]/10 transition-colors" 
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Dropdown Đổi Trạng Thái */}
                              <div className="relative">
                                <select
                                  value={b.status}
                                  disabled={updatingId === b.id} // Vô hiệu hóa khi đang load API
                                  onChange={(e) => handleUpdateStatus(b.id, e.target.value as BookingStatus)}
                                  className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] cursor-pointer disabled:opacity-50 text-slate-700 shadow-sm"
                                >
                                  <option value="holding">Giữ chỗ</option>
                                  <option value="paid">Đã thanh toán</option>
                                  <option value="completed">Hoàn thành</option>
                                  <option value="cancelled">Hủy đơn</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>

                              {/* Hiệu ứng xoay tròn Loading khi API đang chạy */}
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
            </div>
          </div>
        )}
        
        {/* ══════════════════════════════════════════════════════════════
            TAB: CRUISES
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "cruises" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên du thuyền..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
        />
      </div>
      <button
        onClick={() => setCruiseModal("create")}
        className="bg-[#0A192F] text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
      >
        <Plus className="w-4 h-4" /> Thêm Du thuyền
      </button>
    </div>

    <div className="grid gap-6">
      {filteredCruises.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
          <Ship className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Không tìm thấy du thuyền nào</p>
        </div>
      ) : (
        filteredCruises.map(cruise => (
          <div
            key={cruise.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow"
          >
            <div className="w-full md:w-64 h-48 md:h-auto bg-slate-200 relative">
              <img
                src={cruise.thumbnail || 'https://placehold.co/400x300/e2e8f0/64748b?text=OceanaLux'}
                alt={cruise.name}
                className="w-full h-full object-cover"
              />
              {cruise.featured && (
                <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  Nổi bật
                </div>
              )}
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#0A192F] font-serif">{cruise.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {cruise.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {cruise.durationDays}N {cruise.durationNights}Đ
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> {cruise.starRating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-bold">Giá khởi điểm</div>
                    <div className="text-lg font-bold text-[#D4AF37]">{formatCurrency(cruise.basePrice)}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cruise.facilities.slice(0, 5).map(f => (
                    <span
                      key={f}
                      className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded border border-slate-100"
                    >
                      {f}
                    </span>
                  ))}
                  {cruise.facilities.length > 5 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded border border-slate-100">
                      +{cruise.facilities.length - 5}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {/* Nút Sửa - đồng bộ viền Vàng, chữ Navy */}
               <button onClick={() => setCruiseModal(cruise)} className="flex items-center justify-center gap-2 flex-1 py-2 bg-slate-50 bg-[#0A192F] text-[#D4AF37] border border-slate-100 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
                <Edit className="w-4 h-4"/> Sửa
                </button>
                {/* Nút Xem phòng - giữ phong cách hiện tại (đã đúng chuẩn) */}
              <button onClick={()=>{setSelectedCruiseId(cruise.id); setActiveTab('cabins');}} className="flex items-center justify-center gap-2 flex-1 py-2 bg-[#0A192F] text-[#D4AF37] rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm">
                <Bed className="w-4 h-4"/> Xem phòng ({cruise.cabins.length})
                </button>
                {/* Nút Xóa giữ nguyên */}
                <button onClick={() => setDeleteCruise(cruise)} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:border-[#0A192F] hover:text-[#0A192F] hover:bg-slate-50 transition-all">
                  <Trash2 className="w-4 h-4"/>
                  </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}

        {/* ══════════════════════════════════════════════════════════════
            TAB: CABINS
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "cabins" && (
          <div className="space-y-6">
             <div className="bg-[#0A192F] p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Đang quản lý phòng của</p>
                  <h2 className="text-2xl font-serif mt-1">{currentCruise?.name ?? "Chưa chọn tàu"}</h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select value={selectedCruiseId} onChange={e=>setSelectedCruiseId(e.target.value)}
                          className="flex-1 md:w-64 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none font-medium">
                    {cruises.map(c => <option key={c.id} value={c.id} className="text-black">{c.name}</option>)}
                  </select>
                  <button onClick={() => setCabinModal("create")} className="bg-[#D4AF37] text-[#0A192F] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#e8c84a] transition-colors whitespace-nowrap">
                    <Plus className="w-4 h-4"/> Thêm phòng
                  </button>
                </div>
             </div>

             {(!currentCruise || currentCruise.cabins.length === 0) ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-100"><Bed className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-slate-400">Du thuyền này chưa có phòng nào</p></div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentCruise.cabins.map(cabin => (
                    <div key={cabin.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group">
                      <div className="h-48 bg-slate-200 relative overflow-hidden">
                        {cabin.imageUrl ? (
                          <img src={cabin.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={cabin.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-slate-300" /></div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#0A192F] text-[10px] font-bold px-2 py-1 rounded border border-white/50">{cabin.type}</div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-[#0A192F] text-lg">{cabin.name}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> Tối đa {cabin.capacity}</span>
                          <span className={`font-bold ${cabin.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{cabin.available > 0 ? `Còn ${cabin.available} phòng` : 'Hết phòng'}</span>
                        </div>
                        <div className="text-xl font-bold text-[#D4AF37] mb-5">{formatCurrency(cabin.pricePerNight)} <span className="text-xs text-slate-400 font-normal">/ đêm</span></div>
                        <div className="flex gap-2">
                        {/* Nút Sửa Cabin */}
                          <button onClick={() => setCabinModal(cabin)} className="flex-1 py-2 bg-slate-50 text-[#0A192F] rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                            <Edit className="w-4 h-4"/> Sửa
                            </button>
                        {/* Nút Xóa Cabin: Giống style với nút Xóa Tàu */}
                          <button onClick={() => setDeleteCabin(cabin)} className="p-2 bg-white text-slate-400 rounded-lg border border-slate-200 hover:border-[#0A192F] hover:text-[#0A192F] hover:bg-slate-50 transition-all">
                            <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: ACCOUNTS (QUẢN LÝ TÀI KHOẢN)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "accounts" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0A192F]">Quản lý Tài khoản</h2>
                <p className="text-sm text-slate-500 mt-1">Quản trị phân quyền và trạng thái hoạt động của nhân sự & khách hàng.</p>
              </div>
              <button 
                onClick={() => setAccountModal("create")} className="bg-[#0A192F] text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
                 <Plus className="w-4 h-4"/> Thêm tài khoản
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
  type="text" 
  placeholder="Tìm theo tên, email hoặc số điện thoại..."
  // 👉 THÊM 2 DÒNG DƯỚI NÀY:
  value={searchAccountTerm}
  onChange={(e) => setSearchAccountTerm(e.target.value)}
  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all" 
/>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-[#0A192F] text-white">
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tl-lg">Tài khoản</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider">Vai trò (Role)</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider">Ngày tham gia</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider">Trạng thái</th>
                      <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tr-lg">Hành động</th>
                    </tr>
                  </thead>
           <tbody>
                    {filteredAccounts.map(acc => (
                      <tr key={acc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        
                        {/* CỘT 1: Tên & Email */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm bg-slate-100 text-[#0A192F]">
                              {acc.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#0A192F] text-sm">{acc.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{acc.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* CỘT 2: Phân quyền */}
                        <td className="py-4 px-6">
                         <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                         (acc.role || '').toLowerCase() === 'admin' 
                          ? 'bg-[#0A192F] text-[#D4AF37] border-[#0A192F] shadow-sm' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {/* Viết hoa chữ cái đầu tiên cho đẹp giao diện */}
                        {(acc.role || 'Customer').charAt(0).toUpperCase() + (acc.role || 'Customer').slice(1).toLowerCase()}
                          </span>
                        </td>
                        {/* CỘT 3: Ngày tham gia */}
                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                          {acc.createdAt}
                        </td>

                        {/* CỘT 4: Hiển thị Số điện thoại (Thay cho Trạng thái cũ) */}
                        <td className="py-4 px-6">
                          <span className="text-sm font-semibold text-[#0A192F]">
                            {acc.phone || 'Chưa cập nhật'}
                          </span>
                        </td>

                        {/* CỘT 5: Hành động (Chỉ giữ lại Sửa và Xóa) */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Nút Sửa */}
                            <button onClick={() => setAccountModal(acc)} className="p-2 bg-white text-[#0A192F] rounded-lg border border-slate-200 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all" title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            {/* Nút Xóa (Style chuẩn DNA không dùng màu đỏ) */}
                            <button onClick={() => setDeleteAccount(acc)} className="p-2 bg-white text-slate-400 rounded-lg border border-slate-200 hover:border-[#0A192F] hover:text-[#0A192F] hover:bg-slate-50 transition-all" title="Xóa tài khoản">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Không tìm thấy tài khoản nào khớp với "{searchAccountTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>

      {/* ══════════════════════════════════════════════════════════════
          CÁC MODAL LAYER (HIỂN THỊ ĐÈ LÊN TRÊN CÙNG)
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        
        {/* Modal Chi Tiết Booking */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#0A192F] p-6 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="font-serif text-white text-xl">Chi tiết đặt chỗ</h2>
                  <p className="text-xs text-[#D4AF37] mt-1 font-mono tracking-widest">{selectedBooking.bookingRef}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  {getStatusBadge(selectedBooking.status)}
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Tạo lúc {selectedBooking.bookedDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thông tin khách</div>
                    <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Họ và tên</span><span className="text-sm font-bold text-[#0A192F]">{selectedBooking.guestName}</span></div>
                    <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Email</span><span className="text-sm font-bold text-[#0A192F]">{selectedBooking.guestEmail}</span></div>
                    <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Số lượng</span><span className="text-sm font-bold text-[#0A192F]">{selectedBooking.guests||2} hành khách</span></div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thông tin chuyến đi</div>
                    <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Du thuyền</span><span className="text-sm font-bold text-[#0A192F]">{selectedBooking.cruiseName}</span></div>
                    <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Hạng phòng</span><span className="text-sm font-bold text-[#0A192F]">{selectedBooking.cabinType}</span></div>
                    <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Thời gian</span><span className="text-sm font-bold text-emerald-600">{selectedBooking.departureDate} ➝ {selectedBooking.returnDate}</span></div>
                  </div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Phương thức thanh toán</div>
                    <div className="text-sm font-bold text-[#0A192F] uppercase">{selectedBooking.paymentMethod}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Tổng cộng</div>
                    <div className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(selectedBooking.totalAmount)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Tàu */}
        {cruiseModal !== null && (
          <CruiseModal cruise={cruiseModal === "create" ? null : cruiseModal} onSave={handleSaveCruise} onClose={() => setCruiseModal(null)} />
        )}

        {/* Modal Phòng */}
        {cabinModal !== null && currentCruise && (
          <CabinModal cabin={cabinModal === "create" ? null : cabinModal} cruiseName={currentCruise.name} onSave={handleSaveCabin} onClose={() => setCabinModal(null)} />
        )}

        {/* Xác nhận Xóa Tàu */}
        {deleteCruise && (
          <DeleteConfirm label={`Du thuyền ${deleteCruise.name}`} onConfirm={handleDeleteCruise} onClose={() => setDeleteCruise(null)} />
        )}

        {/* Xác nhận Xóa Phòng */}
        {deleteCabin && (
          <DeleteConfirm label={`Hạng phòng ${deleteCabin.name}`} onConfirm={handleDeleteCabin} onClose={() => setDeleteCabin(null)} />
        )}
        {/* Modal Thêm/Sửa Tài khoản */}
        {accountModal !== null && (
          <AccountModal account={accountModal === "create" ? null : accountModal} onSave={handleSaveAccount} onClose={() => setAccountModal(null)} />
        )}
        
        {/* Modal Xác nhận Xóa Tài khoản */}
        {deleteAccount && (
          <DeleteConfirm label={`Tài khoản ${deleteAccount.name}`} onConfirm={handleDeleteAccount} onClose={() => setDeleteAccount(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}