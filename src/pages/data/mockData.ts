export const mockCruises = [
  {
    id: "sea-sovereign",
    name: "Stellar Seas",
    destination: "Mediterranean",
    starRating: 5,
    durationDays: 8,
    durationNights: 7,
    basePrice: 2499,
    description: "Trải nghiệm đẳng cấp hoàng gia trên đại dương với dịch vụ cá nhân hóa tuyệt đối.",
    images: [
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1000",
      "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1000"
    ],
    facilities: ["Michelin Restaurant", "Infinity Spa", "Ocean View Gym", "Private Butler"],
    itinerary: [
      { day: 1, location: "Barcelona, Spain", description: "Khởi hành từ cảng Barcelona.", activities: ["Check-in", "Welcome Dinner"] },
      { day: 2, location: "Marseille, France", description: "Khám phá vẻ đẹp cổ kính nước Pháp.", activities: ["City Tour", "Wine Tasting"] }
    ],
    cabins: [
      {
        id: "cabin-1",
        name: "Azure Ocean Suite",
        type: "Suite",
        pricePerNight: 450,
        capacity: 2,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
        amenities: ["Private Balcony", "King Bed", "Mini Bar"],
        available: 3
      }
    ],
    reviews: [
      { id: "r1", user: "John Doe", date: "2024-01-15", rating: 5, comment: "Tuyệt vời!" }
    ]
  },
  {
    id: "caribbean-pearl",
    name: "Caribbean Pearl",
    destination: "Caribbean",
    starRating: 4.5,
    durationDays: 5,
    durationNights: 4,
    basePrice: 1299,
    description: "Hành trình khám phá những hòn đảo thiên đường tại vùng biển Caribbean.",
    images: ["https://images.unsplash.com/photo-1500021804447-2ca2eaaaabeb?q=80&w=1000"],
    facilities: ["Water Park", "Casino", "Beach Club"],
    itinerary: [],
    cabins: [],
    reviews: []
  }
];
// ─── ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACES) ───

export interface Cabin {
  id: string;
  type: string; // "Interior" | "Ocean View" | "Balcony" | "Suite" | "Deluxe Suite" | "Royal Suite"
  name: string;
  pricePerNight: number;
  capacity: number;
  available: number;
  amenities: string[];
  imageUrl: string;
}

export interface Cruise {
  id: string;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  starRating: number;
  basePrice: number;
  images: string[];
  description: string;
  facilities: string[];
  cabins: Cabin[];
  itinerary?: any[]; // Tạm thời để any[] vì màn admin hiện tại chưa dùng sâu vào chi tiết lịch trình
  reviews?: any[];   // Tương tự cho reviews
  featured: boolean;
}

// ─── DỮ LIỆU MẪU (MOCK DATA) VIỆT HÓA ───

