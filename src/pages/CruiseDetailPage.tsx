import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Đã thêm ChevronLeft, ChevronRight vào danh sách import
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  Anchor,
  Info,
  Calendar as CalIcon,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { CabinCard } from "./CabinCard";
import { echo } from "../echo";
import { toast } from "react-hot-toast";
// ==========================================
// COMPONENT: TỜ LỊCH
// ==========================================
const ScheduleCalendar = ({
  schedules,
  selectedId,
  onSelect,
  durationDays = 1,
}: {
  schedules: any[];
  selectedId: any;
  onSelect: (id: any) => void;
  durationDays?: number;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const availableSchedules = useMemo(() => {
    if (!schedules) return {};
    return schedules.reduce((acc: Record<string, number>, sch: any) => {
      const rawDate = sch.departure_time || sch.departure_date;
      if (rawDate) {
        const dateObj = new Date(rawDate.replace(" ", "T"));
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
        acc[dateStr] = sch.id;
      }
      return acc;
    }, {});
  }, [schedules]);

  const { selectedStartTime, selectedEndTime } = useMemo(() => {
    if (!selectedId || !schedules)
      return { selectedStartTime: null, selectedEndTime: null };

    const sch = schedules.find((s) => s.id === selectedId);
    if (!sch) return { selectedStartTime: null, selectedEndTime: null };

    const rawDate = sch.departure_time || sch.departure_date;
    const startObj = new Date(rawDate.replace(" ", "T"));
    const startDate = new Date(
      startObj.getFullYear(),
      startObj.getMonth(),
      startObj.getDate(),
    );

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (durationDays - 1));

    return {
      selectedStartTime: startDate.getTime(),
      selectedEndTime: endDate.getTime(),
    };
  }, [selectedId, schedules, durationDays]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg mb-6">
      {/* HEADER LỊCH */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50">
        <button
          onClick={prevMonth}
          className="p-2 bg-slate-50 hover:bg-[#0A192F] hover:text-white rounded-lg text-slate-500 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="font-bold text-[#0A192F] text-lg font-serif">
          Tháng {month + 1}, {year}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 bg-slate-50 hover:bg-[#0A192F] hover:text-white rounded-lg text-slate-500 transition-colors shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* THỨ TRONG TUẦN */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* CÁC NGÀY TRONG THÁNG */}
      <div className="grid grid-cols-7 gap-y-2">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-10"></div>
        ))}
        {days.map((day) => {
          const checkDate = new Date(year, month, day);
          const checkTime = checkDate.getTime();
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const scheduleId = availableSchedules[dateStr];
          const isDeparture = !!scheduleId;

          let isSelectedStart = false;
          let isSelectedEnd = false;
          let isInSelectedRange = false;

          if (selectedStartTime && selectedEndTime) {
            if (checkTime === selectedStartTime) isSelectedStart = true;
            if (checkTime === selectedEndTime) isSelectedEnd = true;
            if (checkTime > selectedStartTime && checkTime < selectedEndTime)
              isInSelectedRange = true;
          }

          // XÂY DỰNG STYLE CHUẨN LUXURY THEME
          let buttonClasses =
            "h-10 w-full text-sm font-medium transition-all flex items-center justify-center relative ";
          let isDisabled = !isDeparture;

          if (isSelectedStart) {
            // Ngày đi: Nền Navy, chữ Vàng (Khớp với nút bấm của bạn)
            buttonClasses +=
              "bg-[#0A192F] text-amber-400 shadow-md z-10 " +
              (durationDays > 1 ? "rounded-l-xl" : "rounded-xl");
          } else if (isSelectedEnd) {
            // Ngày về: Nền Navy, chữ Vàng
            buttonClasses +=
              "bg-[#0A192F] text-amber-400 shadow-md z-10 " +
              (durationDays > 1 ? "rounded-r-xl" : "rounded-xl");
            if (isDeparture)
              buttonClasses += "cursor-pointer hover:bg-slate-800 ";
          } else if (isInSelectedRange) {
            // Ở giữa chuyến: Nền xám nhạt xanh
            buttonClasses += "bg-slate-100 text-[#0A192F] font-semibold ";
            if (isDeparture)
              buttonClasses +=
                "cursor-pointer hover:bg-slate-200 border-y border-slate-200 ";
          } else if (isDeparture) {
            // Có tàu nhưng chưa chọn: Viền xám, hover lên viền vàng
            buttonClasses +=
              "bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600 hover:shadow-sm cursor-pointer rounded-xl ";
          } else {
            // Không có tàu: Xám, mờ
            buttonClasses +=
              "bg-transparent text-slate-300 opacity-40 cursor-not-allowed rounded-xl ";
          }

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => isDeparture && onSelect(scheduleId)}
              className={buttonClasses}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT CHÍNH: CHI TIẾT DU THUYỀN
// ==========================================
export function CruiseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cruise, setCruise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  // 1. API: LẤY DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    // Chỉ chạy khi đã có dữ liệu cruise và có mảng images
    if (cruise?.images?.length > 0) {
      const interval = setInterval(() => {
        nextImage();
      }, 3600);
      return () => clearInterval(interval);
    }
  }, [cruise?.images, activeImageIndex]);
  useEffect(() => {
    axios
      .get(`http://localhost/api/cruises/${id}`)
      .then((response) => {
        setCruise(response.data.data);
      })
      .catch((error) => {
        console.error("Lỗi lấy chi tiết tàu:", error);
      })
      .finally(() => setLoading(false)); // Tối ưu: Gộp tắt loading vào finally
  }, [id]);

  // 2. SOCKET: LOGIC REAL-TIME
  useEffect(() => {
    // Nếu chưa có ID tàu hoặc chưa kết nối Echo thì bỏ qua
    if (!cruise?.id || !echo) return;

    const channel = echo.channel("rooms").listen(".RoomReleased", (e: any) => {
      // Nếu sự kiện Real-time báo về mà không khớp với ID Lịch trình khách đang xem -> BỎ QUA NGAY!
      if (
        e.schedule_id &&
        String(e.schedule_id) !== String(selectedScheduleId)
      ) {
        return;
      }

      setCruise((prevCruise: any) => {
        if (!prevCruise) return prevCruise;
        return {
          ...prevCruise,
          cabin_classes: prevCruise.cabin_classes.map((cabin: any) =>
            cabin.id === e.cabinClassId
              ? { ...cabin, available_rooms: e.availableRooms }
              : cabin,
          ),
        };
      });
    });

    return () => {
      echo.leave("rooms");
    };
  }, [cruise?.id, selectedScheduleId]); //
  useEffect(() => {
    if (!selectedScheduleId) return; // Nếu chưa chọn ngày thì thôi

    // Gọi API để lấy số lượng phòng chuẩn xác cho ngày vừa chọn
    axios
      .get(
        `http://localhost/api/schedules/${selectedScheduleId}/available-cabins`,
      )
      .then((response) => {
        // Cập nhật lại mảng cabin_classes trong state cruise
        setCruise((prev: any) => ({
          ...prev,
          cabin_classes: response.data.data,
        }));
      })
      .catch((error) => console.error("Lỗi cập nhật phòng:", error));
  }, [selectedScheduleId]); // <-- Chạy lại hàm này mỗi khi biến này thay đổi
  // 3. XỬ LÝ ĐẶT PHÒNG
  const handleBooking = (cabinId: number) => {
    // TÌM XEM KHÁCH ĐANG BẤM VÀO PHÒNG NÀO ĐỂ LẤY SỨC CHỨA
    const cabin = cruise.cabin_classes.find((c: any) => c.id === cabinId);
    const capacity = cabin?.capacity || 2;

    // KIỂM TRA ĐIỀU KIỆN SỐ NGƯỜI
    if (guestCount > capacity + 2) {
      toast.error(
        `Rất tiếc! Phòng này chứa tiêu chuẩn ${capacity} khách. Tối đa chỉ cho phép ở ghép thêm 2 người (Tổng: ${capacity + 2}). Quý khách vui lòng đặt Hạng phòng lớn hơn hoặc chia làm nhiều phòng nhé!`,
      );
      return; // Chặn đứng tại đây, không cho đi tiếp
    }

    if (!selectedScheduleId) {
      toast.error(
        "Thuyền viên ơi, vui lòng chọn ngày khởi hành trên tờ lịch trước khi đặt phòng nhé!",
      );
      return;
    }

    const token = localStorage.getItem("token");

    // Nối thêm số lượng khách vào URL
    const checkoutUrl = `/checkout?cruiseId=${id}&cabinId=${cabinId}&scheduleId=${selectedScheduleId}&guests=${guestCount}`;

    if (!token) {
      toast.error("Vui lòng đăng nhập để giữ chỗ!");
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }

    navigate(checkoutUrl);
  };

  if (loading)
    return (
      <div className="p-20 text-center text-xl font-serif text-slate-800">
        Đang chuẩn bị hành trình 5 sao...
      </div>
    );
  if (!cruise)
    return (
      <div className="p-20 text-center text-xl text-red-500">
        Không tìm thấy du thuyền.
      </div>
    );
  const nextImage = () => {
    if (!cruise?.images) return;
    setActiveImageIndex((prev) =>
      prev === cruise.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    if (!cruise?.images) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? cruise.images.length - 1 : prev - 1,
    );
  };
  const basePrice =
    cruise.cabin_classes?.length > 0
      ? Math.min(...cruise.cabin_classes.map((c: any) => c.price || 0))
      : 0;

  return (
    <div className="bg-slate-50 min-h-screen relative">
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-slate-900">
        <img
          src={cruise.thumbnail || "/images/tau-1.jpg"}
          alt={cruise.name}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">
              <MapPin className="w-4 h-4" />{" "}
              {cruise.destination || "Vịnh Hạ Long"},Việt Nam
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
              {cruise.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-slate-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-medium text-lg">
                  {cruise.star_rating} Sao Đẳng Cấp
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-lg">
                  {" "}
                  {cruise.duration_days} Ngày / {cruise.duration_nights} Đêm
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-8 border-b border-slate-200 mb-8 pb-2 sticky top-20 bg-slate-50 z-20">
            {[
              { id: "overview", icon: Info, label: "Tổng quan" },
              { id: "itinerary", icon: Anchor, label: "Lịch trình" },
              { id: "cabins", icon: ShieldCheck, label: "Hạng Phòng" },
              { id: "reviews", icon: MessageSquare, label: "Đánh giá" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-semibold uppercase tracking-wider relative transition-all ${
                  activeTab === tab.id
                    ? "text-amber-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-amber-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <section>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                    Thư viện hình ảnh
                  </h3>
                  {cruise.images?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Khung ảnh lớn có nút chuyển */}
                      <div className="group relative w-full h-[450px] rounded-3xl overflow-hidden shadow-lg border border-white">
                        <img
                          src={cruise.images[activeImageIndex]?.image_url}
                          className="w-full h-full object-cover transition-all duration-700"
                          alt="Cruise Gallery"
                        />

                        {/* Nút sang trái */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Nút sang phải */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Chỉ số ảnh (Ví dụ: 1/10) - Tùy chọn thêm cho đẹp */}
                        <div className="absolute bottom-4 right-6 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                          {activeImageIndex + 1} / {cruise.images.length}
                        </div>
                      </div>

                      {/* Danh sách ảnh nhỏ bên dưới */}
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {cruise.images.map((img: any, idx: number) => (
                          <button
                            key={img.id}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                              activeImageIndex === idx
                                ? "border-amber-500 scale-105 shadow-md"
                                : "border-transparent opacity-60"
                            }`}
                          >
                            <img
                              src={img.image_url}
                              className="w-full h-full object-cover"
                              alt="thumb"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="italic text-slate-400">
                      Đang cập nhật hình ảnh...
                    </p>
                  )}
                </section>

                <section>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                    Tiện ích nổi bật
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cruise.amenities?.map((fac: any) => (
                      <div
                        key={fac.id}
                        className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">
                          {fac.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "cabins" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-serif font-bold text-slate-900">
                  Chọn không gian nghỉ dưỡng
                </h3>
                <div className="grid gap-8">
                  {cruise.cabin_classes?.map((cabin: any) => (
                    <CabinCard
                      key={cabin.id}
                      cabin={cabin}
                      onBooking={handleBooking}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "itinerary" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                  Lịch trình chi tiết
                </h3>
                <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-12">
                  {cruise.itineraries?.map((day: any) => (
                    <div key={day.id} className="relative">
                      <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow-sm" />
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">
                          Ngày {day.day_number}
                        </span>
                        <h4 className="text-xl font-bold text-slate-900 mt-1 mb-3">
                          {day.location}
                        </h4>
                        <p className="text-slate-600 leading-relaxed">
                          {day.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {JSON.parse(day.activities || "[]").map(
                            (act: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs border border-slate-100"
                              >
                                {act}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6"
              >
                {cruise.reviews?.map((review: any) => (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                          {review.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {review.user?.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-amber-500 gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{review.comment}"</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 lg:p-8 sticky top-28 flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#0A192F] mb-2">
                Hành trình của bạn
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-500">
                  {new Intl.NumberFormat("vi-VN").format(basePrice)}đ
                </span>
                <span className="text-slate-500 text-sm font-medium">
                  / khách
                </span>
              </div>
            </div>

            <div className="space-y-4 py-4 border-y border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-500" /> Thời lượng
                </span>
                <span className="font-semibold text-[#0A192F]">
                  {cruise.duration_days} Ngày {cruise.duration_nights} Đêm
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-amber-500" /> Khởi hành
                </span>
                <span className="font-semibold text-[#0A192F] text-right max-w-[150px] truncate">
                  {cruise.destination || "Vịnh Hạ Long"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[#0A192F] font-bold flex items-center gap-2">
                <CalIcon className="w-5 h-5 text-amber-500" /> Chọn ngày đi:
              </label>

              <ScheduleCalendar
                schedules={cruise.schedules}
                selectedId={selectedScheduleId}
                onSelect={setSelectedScheduleId}
                durationDays={cruise.duration_days || 1}
              />

              {/* MỚI THÊM: KHU VỰC CHỌN SỐ LƯỢNG KHÁCH */}
              <div className="pt-2 pb-1 border-t border-slate-100">
                <label className="text-[#0A192F] font-bold flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-amber-500" /> Số lượng khách:
                </label>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))} // Tối thiểu là 1 người
                    className="p-3 bg-white rounded-lg shadow-sm text-slate-500 hover:text-amber-500 hover:border-amber-200 border border-transparent transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="font-bold text-[#0A192F] text-lg">
                    {guestCount}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      người
                    </span>
                  </span>

                  <button
                    onClick={() => setGuestCount(Math.min(10, guestCount + 1))} // Tối đa giả sử là 10 người
                    className="p-3 bg-white rounded-lg shadow-sm text-slate-500 hover:text-amber-500 hover:border-amber-200 border border-transparent transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {!selectedScheduleId && (
                <p className="text-xs text-amber-600 font-medium italic text-center animate-pulse mt-2">
                  * Vui lòng chọn ngày để xem giá và phòng trống
                </p>
              )}
            </div>

            {/* 4. Nút Call to Action (Xử lý thông minh) */}
            <button
              onClick={() => {
                if (!selectedScheduleId) {
                  toast.error(
                    "Thuyền viên ơi, vui lòng chọn ngày khởi hành trên tờ lịch trước nhé!",
                  );
                  return;
                }
                setActiveTab("cabins");
                // Code cuộn mượt xuống khu vực phòng (Tùy chọn)
                window.scrollTo({
                  top: document.body.scrollHeight / 2,
                  behavior: "smooth",
                });
              }}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg
                ${
                  selectedScheduleId
                    ? "bg-[#0A192F] text-white hover:bg-amber-500 hover:text-slate-900 hover:shadow-amber-200 cursor-pointer"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }
              `}
            >
              {selectedScheduleId ? "XEM PHÒNG TRỐNG" : "CHỌN NGÀY ĐỂ TIẾP TỤC"}
              <Anchor
                className={`w-5 h-5 ${selectedScheduleId ? "animate-bounce" : ""}`}
              />
            </button>

            {/* 5. Trust Badges */}
            <div className="pt-2 border-t border-slate-50 flex flex-col items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Thanh toán
                an toàn
              </div>
              <span>Cam kết giá tốt nhất hệ thống</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
