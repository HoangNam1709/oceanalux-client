  import React, { useState, useEffect } from "react";
  import { useSearchParams, useNavigate } from "react-router-dom"; // Sửa lại thành react-router-dom
  import { CreditCard, Wallet, Smartphone, ShieldCheck, Tag, Ticket, HelpCircle, CheckCircle, Clock } from "lucide-react";
  import { motion } from "framer-motion"; // Sửa thành framer-motion
  import axios from "axios";

  export function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Lấy ID từ thanh địa chỉ
    const cruiseId = searchParams.get("cruise");
    const cabinId = searchParams.get("cabin");
    
    // State quản lý dữ liệu và UI
    const [cruiseData, setCruiseData] = useState<any>(null);
    const [cabinData, setCabinData] = useState<any>(null);
    const [bookingId, setBookingId] = useState<number | null>(null);
    
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // State đếm ngược 15 phút (900 giây)
    const [timeLeft, setTimeLeft] = useState(900);

    // State các dịch vụ thêm
    const [addons, setAddons] = useState({
      insurance: false,
      wifi: false,
      beverage: false
    });

    // 1. GỌI API GIỮ PHÒNG NGAY KHI VÀO TRANG
    useEffect(() => {
      if (!cruiseId || !cabinId) return;

      // Lấy thông tin tàu trước để hiển thị
      axios.get(`http://localhost/api/cruises/${cruiseId}`)
        .then(res => {
          const cruise = res.data.data;
          setCruiseData(cruise);
          const cabin = cruise.cabin_classes.find((c: any) => c.id == cabinId);
          setCabinData(cabin);
          
          // Gọi API Khóa phòng (Hold Room)
          return axios.post('http://localhost/api/bookings/hold', {
            schedule_id: 1, // Tạm fix cứng chuyến đi số 1 cho đồ án
            cabin_class_id: cabinId,
            quantity: 1,
            customer_name: "Khách Hàng Trải Nghiệm", // Mặc định tạm
            customer_email: "khach@gmail.com"
          });
        })
        .then(holdRes => {
          // Lưu lại ID đơn hàng để lát nữa gọi API thanh toán
          setBookingId(holdRes.data.data.booking_id);
        })
        .catch(error => {
          alert(error.response?.data?.message || "Rất tiếc, phòng vừa được người khác đặt. Vui lòng chọn phòng khác!");
          navigate(`/cruise/${cruiseId}`); // Đá về trang chi tiết
        });
    }, [cruiseId, cabinId, navigate]);

    // 2. LOGIC ĐỒNG HỒ ĐẾM NGƯỢC
    useEffect(() => {
      if (timeLeft <= 0) {
        alert("Đã hết 15 phút giữ phòng! Đơn hàng của bạn đã bị hủy.");
        navigate(`/cruise/${cruiseId}`);
        return;
      }
      const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timerId);
    }, [timeLeft, navigate, cruiseId]);

    // Định dạng hiển thị phút:giây
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Nếu đang tải dữ liệu thì hiện loading
    if (!cruiseData || !cabinData) return <div className="p-20 text-center text-xl font-serif">Đang thiết lập kênh thanh toán bảo mật...</div>;

    // Tính toán giá tiền (Chuyển sang VNĐ)
    const guests = 2; 
    const basePrice = cabinData.price;
    const taxes = 500000 * guests; // Thuế phí cảng mẫu
    
    const addonPrices = {
      insurance: 250000 * guests,
      wifi: 150000 * 3, // 3 ngày
      beverage: 800000 * guests
    };

    const totalAddons = 
      (addons.insurance ? addonPrices.insurance : 0) +
      (addons.wifi ? addonPrices.wifi : 0) +
      (addons.beverage ? addonPrices.beverage : 0);

    const totalAmount = basePrice + taxes + totalAddons;

    // 3. XỬ LÝ THANH TOÁN (Giả lập)
    const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      
      // Ở đây sau này bạn sẽ gọi API update status thành 'confirmed'
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }, 2000);
    };

    if (isSuccess) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Đặt Phòng Thành Công!</h2>
            <p className="text-slate-600 mb-8">Kỳ nghỉ dưỡng xa hoa của quý khách đã được xác nhận. Email hướng dẫn chi tiết đã được gửi đi.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-left">
              <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Mã Chuyến Đi</div>
              <div className="font-mono font-bold text-xl text-slate-900">OCL-{bookingId || Math.floor(Math.random() * 1000000)}</div>
            </div>
            
            <p className="text-sm text-slate-500 animate-pulse">Đang chuyển hướng về Bảng điều khiển...</p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 relative">
        
        {/* THANH ĐẾM NGƯỢC GIỮ PHÒNG NỔI BẬT LÊN TRÊN CÙNG */}
        <div className="bg-[#0A192F] text-amber-400 py-3 px-4 sticky top-20 z-40 shadow-md flex justify-center items-center gap-2 font-medium">
          <Clock className="w-5 h-5 animate-pulse" />
          Phòng của bạn đang được giữ trong <span className="text-white font-bold text-lg w-12 text-center">{formatTime(timeLeft)}</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 py-8">
          
          {/* Cột trái - Form thanh toán */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Add-ons Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Nâng Tầm Trải Nghiệm</h2>
                <p className="text-slate-600">Chọn các dịch vụ cao cấp để chuyến đi của bạn thêm phần hoàn hảo.</p>
              </div>
              
              <div className="p-6 md:p-8 space-y-4">
                {/* Premium Beverage Package */}
                <label className={`flex items-start md:items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${addons.beverage ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={addons.beverage} onChange={() => setAddons({...addons, beverage: !addons.beverage})} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Gói Đồ Uống Thượng Hạng</h4>
                      <p className="text-sm text-slate-600">Thỏa thích thưởng thức rượu vang, cocktail và cà phê pha máy không giới hạn.</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="font-bold text-slate-900">+{new Intl.NumberFormat('vi-VN').format(addonPrices.beverage)}đ</div>
                    <div className="text-xs text-slate-500">tổng cộng</div>
                  </div>
                </label>

                {/* High-Speed Wi-Fi */}
                <label className={`flex items-start md:items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${addons.wifi ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={addons.wifi} onChange={() => setAddons({...addons, wifi: !addons.wifi})} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Internet Vệ Tinh Starlink</h4>
                      <p className="text-sm text-slate-600">Kết nối mạng tốc độ cao ngay giữa đại dương. (1 thiết bị/khách).</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="font-bold text-slate-900">+{new Intl.NumberFormat('vi-VN').format(addonPrices.wifi)}đ</div>
                    <div className="text-xs text-slate-500">tổng cộng</div>
                  </div>
                </label>

                {/* Travel Insurance */}
                <label className={`flex items-start md:items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${addons.insurance ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={addons.insurance} onChange={() => setAddons({...addons, insurance: !addons.insurance})} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Bảo Hiểm Du Lịch OceanaLux</h4>
                      <p className="text-sm text-slate-600">Bảo vệ toàn diện cho hành lý, y tế và hủy chuyến không lường trước.</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="font-bold text-slate-900">+{new Intl.NumberFormat('vi-VN').format(addonPrices.insurance)}đ</div>
                    <div className="text-xs text-slate-500">tổng cộng</div>
                  </div>
                </label>
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Phương Thức Thanh Toán</h2>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 w-fit px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> Thanh toán mã hóa bảo mật 256-bit
                </div>
              </div>

              <form onSubmit={handlePayment} className="p-6 md:p-8">
                <div className="space-y-4 mb-8">
                  {/* Các phương thức thanh toán giữ nguyên logic, chỉ dịch text */}
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-amber-500" />
                      <div className="flex items-center gap-3 w-full justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <CreditCard className="w-6 h-6 text-slate-600" /> Thẻ Tín Dụng / Ghi Nợ Quốc Tế
                        </div>
                      </div>
                    </div>
                    
                    {paymentMethod === 'credit_card' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 space-y-4">
                        {/* Inputs thẻ tín dụng */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số Thẻ</label>
                          <input required type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày Hết Hạn</label>
                            <input required type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CVV</label>
                            <input required type="text" placeholder="123" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </label>

                  {/* VNPAY */}
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-amber-500" />
                      <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-blue-600" /> <span className="font-bold text-slate-900">VNPAY (Quét mã QR / Thẻ nội địa)</span>
                      </div>
                    </div>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý giao dịch...
                    </>
                  ) : (
                    <>Hoàn Tất Đặt Phòng • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Cột Phải - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden sticky top-32 text-white">
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold font-serif mb-1">Tóm Tắt Đơn Hàng</h3>
                <p className="text-slate-400 text-sm">Kiểm tra chi tiết chuyến hải trình</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex gap-4 items-start">
                  <img src={cruiseData.images && cruiseData.images[0] ? cruiseData.images[0].image_url : "/images/tau-1.jpg"} alt="Ảnh tàu" className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-white leading-tight mb-1">{cruiseData.name}</h4>
                    <div className="text-xs text-amber-500 font-semibold uppercase">{cabinData.name}</div>
                    <div className="text-xs text-slate-400 mt-1">3 Ngày 2 Đêm • {guests} Khách</div>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Giá phòng ({guests} Khách)</span>
                    <span className="font-medium text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">Thuế & Phí Cảng <HelpCircle className="w-3 h-3" /></span>
                    <span className="font-medium text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxes)}</span>
                  </div>
                  
                  {totalAddons > 0 && (
                    <div className="pt-3 mt-3 border-t border-slate-800 border-dashed space-y-3">
                      <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Dịch Vụ Bổ Sung</div>
                      {addons.beverage && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400 text-xs">Gói đồ uống</span>
                          <span className="font-medium text-white text-xs">{new Intl.NumberFormat('vi-VN').format(addonPrices.beverage)}đ</span>
                        </div>
                      )}
                      {addons.wifi && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400 text-xs">Wifi Starlink</span>
                          <span className="font-medium text-white text-xs">{new Intl.NumberFormat('vi-VN').format(addonPrices.wifi)}đ</span>
                        </div>
                      )}
                      {addons.insurance && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400 text-xs">Bảo hiểm du lịch</span>
                          <span className="font-medium text-white text-xs">{new Intl.NumberFormat('vi-VN').format(addonPrices.insurance)}đ</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Tổng Tiền</div>
                    <div className="text-xs text-slate-500">Đã bao gồm VAT</div>
                  </div>
                  <div className="text-2xl font-bold text-amber-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</div>
                </div>
              </div>
              
              <div className="bg-slate-950 p-4 text-center text-xs text-slate-500 flex justify-center items-center gap-4">
                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-slate-400" /> Thanh Toán An Toàn</span>
                <span className="flex items-center gap-1"><Ticket className="w-4 h-4 text-slate-400" /> Cam Kết Giá Tốt</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }