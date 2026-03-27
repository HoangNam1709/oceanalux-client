import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calendar, Users, MapPin, ChevronRight, Star, Clock, PawPrint, Baby } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { echo } from "../lib/echo";

export function HomePage() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState("");
  
  // 1. State chứa dữ liệu thật
  const [trendingCruises, setTrendingCruises] = useState<any[]>([]);

  // 2. Lấy dữ liệu ban đầu từ API
  useEffect(() => {
    axios.get('http://localhost/api/cruises')
      .then(response => {
        setTrendingCruises(response.data.data);
      })
      .catch(error => console.error("Lỗi lấy danh sách tàu:", error));
  }, []);
  // 3. Gọi API khi trang chủ vừa load
  useEffect(() => {
    axios.get('http://localhost/api/cruises')
      .then(response => {
        setTrendingCruises(response.data.data);
      })
      .catch(error => {
        console.error("Lỗi lấy danh sách tàu:", error);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?dest=${destination}`);
  };

  return (
    <div className="w-full bg-[#F8F9FA] font-sans">
      
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src=".\images\Banner.avif"
            alt="Luxury Cruise"
            className="w-full h-full object-cover object-center scale-105 motion-safe:animate-pulse"
          />
          <div className="absolute inset-0 bg-[#0A192F]/40 mix-blend-multiply"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-lg font-serif mb-6"
          >
            A Journey Beyond <span className="text-[#D4AF37] italic font-medium">Extraordinary</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl font-light drop-shadow"
          >
            Discover the world's most pristine waters with unmatched luxury, personalized service, and unforgettable experiences.
          </motion.p>

          {/* Search Bar Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 md:p-3 relative"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative flex items-center border border-slate-200 rounded-xl px-4 py-3 md:py-4 bg-white hover:border-[#D4AF37] transition-colors group focus-within:ring-2 focus-within:ring-[#D4AF37]/50 focus-within:border-[#D4AF37]">
                <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-[#D4AF37] shrink-0" />
                <div className="ml-3 flex flex-col w-full text-left">
                  <label className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">Destination</label>
                  <input
                    type="text"
                    placeholder="Where to?"
                    className="w-full text-sm md:text-base font-medium text-slate-900 focus:outline-none bg-transparent placeholder-slate-400 truncate"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 relative flex items-center border border-slate-200 rounded-xl px-4 py-3 md:py-4 bg-white hover:border-[#D4AF37] transition-colors group focus-within:ring-2 focus-within:ring-[#D4AF37]/50 focus-within:border-[#D4AF37]">
                <Calendar className="w-5 h-5 text-slate-400 group-focus-within:text-[#D4AF37] shrink-0" />
                <div className="ml-3 flex flex-col w-full text-left">
                  <label className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</label>
                  <input
                    type="text"
                    placeholder="When?"
                    className="w-full text-sm md:text-base font-medium text-slate-900 focus:outline-none bg-transparent placeholder-slate-400 truncate"
                    value={dates}
                    onChange={(e) => setDates(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 relative flex items-center border border-slate-200 rounded-xl px-4 py-3 md:py-4 bg-white hover:border-[#D4AF37] transition-colors group focus-within:ring-2 focus-within:ring-[#D4AF37]/50 focus-within:border-[#D4AF37]">
                <Users className="w-5 h-5 text-slate-400 group-focus-within:text-[#D4AF37] shrink-0" />
                <div className="ml-3 flex flex-col w-full text-left">
                  <label className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">Guests</label>
                  <input
                    type="text"
                    placeholder="Who's sailing?"
                    className="w-full text-sm md:text-base font-medium text-slate-900 focus:outline-none bg-transparent placeholder-slate-400 truncate"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-xl px-8 py-3 md:py-4 font-semibold transition-all duration-300 shadow-md flex items-center justify-center shrink-0 min-w-[120px]"
              >
                <span>Search</span>
                <Search className="w-5 h-5 ml-2" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Trending Cruises Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-bold mb-4">Bộ Sưu Tập Giới Hạn</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0A192F] uppercase">CÁC TÀU XU HƯỚNG HOT NHẤT</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 3. Đổ dữ liệu thật từ Database ra màn hình */}
          {trendingCruises.map((cruise: any) => (
            <div key={cruise.id} className="group bg-white flex flex-col rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100">
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* Dùng ảnh mặc định tạm thời để giữ layout đẹp */}
                <img
                  src="https://images.unsplash.com/photo-1764132271511-61fdd16918ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjcnVpc2UlMjBzaGlwJTIwaW4lMjBzb3V0aGVhc3QlMjBhc2lhfGVufDF8fHx8MTc3MzgzMjM1M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt={cruise.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-transparent to-transparent opacity-80"></div>
                
                {/* Hiển thị số sao lấy từ Database */}
                <div className="absolute top-4 right-4 flex gap-1 bg-white/90 px-3 py-1.5 rounded-sm">
                  {[...Array(cruise.star_rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-serif font-bold text-white mb-2 tracking-wide drop-shadow-md">
                    {cruise.name}
                  </h3>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1 bg-white">
                <div className="mb-6">
                  <p className="text-[#0A192F] font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block"></span>
                    Mô tả: {cruise.description ? cruise.description.substring(0, 50) + '...' : 'Đang cập nhật'}
                  </p>
                  <p className="text-slate-500 font-light italic">
                    Nổi bật: {cruise.amenities && cruise.amenities.length > 0 
                      ? cruise.amenities.map((a: any) => a.name).join(', ') 
                      : 'Các dịch vụ chuẩn 5 sao'}
                  </p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <Link
                    to={`/cruise/${cruise.id}`}
                    className="flex items-center justify-between text-[#0A192F] font-bold uppercase tracking-widest text-sm hover:text-[#D4AF37] transition-colors group/btn"
                  >
                    <span>Xem Chi Tiết</span>
                    <ChevronRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
     {/* About Us & Policies */}
      <section className="bg-white py-24 border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Image & Decorative Elements */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[#D4AF37] transform rotate-2 rounded-sm opacity-20 hidden md:block"></div>
              <img
                src="/images/Aboutus_images_home.jpg"
                alt="Founder & Ship Heritage"
               
              />
              <div className="absolute bottom-[-10%] right-[-10%] bg-[#0A192F] text-white p-8 md:p-12 z-20 shadow-2xl max-w-xs border border-[#D4AF37]/30">
                <p className="font-serif text-5xl text-[#D4AF37] mb-2">20+</p>
                <p className="text-sm uppercase tracking-widest font-light">Năm Kiến Tạo <br/>Kỳ Nghỉ Hoàn Mỹ</p>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col">
              <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-bold mb-4">Di Sản & Định Hướng</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0A192F] mb-10 leading-tight">
                VỀ CHÚNG TÔI & <br/>CAM KẾT CỦA CHÚNG TÔI
              </h2>

              <div className="prose prose-lg text-slate-600 font-light mb-12">
                <p>
                  Hơn 20 năm kiên trì theo đuổi sự hoàn hảo, chúng tôi mang đến những kỳ nghỉ 5 sao cá nhân hóa, nơi mỗi chi tiết đều được chăm chút tỉ mỉ. Không chỉ là một chuyến đi, chúng tôi kiến tạo một trải nghiệm sống đỉnh cao trên đại dương. Khám phá di sản của chúng tôi và cách chúng tôi định nghĩa lại sự sang trọng.
                </p>
              </div>

              {/* Policies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-4 p-6 bg-[#F8F9FA] rounded-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-white shadow-sm rounded-full shrink-0">
                    <Calendar className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A192F] mb-1">Chính sách Đặt phòng</h4>
                    <p className="text-sm text-slate-500 font-light">Đơn giản & nhanh chóng.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-[#F8F9FA] rounded-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-white shadow-sm rounded-full shrink-0">
                    <Clock className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A192F] mb-1">Chính sách Hủy chuyến</h4>
                    <p className="text-sm text-slate-500 font-light">Chính sách linh hoạt cho mọi hành trình.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-[#F8F9FA] rounded-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-white shadow-sm rounded-full shrink-0">
                    <PawPrint className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A192F] mb-1">Chính sách Thú cưng</h4>
                    <p className="text-sm text-slate-500 font-light">Chấp nhận thú cưng nhỏ, vui lòng đặt trước.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-[#F8F9FA] rounded-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-white shadow-sm rounded-full shrink-0">
                    <Baby className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A192F] mb-1">Chính sách Trẻ em</h4>
                    <p className="text-sm text-slate-500 font-light">Ưu đãi cho gia đình & câu lạc bộ trẻ em.</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}