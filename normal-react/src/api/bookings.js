import { api } from "./api";

export const getBookings = () => api("/api/bookings");

export const createBooking = (payload) =>
  api("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
