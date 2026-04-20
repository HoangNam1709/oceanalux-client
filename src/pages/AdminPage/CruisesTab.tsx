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
} from "lucide-react";
import { Cruise, AdminTab, formatCurrency, Pagination } from "./AdminShared";

interface Props {
  cruises: Cruise[];
  setCruiseModal: (val: "create" | Cruise | null) => void;
  setSelectedCruiseId: (id: string) => void;
  setActiveTab: (tab: AdminTab) => void;
  setDeleteCruise: (c: Cruise) => void;
}

export function CruisesTab({
  cruises,
  setCruiseModal,
  setSelectedCruiseId,
  setActiveTab,
  setDeleteCruise,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // ─── THÊM STATE PHÂN TRANG ───
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Để 6 chiếc tàu trên 1 trang cho gọn đẹp

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
            {currentItems.map((cruise) => (
              <div
                key={cruise.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow"
              >
                <div className="w-full md:w-64 h-48 md:h-auto bg-slate-200 relative shrink-0">
                  <img
                    src={
                      cruise.thumbnail ||
                      "https://placehold.co/400x300/e2e8f0/64748b?text=OceanaLux"
                    }
                    alt={cruise.name}
                    className="w-full h-full object-cover"
                  />
                  {cruise.featured && (
                    <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold px-2 py-1 rounded-full uppercase">
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
                      {cruise.facilities.slice(0, 5).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded border border-slate-100"
                        >
                          {f}
                        </span>
                      ))}
                      {cruise.facilities.length > 5 && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded border border-slate-100">
                          +{cruise.facilities.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setCruiseModal(cruise)}
                      className="flex items-center justify-center gap-2 flex-1 py-2 bg-[#0A192F] text-[#D4AF37] border border-slate-100 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Sửa
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCruiseId(cruise.id);
                        setActiveTab("cabins");
                      }}
                      className="flex items-center justify-center gap-2 flex-1 py-2 bg-[#0A192F] text-[#D4AF37] rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <Bed className="w-4 h-4" /> Xem phòng (
                      {cruise.cabins.length})
                    </button>
                    <button
                      onClick={() => setDeleteCruise(cruise)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:border-[#0A192F] hover:text-[#0A192F] hover:bg-slate-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NHÚNG PHÂN TRANG VÀO DƯỚI DANH SÁCH */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-4">
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
    </div>
  );
}
