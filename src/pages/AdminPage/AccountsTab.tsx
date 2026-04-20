import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Account, Pagination } from "./AdminShared";

interface Props {
  accounts: Account[];
  setAccountModal: (val: "create" | Account | null) => void;
  setDeleteAccount: (a: Account) => void;
}

export function AccountsTab({
  accounts,
  setAccountModal,
  setDeleteAccount,
}: Props) {
  const [searchAccountTerm, setSearchAccountTerm] = useState("");

  // ─── STATE PHÂN TRANG ───
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Số dòng trên 1 trang

  const filteredAccounts = accounts.filter((acc) => {
    const term = searchAccountTerm.toLowerCase();
    return (
      (acc.name || "").toLowerCase().includes(term) ||
      (acc.email || "").toLowerCase().includes(term) ||
      (acc.phone && acc.phone.includes(term))
    );
  });

  // ─── LOGIC CẮT MẢNG DỮ LIỆU (SLICING) ───
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Mảng dữ liệu THỰC SỰ sẽ hiển thị trên trang hiện tại
  const currentItems = filteredAccounts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Reset về trang 1 khi search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchAccountTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#0A192F]">
            Quản lý Tài khoản
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị phân quyền và trạng thái hoạt động của nhân sự & khách
            hàng.
          </p>
        </div>
        <button
          onClick={() => setAccountModal("create")}
          className="bg-[#0A192F] text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              value={searchAccountTerm}
              onChange={handleSearch} // Gọi thẳng hàm handleSearch để reset trang 1
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#0A192F] text-white">
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tl-lg">
                  Tài khoản
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider">
                  Vai trò (Role)
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider">
                  Trạng thái (SĐT)
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-tr-lg">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Không tìm thấy tài khoản nào khớp với "{searchAccountTerm}"
                  </td>
                </tr>
              ) : (
                // SỬA LỖI 1: Duyệt qua currentItems thay vì filteredAccounts
                currentItems.map((acc) => (
                  <tr
                    key={acc.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm bg-slate-100 text-[#0A192F]">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0A192F] text-sm">
                            {acc.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {acc.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${(acc.role || "").toLowerCase() === "admin" ? "bg-[#0A192F] text-[#D4AF37] border-[#0A192F] shadow-sm" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                      >
                        {(acc.role || "Customer").charAt(0).toUpperCase() +
                          (acc.role || "Customer").slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                      {acc.createdAt}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-[#0A192F]">
                        {acc.phone || "Chưa cập nhật"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setAccountModal(acc)}
                          className="p-2 bg-white text-[#0A192F] rounded-lg border border-slate-200 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteAccount(acc)}
                          className="p-2 bg-white text-slate-400 rounded-lg border border-slate-200 hover:border-[#0A192F] hover:text-[#0A192F] hover:bg-slate-50 transition-all"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SỬA LỖI 2: totalItems truyền filteredAccounts.length */}
        <div className="bg-slate-50 mt-auto border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAccounts.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
