import { api } from "./api";

export const getCheckins = () => api("/api/checkins");

export const createCheckin = (payload) =>
	api("/api/checkins", { method: "POST", body: JSON.stringify(payload) });
