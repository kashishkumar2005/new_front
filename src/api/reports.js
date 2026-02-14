import { api } from "./api";

export const getReports = () => api("/api/reports");

export const createReport = (payload) =>
  api("/api/reports", { method: "POST", body: JSON.stringify(payload) });
