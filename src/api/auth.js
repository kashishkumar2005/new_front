import { api } from "./api";

export const signup = (payload) =>
  api("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (payload) =>
  api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
