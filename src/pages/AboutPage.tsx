import React from "react";
import { motion } from "framer-motion";
import { Anchor, Compass, Shield, Users, Award, Ship } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AboutPage() {
  const navigate = useNavigate();

  // DỮ LIỆU CỨNG (HARD-CODED) - Không cần gọi API
  const stats = [
    { id: 1, number: "10+", label: "Du Thuyền 5 Sao" },
    { id: 2, number: "50,000+", label: "Khách Hàng Hài Lòng" },
    { id: 3, number: "15+", label: "Năm Kinh Nghiệm" },
    { id: 4, number: "100%", label: "An Toàn Tuyệt Đối" },
  ];

  const features = [
    {
      icon: Compass,
      title: "Hành Trình Độc Bản",
      desc: "Chúng tôi thiết kế những hải trình riêng biệt, đưa bạn đến những góc khuất tuyệt đẹp của Vịnh Hạ Long mà ít nơi nào có được."
    },
    {
      icon: Award,
      title: "Dịch Vụ Đẳng Cấp",
      desc: "Đội ngũ nhân viên được đào tạo theo tiêu chuẩn khách sạn quốc tế, cam kết mang lại trải nghiệm hoàng gia cho mọi du khách."
    },
    {
      icon: Shield,
      title: "Cam Kết Bền Vững",
      desc: "OceanaLux tiên phong trong việc du lịch xanh, hạn chế rác thải nhựa và bảo tồn hệ sinh thái biển quý giá của Việt Nam."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* HERO SECTION - Ảnh bìa lớn */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Lớp phủ mờ (Overlay) */}
        <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
        {/* Ảnh nền */}
        <div 
         className="absolute inset-0 bg-cover bg-center z-0"
         style={{ backgroundImage: "url('/images/billy-pasco-F5oj6SYoarc-unsplash.jpg')" }}
        ></div>
        
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Định Nghĩa Lại Sự Xa Hoa</h1>
            <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed max-w-2xl mx-auto">
              Hành trình của chúng tôi bắt đầu từ tình yêu mãnh liệt với biển cả và khát vọng mang đến những trải nghiệm du ngoạn hoàn mỹ nhất tại Vịnh Hạ Long.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CÂU CHUYỆN THƯƠNG HIỆU */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8"
          >
            <div className="flex items-center gap-3 text-amber-600 font-bold uppercase tracking-widest text-sm">
              <Anchor className="w-5 h-5" />
              <span>Câu Chuyện Của NamOcen</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 leading-tight">
              Hơn cả một chuyến đi, <br /> đó là một <span className="text-amber-500">di sản</span>.
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Được thành lập vào năm 2010, OceanaLux khởi đầu với một chiếc thuyền gỗ nhỏ. Trải qua hơn một thập kỷ, chúng tôi đã vươn mình trở thành đội tàu du lịch sang trọng bậc nhất Vịnh Bắc Bộ. 
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              Mỗi chiếc du thuyền của chúng tôi không chỉ là một kiệt tác kỹ thuật số, mà còn là một bảo tàng nổi tôn vinh nét đẹp văn hóa truyền thống Việt Nam kết hợp cùng sự tiện nghi hiện đại của phương Tây.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="absolute inset-0 bg-amber-500 translate-x-4 translate-y-4 rounded-3xl -z-10"></div>
            <img 
              src="https://catba.com.vn/pic/PhotoAlbum/536_637630821673513621_HasThumb.jpg" 
              alt="Luxury Dining" 
              className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
            />
          </motion.div>
        </div>
      </section>

      {/* THỐNG KÊ (STATS) */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-800">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center px-4"
              >
                <div className="text-4xl md:text-5xl font-serif font-bold text-amber-500 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GIÁ TRỊ CỐT LÕI */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-16">Tại Sao Chọn Chúng Tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-500">
                  <feature.icon className="w-10 h-10 text-slate-900 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION (CTA) */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Ship className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Bạn Đã Sẵn Sàng Vươn Khơi?</h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            Hãy để chúng tôi biến kỳ nghỉ trong mơ của bạn thành hiện thực. Đặt phòng ngay hôm nay để nhận những ưu đãi đặc biệt nhất.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg hover:-translate-y-1"
          >
            Tìm Du Thuyền Ngay
          </button>
        </div>
      </section>

    </div>
  );
}