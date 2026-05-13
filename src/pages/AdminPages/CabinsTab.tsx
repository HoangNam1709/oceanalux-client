import { useState } from "react";
import {
  Plus,
  Bed,
  Image,
  Users,
  Edit,
  Trash2,
  Maximize,
  Layers,
  Image as ImageIcon, 
} from "lucide-react";
import { Cabin, Cruise, formatCurrency } from "./adminShared";

// 👉 LƯU Ý ĐƯỜNG DẪN: Nếu bạn lưu trong thư mục modals thì phải import từ ./modals
import { ImageGalleryModal } from "./Modals";

interface Props {
  currentCruise: Cruise;
  cruises: Cruise[];
  selectedCruiseId: string;
  setSelectedCruiseId: (id: string) => void;
  setCabinModal: (val: "create" | Cabin | null) => void;
  setDeleteCabin: (c: Cabin) => void;
  fetchData: () => void;
}

export function CabinsTab({
  currentCruise,
  cruises,
  selectedCruiseId,
  setSelectedCruiseId,
  setCabinModal,
  setDeleteCabin,
  fetchData,
}: Props) {

  const [galleryItem, setGalleryItem] = useState<Cabin | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-[#0A192F] p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
            Đang quản lý phòng của
          </p>
          <h2 className="text-2xl font-serif mt-1">
            {currentCruise?.name ?? "Chưa chọn tàu"}
          </h2>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCruiseId}
            onChange={(e) => setSelectedCruiseId(e.target.value)}
            className="flex-1 md:w-64 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none font-medium"
          >
            {cruises.map((c) => (
              <option key={c.id} value={c.id} className="text-black">
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCabinModal("create")}
            className="bg-[#D4AF37] text-[#0A192F] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#e8c84a] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Thêm phòng
          </button>
        </div>
      </div>

      {!currentCruise || currentCruise.cabins.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
          <Bed className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Du thuyền này chưa có phòng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentCruise.cabins.map((cabin) => (
            <div
              key={cabin.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group"
            >
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                {cabin.imageUrl ? (
                  <img
                    src={cabin.imageUrl}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={cabin.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#0A192F] text-[10px] font-bold px-2 py-1 rounded border border-white/50">
                  {cabin.type}
                </div>
              </div>

              <div className="p-5">
                <h4 className="font-bold text-[#0A192F] text-lg mb-2">
                  {cabin.name}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Users className="w-3.5 h-3.5" /> Max {cabin.capacity}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Maximize className="w-3.5 h-3.5" /> {cabin.area || 20} m²
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Layers className="w-3.5 h-3.5" /> Tầng {cabin.deck || 1}
                  </span>
                </div>

                <div className="mb-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      cabin.available > 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {cabin.available > 0
                      ? `Còn ${cabin.available} phòng`
                      : "Hết phòng"}
                  </span>
                </div>

                <div className="text-xl font-bold text-[#D4AF37] mb-5">
                  {formatCurrency(cabin.pricePerNight)}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    / đêm
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCabinModal(cabin)}
                    className="flex-1 py-2 bg-slate-50 text-[#0A192F] rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Sửa
                  </button>

                  <button
                    onClick={() => setGalleryItem(cabin)}
                    className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" /> Ảnh (
                    {cabin.images_objects?.length || 0})
                  </button>

                  <button
                    onClick={() => setDeleteCabin(cabin)}
                    className="p-2 bg-white text-slate-400 rounded-lg border border-slate-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageGalleryModal
        isOpen={!!galleryItem}
        onClose={() => setGalleryItem(null)} // Chỉ đóng khi người dùng nhấn dấu X
        type="cabin" // RẤT QUAN TRỌNG: Gọi xuống Backend để lưu bảng cabin_images
        itemId={galleryItem?.id || ""}
        itemName={`${galleryItem?.name || ""} - ${currentCruise?.name || ""}`}
        initialImages={galleryItem?.images_objects || []}
        currentThumbnail={galleryItem?.imageUrl || ""} // Cabin dùng trường imageUrl
        onUpdate={() => {
          if (typeof fetchData === "function") fetchData(); // Reload ngầm
        }}
      />
    </div>
  );
}
