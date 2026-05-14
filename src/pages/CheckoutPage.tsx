import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Wifi,
  Wine,
  Users,
  Clock3,
  BadgeCheck,
  AlertCircle,
  X,
  Calendar,
  User,
  Mail,
  Phone,
  ChevronRight,
  Check,
  Tag,
  Plus,
  Baby,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { echo } from "../echo";
import { toast } from "react-hot-toast";

// ─── Brand Palette ─────────────────────────────────────────────────────────────
const NAVY = "#0A192F";
const GOLD = "#D4AF37";
const PEARL = "#F8F9FA";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}
function fmtVNDShort(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

function StepBar({
  step,
  onStepClick,
}: {
  step: 1 | 2;
  onStepClick: (target: 1 | 2) => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-8 select-none">
      <div
        onClick={() => onStepClick(1)}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer hover:opacity-90 hover:scale-[1.02]"
        style={
          step >= 1
            ? { backgroundColor: step > 1 ? GOLD : NAVY, color: "#fff" }
            : { backgroundColor: "#e2e8f0", color: "#94a3b8" }
        }
      >
        {step > 1 ? (
          <Check className="w-4 h-4" />
        ) : (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold rounded-full border border-current">
            1
          </span>
        )}
        <span className="hidden sm:inline">Thông tin hành khách</span>
        <span className="sm:hidden">Bước 1</span>
      </div>

      <div className="flex-1 h-px bg-slate-200 relative overflow-hidden max-w-16">
        <motion.div
          className="absolute inset-y-0 left-0 h-full"
          style={{ backgroundColor: GOLD }}
          initial={{ width: "0%" }}
          animate={{ width: step > 1 ? "100%" : "0%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div
        onClick={() => onStepClick(2)}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer hover:opacity-90 hover:scale-[1.02]"
        style={
          step === 2
            ? { backgroundColor: NAVY, color: "#fff" }
            : { backgroundColor: "#e2e8f0", color: "#94a3b8" }
        }
      >
        <span className="w-4 h-4 flex items-center justify-center text-xs font-bold rounded-full border border-current">
          2
        </span>
        <span className="hidden sm:inline">Dịch vụ & Thanh toán</span>
        <span className="sm:hidden">Bước 2</span>
      </div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold uppercase tracking-widest mb-1.5"
      style={{ color: "#64748b" }}
    >
      {children}
    </label>
  );
}

function Field({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 ${className}`}
    />
  );
}

function StyledSelect({
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 cursor-pointer ${className}`}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. URL Params
  const cruiseId = searchParams.get("cruiseId");
  const cabinId = searchParams.get("cabinId");
  const scheduleId = searchParams.get("scheduleId");
  const startDateParam = searchParams.get("startDate");
  const { bookingId: paramBookingId } = useParams();
  const guests = Number(searchParams.get("guests")) || 2;

  // 2. Core State
  const [cruiseData, setCruiseData] = useState<any>(null);
  const [cabinData, setCabinData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null); // 🚀 THÊM STATE LƯU LỊCH TRÌNH
  const [bookingId, setBookingId] = useState<number | null>(
    paramBookingId ? Number(paramBookingId) : null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false);

  // 3. UI State (Step 1 & Step 2)
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  // -- Form Step 1 --
  const [leadGuest, setLeadGuest] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [hasDelegate, setHasDelegate] = useState(false);
  const [delegate, setDelegate] = useState({ fullName: "", phone: "" });
  const [childrenCount, setChildrenCount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");

  // -- Form Step 2 --
  const [addons, setAddons] = useState({
    insurance: false,
    wifi: false,
    beverage: false,
  });
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Lấy dữ liệu user tự động điền vào form
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setLeadGuest({
          fullName: user.name || user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } else {
        const token = localStorage.getItem("token");
        if (token) {
          axios
            .get("http://localhost:8081/api/user", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              const u = res.data.data || res.data;
              setLeadGuest({
                fullName: u.name || "",
                email: u.email || "",
                phone: u.phone || "",
              });
              localStorage.setItem("user", JSON.stringify(u));
            })
            .catch((err) => console.error("Không lấy được user từ API:", err));
        }
      }
    } catch (e) {
      console.error("Lỗi parse thông tin user:", e);
    }
  }, []);

  // Gọi API lấy danh sách Coupon
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/coupons")
      .then((res) => {
        setAvailableCoupons(res.data.data || res.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách mã giảm giá:", err);
      });
  }, []);

  // 4. Pricing Logic 🚀 CẬP NHẬT ĐỂ TÍNH GIÁ THEO HỆ SỐ NGÀY LỄ
  const {
    basePrice,
    priceFactor, // 🚀 Thêm biến này để dùng cho UI
    taxes,
    addonPrices,
    totalAddons,
    childDiscount,
    subTotal,
    grandTotal,
    isSurcharged,
  } = useMemo(() => {
    // 🚀 BƯỚC 1: Lấy hệ số nhân (Nếu không có thì mặc định là 1.0)
    const factor = scheduleData?.price_factor
      ? parseFloat(scheduleData.price_factor)
      : 1.0;

    // 🚀 BƯỚC 2: Tính giá cơ bản đã có hệ số
    const baseCabinPrice = Number(cabinData?.price) || 0;
    const originalPrice = baseCabinPrice * factor;

    const capacity = Number(cabinData?.capacity) || 2;

    let finalBasePrice = originalPrice;
    let surcharged = false;

    // Phụ thu ở ghép
    if (guests > capacity && guests <= capacity + 2) {
      finalBasePrice = originalPrice * 1.15;
      surcharged = true;
    }

    const pricePerPerson = finalBasePrice / guests;
    const discountAmount = pricePerPerson * 0.3 * childrenCount;
    const priceAfterChild = finalBasePrice - discountAmount;

    const taxAmount = 500000 * guests;
    const prices = {
      insurance: 250000 * guests,
      wifi: 150000 * Math.ceil(guests / 2),
      beverage: 800000 * guests,
    };
    const totalAddon =
      (addons.insurance ? prices.insurance : 0) +
      (addons.wifi ? prices.wifi : 0) +
      (addons.beverage ? prices.beverage : 0);

    const calculatedSubTotal = priceAfterChild + taxAmount + totalAddon;

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (calculatedSubTotal >= appliedCoupon.min_order_value) {
        if (appliedCoupon.discount_amount)
          couponDiscount = Number(appliedCoupon.discount_amount);
        if (appliedCoupon.discount_percent)
          couponDiscount =
            calculatedSubTotal * (Number(appliedCoupon.discount_percent) / 100);
      }
    }

    return {
      basePrice: finalBasePrice,
      priceFactor: factor,
      taxes: taxAmount,
      addonPrices: prices,
      totalAddons: totalAddon,
      childDiscount: discountAmount,
      subTotal: calculatedSubTotal,
      grandTotal: Math.max(0, calculatedSubTotal - couponDiscount),
      isSurcharged: surcharged,
    };
  }, [cabinData, scheduleData, addons, guests, childrenCount, appliedCoupon]);

  // 4.5 TÌM MÃ GIẢM GIÁ TỐT NHẤT
  const bestCoupon = useMemo(() => {
    if (!availableCoupons || availableCoupons.length === 0) return null;

    let maxDiscount = 0;
    let best: any = null;

    availableCoupons.forEach((c) => {
      const minOrder = Number(c.min_order_value);

      if (subTotal >= minOrder) {
        let currentDiscount = 0;
        if (Number(c.discount_amount) > 0) {
          currentDiscount = Number(c.discount_amount);
        } else if (Number(c.discount_percent) > 0) {
          currentDiscount = subTotal * (Number(c.discount_percent) / 100);
        }

        if (currentDiscount > maxDiscount) {
          maxDiscount = currentDiscount;
          best = c;
        }
      }
    });

    return best;
  }, [availableCoupons, subTotal]);

  // 5. Effects (API & Socket)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (paramBookingId) {
      axios
        .get(`http://localhost:8081/api/bookings/${paramBookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const oldBooking = res.data.data;
          if (
            oldBooking?.schedule?.cruise &&
            oldBooking?.details?.[0]?.cabin_class
          ) {
            setCruiseData(oldBooking.schedule.cruise);
            setCabinData(oldBooking.details[0].cabin_class);
            setScheduleData(oldBooking.schedule); // 🚀 LƯU SCHEDULE VÀO STATE
            setBookingId(oldBooking.id);
            const backup = Math.floor(Number(oldBooking.remaining_seconds));
            if (backup > 0) setTimeLeft(backup);
            else {
              toast.error(
                "Đơn hàng này đã hết hạn giữ chỗ! Vui lòng đặt đơn mới.",
              );
              navigate("/dashboard");
            }
          }
        })
        .catch(() => {
          toast.error("Đơn hàng không tồn tại hoặc đã hết hạn!");
          navigate("/dashboard");
        });
      return;
    }

    if (!cruiseId || !cabinId) return;
    axios
      .get(`http://localhost:8081/api/cruises/${cruiseId}`)
      .then((res) => {
        setCruiseData(res.data.data);
        setCabinData(
          res.data.data.cabin_classes.find((c: any) => c.id == cabinId),
        );
        // 🚀 TÌM VÀ LƯU LỊCH TRÌNH ĐANG CHỌN ĐỂ LẤY HỆ SỐ GIÁ
        setScheduleData(
          res.data.data.schedules?.find((s: any) => s.id == scheduleId),
        );

        return axios.post(
          "http://localhost:8081/api/bookings/hold",
          {
            schedule_id: scheduleId,
            cabin_class_id: cabinId,
            quantity: 1,
            guests,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      })
      .then((holdRes) => {
        if (holdRes.data.status === "require_confirmation") {
          setConflictData(holdRes.data.data);
          setShowConflictModal(true);
        } else if (holdRes.data.status === "success") {
          setBookingId(holdRes.data.data.booking_id);
          setTimeLeft(Math.floor(Number(holdRes.data.data.remaining_seconds)));
        }
      })
      .catch((err) => {
        if (err.response?.data?.message) toast.error(err.response.data.message);
        navigate("/");
      });
  }, [cruiseId, cabinId, guests, scheduleId, paramBookingId, navigate]);

  useEffect(() => {
    if (!bookingId) return;
    const channel = echo.channel(`booking.${bookingId}`);
    channel.listen(".BookingExpired", () => {
      toast.error("Thời gian giữ chỗ đã hết!");
      navigate("/dashboard");
    });
    channel.listen(".TimerUpdated", (e: any) => {
      setTimeLeft(Math.floor(Number(e.remainingSeconds)));
    });
    return () => {
      echo.leaveChannel(`booking.${bookingId}`);
    };
  }, [bookingId, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      toast.error("Đã hết thời gian giữ phòng! Đơn hàng bị hủy.");
      navigate("/dashboard");
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  // 6. Handlers
  const handleHoldRoom = (forceCancel = false) => {
    axios
      .post(
        "http://localhost:8081/api/bookings/hold",
        {
          schedule_id: scheduleId,
          cabin_class_id: cabinId,
          quantity: 1,
          guests,
          force_cancel_old: forceCancel,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      .then((res) => {
        if (res.data.status === "success") {
          setBookingId(res.data.data.booking_id);
          setTimeLeft(Math.floor(Number(res.data.data.remaining_seconds)));
        }
      });
  };

  const handleStepClick = (targetStep: 1 | 2) => {
    if (targetStep === 1) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (!leadGuest.fullName || !leadGuest.email || !leadGuest.phone) {
        toast.error("Vui lòng điền đầy đủ thông tin người liên hệ!");
        return;
      }
      if (hasDelegate && (!delegate.fullName || !delegate.phone)) {
        toast.error("Vui lòng điền thông tin người đại diện nhận phòng!");
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStepClick(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return toast.error("Chưa có mã đơn hàng hợp lệ.");
    setIsProcessing(true);
    try {
      const response = await axios.post(
        "http://localhost:8081/api/payment/create",
        {
          booking_id: bookingId,
          payment_method: paymentMethod,
          amount: grandTotal,
          addons,
          taxes,
          customer_info: leadGuest,
          delegate_info: hasDelegate ? delegate : null,
          children_count: childrenCount,
          special_requests: specialRequests,
          coupon_code: appliedCoupon?.code || null,
        },
      );

      if (response.data?.checkoutUrl) {
        localStorage.setItem(
          "retryCheckoutUrl",
          window.location.pathname + window.location.search,
        );
        window.location.href = response.data.checkoutUrl;
      } else {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Giao dịch bị từ chối.");
      setIsProcessing(false);
    }
  };

  // 7. Render Prep
  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return "00:00";
    const total = Math.floor(seconds);
    return `${Math.floor(total / 60)
      .toString()
      .padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
  };
  const isUrgent = timeLeft !== null && timeLeft <= 120;

  const durationDays = cruiseData?.duration_days || 3;
  const durationNights = cruiseData?.duration_nights || 2;
  const cruiseImage = cruiseData?.images?.[0]?.image_url || "/images/tau-1.jpg";

  const { checkInDate, checkOutDate } = useMemo(() => {
    // Ưu tiên lấy ngày từ schedule nếu load từ API booking cũ
    const rawStart = scheduleData?.departure_date || startDateParam;
    const checkIn = rawStart ? new Date(rawStart) : new Date();
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + durationNights);
    return { checkInDate: checkIn, checkOutDate: checkOut };
  }, [startDateParam, scheduleData, durationNights]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ─── EARLY RETURNS ─────────────────────────────────────────────────────────────
  if (!cruiseData || !cabinData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: PEARL }}
      >
        <div className="text-center p-10">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-5"
            style={{
              borderColor: `${GOLD} transparent transparent transparent`,
            }}
          />
          <p className="font-serif text-slate-600 text-lg">
            Đang thiết lập kênh thanh toán bảo mật...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{ backgroundColor: PEARL }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${GOLD}22` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: GOLD }} />
          </div>
          <h2
            className="text-3xl font-serif font-bold mb-2"
            style={{ color: NAVY }}
          >
            Đặt Phòng Thành Công!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Kỳ nghỉ dưỡng xa hoa của quý khách đã được xác nhận. Email hướng dẫn
            chi tiết đã được gửi đi.
          </p>
          <p className="text-sm text-slate-400 animate-pulse">
            Đang chuyển hướng về Bảng điều khiển...
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── ORDER SUMMARY (RIGHT COLUMN) ───────────────────────────────────────────
  const OrderSummary = (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{ backgroundColor: NAVY }}
    >
      <div className="relative h-40">
        <img
          src={cruiseImage}
          alt={cabinData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3
            className="font-serif text-white leading-tight font-bold"
            style={{ fontSize: "1rem" }}
          >
            {cruiseData.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: GOLD }}>
            {cabinData.name}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3.5 flex flex-col justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                <span
                  className="text-[11px] uppercase tracking-wider font-bold"
                  style={{ color: "#94a3b8" }}
                >
                  Nhận phòng
                </span>
              </div>
              <p className="text-white text-sm font-bold">
                {formatDate(checkInDate)}
              </p>
            </div>
            <div
              className="rounded-xl p-3.5 flex flex-col justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                <span
                  className="text-[11px] uppercase tracking-wider font-bold"
                  style={{ color: "#94a3b8" }}
                >
                  Trả phòng
                </span>
              </div>
              <p className="text-white text-sm font-bold">
                {formatDate(checkOutDate)}
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-3.5 flex items-center justify-between"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: GOLD }} />
              <span
                className="text-sm font-medium"
                style={{ color: "#94a3b8" }}
              >
                Hành khách
              </span>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-bold">
                {guests - childrenCount} người lớn
              </p>
              {childrenCount > 0 && (
                <p className="text-amber-400 text-xs font-bold">
                  {childrenCount} trẻ em
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="pt-4 border-t space-y-2.5"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex justify-between items-baseline">
            <span className="text-sm" style={{ color: "#94a3b8" }}>
              Giá cơ bản ({guests} khách)
            </span>
            <span className="text-white text-sm font-semibold ml-2 shrink-0">
              {fmtVNDShort(basePrice)}
            </span>
          </div>

          {/* 🚀 HIỂN THỊ BADGE GIÁ ĐỘNG (LỄ TẾT / KHUYẾN MÃI) */}
          {priceFactor !== 1.0 && (
            <div className="flex justify-between items-baseline">
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              ></span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 mt-0.5"
                style={{
                  backgroundColor: priceFactor > 1 ? "#7f1d1d" : "#064e3b",
                  color: priceFactor > 1 ? "#fca5a5" : "#6ee7b7",
                }}
              >
                <Sparkles className="w-3 h-3" />
                {priceFactor > 1
                  ? `Giá cao điểm (x${priceFactor})`
                  : `Giá ưu đãi (x${priceFactor})`}
              </span>
            </div>
          )}

          {isSurcharged && (
            <p
              className="text-[11px] italic text-right mt-1"
              style={{ color: GOLD }}
            >
              *Đã bao gồm 15% phụ thu ở ghép
            </p>
          )}

          {childrenCount > 0 && (
            <div className="flex justify-between items-baseline bg-red-950/30 -mx-1 px-1 py-1 rounded-lg">
              <span className="text-sm flex items-center gap-1.5 text-red-400">
                <Tag className="w-3 h-3" /> Chiết khấu trẻ em (30%)
              </span>
              <span className="text-sm font-bold text-red-400 ml-2 shrink-0">
                −{fmtVNDShort(childDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-baseline mt-2">
            <span
              className="text-sm flex items-center gap-1"
              style={{ color: "#94a3b8" }}
            >
              Thuế & Phí Cảng <HelpCircle className="w-3 h-3 opacity-40" />
            </span>
            <span className="text-white text-sm font-semibold ml-2 shrink-0">
              {fmtVNDShort(taxes)}
            </span>
          </div>

          {totalAddons > 0 && (
            <div
              className="pt-3 border-t space-y-2 mt-3"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: GOLD }}
              >
                Dịch vụ đã chọn
              </p>
              {addons.beverage && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#94a3b8" }}>Đồ Uống Thượng Hạng</span>
                  <span className="text-white font-semibold ml-2">
                    +{fmtVNDShort(addonPrices.beverage)}
                  </span>
                </div>
              )}
              {addons.wifi && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#94a3b8" }}>Internet Starlink</span>
                  <span className="text-white font-semibold ml-2">
                    +{fmtVNDShort(addonPrices.wifi)}
                  </span>
                </div>
              )}
              {addons.insurance && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#94a3b8" }}>Bảo Hiểm Du Lịch</span>
                  <span className="text-white font-semibold ml-2">
                    +{fmtVNDShort(addonPrices.insurance)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="pt-4 border-t mt-2"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          {appliedCoupon && (
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm flex items-center gap-1.5 text-emerald-400">
                <Tag className="w-3 h-3" /> Mã giảm giá
              </span>
              <span className="text-sm font-bold text-emerald-400 ml-2 shrink-0">
                −{fmtVNDShort(subTotal - grandTotal)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-end">
            <div>
              <p
                className="text-xs uppercase tracking-wider font-bold"
                style={{ color: "#64748b" }}
              >
                Tổng thanh toán
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                Đã bao gồm VAT
              </p>
            </div>
            <div className="text-3xl font-bold" style={{ color: GOLD }}>
              {fmtVNDShort(grandTotal)}
            </div>
          </div>
        </div>
      </div>
      <div
        className="px-5 py-3 border-t flex items-center justify-center gap-5"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "#060f1e",
        }}
      >
        <span
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "#64748b" }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Thanh toán
          bảo mật
        </span>
      </div>
    </div>
  );

  // ─── STEP 1 CONTENT ────────────────────────────────────────────────────────
  const Step1Content = (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleStep1Submit} className="space-y-6">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${NAVY}12` }}
            >
              <User className="w-4 h-4" style={{ color: NAVY }} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">
                Thông tin người đặt
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động lấy từ tài khoản (Có thể sửa)
              </p>
            </div>
          </div>
          <div className="px-7 py-6 space-y-5">
            <div>
              <FieldLabel htmlFor="lead-name">Họ và tên đầy đủ</FieldLabel>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Field
                  id="lead-name"
                  required
                  className="pl-11"
                  value={leadGuest.fullName}
                  onChange={(e) =>
                    setLeadGuest({ ...leadGuest, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel htmlFor="lead-email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Field
                    id="lead-email"
                    required
                    type="email"
                    className="pl-11"
                    value={leadGuest.email}
                    onChange={(e) =>
                      setLeadGuest({ ...leadGuest, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="lead-phone">Số điện thoại</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Field
                    id="lead-phone"
                    required
                    type="tel"
                    className="pl-11"
                    value={leadGuest.phone}
                    onChange={(e) =>
                      setLeadGuest({ ...leadGuest, phone: e.target.value })
                    }
                    placeholder="0912 345 678"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {guests > 1 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${GOLD}22` }}
              >
                <Baby className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg">
                  Hành khách Trẻ em
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trẻ em dưới 12 tuổi được giảm 30%
                </p>
              </div>
            </div>
            <div className="px-7 py-6">
              <FieldLabel>Số lượng trẻ em (Dưới 12 tuổi)</FieldLabel>
              <StyledSelect
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
              >
                {[...Array(guests)].map((_, i) =>
                  i < guests ? (
                    <option key={i} value={i}>
                      {i} trẻ em
                    </option>
                  ) : null,
                )}
              </StyledSelect>
              {childrenCount > 0 && (
                <div className="mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Hệ thống đã áp dụng mã giảm giá 30% cho {childrenCount} trẻ
                    em. Vui lòng mang theo giấy khai sinh khi nhận phòng.
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <label className="px-7 py-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div
              className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${hasDelegate ? "border-[#D4AF37] bg-[#D4AF37]" : "border-slate-300"}`}
            >
              {hasDelegate && (
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              )}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={hasDelegate}
              onChange={(e) => setHasDelegate(e.target.checked)}
            />
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-base">
                Có người đại diện tới nhận phòng trước?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dành cho trường hợp người đặt chính tới trễ.
              </p>
            </div>
          </label>
          <AnimatePresence>
            {hasDelegate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-7 pb-6 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/50">
                  <div>
                    <FieldLabel>Họ tên người tới trước</FieldLabel>
                    <Field
                      required
                      placeholder="VD: Trần Văn B"
                      value={delegate.fullName}
                      onChange={(e) =>
                        setDelegate({ ...delegate, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel>Số điện thoại</FieldLabel>
                    <Field
                      required
                      type="tel"
                      placeholder="09xx xxx xxx"
                      value={delegate.phone}
                      onChange={(e) =>
                        setDelegate({ ...delegate, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-7 py-6">
            <FieldLabel htmlFor="special-req">
              Yêu cầu đặc biệt (Không bắt buộc)
            </FieldLabel>
            <textarea
              id="special-req"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none transition-all resize-none focus:border-[#D4AF37] focus:ring-2 text-sm"
              placeholder="Ví dụ: Dị ứng hải sản, chuẩn bị bánh sinh nhật, xin cũi em bé..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all hover:brightness-110 active:scale-[0.99]"
          style={{ backgroundColor: NAVY, color: "#fff" }}
        >
          Bước tiếp theo: Dịch vụ & Thanh toán{" "}
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );

  // ─── STEP 2 CONTENT ──────
  const Step2Content = (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100">
            <h2 className="font-serif font-bold text-slate-900 text-lg">
              Dịch vụ đi kèm (Nâng tầm trải nghiệm)
            </h2>
          </div>
          <div className="px-7 py-6 space-y-3">
            <label
              className={`flex items-start justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${addons.beverage ? "border-[#D4AF37] bg-amber-50/50 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${addons.beverage ? "border-[#D4AF37] bg-[#D4AF37]" : "border-slate-300"}`}
                >
                  {addons.beverage && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={addons.beverage}
                  onChange={(e) =>
                    setAddons({ ...addons, beverage: e.target.checked })
                  }
                />
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                  style={{ backgroundColor: `${NAVY}0f` }}
                >
                  <Wine className="w-5 h-5" style={{ color: NAVY }} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Gói Đồ Uống Thượng Hạng
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rượu vang, cocktail và cafe không giới hạn.
                  </p>
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <div className="font-bold text-slate-900 text-sm">
                  +{fmtVNDShort(addonPrices.beverage)}
                </div>
              </div>
            </label>

            <label
              className={`flex items-start justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${addons.wifi ? "border-[#D4AF37] bg-amber-50/50 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${addons.wifi ? "border-[#D4AF37] bg-[#D4AF37]" : "border-slate-300"}`}
                >
                  {addons.wifi && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={addons.wifi}
                  onChange={(e) =>
                    setAddons({ ...addons, wifi: e.target.checked })
                  }
                />
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                  style={{ backgroundColor: `${NAVY}0f` }}
                >
                  <Wifi className="w-5 h-5" style={{ color: NAVY }} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Internet Vệ Tinh Starlink
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kết nối tốc độ cao giữa đại dương.
                  </p>
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <div className="font-bold text-slate-900 text-sm">
                  +{fmtVNDShort(addonPrices.wifi)}
                </div>
              </div>
            </label>

            <label
              className={`flex items-start justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${addons.insurance ? "border-[#D4AF37] bg-amber-50/50 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${addons.insurance ? "border-[#D4AF37] bg-[#D4AF37]" : "border-slate-300"}`}
                >
                  {addons.insurance && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={addons.insurance}
                  onChange={(e) =>
                    setAddons({ ...addons, insurance: e.target.checked })
                  }
                />
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                  style={{ backgroundColor: `${NAVY}0f` }}
                >
                  <ShieldCheck className="w-5 h-5" style={{ color: NAVY }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Bảo Hiểm Du Lịch
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Bảo vệ y tế, hành lý & hủy chuyến.
                  </p>
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <div className="font-bold text-slate-900 text-sm">
                  +{fmtVNDShort(addonPrices.insurance)}
                </div>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">
                Mã Giảm Giá
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Áp dụng mã ưu đãi cho chuyến đi của bạn
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${GOLD}15` }}
            >
              <Tag className="w-4 h-4" style={{ color: GOLD }} />
            </div>
          </div>

          <div className="p-6 relative">
            {appliedCoupon ? (
              <div
                className="flex justify-between items-center bg-amber-50/50 border-2 px-5 py-4 rounded-xl shadow-sm"
                style={{ borderColor: GOLD }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${GOLD}20` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {appliedCoupon.code}{" "}
                      <span className="text-slate-500 font-normal ml-1">
                        đã áp dụng
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {appliedCoupon.title}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-amber-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3 relative">
                <div className="relative flex-1 group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã giảm giá..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const match = availableCoupons.find(
                      (c) => c.code.toUpperCase() === couponCode,
                    );
                    if (match && subTotal >= match.min_order_value) {
                      setAppliedCoupon(match);
                      setShowCoupons(false);
                      setCouponCode("");
                      toast.success("Áp dụng mã giảm giá thành công!");
                    } else {
                      toast.error(
                        "Mã không hợp lệ hoặc chưa đủ điều kiện áp dụng.",
                      );
                    }
                  }}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: GOLD, color: NAVY }}
                >
                  Áp dụng
                </button>
              </div>
            )}

            {!appliedCoupon && bestCoupon && (
              <div
                className="mt-3 flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-xl border"
                style={{
                  backgroundColor: `${GOLD}10`,
                  borderColor: `${GOLD}30`,
                  color: NAVY,
                }}
              >
                <Sparkles
                  className="w-3.5 h-3.5 animate-pulse"
                  style={{ color: GOLD }}
                />
                <span>
                  Gợi ý: Dùng mã{" "}
                  <strong
                    className="cursor-pointer font-bold transition-opacity hover:opacity-70 underline decoration-slate-300"
                    onClick={() => setCouponCode(bestCoupon?.code || "")}
                  >
                    {bestCoupon?.code}
                  </strong>{" "}
                  để tiết kiệm nhiều nhất!
                </span>
              </div>
            )}

            {!appliedCoupon && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="text-sm font-bold hover:underline flex items-center gap-1.5"
                  style={{ color: GOLD }}
                >
                  <Tag className="w-4 h-4" />
                  {showCoupons ? "Đóng danh sách mã" : "Xem tất cả mã khả dụng"}
                </button>
              </div>
            )}

            <AnimatePresence>
              {showCoupons && !appliedCoupon && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="space-y-3 pt-2">
                    {availableCoupons.length === 0 && (
                      <div className="text-center text-slate-500 py-4 text-sm">
                        Chưa có mã giảm giá nào khả dụng.
                      </div>
                    )}
                    {availableCoupons.map((c) => {
                      const isEligible = subTotal >= Number(c.min_order_value);
                      const valueStr =
                        Number(c.discount_amount) > 0
                          ? fmtVNDShort(Number(c.discount_amount))
                          : Number(c.discount_percent) > 0
                            ? `${c.discount_percent}%`
                            : "";

                      const progressPct = Math.min(
                        100,
                        (subTotal / Number(c.min_order_value)) * 100,
                      );

                      return (
                        <button
                          key={c.id || c.code}
                          type="button"
                          onClick={() => {
                            if (isEligible) {
                              setAppliedCoupon(c);
                              setShowCoupons(false);
                              setCouponCode("");
                              toast.success("Áp dụng mã giảm giá thành công!");
                            }
                          }}
                          disabled={!isEligible}
                          className={`w-full text-left rounded-xl flex items-stretch border-2 transition-all overflow-hidden ${
                            isEligible
                              ? "border-slate-100 bg-white hover:border-[#D4AF37] hover:bg-amber-50/40 cursor-pointer"
                              : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed grayscale-[60%]"
                          }`}
                        >
                          <div
                            className={`w-[110px] p-3 flex flex-col items-center justify-center border-r-2 border-dashed shrink-0 ${
                              isEligible
                                ? "bg-amber-50/50 text-[#D4AF37] border-slate-100"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}
                          >
                            <span className="text-lg font-extrabold text-center leading-tight">
                              {valueStr}
                            </span>
                            <span
                              className="text-[9px] uppercase tracking-wider font-semibold mt-1"
                              style={{ color: NAVY }}
                            >
                              Giảm giá
                            </span>
                          </div>

                          <div className="flex-1 p-4 flex flex-col justify-center relative">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold text-sm ${isEligible ? "text-slate-900" : "text-slate-500"}`}
                                >
                                  {c.code}
                                </span>
                                {c.code === bestCoupon?.code && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                                    Tốt nhất
                                  </span>
                                )}
                                {isEligible && c.code !== bestCoupon?.code && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                                    Khả dụng
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-700 mb-1">
                              {c.title}
                            </span>
                            <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
                              {c.description}
                            </p>

                            {!isEligible ? (
                              <div className="mt-auto">
                                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5">
                                  <div
                                    className="bg-slate-400 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPct}%` }}
                                  ></div>
                                </div>
                                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Cần mua
                                  thêm{" "}
                                  {fmtVNDShort(
                                    Number(c.min_order_value) - subTotal,
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div
                                className="mt-auto text-[10px] font-bold flex items-center gap-1"
                                style={{ color: GOLD }}
                              >
                                <Check className="w-3 h-3" /> Đủ điều kiện sử
                                dụng
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100">
            <h2 className="font-serif font-bold text-slate-900 text-lg">
              Phương Thức Thanh Toán
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "vnpay" ? "border-[#D4AF37] bg-amber-50/40 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className="mt-0.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "vnpay" ? "border-[#D4AF37]" : "border-slate-300"}`}
                >
                  {paymentMethod === "vnpay" && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: GOLD }}
                    />
                  )}
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="vnpay"
                  className="sr-only"
                  checked={paymentMethod === "vnpay"}
                  onChange={() => setPaymentMethod("vnpay")}
                />
              </div>
              <div
                className="flex items-center justify-center w-12 h-10 rounded-xl shrink-0"
                style={{ backgroundColor: "#005BAA" }}
              >
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">VNPAY</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quét mã QR / Thẻ ATM nội địa
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "credit_card" ? "border-[#D4AF37] bg-amber-50/40 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className="mt-0.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "credit_card" ? "border-[#D4AF37]" : "border-slate-300"}`}
                >
                  {paymentMethod === "credit_card" && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: GOLD }}
                    />
                  )}
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  className="sr-only"
                  checked={paymentMethod === "credit_card"}
                  onChange={() => setPaymentMethod("credit_card")}
                />
              </div>
              <div
                className="flex items-center justify-center w-12 h-10 rounded-xl shrink-0"
                style={{ backgroundColor: NAVY }}
              >
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">
                  Thẻ Tín Dụng Quốc Tế
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visa, Mastercard, JCB
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* ── 4. NÚT SUBMIT CHUYỂN TRANG ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex-1 sm:flex-none px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 transition-all text-center"
          >
            ← Trở lại
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />{" "}
                Đang kết nối ngân hàng...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Xác Nhận Thanh Toán · {fmtVNDShort(grandTotal)}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: PEARL }}>
      <AnimatePresence>
        {showConflictModal && conflictData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ backgroundColor: GOLD }}
              />
              <button
                onClick={() => setShowConflictModal(false)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
              <AlertCircle
                className="w-10 h-10 mb-4 mt-2"
                style={{ color: GOLD }}
              />
              <h3
                className="text-xl font-bold font-serif mb-3"
                style={{ color: NAVY }}
              >
                Phát hiện Đơn hàng chờ!
              </h3>
              <p className="text-slate-600 mb-7 text-sm">
                Hệ thống ghi nhận bạn đang có 1 đơn giữ phòng vào ngày{" "}
                <strong className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {conflictData.old_date
                    ? new Date(conflictData.old_date).toLocaleDateString(
                        "vi-VN",
                      )
                    : "khác"}
                </strong>{" "}
                chưa được hoàn tất. Bạn muốn xử lý thế nào?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowConflictModal(false);
                    window.location.href = `/checkout?cruiseId=${searchParams.get("cruiseId")}&cabinId=${conflictData.old_cabin_id}&scheduleId=${conflictData.old_schedule_id}`;
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                  style={{ backgroundColor: NAVY, color: GOLD }}
                >
                  Tiếp tục thanh toán đơn cũ
                </button>
                <button
                  onClick={() => {
                    setShowConflictModal(false);
                    handleHoldRoom(true);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm border-2 transition-all hover:bg-slate-50"
                  style={{ borderColor: NAVY, color: NAVY }}
                >
                  Hủy đơn cũ & Đặt phòng mới
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="sticky top-0 z-40 py-3 px-4 flex justify-center items-center gap-3 shadow-md transition-colors duration-500"
        style={{ backgroundColor: isUrgent ? "#7f1d1d" : NAVY }}
      >
        <Clock
          className="w-5 h-5 animate-pulse shrink-0"
          style={{ color: GOLD }}
        />
        <span className="text-sm" style={{ color: "#94a3b8" }}>
          Phòng của bạn đang được giữ trong
        </span>
        <span
          className="font-bold text-lg w-16 text-center tabular-nums"
          style={{ color: isUrgent ? "#fca5a5" : GOLD }}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <div
        className="lg:hidden sticky top-[52px] z-30 shadow-lg"
        style={{ backgroundColor: NAVY }}
      >
        <button
          onClick={() => setMobileOrderOpen((o) => !o)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {cruiseData?.name} · {cabinData?.name}
            </p>
            <p className="font-bold" style={{ color: GOLD }}>
              {fmtVNDShort(grandTotal)}
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: GOLD }}
          >
            <span>Chi tiết đơn</span>
            {mobileOrderOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>
        <AnimatePresence>
          {mobileOrderOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">{OrderSummary}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="font-serif font-bold text-slate-900"
              style={{ fontSize: "1.6rem" }}
            >
              Hoàn tất đặt phòng
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {cruiseData?.name} · {cabinData?.name}
            </p>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
            style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
          >
            <ShieldCheck className="w-4 h-4" />
            Đặt phòng an toàn
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[65%]">
            <StepBar step={step} onStepClick={handleStepClick} />
            <AnimatePresence mode="wait">
              {step === 1 ? Step1Content : Step2Content}
            </AnimatePresence>
          </div>
          <div className="hidden lg:block lg:w-[35%] sticky top-[76px]">
            {OrderSummary}
          </div>
        </div>
      </div>
    </div>
  );
}
