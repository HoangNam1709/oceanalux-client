import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ChevronRight,
  Star,
  Clock,
  PawPrint,
  Baby,
  Anchor,
  Award,
  Shield,
  ArrowRight,
  Play,
  Quote,
  Sparkles,
  Compass,
  Utensils,
  Waves,
  Wind,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import axios from "axios";
import { echo } from "../echo";

// ─── Dữ Liệu Tĩnh (Cho các section bổ trợ UI) ──────────────────────────────────
const HERO_SLIDES = [
  {
    image: "./images/Banner.avif", // Ảnh gốc của bạn
    tagline: "Hành Trình Vượt Thời Gian",
    heading: "Đại Dương Là\nNhà Của Bạn",
    sub: "Trải nghiệm du thuyền 5 sao sang trọng nhất thế giới",
  },
  {
    image:
      "https://images.unsplash.com/photo-1576723860479-4459fdf0bc48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2UlMjBzaGlwJTIwaW5maW5pdHklMjBwb29sJTIwb2NlYW4lMjBkZWNrJTIwbHV4dXJ5fGVufDF8fHx8MTc3NTE1MzkyNHww&ixlib=rb-4.1.0&q=80&w=1080",
    tagline: "Sang Trọng Đỉnh Cao",
    heading: "Sống Đẳng Cấp\nGiữa Biển Khơi",
    sub: "Hồ bơi vô cực, spa hàng đầu và ẩm thực Michelin chờ đón bạn",
  },
  {
    image:
      "https://images.unsplash.com/photo-1500687834377-1388ec3c5991?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tagline: "Hành Trình Độc Bản",
    heading: "Khám Phá Những\nHải Trình Bí Ẩn",
    sub: "Chỉ có tại NamOcen - những chuyến đi không thể tìm thấy ở đâu khác",
  },
];

const STATS = [
  { value: "20+", label: "Năm kinh nghiệm" },
  { value: "150+", label: "Điểm đến trên TG" },
  { value: "50K+", label: "Khách hàng hài lòng" },
  { value: "5★", label: "Đánh giá trung bình" },
];

const EXPERIENCES = [
  {
    icon: Utensils,
    title: "Ẩm Thực Michelin",
    desc: "Thưởng thức các bữa ăn do đầu bếp 3 sao Michelin chế biến ngay trên boong tàu, với nguyên liệu tươi nhất từng cảng ghé.",
    image:
      "https://images.unsplash.com/photo-1674168461837-9e2be6a263da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjcnVpc2UlMjBzaGlwJTIwZmluZSUyMGRpbmluZyUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzc1MTUzOTI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Sparkles,
    title: "Spa & Phục Hồi",
    desc: "Không gian spa đẳng cấp thế giới với liệu trình độc quyền, hồ bơi nhiệt đới và phòng xông hơi toàn cảnh biển.",
    image:
      "https://images.unsplash.com/photo-1614368454831-0d6d814c87e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB3ZWxsbmVzcyUyMHJlc29ydCUQDvDUxFShoWWbHougyHjr0tFz3E38fX8e0bnTUpya-P0mXW&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Waves,
    title: "Hải Trình Độc Bản",
    desc: "Khám phá những hải trình độc quyền đến các điểm đến bí ẩn và tuyệt đẹp mà chỉ OceanaLux mới có.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjdXJzaW5lfGVufDF8fHx8MTc3NTE1MzkyNHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Anh",
    role: "CEO, TechVN",
    rating: 5,
    avatar: "M",
    text: "Dịch vụ hoàn hảo từng chi tiết, ẩm thực tuyệt vời và cảnh quan mê hoặc. Thực sự định nghĩa lại sự sang trọng.",
    route: "Địa Trung Hải · 10 ngày",
  },
  {
    name: "Trần Phương Linh",
    role: "Giám đốc Marketing",
    rating: 5,
    avatar: "L",
    text: "Kỷ niệm 10 năm ngày cưới trên du thuyền không thể tuyệt vời hơn. Nhân viên cực kỳ chu đáo, suite ban công nhìn ra biển xanh ngắt.",
    route: "Caribbean · 7 ngày",
  },
  {
    name: "Lê Quốc Hùng",
    role: "Luật sư",
    rating: 5,
    avatar: "H",
    text: "Khoảnh khắc bình minh qua ô cửa kính panorama tôi sẽ không bao giờ quên. Sự kết hợp hoàn hảo giữa thiên nhiên và tiện nghi xa xỉ.",
    route: "Na Uy · 5 ngày",
  },
];

