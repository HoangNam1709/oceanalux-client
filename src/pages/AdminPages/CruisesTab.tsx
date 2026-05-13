import { useState } from "react";
import {
  Search,
  Plus,
  Ship,
  MapPin,
  Clock,
  Star,
  Edit,
  Bed,
  Trash2,
  CalendarDays,
  Image as ImageIcon,
  Map,
  AlertCircle,
  CalendarX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Cruise, AdminTab, formatCurrency, Pagination } from "./adminShared";
import { ScheduleManager } from "./ScheduleManager";
import { ImageGalleryModal } from "./Modals";
import { ItinerarySection } from "./ItinerarySection";

interface Props {
  cruises: Cruise[];
  setCruiseModal: (val: "create" | Cruise | null) => void;
  setSelectedCruiseId: (id: string) => void;
  setActiveTab: (tab: AdminTab) => void;
  setDeleteCruise: (c: Cruise) => void;
  fetchData: () => void;
}

export function CruisesTab({
  cruises,
  setCruiseModal,
  setSelectedCruiseId,
  setActiveTab,
  setDeleteCruise,
  fetchData,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [expandedCruiseId, setExpandedCruiseId] = useState<string | null>(null);
  const [activeInnerTab, setActiveInnerTab] = useState<
    "schedules" | "itineraries"
  >("schedules");

  const [forceShowScheduleManager, setForceShowScheduleManager] = useState<
    string | null
  >(null);

  const [galleryItem, setGalleryItem] = useState<Cruise | null>(null);

  const filteredCruises = cruises.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCruises.length / itemsPerPage);
  const currentItems = filteredCruises.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên du thuyền..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>
        <button
          onClick={() => setCruiseModal("create")}
          className="bg-[#0A192F] text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Du thuyền
        </button>
      </div>

      {currentItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
          <Ship className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Không tìm thấy du thuyền nào</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {currentItems.map((cruise) => {
              const imageCount = (cruise as any).images_objects?.length || 0;
              const hasNoImages = imageCount === 0;
              const scheduleCount = cruise.schedules?.length || 0;

              return (
                <div
                  key={cruise.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-48 md:h-auto bg-slate-200 relative shrink-0">
                      <img
                        src={
                          cruise.thumbnail ||
                          "https://placehold.co/400x300?text=OceanaLux"
                        }
                        alt={cruise.name}
                        className="w-full h-full object-cover"
                      />
                      {cruise.featured && (
                        <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm">
                          Nổi bật
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-[#0A192F] font-serif">
                              {cruise.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />{" "}
                                {cruise.destination}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />{" "}
                                {cruise.durationDays}N {cruise.durationNights}Đ
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />{" "}
                                {cruise.starRating}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase font-bold">
                              Giá khởi điểm
                            </div>
                            <div className="text-lg font-bold text-[#D4AF37]">
                              {formatCurrency(cruise.basePrice)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(cruise.facilities || []).slice(0, 5).map((f) => (
                            <span
                              key={f}
                              className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded border border-slate-100"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                        {hasNoImages && (
                          <div className="bg-[#FFF8E6] border border-[#F5E6B3] text-[#B8912A] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                            Hồ sơ tàu chưa đầy đủ — thiếu ảnh. Bổ sung để tăng
                            tỉ lệ đặt chỗ.
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => setCruiseModal(cruise)}
                            className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Sửa thông tin
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCruiseId(cruise.id);
                              setActiveTab("cabins");
                            }}
                            className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
                          >
                            <Bed className="w-4 h-4" /> Phòng (
                            {cruise.cabins?.length || 0})
                          </button>
                          <button
                            onClick={() => setGalleryItem(cruise)}
                            className={`px-4 py-2 border rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                              hasNoImages
                                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" // 🚀 ĐỎ NẾU CHƯA CÓ ẢNH
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <ImageIcon className="w-4 h-4" /> Ảnh ({imageCount})
                          </button>
                          <div className="flex-1"></div>{" "}
                          <button
                            onClick={() => setDeleteCruise(cruise)}
                            className="px-3 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                            title="Xóa tàu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (expandedCruiseId !== cruise.id) {
                                setExpandedCruiseId(cruise.id);
                                setActiveInnerTab("schedules");
                              } else {
                                setExpandedCruiseId(null);
                              }
                            }}
                            className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm ${
                              expandedCruiseId === cruise.id
                                ? "bg-amber-500 text-[#0A192F] hover:bg-amber-600"
                                : "bg-[#0A192F] text-white hover:bg-slate-800"
                            }`}
                          >
                            <CalendarDays
                              className={`w-4 h-4 ${expandedCruiseId === cruise.id ? "text-[#0A192F]" : "text-[#D4AF37]"}`}
                            />
                            {scheduleCount === 0
                              ? "Thêm lịch trình"
                              : expandedCruiseId === cruise.id
                                ? "Đóng lịch trình"
                                : "Quản lý lịch trình"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedCruiseId === cruise.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/30"
                      >
                        <div className="border-t border-slate-100 m-6 rounded-2xl bg-white border shadow-sm overflow-hidden">
                          {/* TAB HEADERS */}
                          <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-2">
                            <button
                              onClick={() => setActiveInnerTab("schedules")}
                              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                activeInnerTab === "schedules"
                                  ? "border-[#0A192F] text-[#0A192F] bg-white rounded-t-lg"
                                  : "border-transparent text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              <CalendarDays className="w-4 h-4" /> Lịch trình mở
                              bán ({scheduleCount})
                            </button>
                            <button
                              onClick={() => setActiveInnerTab("itineraries")}
                              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                activeInnerTab === "itineraries"
                                  ? "border-[#0A192F] text-[#0A192F] bg-white rounded-t-lg"
                                  : "border-transparent text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              <Map className="w-4 h-4" /> Lịch trình chi tiết (
                              {(cruise as any).itineraries?.length || 0})
                            </button>
                          </div>

                          {/* TAB CONTENT */}
                          <div className="bg-white">
                            {activeInnerTab === "schedules" && (
                              <div className="p-6">
                                {scheduleCount === 0 &&
                                forceShowScheduleManager !== cruise.id ? (
                                  <div className="flex flex-col items-center justify-center py-16 px-4">
                                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                      <CalendarX className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0A192F] mb-1">
                                      Chưa có lịch trình mở bán
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
                                      Tạo lịch trình để bắt đầu nhận đặt chỗ từ
                                      khách hàng.
                                    </p>
                                    <button
                                      onClick={() =>
                                        setForceShowScheduleManager(cruise.id)
                                      }
                                      className="px-6 py-2.5 bg-white border-2 border-slate-200 text-[#0A192F] font-bold rounded-xl hover:border-[#0A192F] hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                      <CalendarDays className="w-4 h-4" /> Thêm
                                      lịch trình đầu tiên
                                    </button>
                                  </div>
                                ) : (
                                  <ScheduleManager
                                    cruiseId={cruise.id}
                                    initialSchedules={cruise.schedules || []}
                                    durationDays={cruise.durationDays}
                                  />
                                )}
                              </div>
                            )}

                            {activeInnerTab === "itineraries" && (
                              <div className="px-6 pb-6 pt-0">
                                <ItinerarySection
                                  cruise={cruise}
                                  refreshData={fetchData}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredCruises.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </>
      )}

      <ImageGalleryModal
        isOpen={!!galleryItem}
        onClose={() => setGalleryItem(null)}
        type="cruise"
        itemId={galleryItem?.id || ""}
        itemName={galleryItem?.name || ""}
        initialImages={(galleryItem as any)?.images_objects || []}
        currentThumbnail={galleryItem?.thumbnail || ""}
        onUpdate={() => {
          if (typeof fetchData === "function") fetchData();
        }}
      />
    </div>
  );
}
