import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { Star, MapPin, Clock, ShieldCheck, Check, Anchor, Info, Calendar as CalIcon, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { CabinCard } from "./CabinCard"; // Đảm bảo file này nằm cùng thư mục
import { echo } from "../echo"; 

export function CruiseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  
  const [cruise, setCruise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // GỌI API LẤY DỮ LIỆU
  useEffect(() => {
    axios.get(`http://localhost/api/cruises/${id}`)
      .then(response => {
        setCruise(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi lấy chi tiết tàu:", error);
        setLoading(false);
      });
  }, [id]);

  // LOGIC REAL-TIME
  useEffect(() => {
    if (!cruise || !echo) return;

    const channel = echo.channel('rooms')
      .listen('.RoomReleased', (e: any) => {
        setCruise((prevCruise: any) => {
          if (!prevCruise) return prevCruise;
          return {
            ...prevCruise,
            cabin_classes: prevCruise.cabin_classes.map((cabin: any) => 
              cabin.id === e.cabinClassId 
                ? { ...cabin, available_rooms: e.availableRooms } 
                : cabin
            )
          };
        });
      });

    return () => { echo.leave('rooms'); };
  }, [cruise]); 

  const handleBooking = (cabinId: number) => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện đặt phòng!");
      navigate(`/login?redirect=/checkout?cruise=${id}&cabin=${cabinId}`);
      return;
    }
    navigate(`/checkout?cruise=${id}&cabin=${cabinId}`);
  };

  if (loading) return <div className="p-20 text-center text-xl font-serif text-slate-800">Đang chuẩn bị hành trình 5 sao...</div>;
  if (!cruise) return <div className="p-20 text-center text-xl text-red-500">Không tìm thấy du thuyền.</div>;

  const basePrice = cruise.cabin_classes?.length > 0 
    ? Math.min(...cruise.cabin_classes.map((c: any) => c.price || 0)) 
    : 0;

  return (
    // FIX 1: Thêm relative ở đây
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
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="flex items-center gap-3 text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">
            <MapPin className="w-4 h-4" /> {cruise.destination  || "Vịnh Hạ Long"},Việt Nam 
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
              {cruise.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-slate-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-medium text-lg">{cruise.star_rating} Sao Đẳng Cấp</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-lg"> {cruise.duration_days} Ngày / {cruise.duration_nights} Đêm</span>
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
              { id: 'overview', icon: Info, label: 'Tổng quan' },
              { id: 'itinerary', icon: Anchor, label: 'Lịch trình' },
              { id: 'cabins', icon: ShieldCheck, label: 'Hạng Phòng' },
              { id: 'reviews', icon: MessageSquare, label: 'Đánh giá' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-semibold uppercase tracking-wider relative transition-all ${
                  activeTab === tab.id ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <section>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Thư viện hình ảnh</h3>
                  {cruise.images?.length > 0 ? (
                    <div className="space-y-4">
                      <div className="w-full h-[450px] rounded-3xl overflow-hidden shadow-lg border border-white">
                        <img 
                          src={cruise.images[activeImageIndex]?.image_url} 
                          className="w-full h-full object-cover" 
                          alt="Cruise Gallery"
                        />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {cruise.images.map((img: any, idx: number) => (
                          <button 
                            key={img.id} 
                            onClick={() => setActiveImageIndex(idx)}
                            className={`shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                              activeImageIndex === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-60'
                            }`}
                          >
                            <img src={img.image_url} className="w-full h-full object-cover" alt="thumb" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : <p className="italic text-slate-400">Đang cập nhật hình ảnh...</p>}
                </section>

                <section>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Tiện ích nổi bật</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cruise.amenities?.map((fac: any) => (
                      <div key={fac.id} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                           <Check className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">{fac.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* CABINS TAB */}
            {activeTab === 'cabins' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900">Chọn không gian nghỉ dưỡng</h3>
                <div className="grid gap-8">
                  {cruise.cabin_classes?.map((cabin: any) => (
                    <CabinCard key={cabin.id} cabin={cabin} onBooking={handleBooking} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ITINERARY TAB */}
            {activeTab === 'itinerary' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Lịch trình chi tiết</h3>
                  <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-12">
                    {cruise.itineraries?.map((day: any) => (
                      <div key={day.id} className="relative">
                        <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow-sm" />
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                           <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Ngày {day.day_number}</span>
                           <h4 className="text-xl font-bold text-slate-900 mt-1 mb-3">{day.location}</h4>
                           <p className="text-slate-600 leading-relaxed">{day.description}</p>
                           <div className="flex flex-wrap gap-2 mt-4">
                              {JSON.parse(day.activities || '[]').map((act: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs border border-slate-100">{act}</span>
                              ))}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
                  {cruise.reviews?.map((review: any) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                            {review.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{review.user?.name}</div>
                            <div className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex text-amber-500 gap-0.5">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                      </div>
                      <p className="text-slate-600 italic">"{review.comment}"</p>
                    </div>
                  ))}
               </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sticky top-32">
            <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif text-center">Tóm tắt hành trình</h3>
            <div className="space-y-5 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-400">Giá thấp nhất từ</span>
                <span className="text-2xl font-bold text-amber-600">
                  {new Intl.NumberFormat('vi-VN').format(basePrice)}đ
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-400 text-sm">Thời lượng</span>
                <span className="font-semibold text-slate-800">3 Ngày 2 Đêm</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-400 text-sm">Điểm đi/về</span>
                <span className="font-semibold text-slate-800 text-sm">Cảng Tuần Châu</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('cabins')}
              className="w-full bg-[#0A192F] text-white py-4 rounded-2xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              CHỌN PHÒNG NGAY <Anchor className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed uppercase tracking-widest font-bold">
              Cam kết giá tốt nhất • Thanh toán an toàn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}