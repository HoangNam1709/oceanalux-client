import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { Star, MapPin, Clock, ShieldCheck, Check, Anchor, Info, Calendar as CalIcon, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export function CruiseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook để điều hướng thủ công
  
  const [cruise, setCruise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // LOGIC KIỂM TRA ĐĂNG NHẬP KHI BẤM ĐẶT PHÒNG
  const handleBooking = (cabinId: number) => {
  // Giả sử bạn lưu trạng thái đăng nhập trong localStorage hoặc Context
  const token = localStorage.getItem('token'); 

  if (!token) {
    // Nếu chưa đăng nhập, đá sang trang Login kèm theo "vết tích" để quay lại
    alert("Vui lòng đăng nhập để thực hiện đặt phòng!");
    navigate(`/login?redirect=/checkout?cruise=${id}&cabin=${cabinId}`);
    return;
  }

  // Nếu đã đăng nhập, cho đi tiếp sang trang Checkout
  navigate(`/checkout?cruise=${id}&cabin=${cabinId}`);
};
  // 2. Gọi API lấy dữ liệu chi tiết tàu
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

  // Hiệu ứng Loading 5 sao
  if (loading) return <div className="p-20 text-center text-xl font-serif text-slate-800">Đang chuẩn bị hành trình 5 sao...</div>;
  if (!cruise) return <div className="p-20 text-center text-xl text-red-500">Không tìm thấy du thuyền.</div>;

  // Tính giá thấp nhất từ các hạng phòng để hiển thị ở cột phải
  const basePrice = cruise.cabin_classes && cruise.cabin_classes.length > 0 
    ? Math.min(...cruise.cabin_classes.map((c: any) => c.price)) 
    : 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-slate-900">
        {/* Tạm dùng ảnh tĩnh trong thư mục public của bạn */}
        <img 
          src="/images/tau-1.jpg" 
          alt={cruise.name} 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1080&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-400 font-semibold text-sm uppercase tracking-widest">
              <MapPin className="w-4 h-4" /> Vịnh Hạ Long, Việt Nam
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
                <span className="font-medium text-lg">3 Ngày / 2 Đêm</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column - Details */}
        <div className="lg:w-2/3">
          {/* Tabs Navigation */}
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
                className={`flex items-center gap-2 pb-4 text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors relative ${
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

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <section>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Thư viện hình ảnh</h3>
                  
                  {cruise.images && cruise.images.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {/* 1. Ảnh chính (To, hiển thị ảnh đang được chọn) */}
                      <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-md">
                        <img 
                          src={cruise.images[activeImageIndex]?.image_url} 
                          alt="Main Gallery" 
                          className="w-full h-full object-cover transition-opacity duration-500"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1080&auto=format&fit=crop"; }}
                        />
                      </div>
                      
                      {/* 2. Danh sách ảnh nhỏ (Thumbnails) nằm ngang */}
                      <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                        {cruise.images.map((img: any, index: number) => (
                          <button 
                            key={img.id}
                            onClick={() => setActiveImageIndex(index)}
                            className={`shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                              activeImageIndex === index 
                                ? 'border-amber-500 opacity-100 shadow-lg scale-105' 
                                : 'border-transparent opacity-50 hover:opacity-100'
                            }`}
                          >
                            <img 
                              src={img.image_url} 
                              alt={`Thumbnail ${index}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1080&auto=format&fit=crop"; }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic p-8 bg-white rounded-xl border border-slate-100 text-center">
                      Đang cập nhật hình ảnh...
                    </p>
                  )}
                </section>
                <section>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Dịch vụ & Tiện ích tiêu chuẩn</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Map dữ liệu từ bảng amenities */}
                    {cruise.amenities && cruise.amenities.map((fac: any) => (
                      <div key={fac.id} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-800">{fac.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'itinerary' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Lịch trình chuyến đi</h3>
                
                {cruise.itineraries && cruise.itineraries.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {cruise.itineraries.map((day: any) => {
                      // Xử lý chuỗi JSON activities từ Database
                      const actList = typeof day.activities === 'string' ? JSON.parse(day.activities) : (day.activities || []);
                      
                      return (
                        <div key={day.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-amber-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                            {day.day_number}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="text-lg font-bold text-slate-900 mb-1">{day.location}</h4>
                            <p className="text-slate-600 mb-4">{day.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {actList.map((act: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100">
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-8 bg-white rounded-xl border border-slate-100 text-center">
                    Lịch trình chi tiết đang được cập nhật.
                  </p>
                )}
              </motion.div>
            )}

            {activeTab === 'cabins' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Chọn không gian nghỉ dưỡng</h3>
                {cruise.cabin_classes && cruise.cabin_classes.length > 0 ? (
                  <div className="grid gap-6">
                    {/* Map dữ liệu từ bảng cabin_classes */}
                    {cruise.cabin_classes.map((cabin: any) => (
                      <div key={cabin.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col md:flex-row">
                        <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                          <img 
                            src={cabin.image_url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1080&auto=format&fit=crop"} 
                            alt={cabin.name} 
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900">
                            HẠNG SANG
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold font-serif text-slate-900 mb-1">{cabin.name}</h4>
                              <div className="text-sm text-slate-500 flex items-center gap-2">
                                <CalIcon className="w-4 h-4" /> Tiêu chuẩn: {cabin.capacity} khách
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cabin.price)}
                              </span>
                              <span className="text-xs text-slate-500 block uppercase">/ đêm</span>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${cabin.available_rooms > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className={`text-sm font-semibold ${cabin.available_rooms > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {cabin.available_rooms > 0 ? `Còn ${cabin.available_rooms} phòng` : 'Hết phòng'}
                              </span>
                            </div>
                            {/* Nút Đặt phòng: Truyền luôn ID của tàu và ID của hạng phòng */}
                            <button
                            onClick={() => handleBooking(cabin.id)}
                            disabled={cabin.available_rooms === 0}
                            className={` w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
    ${
      cabin.available_rooms > 0 
        ? 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 hover:-translate-y-1 shadow-slate-900/20 active:scale-95' 
        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
    }
  `}
>
  {cabin.available_rooms > 0 ? (
    <>
      <span>Đặt Phòng Này</span>
      <Anchor className="w-5 h-5" /> 
    </>
  ) : (
    'Hết Phòng'
  )}
</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-8 bg-white rounded-xl border border-slate-100 text-center">Đang cập nhật hạng phòng.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-6">
                  {cruise.reviews && cruise.reviews.length > 0 ? cruise.reviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                            {/* Lấy chữ cái đầu tiên của tên */}
                            {review.user?.name ? review.user.name.charAt(0) : 'K'}
                          </div>
                          <div>
                            {/* Tên khách hàng thật từ Database */}
                            <h5 className="font-bold text-slate-900">{review.user?.name || 'Khách hàng ẩn danh'}</h5>
                            {/* Đổi định dạng ngày giờ chuẩn Việt Nam */}
                            <span className="text-xs text-slate-500">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <div className="flex">
                          {/* In số sao khách chấm */}
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 italic">"{review.comment}"</p>
                    </div>
                  )) : (
                    <p className="text-slate-500 italic p-8 bg-white rounded-xl border border-slate-100 text-center">Chưa có đánh giá nào cho chuyến đi này.</p>
                  )}
                </div>
                <p className="text-slate-500 italic p-8 bg-white rounded-xl border border-slate-100 text-center">Chưa có đánh giá nào cho chuyến đi này.</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column - Booking Summary Card */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sticky top-32">
            <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif">Tóm tắt hành trình</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Giá chỉ từ</span>
                <span className="text-2xl font-bold text-amber-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Thời gian</span>
                <span className="font-semibold text-slate-800">3 Ngày 2 Đêm</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cảng khởi hành</span>
                <span className="font-semibold text-slate-800">Cảng Tuần Châu</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('cabins')}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group"
            >
              Xem Hạng Phòng <Anchor className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>

            <p className="text-xs text-center text-slate-500 mt-4">
              Cam kết giá tốt nhất. Phí dịch vụ cảng sẽ được tính ở bước thanh toán.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}