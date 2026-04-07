import React from "react";
import { motion } from "framer-motion";
import { Gift, Clock, Tag, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function OffersPage() {
  const navigate = useNavigate();

  // DỮ LIỆU CỨNG CHO CÁC GÓI ƯU ĐÃI
  const promotions = [
    {
      id: 1,
      title: "Kỳ Nghỉ Trăng Mật Hoàn Hảo",
      discount: "Giảm 20%",
      image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1000&auto=format&fit=crop",
      tag: "Cặp đôi",
      desc: "Tận hưởng không gian lãng mạn bậc nhất với rượu vang sủi bối, hoa hồng trang trí phòng và bữa tối dưới ánh nến trên boong tàu. Dành riêng cho các cặp đôi mới cưới.",
      validUntil: "31/12/2026",
      code: "HONEYMOON20"
    },
    {
      id: 2,
      title: "Đại Tiệc Mùa Hè Rực Rỡ",
      discount: "Mua 3 Tặng 1",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop",
      tag: "Gia đình",
      desc: "Lên kế hoạch cho kỳ nghỉ gia đình trọn vẹn. Khi đặt 3 vé người lớn, bạn sẽ được miễn phí 1 vé trẻ em (dưới 12 tuổi) kèm các hoạt động giải trí trên tàu.",
      validUntil: "31/08/2026",
      code: "SUMMERFAMILY"
    },
    {
      id: 3,
      title: "Trải Nghiệm Bay Thủy Phi Cơ",
      discount: "Tặng Gói Bay 15'",
      image: "https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=1000&auto=format&fit=crop",
      tag: "Độc quyền",
      desc: "Ngắm trọn vẹn kỳ quan Vịnh Hạ Long từ trên cao. Miễn phí gói bay thủy phi cơ 15 phút khi đặt hạng phòng President Suite (tối thiểu 2 đêm).",
      validUntil: "Không thời hạn",
      code: "VIPFLIGHT"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* HEADER SECTION */}
      <section className="bg-slate-900 py-20 px-4 relative overflow-hidden">
        {/* Background Blur Effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-4">
              <span className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase flex items-center gap-2 border border-amber-500/20">
                <Sparkles className="w-4 h-4" /> Đặc Quyền Khách Hàng
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Ưu Đãi & Khuyến Mãi
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Khám phá các gói ưu đãi độc quyền được thiết kế riêng để nâng tầm trải nghiệm du ngoạn của bạn cùng OceanaLux.
            </p>
          </motion.div>
        </div>
      </section>

      {/* OFFERS LIST */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          {promotions.map((promo, index) => (
            <motion.div 
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row group"
            >
              {/* Cột Ảnh */}
              <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden shrink-0">
                <img 
                  src={promo.image} 
                  alt={promo.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">
                  <Tag className="w-4 h-4" /> {promo.discount}
                </div>
              </div>

              {/* Cột Nội Dung */}
              <div className="p-8 md:p-10 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
                    {promo.tag}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                    <Clock className="w-4 h-4" /> HSD: {promo.validUntil}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">
                  {promo.title}
                </h2>
                
                <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                  {promo.desc}
                </p>

                <div className="mt-auto flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="w-full sm:w-auto bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mã Code</span>
                    <span className="font-mono font-bold text-slate-900 text-lg">{promo.code}</span>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/search')}
                    className="w-full sm:w-auto flex-1 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-sm flex items-center justify-center gap-2 group/btn"
                  >
                    Dùng Ngay <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="bg-amber-50 py-16 text-center px-4 border-t border-amber-100">
        <div className="max-w-2xl mx-auto">
          <Gift className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Nhận Thêm Nhiều Đặc Quyền?</h3>
          <p className="text-slate-600 mb-8">
            Đăng ký thành viên OceanaLux ngay hôm nay để nhận thông báo sớm nhất về các chương trình Flash Sale và tích điểm đổi chuyến đi.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="text-amber-700 font-bold uppercase tracking-wider text-sm border-b-2 border-amber-500 pb-1 hover:text-amber-600 transition-colors"
          >
            Đăng Ký Tài Khoản Mới
          </button>
        </div>
      </section>

    </div>
  );
}