// ─── Component Đếm số chạy hiệu ứng ──────────────────────────────────────────
function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target.replace(/\D/g, ""), 10);
    const suffix = target.replace(/[0-9]/g, "");
    if (isNaN(num)) {
      setDisplay(target);
      return;
    }
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setDisplay(start + suffix);
      if (start >= num) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [inView, target]);
  return display;
}

function StatCard({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const count = useCountUp(value, inView);
  return (
    <div ref={ref} className="text-center group">
      <div className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-none text-[#D4AF37] group-hover:scale-110 transition-transform duration-500">
        {count}
      </div>
      <div className="text-slate-300 text-sm mt-3 uppercase tracking-[0.2em]">
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANG CHỦ CHÍNH (HOMEPAGE)
// ═══════════════════════════════════════════════════════════════════════════════
export function HomePage() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState("");
  const today = new Date().toISOString().split("T")[0];
  // State hiệu ứng UI
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeExp, setActiveExp] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // State chứa dữ liệu thật từ Database
  const [trendingCruises, setTrendingCruises] = useState<any[]>([]);

  // Gọi API lấy dữ liệu & Chuyển slide tự động (Đã gộp chung vào 1 useEffect để tối ưu)
  useEffect(() => {
    // Fetch dữ liệu tàu
    axios
      .get("http://localhost/api/cruises")
      .then((response) => {
        if (response.data && response.data.data) {
          setTrendingCruises(response.data.data);
        }
      })
      .catch((error) => console.error("Lỗi lấy danh sách tàu:", error));

    // Chạy Slider tự động
    const t = setInterval(
      () => setActiveSlide((s) => (s + 1) % HERO_SLIDES.length),
      6000,
    );
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Tạo URLSearchParams để tự động encode các ký tự đặc biệt (khoảng trắng, dấu tiếng Việt)
    const params = new URLSearchParams();
    if (destination) params.append("location", destination);
    if (dates) params.append("date", dates); // Bạn có thể cần format lại ngày nếu dùng DatePicker thật
    if (guests) params.append("guests", guests);
    // Chuyển hướng sang trang kết quả tìm kiếm
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full bg-[#F8F9FA] font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#0A192F]">
      {/* ═══════════════════════════════════════════════════════
          §1  HERO SECTION (Đã thu nhỏ banner & Bo tròn Search)
      ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden h-[80svh] min-h-[600px] max-h-[850px]"
      >
        {/* Slideshow */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0"
            style={{ y: heroY }}
          >
            <img
              src={HERO_SLIDES[activeSlide].image}
              alt="Luxury Cruise"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F]/70 to-transparent w-full md:w-2/3" />

        {/* Nội dung Slider (Đẩy lên một chút để nhường chỗ cho thanh search) */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-7xl mx-auto left-0 right-0 z-10 pb-20"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-px bg-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
                  {HERO_SLIDES[activeSlide].tagline}
                </span>
              </div>
              <h1 className="text-white font-serif mb-6 text-[clamp(2.8rem,7vw,6.5rem)] leading-[1.05] tracking-tight">
                {HERO_SLIDES[activeSlide].heading.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <span className="text-[#D4AF37] drop-shadow-lg italic font-medium">
                        {line}
                      </span>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>
              <p className="text-slate-200 mb-12 max-w-xl text-lg leading-relaxed font-light">
                {HERO_SLIDES[activeSlide].sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-40 left-6 md:left-20 flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`transition-all duration-500 rounded-full h-2 ${i === activeSlide ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>

        {/* Form Tìm Kiếm - Phong cách Bo góc tinh tế, Chữ gọn gàng */}
        <div className="absolute bottom-8 left-0 right-0 max-w-5xl mx-auto px-4 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(10,25,47,0.1)] p-2 md:pl-4 border border-slate-100"
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row w-full items-center divide-y md:divide-y-0 md:divide-x divide-slate-100"
            >
              {/* Điểm đến */}
              <div className="flex-1 w-full px-4 py-3 hover:bg-slate-50/70 rounded-xl transition-colors group cursor-pointer flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37] transition-colors shrink-0" />
                <div className="flex flex-col w-full">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-[#D4AF37] transition-colors mb-0.5 cursor-pointer">
                    Điểm đến
                  </label>
                  <input
                    type="text"
                    placeholder="Bạn muốn đi đâu?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-sm font-semibold text-[#0A192F] focus:outline-none bg-transparent placeholder-slate-400 truncate"
                  />
                </div>
              </div>

              {/* Khởi hành */}
              <div className="flex-1 w-full px-4 py-3 hover:bg-slate-50/70 rounded-xl transition-colors group cursor-pointer flex items-center gap-3 md:ml-1">
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37] transition-colors shrink-0" />
                <div className="flex flex-col w-full">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-[#D4AF37] transition-colors mb-0.5 cursor-pointer">
                    Khởi hành
                  </label>
                  <input
                    type="date"
                    placeholder="Thêm ngày"
                    value={dates || today}
                    onChange={(e) => setDates(e.target.value)}
                    className="w-full text-sm font-semibold text-[#0A192F] focus:outline-none bg-transparent placeholder-slate-400 truncate"
                  />
                </div>
              </div>

              {/* Hành khách */}
              <div className="flex-1 w-full px-4 py-3 hover:bg-slate-50/70 rounded-xl transition-colors group cursor-pointer flex items-center gap-3 md:ml-1">
                <Users className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37] transition-colors shrink-0" />
                <div className="flex flex-col w-full">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-[#D4AF37] transition-colors mb-0.5 cursor-pointer">
                    Hành khách
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Thêm khách"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full text-sm font-semibold text-[#0A192F] focus:outline-none bg-transparent placeholder-slate-400 truncate"
                  />
                </div>
              </div>

              {/* Nút Tìm Kiếm */}
              <div className="w-full md:w-auto p-2 md:p-0 md:pl-3">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-gradient-to-br from-[#D4AF37] to-[#e8c84a] text-[#0A192F] hover:shadow-[0_8px_20px_rgba(212,175,55,0.4)] rounded-xl px-7 h-12 md:h-[3.25rem] font-bold uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center hover:scale-105"
                >
                  <Search className="w-4 h-4 mr-2" />
                  <span>Khám phá</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §2  STATS STRIP (Thanh thông số bổ sung)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0A192F] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6 divide-x divide-white/10">
            {STATS.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════
         §3  TRENDING CRUISES (Đổ dữ liệu API + Phủ UI Luxury)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-[#D4AF37]" />
            <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-bold">
              Bộ Sưu Tập Giới Hạn
            </p>
            <span className="w-8 h-px bg-[#D4AF37]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0A192F] uppercase">
            CÁC TÀU XU HƯỚNG HOT NHẤT
          </h2>
        </div>

        {trendingCruises.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium animate-pulse flex flex-col items-center gap-3">
            <Anchor
              className="w-8 h-8 text-[#D4AF37] animate-spin"
              style={{ animationDuration: "3s" }}
            />
            Đang tải danh sách tàu...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {trendingCruises.slice(0, 3).map((cruise: any, index: number) => (
                <motion.div
                  key={cruise.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/cruise/${cruise.id}`)}
                  className="group bg-white flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_20px_40px_rgba(10,25,47,0.1)] transition-all duration-500 border border-slate-100 hover:-translate-y-2 cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cruise.thumbnail || "/images/default_cruise.jpg"}
                      alt={cruise.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/20 to-transparent opacity-90 transition-opacity duration-500"></div>

                    <div className="absolute top-4 right-4 flex gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      {[...Array(cruise.star_rating || 5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]"
                        />
                      ))}
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide drop-shadow-md transform group-hover:-translate-y-1 transition-transform duration-500">
                        {cruise.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1 bg-white">
                    <div className="mb-6 flex-1">
                      <p className="text-[#0A192F] font-bold uppercase tracking-wider text-sm mb-4 flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">
                          {cruise.description
                            ? cruise.description.substring(0, 70) + "..."
                            : "Trải nghiệm đỉnh cao với các dịch vụ chuẩn 5 sao."}
                        </span>
                      </p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">
                          <span className="font-bold text-[#0A192F] block mb-1">
                            Nổi bật:
                          </span>
                          {cruise.amenities && cruise.amenities.length > 0
                            ? cruise.amenities
                                .map((a: any) => a.name)
                                .join(" • ")
                            : "Hồ bơi vô cực • Spa • Ẩm thực cao cấp"}
                        </p>
                      </div>
                    </div>

                    {/* Nút Chi tiết bây giờ chỉ mang tính chất trang trí hoặc hỗ trợ UX */}
                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-end">
                      <div className="flex items-center gap-2 bg-[#0A192F]/5 px-5 py-2.5 rounded-full text-[#0A192F] font-bold uppercase tracking-widest text-xs group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all group/btn">
                        <span>Chi Tiết</span>
                        <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Nút Xem Tất Cả */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-16 flex justify-center"
            >
              <Link
                to="/search"
                className="group flex items-center gap-3 bg-[#0A192F] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all duration-300 shadow-xl hover:-translate-y-1"
              >
                Xem Tất Cả Du Thuyền
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          §4  EXPERIENCE SHOWCASE (Khối tab trải nghiệm bổ sung)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28 overflow-hidden bg-[#0A192F] relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Trải nghiệm độc quyền
              </span>
              <span className="w-8 h-px bg-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-white text-[clamp(2.5rem,4vw,3.5rem)]">
              Cuộc Sống Trên Boong Tàu
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-stretch">
            <div className="lg:w-1/3 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x">
              {EXPERIENCES.map((exp, i) => {
                const Icon = exp.icon;
                const active = activeExp === i;
                return (
                  <button
                    key={exp.title}
                    onClick={() => setActiveExp(i)}
                    className={`flex-1 min-w-[280px] lg:min-w-0 lg:flex-none flex items-start gap-5 p-6 rounded-2xl text-left transition-all duration-300 snap-center border ${active ? "bg-white/5 border-[#D4AF37]/40 shadow-[0_0_30px_rgba(212,175,55,0.1)]" : "bg-transparent border-white/5 hover:bg-white/5"}`}
                  >
                    <div
                      className={`p-3 rounded-xl shrink-0 transition-colors ${active ? "bg-[#D4AF37]" : "bg-[#D4AF37]/10"}`}
                    >
                      <Icon
                        className={`w-6 h-6 ${active ? "text-[#0A192F]" : "text-[#D4AF37]"}`}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-bold text-lg mb-2 transition-colors ${active ? "text-white" : "text-slate-400"}`}
                      >
                        {exp.title}
                      </div>
                      {active && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-slate-300 leading-relaxed"
                        >
                          {exp.desc}
                        </motion.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="lg:w-2/3 relative rounded-3xl overflow-hidden min-h-[450px] shadow-2xl border border-white/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeExp}
                  src={EXPERIENCES[activeExp].image}
                  alt={EXPERIENCES[activeExp].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="font-serif text-white text-3xl mb-3">
                  {EXPERIENCES[activeExp].title}
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed max-w-xl">
                  {EXPERIENCES[activeExp].desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §5  ABOUT US & POLICIES (Giữ nguyên text + ảnh của bạn)
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-[#D4AF37]/10 transform -rotate-2 rounded-3xl border border-[#D4AF37]/20 hidden md:block"></div>
              <img
                src="/images/Aboutus_images_home.jpg"
                alt="Heritage"
                className="relative z-10 w-full rounded-2xl object-cover shadow-2xl aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-[#0A192F] text-white p-8 z-20 shadow-2xl rounded-2xl max-w-xs border border-[#D4AF37]/30">
                <p className="font-serif text-5xl text-[#D4AF37] mb-2">20+</p>
                <p className="text-sm uppercase tracking-widest font-light text-slate-300">
                  Năm Kiến Tạo <br />
                  Kỳ Nghỉ Hoàn Mỹ
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Di Sản & Định Hướng
                </span>
              </div>
              <h2 className="text-[clamp(2.2rem,3.5vw,3.2rem)] font-serif font-bold text-[#0A192F] mb-8 leading-tight">
                VỀ CHÚNG TÔI & <br />
                <span className="text-[#D4AF37]">CAM KẾT CỦA CHÚNG TÔI</span>
              </h2>
              <div className="text-lg text-slate-600 font-light mb-12 leading-relaxed">
                <p>
                  Hơn 20 năm kiên trì theo đuổi sự hoàn hảo, chúng tôi mang đến
                  những kỳ nghỉ 5 sao cá nhân hóa, nơi mỗi chi tiết đều được
                  chăm chút tỉ mỉ. Không chỉ là một chuyến đi, chúng tôi kiến
                  tạo một trải nghiệm sống đỉnh cao trên đại dương.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    icon: Calendar,
                    title: "Chính sách Đặt phòng",
                    desc: "Đơn giản & nhanh chóng.",
                  },
                  {
                    icon: Clock,
                    title: "Chính sách Hủy chuyến",
                    desc: "Linh hoạt cho mọi hành trình.",
                  },
                  {
                    icon: PawPrint,
                    title: "Chính sách Thú cưng",
                    desc: "Chấp nhận thú cưng nhỏ.",
                  },
                  {
                    icon: Baby,
                    title: "Chính sách Trẻ em",
                    desc: "Ưu đãi cho gia đình & trẻ em.",
                  },
                ].map((p, i) => (
                  <div
                    key={p.title}
                    className="flex items-start gap-4 p-5 bg-[#F8F9FA] border border-slate-100 rounded-xl hover:border-[#D4AF37]/30 hover:shadow-lg transition-all group"
                  >
                    <div className="p-3 bg-white shadow-sm rounded-xl shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                      <p.icon className="w-5 h-5 text-[#D4AF37] group-hover:text-[#0A192F]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0A192F] mb-1 text-sm">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §6  TESTIMONIALS (Cảm nhận khách hàng - UI Kính mờ)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 bg-[#0A192F] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Cảm nhận từ khách hàng
              </span>
              <span className="w-8 h-px bg-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-white text-[clamp(2.5rem,4vw,3.5rem)]">
              Những Câu Chuyện Thật
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="relative p-8 rounded-3xl flex flex-col bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group"
              >
                <Quote className="w-10 h-10 mb-6 text-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="text-slate-200 leading-relaxed mb-8 flex-1 text-[15px] italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-1.5 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#D4AF37] text-[#0A192F] font-bold text-lg shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm tracking-wide">
                      {t.name}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          §7  NEWSLETTER CTA (Form nhận tin khuyết cuối trang)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto -translate-y-12 relative z-20">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="./images/Banner.avif"
            alt="Newsletter"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A192F]/85 backdrop-blur-sm" />

          <div className="relative p-12 md:p-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Ưu đãi độc quyền
              </span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-white mb-6 text-[clamp(2.2rem,4vw,3rem)] leading-tight">
              Nhận Ưu Đãi Trước Mọi Người
            </h2>
            <p className="text-slate-300 mb-10 max-w-xl mx-auto text-lg">
              Đăng ký nhận bản tin để không bỏ lỡ các chương trình khuyến mãi
              sớm và hành trình mới.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-md"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                className="flex-1 px-6 py-4 rounded-full text-sm font-medium focus:outline-none bg-transparent text-white placeholder-slate-300"
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest text-[#0A192F] whitespace-nowrap bg-gradient-to-r from-[#D4AF37] to-[#e8c84a] hover:scale-105 transition-transform"
              >
                <Link to="/signup" className="flex items-center gap-2">
                  Đăng Ký
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
