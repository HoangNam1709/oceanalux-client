import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from "yet-another-react-lightbox";

import { Users, Maximize2, ChevronLeft, ChevronRight, Anchor, Layout, Layers, CheckCircle2 } from 'lucide-react';

export const CabinCard = ({ cabin, onBooking }: { cabin: any, onBooking: any }) => {
    const [currentImg, setCurrentImg] = useState(0);
    const [openLightbox, setOpenLightbox] = useState(false);

    const images = cabin.images || [];
    const amenities = cabin.amenities || [];
    
    // Tạo danh sách ảnh cho Lightbox
    const slides = images.length > 0 
        ? images.map((img: any) => ({ src: img.image_url })) 
        : [{ src: cabin.image_url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a" }];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImg((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col md:flex-row hover:shadow-md transition-all duration-300 group/card relative">
            
            {/* KHỐI ẢNH BÊN TRÁI (SLIDER) */}
            <div className="w-full md:w-80 h-56 md:h-auto relative overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImg}
                        src={images[currentImg]?.image_url || cabin.image_url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a"}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setOpenLightbox(true)}
                    />
                </AnimatePresence>

                {/* Nút Phóng to */}
                <button 
                    onClick={() => setOpenLightbox(true)}
                    className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover/card:opacity-100"
                >
                    <Maximize2 size={16} />
                </button>

                {/* Nút Chuyển Ảnh */}
                {images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-slate-900 rounded-full shadow opacity-0 group-hover/card:opacity-100 transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-slate-900 rounded-full shadow opacity-0 group-hover/card:opacity-100 transition-all">
                            <ChevronRight size={20} />
                        </button>
                        
                        {/* Chỉ số ảnh (Dots) */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_: any, idx: number) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${currentImg === idx ? 'bg-white w-4' : 'bg-white/50'}`} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* KHỐI THÔNG TIN BÊN PHẢI */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">{cabin.name}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Users size={16} className="text-slate-400" /> {cabin.capacity} khách
                                </span>
                                {/* THÔNG TIN DIỆN TÍCH & TẦNG (Lấy từ DB) */}
                                <span className="flex items-center gap-1.5">
                                    <Layout size={16} className="text-slate-400" /> {cabin.area || '28'} m²
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Layers size={16} className="text-slate-400" /> Tầng {cabin.deck || '2'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('vi-VN').format(cabin.price)}đ
                            </div>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">/ đêm</span>
                        </div>
                    </div>

                    {/* LỢI ÍCH / TIỆN ÍCH PHÒNG (Dàn hàng ngang) */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
                        {amenities.slice(0, 4).map((amt: any) => (
                            <div key={amt.id} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                <CheckCircle2 size={12} className="text-green-500" />
                                {amt.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Còn {cabin.available_rooms} phòng
                    </div>
                    
                    <button
                        onClick={() => onBooking(cabin.id)}
                        disabled={cabin.available_rooms === 0}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
                            cabin.available_rooms > 0 
                            ? 'bg-[#0A192F] text-white hover:bg-amber-500 hover:text-slate-900 hover:shadow-amber-200' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {cabin.available_rooms > 0 ? (<>Đặt Phòng <Anchor size={16} /></>) : 'Hết phòng'}
                    </button>
                </div>
            </div>

            {/* LIGHTBOX XEM FULL ẢNH */}
            <Lightbox
  open={openLightbox}
  close={() => setOpenLightbox(false)}
  slides={slides}
  index={currentImg}
  // Quan trọng: Đưa nó ra ngoài cùng body để tránh lỗi layout
  portal={{ root: document.body }} 
  // Thêm plugin để hỗ trợ vuốt, zoom nếu cần
  // plugins={[Fullscreen, Zoom, Thumbnails]} 
  styles={{
    container: { 
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      zIndex: 9999 
    }
  }}
/>
        </div>
    );
};