import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { CreditCard, Wallet, ShieldCheck, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { echo } from "../echo";

export function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. Khai báo các State
    const cruiseId = searchParams.get("cruise");
    const cabinId = searchParams.get("cabin");
    const { bookingId: paramBookingId } = useParams();
    const guests = Number(searchParams.get("guests")) || 2; 

    const [cruiseData, setCruiseData] = useState<any>(null);
    const [cabinData, setCabinData] = useState<any>(null);
    const [bookingId, setBookingId] = useState<number | null>(paramBookingId ? Number(paramBookingId) : null);

    const [paymentMethod, setPaymentMethod] = useState("vnpay");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [addons, setAddons] = useState({
        insurance: false,
        wifi: false,
        beverage: false
    });

    // 2. TÍNH TOÁN GIÁ TIỀN
    const { basePrice, taxes, addonPrices, totalAddons, totalAmount } = useMemo(() => {
        const base = Number(cabinData?.price) || 0; 
        const taxAmount = 500000 * guests;
        
        const prices = {
            insurance: 250000 * guests,
            wifi: 150000 * 3, 
            beverage: 800000 * guests
        };

        const totalAddon = 
            (addons.insurance ? prices.insurance : 0) +
            (addons.wifi ? prices.wifi : 0) +
            (addons.beverage ? prices.beverage : 0);

        return {
            basePrice: base,
            taxes: taxAmount,
            addonPrices: prices,
            totalAddons: totalAddon,
            totalAmount: base + taxAmount + totalAddon
        };
    }, [cabinData, addons, guests]);

    // 3. useEffect 1: GỌI API GIỮ PHÒNG HOẶC PHỤC HỒI ĐƠN CŨ
    useEffect(() => {
        const token = localStorage.getItem('token');

        // ==========================================
        // NGÃ RẼ 1: KHÁCH CŨ QUAY LẠI THANH TOÁN
        // ==========================================
        if (paramBookingId) {
            axios.get(`http://localhost/api/bookings/${paramBookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const oldBooking = res.data.data;
                const cruise = oldBooking?.schedule?.cruise;
                const cabin = oldBooking?.details?.[0]?.cabinClass || oldBooking?.details?.[0]?.cabin_class;

                if (cruise && cabin) {
                    setCruiseData(cruise);
                    setCabinData(cabin);
                    setBookingId(oldBooking.id);
                    
                    // 👉 TỐI ƯU 1: KHÓA CHẾT ĐỒNG HỒ DỰA VÀO HOLD_EXPIRES_AT
                    if (oldBooking.hold_expires_at) {
                        const expireTimeStr = oldBooking.hold_expires_at.replace(' ', 'T'); // Fix lỗi iOS/Safari
                        const expiresAt = new Date(expireTimeStr).getTime();
                        const now = new Date().getTime();
                        const remaining = Math.floor((expiresAt - now) / 1000);

                        if (remaining > 0) {
                            setTimeLeft(remaining); 
                        } else {
                            alert("Đơn hàng này đã hết hạn giữ chỗ! Vui lòng đặt đơn mới.");
                            navigate('/dashboard');
                        }
                    } else {
                        // Backup nếu API không trả về hold_expires_at
                        const backupRemaining = Math.floor(Number(oldBooking.remaining_seconds));
                        if(backupRemaining > 0) setTimeLeft(backupRemaining);
                        else {
                            alert("Đơn hàng này đã hết hạn giữ chỗ! Vui lòng đặt đơn mới.");
                            navigate('/dashboard');
                        }
                    }
                } else {
                    alert("Dữ liệu đơn hàng cũ bị thiếu thông tin Tàu hoặc Phòng!");
                    navigate('/dashboard');
                }
            })
            .catch(err => {
                console.error("Lỗi lấy đơn hàng cũ:", err);
                alert("Đơn hàng không tồn tại hoặc đã hết hạn!");
                navigate('/dashboard');
            });
            
            return; 
        }

        // ==========================================
        // NGÃ RẼ 2: KHÁCH MỚI TINH VÀO ĐẶT CHỖ
        // ==========================================
        if (!cruiseId || !cabinId) return;

        axios.get(`http://localhost/api/cruises/${cruiseId}`)
            .then(res => {
                setCruiseData(res.data.data);
                const cabin = res.data.data.cabin_classes.find((c: any) => c.id == cabinId);
                setCabinData(cabin);
                
                return axios.post('http://localhost/api/bookings/hold', {
                    schedule_id: 1, 
                    cabin_class_id: cabinId,
                    quantity: 1,
                    guests: guests 
                }, {
                    headers: { Authorization: `Bearer ${token}` } 
                });
            })
            .then(holdRes => {
                setBookingId(holdRes.data.data.booking_id);
                // Ép kiểu và làm tròn khi tạo mới
                setTimeLeft(Math.floor(Number(holdRes.data.data.remaining_seconds)));
            })
            .catch(err => {
                console.error("Lỗi giữ phòng:", err);
                navigate('/');
            });
    }, [cruiseId, cabinId, guests, paramBookingId, navigate]);

    // 4. useEffect 2: WEBSOCKET
    useEffect(() => {
        if (!bookingId) return;
        const channel = echo.channel(`booking.${bookingId}`);

        channel.listen('.BookingExpired', () => {
            alert("Thời gian giữ chỗ đã hết!");
            navigate('/dashboard');
        });

        channel.listen('.TimerUpdated', (e: { remainingSeconds: number }) => {
            setTimeLeft(Math.floor(Number(e.remainingSeconds)));
        });

        return () => {
            echo.leaveChannel(`booking.${bookingId}`);
        };
    }, [bookingId, navigate]);

    // 5. useEffect 3: ĐẾM NGƯỢC (ĐÃ ĐƯỢC TỐI ƯU CHỐNG LEAK MEMORY)
    useEffect(() => {
        // Nếu chưa có thời gian, không làm gì cả
        if (timeLeft === null) return;
        
        // Nếu hết giờ, thông báo và điều hướng NGAY LẬP TỨC
        if (timeLeft <= 0) {
            alert("Đã hết thời gian giữ phòng! Đơn hàng của bạn đã bị hủy.");
            navigate('/dashboard');
            return;
        }

        // Thiết lập bộ đếm lùi mỗi giây
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timerId); // Dừng Interval ngay khi về 0
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup function: Xóa timer khi component bị unmount (chuyển trang)
        return () => clearInterval(timerId);
    }, [timeLeft, navigate]);

    // 6. XỬ LÝ THANH TOÁN
    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId) {
            alert("Chưa có mã đơn hàng hợp lệ. Vui lòng tải lại trang!");
            return;
        }

        setIsProcessing(true);

        try {
            const response = await axios.post('http://localhost/api/payment/create', {
                booking_id: bookingId,
                payment_method: paymentMethod,
                amount: totalAmount, 
                addons: addons, 
                taxes: taxes 
            });

            if (response.data && response.data.checkoutUrl) {
                localStorage.setItem('retryCheckoutUrl', window.location.pathname + window.location.search);
                window.location.href = response.data.checkoutUrl;
            } else {
                setIsProcessing(false);
                setIsSuccess(true);
                localStorage.removeItem(`pending_booking_${cruiseId}_${cabinId}`);
                setTimeout(() => navigate('/dashboard'), 3000);
            }
        } catch (error: any) {
            console.error('Lỗi thanh toán:', error);
            alert(error.response?.data?.message || 'Giao dịch bị từ chối. Vui lòng thử lại!');
            setIsProcessing(false);
        }
    };

    // Hàm format thời gian sạch sẽ
    const formatTime = (seconds: number | null) => {
        if (seconds === null || seconds <= 0) return "00:00";
        const total = Math.floor(seconds);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Render Loading
    if (!cruiseData || !cabinData) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-serif text-slate-600">Đang thiết lập kênh thanh toán bảo mật...</div>;
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Đặt Phòng Thành Công!</h2>
                    <p className="text-slate-600 mb-8">Kỳ nghỉ dưỡng xa hoa của quý khách đã được xác nhận. Email hướng dẫn chi tiết đã được gửi đi.</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-left">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Mã Chuyến Đi</div>
                        <div className="font-mono font-bold text-xl text-slate-900">OCL-{bookingId}</div>
                    </div>
                    <p className="text-sm text-slate-500 animate-pulse">Đang chuyển hướng về Bảng điều khiển...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* THANH ĐẾM NGƯỢC */}
            <div className="bg-[#0A192F] text-amber-400 py-3 px-4 sticky top-0 z-40 shadow-md flex justify-center items-center gap-2 font-medium">
                <Clock className="w-5 h-5 animate-pulse" />
                Phòng của bạn đang được giữ trong <span className="text-white font-bold text-lg w-16 text-center">{formatTime(timeLeft)}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 py-8">
                {/* CỘT TRÁI - FORM THANH TOÁN */}
                <div className="lg:w-2/3 space-y-8">
                    {/* NÂNG TẦM TRẢI NGHIỆM */}
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Nâng Tầm Trải Nghiệm</h2>
                            <p className="text-slate-600">Chọn các dịch vụ cao cấp để chuyến đi của bạn thêm phần hoàn hảo.</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-4">
                            <label className={`flex items-start md:items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${addons.beverage ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1"><input type="checkbox" className="w-5 h-5 accent-amber-500" checked={addons.beverage} onChange={(e) => setAddons({...addons, beverage: e.target.checked})} /></div>
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

                            <label className={`flex items-start md:items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${addons.wifi ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1"><input type="checkbox" className="w-5 h-5 accent-amber-500" checked={addons.wifi} onChange={(e) => setAddons({...addons, wifi: e.target.checked})} /></div>
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

                            <label className={`flex items-start md:items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${addons.insurance ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1"><input type="checkbox" className="w-5 h-5 accent-amber-500" checked={addons.insurance} onChange={(e) => setAddons({...addons, insurance: e.target.checked})} /></div>
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

                    {/* PHƯƠNG THỨC THANH TOÁN */}
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Phương Thức Thanh Toán</h2>
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 w-fit px-3 py-1 rounded-full">
                                <ShieldCheck className="w-4 h-4" /> Thanh toán mã hóa bảo mật 256-bit
                            </div>
                        </div>
                        <form onSubmit={handlePayment} className="p-6 md:p-8">
                            <div className="space-y-4 mb-8">
                                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-amber-500" />
                                        <div className="flex items-center gap-3"><Wallet className="w-6 h-6 text-blue-600" /> <span className="font-bold text-slate-900">VNPAY (Quét mã QR / Thẻ nội địa)</span></div>
                                    </div>
                                </label>
                                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-amber-500" />
                                        <div className="flex items-center gap-3"><CreditCard className="w-6 h-6 text-slate-600" /> <span className="font-bold text-slate-900">Thẻ Tín Dụng Quốc Tế</span></div>
                                    </div>
                                </label>
                                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-green-500" />
                                        <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-green-600" /> <span className="font-bold text-slate-900">Thanh toán tiền mặt (Test Mode)</span></div>
                                    </div>
                                </label>
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl disabled:opacity-70 flex items-center justify-center gap-2">
                                {isProcessing ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang kết nối ngân hàng...</>
                                ) : (
                                    <>Xác Nhận Thanh Toán • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</>
                                )}
                            </button>
                        </form>
                    </section>
                </div>

                {/* CỘT PHẢI - TÓM TẮT */}
                <div className="lg:w-1/3">
                    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden sticky top-24 text-white">
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
                                    <span className="text-slate-400 flex items-center gap-1">Thuế & Phí Cảng</span>
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
                    </div>
                </div>
            </div>
        </div>
    );
}