import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
  Ship,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export function SearchPage() {
  const [searchParams] = useSearchParams();

  const urlLocation = searchParams.get("location") || "";
  const urlDate = searchParams.get("date") || "";
  const urlGuests = searchParams.get("guests") || "";

  // STATE LƯU DỮ LIỆU
  const [cruises, setCruises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // STATE MỚI: Nhận biết đây có phải là danh sách "Gợi ý" hay không
  const [isSuggested, setIsSuggested] = useState(false);
  const [suggestReason, setSuggestReason] = useState("");

  const [destination, setDestination] = useState(urlLocation);
  const [priceRange, setPriceRange] = useState(50000000);
  const [minRating, setMinRating] = useState(3); // Mặc định 3 sao
  const [duration, setDuration] = useState("any");

  // GỌI API THEO CHIẾN THUẬT "FALLBACK" (LÙI BƯỚC)
  useEffect(() => {
    const fetchCruises = async () => {
      setLoading(true);
      setIsSuggested(false);
      setSuggestReason("");

      try {
        // LẦN 1: TÌM CHÍNH XÁC YÊU CẦU
        let res = await axios.get("http://localhost:8081/api/cruises", {
          params: { location: urlLocation, date: urlDate, guests: urlGuests },
        });
        let data = res.data.data || [];

        // LẦN 2: NẾU KHÔNG ĐỦ CHỖ, BỎ QUA "SỐ KHÁCH" ĐỂ GỢI Ý
        if (data.length === 0 && urlGuests) {
          const resFallback1 = await axios.get(
            "http://localhost:8081/api/cruises",
            {
              params: { location: urlLocation, date: urlDate }, // Ép Backend không lọc số khách nữa
            },
          );
          data = resFallback1.data.data || [];
          if (data.length > 0) {
            setIsSuggested(true);
            setSuggestReason(
              `Rất tiếc, hiện không có tàu nào đủ sức chứa ${urlGuests} khách trên 1 tàu. Dưới đây là các tàu đang trống lịch, Quý khách có thể cân nhắc thuê nhiều tàu hoặc liên hệ để được hỗ trợ đoàn đông!`,
            );
          }
        }

        // LẦN 3: NẾU VẪN KHÔNG CÓ, BỎ QUA CẢ "NGÀY ĐI"
        if (data.length === 0 && (urlGuests || urlDate)) {
          const resFallback2 = await axios.get(
            "http://localhost:8081/api/cruises",
            {
              params: { location: urlLocation }, // Chỉ giữ lại điểm đến
            },
          );
          data = resFallback2.data.data || [];
          if (data.length > 0) {
            setIsSuggested(true);
            setSuggestReason(
              `Rất tiếc, các chuyến đi vào ngày ${urlDate || "bạn chọn"} đã kín chỗ. Dưới đây là các du thuyền tuyệt đẹp tại ${urlLocation || "khu vực này"} vào những ngày khác!`,
            );
          }
        }

        setCruises(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tàu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCruises();
  }, [urlLocation, urlDate, urlGuests]);

  const getImageUrl = (cruise: any) => {
    let path =
      cruise.image ||
      cruise.images?.find((img: any) => img.is_thumbnail === 1)?.image_url ||
      cruise.images?.[0]?.image_url;
    if (!path)
      return "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800&auto=format&fit=crop";
    if (path.startsWith("http")) return path;
    return `http://localhost:8081/storage/${path}`;
  };

  const filteredCruises = cruises.filter((c) => {
    if (
      destination &&
      !c.destination?.toLowerCase().includes(destination.toLowerCase()) &&
      !c.name?.toLowerCase().includes(destination.toLowerCase())
    )
      return false;
    if (c.star_rating < minRating) return false;

    if (duration !== "any") {
      if (duration === "short" && c.duration_days > 2) return false;
      if (
        duration === "medium" &&
        (c.duration_days <= 2 || c.duration_days > 4)
      )
        return false;
      if (duration === "long" && c.duration_days <= 4) return false;
    }

    const basePrice =
      c.cabin_classes?.length > 0
        ? Math.min(...c.cabin_classes.map((c: any) => c.price))
        : c.price || 0;
    if (basePrice > priceRange) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="font-serif text-slate-600 text-lg">
          Đang tìm kiếm chuyến đi hoàn hảo...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Khám Phá Hành Trình
          </h1>
          <p className="text-slate-600">
            Tìm thấy {filteredCruises.length} du thuyền phù hợp với bộ lọc.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (GIỮ NGUYÊN CODE CŨ BÊN NÀY) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 flex-shrink-0"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Bộ Lọc</h2>
              </div>

              {/* Destination Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                  Điểm đến / Tên tàu
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="VD: Vịnh Hạ Long"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Giá Tối Đa
                  </label>
                  <span className="text-sm font-bold text-amber-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(priceRange)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="30000000"
                  step="500000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Star Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                  Hạng Sao
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-sm font-medium transition-colors ${minRating === rating ? "bg-amber-50 border-amber-500 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {rating}{" "}
                      <Star
                        className={`w-4 h-4 ${minRating === rating ? "fill-amber-500 text-amber-500" : "text-slate-400"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                  Thời Gian
                </label>
                <div className="space-y-2">
                  {[
                    { id: "any", label: "Mọi thời lượng" },
                    { id: "short", label: "Ngắn ngày (1-2 Ngày)" },
                    { id: "medium", label: "Tiêu chuẩn (3-4 Ngày)" },
                    { id: "long", label: "Dài ngày (5+ Ngày)" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${duration === opt.id ? "bg-amber-500 border-amber-500" : "border-slate-300 group-hover:border-amber-500"}`}
                      >
                        {duration === opt.id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                        )}
                      </div>
                      <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">
                        {opt.label}
                      </span>
                      <input
                        type="radio"
                        name="duration"
                        className="hidden"
                        checked={duration === opt.id}
                        onChange={() => setDuration(opt.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setDestination("");
                  setPriceRange(50000000);
                  setMinRating(3);
                  setDuration("any");
                }}
                className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </motion.div>

          {/* Results Grid */}
          <div className="flex-1">
            {/* BANNER GỢI Ý THÔNG MINH KHI KHÔNG TÌM ĐƯỢC CHÍNH XÁC */}
            {isSuggested && filteredCruises.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4"
              >
                <div className="p-2 bg-amber-100 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Gợi ý thay thế dành cho bạn
                  </h3>
                  <p className="text-amber-700 text-sm mt-1">{suggestReason}</p>
                </div>
              </motion.div>
            )}

            {filteredCruises.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <Ship className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Không tìm thấy du thuyền
                </h3>
                <p className="text-slate-500">
                  Thử điều chỉnh lại bộ lọc hoặc ngày khởi hành để xem thêm lựa
                  chọn.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCruises.map((cruise, index) => {
                  const basePrice =
                    cruise.cabin_classes?.length > 0
                      ? Math.min(
                          ...cruise.cabin_classes.map((c: any) => c.price),
                        )
                      : cruise.price || 0;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={cruise.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow flex flex-col md:flex-row group"
                    >
                      <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 overflow-hidden bg-slate-100">
                        <img
                          src={getImageUrl(cruise)}
                          alt={cruise.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800&auto=format&fit=crop";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />{" "}
                          {cruise.star_rating}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                              {cruise.destination || "Vịnh Hạ Long"}
                            </div>
                            <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-amber-700 transition-colors">
                              <Link to={`/cruise/${cruise.id}`}>
                                {cruise.name}
                              </Link>
                            </h3>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                              Chỉ từ
                            </span>
                            <span className="text-2xl font-bold text-slate-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(basePrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>
                              {cruise.duration_days} Ngày{" "}
                              {cruise.duration_nights} Đêm
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-6 flex-1">
                          {cruise.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          <div className="flex gap-2 flex-wrap">
                            {cruise.amenities?.slice(0, 3).map((fac: any) => (
                              <span
                                key={fac.id}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium"
                              >
                                {fac.name}
                              </span>
                            ))}
                            {cruise.amenities?.length > 3 && (
                              <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-xs font-medium">
                                +{cruise.amenities.length - 3}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/cruise/${cruise.id}`}
                            className="shrink-0 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-sm"
                          >
                            Xem Chi Tiết
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
