import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Users, Ship, CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";


export function BookingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false); // State cho nút tải PDF
    
    // Tạo tham chiếu (Ref) để "chụp" khu vực vé
    const ticketRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchBookingDetail(); }, [id]);

    const fetchBookingDetail = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost/api/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setBooking(res.data.data);
        } catch (error) {
            alert("Không tìm thấy đơn hàng!");
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy chuyến đi này không?")) return;
        setIsCancelling(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost/api/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert("Hủy chuyến đi thành công!");
            fetchBookingDetail(); 
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
        } finally {
            setIsCancelling(false);
        }
    };

    const handlePayment = () => {
        const cruiseId = booking?.schedule?.cruise_id || booking?.schedule?.cruise?.id || '';
        const cabinId = booking?.details?.[0]?.cabin_class_id || booking?.details?.[0]?.cabinClass?.id || '';
        navigate(`/checkout/payment/${booking.id}?cruise=${cruiseId}&cabin=${cabinId}`);
    };
    // HÀM XỬ LÝ XUẤT PDF VỚI HTML-TO-IMAGE 
    const handleDownloadPDF = async () => {
        if (!ticketRef.current) return;
        setIsDownloading(true);
        
        try {
            // 1. Dùng filter để ẩn đi khối có thuộc tính data-html2canvas-ignore="true" (nút bấm tải PDF)
            const filter = (node: HTMLElement) => {
                if (node.getAttribute && node.getAttribute('data-html2canvas-ignore') === 'true') {
                    return false; // Bỏ qua không chụp phần tử này
                }
                return true;
            };

            // 2. Chụp khu vực vé thành ảnh PNG chất lượng cao
            const dataUrl = await toPng(ticketRef.current, {
                pixelRatio: 2, // Tăng độ nét gấp đôi
                backgroundColor: '#ffffff', // Nền trắng
                filter: filter, // Áp dụng bộ lọc ẩn nút bấm
            });

            // 3. Tạo khung file PDF khổ A4 nằm dọc
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            // 4. Tính toán tỷ lệ chiều cao cân xứng
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; 

            // 5. Dán ảnh vào PDF và tải về máy (cách lề trên 10mm)
            pdf.addImage(dataUrl, 'PNG', 0, 10, pdfWidth, pdfHeight); 
            pdf.save(`Ve-OceanaLux-${booking.booking_code}.pdf`);
            
        } catch (error) {
            console.error("Lỗi xuất PDF:", error);
            alert("Đã xảy ra lỗi khi tạo file PDF. Vui lòng thử lại!");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#0A192F] bg-[#F8F9FA]">Đang tải thông tin vé...</div>;
    if (!booking) return null;

    const cruise = booking?.schedule?.cruise;
    const cabin = booking?.details?.[0]?.cabinClass || booking?.details?.[0]?.cabin_class;
    const isCompleted = booking.status === 'completed';
    const isPaid = booking.status === 'paid' ;
    const isHolding = booking.status === 'holding';
    const isCancelled = booking.status === 'cancelled';

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#0A192F]/60 hover:text-[#0A192F] mb-6 transition-colors font-bold">
                    <ArrowLeft className="w-5 h-5" /> Bảng điều khiển
                </button>
                <motion.div ref={ticketRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4AF37]/30">
                    
                    <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isPaid ? 'bg-[#0A192F]' : isCancelled ? 'bg-[#0A192F]/60' : 'bg-[#D4AF37] text-[#0A192F]'}`}>
                        <div>
                            <h1 className="text-3xl font-serif font-bold mb-2">
                                {isCompleted ? 'Đơn hàng đã hoàn thành' : isPaid ? 'Vé Điện Tử VIP' : isHolding ? 'Đơn Đặt Chỗ OceanaLux' : 'Đơn Hàng Đã Hủy'}
                            </h1>
                            <p className="flex items-center gap-2 opacity-90">
                                Mã đặt chỗ: <span className={`font-mono font-bold px-3 py-1 rounded tracking-widest ${isPaid ? 'bg-white/20' : isCancelled ? 'bg-white/20' : 'bg-[#0A192F] text-white'}`}>{booking.booking_code}</span>
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold shadow-sm ${isPaid ? 'bg-[#D4AF37] text-[#0A192F]' : isHolding ? 'bg-[#0A192F] text-white' : 'bg-white/90 text-[#0A192F]/70'}`}>
                            {isCompleted && <><CheckCircle2 className="w-5 h-5" /> Hoàn Thành</>}
                            {isPaid && <><CheckCircle2 className="w-5 h-5" /> Đã Thanh Toán</>}
                            {isHolding && <><Clock className="w-5 h-5 animate-pulse" /> Chờ Thanh Toán</>}
                            {isCancelled && <><XCircle className="w-5 h-5" /> Đã Hủy</>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-8 md:border-r-2 border-dashed border-gray-200 space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Hải Trình</h3>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                        <Ship className="w-6 h-6 text-[#0A192F]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold font-serif text-[#0A192F]">{cruise?.name || "Du thuyền 5 Sao"}</h2>
                                        <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm"><MapPin className="w-4 h-4" /> Vịnh Hạ Long</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm"><Calendar className="w-4 h-4 text-[#D4AF37]" /> Khởi hành</div>
                                        <div className="font-bold text-[#0A192F]">{booking?.schedule?.departure_date ? new Date(booking.schedule.departure_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</div>
                                    </div>
                                    <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm"><Users className="w-4 h-4 text-[#D4AF37]" /> Hạng phòng</div>
                                        <div className="font-bold text-[#0A192F]">{cabin?.name || 'Standard'}</div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Thông tin hành khách</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Họ và Tên</p>
                                        <p className="font-bold text-[#0A192F]">{booking.customer_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="font-bold text-[#0A192F]">{booking.customer_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                                        <p className="font-bold text-[#0A192F]">{booking.customer_phone || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Ngày đặt vé</p>
                                        <p className="font-bold text-[#0A192F]">{new Date(booking.created_at).toLocaleString('vi-VN')}</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Phần Sidebar Phải */}
                        <div className="w-full md:w-80 p-8 bg-[#F8F9FA] flex flex-col items-center justify-center text-center relative">
                            <div className="hidden md:block absolute -left-4 top-1/2 w-8 h-8 bg-[#F8F9FA] rounded-full border-r-2 border-gray-200"></div>

                            <div className={`bg-white p-4 rounded-2xl shadow-md border border-[#D4AF37]/20 mb-6 ${!isPaid ? 'opacity-20 grayscale blur-[2px]' : ''}`}>
                                <QRCodeSVG value={`OCEANALUX-${booking.booking_code}-${booking.id}`} size={160} level="H" includeMargin={true} fgColor="#0A192F" />
                            </div>

                            {!isCompleted && !isPaid && !isCancelled && <p className="text-sm text-[#0A192F] font-bold mb-4 bg-[#D4AF37]/20 py-2 px-4 rounded-lg">Mã QR khả dụng sau thanh toán</p>}
                            {isCompleted && <p className="text-sm text-[#0A192F] font-bold mb-4 bg-[#D4AF37]/20 py-2 px-4 rounded-lg">Cảm ơn bạn đã đồng hành cùng OceanaLux!</p>}
                            {isCancelled && <p className="text-sm text-[#0A192F]/60 font-bold mb-4 bg-gray-200 py-2 px-4 rounded-lg">Đơn hàng không còn hiệu lực</p>}

                            <div className="w-full mb-6">
                                <div className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">Tổng Thanh Toán</div>
                                <div className={`text-3xl font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-[#D4AF37]'}`}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price)}
                                </div>
                            </div>

                            {/* Khối chứa nút hành động - Thêm cờ data-html2canvas-ignore để lúc xuất PDF không bị in cái nút bấm vào giấy */}
                            <div data-html2canvas-ignore="true" className="w-full space-y-3 mt-auto">
                                {isHolding && (
                                    <>
                                        <button onClick={handlePayment} className="w-full bg-[#D4AF37] text-[#0A192F] py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-md">
                                            Thanh Toán Ngay
                                        </button>
                                        <button onClick={handleCancelBooking} disabled={isCancelling} className="w-full bg-transparent text-[#0A192F]/60 border-2 border-[#0A192F]/20 py-3 rounded-xl font-bold hover:bg-[#0A192F]/5 hover:text-[#0A192F] transition-colors">
                                            {isCancelling ? 'Đang hủy...' : 'Hủy Đơn Này'}
                                        </button>
                                    </>
                                )}

                                {isPaid && (
                                    <button 
                                        onClick={handleDownloadPDF} 
                                        disabled={isDownloading}
                                        className="w-full flex items-center justify-center gap-2 bg-[#0A192F] text-[#D4AF37] py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md disabled:opacity-70"
                                    >
                                        {isDownloading ? (
                                            <><div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div> Đang xử lý...</>
                                        ) : (
                                            <><Download className="w-5 h-5" /> Tải Vé PDF</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}