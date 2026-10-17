import type { User } from "@/types/user";
import type { Reservation } from "@/types/reservation";

export const demoUsers: User[] = [
  {
    id: "u-demo",
    name: "Nguyễn Minh Anh",
    email: "demo@stayvn.vn",
    role: "USER",
  },
  {
    id: "u-admin",
    name: "Stayvn Admin",
    email: "admin@stayvn.vn",
    role: "ADMIN",
  },
];

export const reservations: Reservation[] = [
  {
    id: "STV-260901",
    userId: "u-demo",
    hotelId: "1",
    roomId: "1-201",
    guestName: "Nguyễn Minh Anh",
    guestEmail: "demo@stayvn.vn",
    checkIn: "2026-10-21",
    checkOut: "2026-10-24",
    guests: 2,
    nights: 3,
    total: 2_550_000,
    status: "CONFIRMED",
    createdAt: "2026-10-10",
  },
  {
    id: "STV-260902",
    userId: "u-demo",
    hotelId: "3",
    roomId: "3-101",
    guestName: "Nguyễn Minh Anh",
    guestEmail: "demo@stayvn.vn",
    checkIn: "2026-11-02",
    checkOut: "2026-11-04",
    guests: 1,
    nights: 2,
    total: 2_700_000,
    status: "PENDING",
    createdAt: "2026-10-12",
  },
];

export const reservationStore = {
  all: reservations,
  add(value: Reservation) {
    this.all.unshift(value);
    return value;
  },
  updateStatus(id: string, status: Reservation["status"]) {
    const found = this.all.find((item) => item.id === id);
    if (found) found.status = status;
    return found;
  },
};
