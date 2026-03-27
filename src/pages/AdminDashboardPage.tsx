import { useState } from "react";
import { Search, Download, Eye, Edit, X, Calendar, Users, DollarSign, Ship, ChevronDown } from "lucide-react";

type Tab = "overview" | "bookings" | "profile";
type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

interface Booking {
  id: string;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  cruiseName: string;
  departureDate: string;
  returnDate: string;
  cabinType: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: string;
  bookedDate: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    bookingRef: "CRZ-2024-001234",
    guestName: "William Anderson",
    guestEmail: "william.anderson@email.com",
    cruiseName: "Mediterranean Grand Voyage",
    departureDate: "2024-06-15",
    returnDate: "2024-06-22",
    cabinType: "Royal Suite",
    guests: 2,
    totalAmount: 8500,
    status: "confirmed",
    paymentMethod: "VNPAY",
    bookedDate: "2024-03-10"
  },
  {
    id: "2",
    bookingRef: "CRZ-2024-001235",
    guestName: "Sophia Martinez",
    guestEmail: "sophia.martinez@email.com",
    cruiseName: "Caribbean Paradise Escape",
    departureDate: "2024-07-20",
    returnDate: "2024-07-30",
    cabinType: "Deluxe Ocean View",
    guests: 4,
    totalAmount: 12400,
    status: "confirmed",
    paymentMethod: "Momo",
    bookedDate: "2024-03-11"
  },
  {
    id: "3",
    bookingRef: "CRZ-2024-001236",
    guestName: "James Wilson",
    guestEmail: "james.wilson@email.com",
    cruiseName: "Northern Lights Explorer",
    departureDate: "2024-09-05",
    returnDate: "2024-09-12",
    cabinType: "Premium Balcony",
    guests: 2,
    totalAmount: 6800,
    status: "pending",
    paymentMethod: "VNPAY",
    bookedDate: "2024-03-12"
  },
  {
    id: "4",
    bookingRef: "CRZ-2024-001237",
    guestName: "Emma Thompson",
    guestEmail: "emma.thompson@email.com",
    cruiseName: "Asian Wonders Journey",
    departureDate: "2024-05-10",
    returnDate: "2024-05-20",
    cabinType: "Royal Suite",
    guests: 3,
    totalAmount: 15200,
    status: "completed",
    paymentMethod: "VNPAY",
    bookedDate: "2024-02-15"
  },
  {
    id: "5",
    bookingRef: "CRZ-2024-001238",
    guestName: "Oliver Brown",
    guestEmail: "oliver.brown@email.com",
    cruiseName: "Mediterranean Grand Voyage",
    departureDate: "2024-08-01",
    returnDate: "2024-08-08",
    cabinType: "Interior Suite",
    guests: 2,
    totalAmount: 4200,
    status: "cancelled",
    paymentMethod: "Momo",
    bookedDate: "2024-03-08"
  },
  {
    id: "6",
    bookingRef: "CRZ-2024-001239",
    guestName: "Isabella Garcia",
    guestEmail: "isabella.garcia@email.com",
    cruiseName: "Pacific Island Retreat",
    departureDate: "2024-10-15",
    returnDate: "2024-10-25",
    cabinType: "Premium Balcony",
    guests: 2,
    totalAmount: 9600,
    status: "confirmed",
    paymentMethod: "VNPAY",
    bookedDate: "2024-03-13"
  }
];

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const stats = {
    totalBookings: mockBookings.length,
    confirmedBookings: mockBookings.filter(b => b.status === "confirmed").length,
    totalRevenue: mockBookings
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalAmount, 0),
    totalGuests: mockBookings
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.guests, 0)
  };

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.cruiseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      case "completed": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    alert(`Cancel booking ${bookingId} - This would update the booking status to cancelled`);
  };

  const handleEditBooking = (bookingId: string) => {
    alert(`Edit booking ${bookingId} - This would open an edit modal`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[#0A192F] mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage bookings and oversee cruise operations</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
              activeTab === "overview"
                ? "bg-[#0A192F] text-white shadow-md"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
              activeTab === "bookings"
                ? "bg-[#0A192F] text-white shadow-md"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-50"
            }`}
          >
            Manage Bookings
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
              activeTab === "profile"
                ? "bg-[#0A192F] text-white shadow-md"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-50"
            }`}
          >
            Profile
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-500">Total</span>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">{stats.totalBookings}</div>
                <div className="text-sm text-slate-600">Total Bookings</div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Ship className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-500">Active</span>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">{stats.confirmedBookings}</div>
                <div className="text-sm text-slate-600">Confirmed Bookings</div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-sm text-slate-500">Revenue</span>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Total Revenue</div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-500">Guests</span>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">{stats.totalGuests}</div>
                <div className="text-sm text-slate-600">Total Guests</div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <h2 className="text-2xl font-light text-slate-900 mb-6">Recent Bookings</h2>
              <div className="space-y-4">
                {mockBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{booking.guestName}</div>
                      <div className="text-sm text-slate-600">{booking.cruiseName}</div>
                      <div className="text-xs text-slate-500 mt-1">{booking.bookingRef}</div>
                    </div>
                    <div className="text-right mr-6">
                      <div className="font-medium text-slate-900">${booking.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-slate-600">{booking.departureDate}</div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Management Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by booking ref, guest name, email, or cruise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
                    className="appearance-none px-6 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0A192F] text-white rounded-lg hover:bg-[#0A192F]/90 transition-colors shadow-md">
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                Showing {filteredBookings.length} of {mockBookings.length} bookings
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Booking Ref</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Guest</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Cruise</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Dates</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Cabin</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Guests</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Amount</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900 text-sm">{booking.bookingRef}</div>
                          <div className="text-xs text-slate-500">{booking.bookedDate}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900 text-sm">{booking.guestName}</div>
                          <div className="text-xs text-slate-600">{booking.guestEmail}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-slate-900 max-w-xs">{booking.cruiseName}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-slate-900">{booking.departureDate}</div>
                          <div className="text-xs text-slate-600">to {booking.returnDate}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-900">{booking.cabinType}</td>
                        <td className="py-4 px-6 text-sm text-slate-900">{booking.guests}</td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900 text-sm">
                            ${booking.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-600">{booking.paymentMethod}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditBooking(booking.id)}
                              className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Booking"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {booking.status !== "cancelled" && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancel Booking"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <h2 className="text-2xl font-light text-slate-900 mb-6">Administrator Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="admin@luxurycruises.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    defaultValue="Super Administrator"
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <input
                    type="text"
                    defaultValue="Operations Management"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    defaultValue="EMP-2024-001"
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-light text-slate-900 mb-6">Security Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button className="px-8 py-3 bg-[#0A192F] text-white rounded-lg hover:bg-[#0A192F]/90 transition-all shadow-md">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Access Permissions */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <h2 className="text-2xl font-light text-slate-900 mb-6">Access Permissions</h2>
              
              <div className="space-y-4">
                {[
                  { name: "Manage All Bookings", enabled: true },
                  { name: "View Financial Reports", enabled: true },
                  { name: "Modify Cruise Schedules", enabled: true },
                  { name: "Manage User Accounts", enabled: true },
                  { name: "Access System Settings", enabled: true },
                  { name: "Export Data", enabled: true }
                ].map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <span className="text-slate-900">{permission.name}</span>
                    <div className={`px-4 py-1 rounded-full text-sm font-medium ${
                      permission.enabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {permission.enabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-light text-slate-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Booking Reference */}
                <div className="bg-[#0A192F] text-white p-6 rounded-xl">
                  <div className="text-sm opacity-90 mb-1">Booking Reference</div>
                  <div className="text-2xl font-light">{selectedBooking.bookingRef}</div>
                  <div className="mt-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedBooking.status === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                        : selectedBooking.status === "pending"
                        ? "bg-amber-500/20 text-amber-100 border border-amber-400/30"
                        : selectedBooking.status === "cancelled"
                        ? "bg-red-500/20 text-red-100 border border-red-400/30"
                        : "bg-blue-500/20 text-blue-100 border border-blue-400/30"
                    }`}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Guest Information</h3>
                  <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.guestEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Number of Guests:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.guests}</span>
                    </div>
                  </div>
                </div>

                {/* Cruise Information */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Cruise Information</h3>
                  <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cruise Name:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.cruiseName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Departure Date:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.departureDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Return Date:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.returnDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cabin Type:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.cabinType}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Payment Information</h3>
                  <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-bold text-slate-900 text-xl">
                        ${selectedBooking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment Method:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Booked Date:</span>
                      <span className="font-medium text-slate-900">{selectedBooking.bookedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleEditBooking(selectedBooking.id)}
                    className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Edit Booking
                  </button>
                  {selectedBooking.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}