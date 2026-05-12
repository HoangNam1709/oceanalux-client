import React from "react";
import { AlertTriangle } from "lucide-react";
import { Cabin } from "../adminShared";

export const inputCls = (hasError: boolean) =>
  `w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-300 focus:ring-red-300 bg-red-50"
      : "border-slate-200 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
  }`;

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export const blankCabin = (): Omit<Cabin, "id"> =>
  ({
    type: "Ocean View",
    name: "",
    pricePerNight: "1500000",
    capacity: "2",
    available: "5",
    area: "20",
    deck: "1",
    amenities: [],
    imageUrl: "",
  }) as any;

export const CABIN_TYPES = [
  "Interior",
  "Ocean View",
  "Balcony",
  "Suite",
  "Deluxe Suite",
  "Royal Suite",
  "Penthouse",
];
