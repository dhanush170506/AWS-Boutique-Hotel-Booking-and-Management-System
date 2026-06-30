import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 10000
});

// Keep API calls centralized so AWS API Gateway/Lambda URLs can replace Express later.
export const bookingApi = {
  create: (payload) => api.post("/bookings", payload).then((res) => res.data),
  list: () => api.get("/bookings").then((res) => res.data),
  listByUser: (userId) => api.get(`/bookings/user/${userId}`).then((res) => res.data),
  get: (bookingId) => api.get(`/bookings/${bookingId}`).then((res) => res.data),
  update: (bookingId, payload) =>
    api.put(`/bookings/${bookingId}`, payload).then((res) => res.data),
  cancel: (bookingId, userId) =>
    api.delete(`/bookings/${bookingId}`, { data: { userId } }).then((res) => res.data)
};

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data)
};

export const userApi = {
  profile: (userId) =>
    api.get("/users/profile", { headers: { "x-user-id": userId } }).then((res) => res.data),
  updateProfile: (userId, payload) =>
    api.put("/users/profile", payload, { headers: { "x-user-id": userId } }).then((res) => res.data)
};

export default api;
