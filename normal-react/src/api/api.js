const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  // Try to parse JSON, but handle empty responses
  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const errMsg = (data && data.error) || res.statusText || "Something went wrong";
    throw new Error(errMsg);
  }

  return data;
};
