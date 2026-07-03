import axios from "axios";

const SESSION_KEY = "aurelia_user";

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (typeof window === "undefined") {
    return configuredUrl || "http://3.237.76.223:5001";
  }

  const { hostname, protocol } = window.location;
  const isLocalPage = hostname === "localhost" || hostname === "127.0.0.1";
  const configuredIsLocal =
    configuredUrl?.includes("localhost") ||
    configuredUrl?.includes("127.0.0.1");

  if (isLocalPage && configuredUrl && !configuredIsLocal) {
    return "http://localhost:5055/api";
  }

  if (configuredUrl && (!configuredIsLocal || isLocalPage)) {
    return configuredUrl;
  }

  return `${protocol}//${hostname}:5001/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    const user = saved ? JSON.parse(saved) : null;
    if (user?.id) {
      config.headers = {
        ...config.headers,
        "x-user-id": user.id,
      };
    }
  } catch {
    // ignore invalid session data
  }
  return config;
});

function getMessageFromResponse(error) {
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }
  return "Unable to reach the backend API. Please check the server URL and CORS configuration.";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.response = {
        data: {
          message: getMessageFromResponse(error),
        },
      };
    } else if (!error.response.data?.message) {
      const data =
        typeof error.response.data === "object" && error.response.data !== null
          ? error.response.data
          : {};
      error.response.data = {
        ...data,
        message: getMessageFromResponse(error),
      };
    }
    return Promise.reject(error);
  },
);

export const bookingApi = {
  create: (payload) => api.post("/bookings", payload).then((res) => res.data),
  list: () => api.get("/bookings").then((res) => res.data),
  listByUser: (userId) =>
    api.get(`/bookings/user/${userId}`).then((res) => res.data),
  get: (bookingId) => api.get(`/bookings/${bookingId}`).then((res) => res.data),
  update: (bookingId, payload) =>
    api.put(`/bookings/${bookingId}`, payload).then((res) => res.data),
  cancel: (bookingId, userId) =>
    api
      .delete(`/bookings/${bookingId}`, { data: { userId } })
      .then((res) => res.data),
};

export const authApi = {
  register: (payload) =>
    api.post("/auth/register", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
};

export const userApi = {
  profile: () => api.get("/users/profile").then((res) => res.data),
  updateProfile: (payload) =>
    api.put("/users/profile", payload).then((res) => res.data),
};

export const roomApi = {
  list: () => api.get("/rooms").then((res) => res.data),
  get: (roomId) => api.get(`/rooms/${roomId}`).then((res) => res.data),
  create: (payload) => api.post("/rooms", payload).then((res) => res.data),
  update: (roomId, payload) =>
    api.put(`/rooms/${roomId}`, payload).then((res) => res.data),
  delete: (roomId) => api.delete(`/rooms/${roomId}`).then((res) => res.data),
};

export const adminApi = {
  analytics: () => api.get("/admin/analytics").then((res) => res.data),
  listUsers: () => api.get("/admin/users").then((res) => res.data),
  getUser: (userId) =>
    api.get(`/admin/users/${userId}`).then((res) => res.data),
  updateUser: (userId, payload) =>
    api.put(`/admin/users/${userId}`, payload).then((res) => res.data),
  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`).then((res) => res.data),
  listBookings: () => api.get("/admin/bookings").then((res) => res.data),
  getBooking: (bookingId) =>
    api.get(`/admin/bookings/${bookingId}`).then((res) => res.data),
  updateBooking: (bookingId, payload) =>
    api.put(`/admin/bookings/${bookingId}`, payload).then((res) => res.data),
  cancelBooking: (bookingId) =>
    api.delete(`/admin/bookings/${bookingId}`).then((res) => res.data),
  deleteBooking: (bookingId) =>
    api
      .delete(`/admin/bookings/${bookingId}?hard=true`)
      .then((res) => res.data),
  listRooms: () => api.get("/admin/rooms").then((res) => res.data),
  getRoom: (roomId) =>
    api.get(`/admin/rooms/${roomId}`).then((res) => res.data),
  createRoom: (payload) =>
    api.post("/admin/rooms", payload).then((res) => res.data),
  updateRoom: (roomId, payload) =>
    api.put(`/admin/rooms/${roomId}`, payload).then((res) => res.data),
  deleteRoom: (roomId) =>
    api.delete(`/admin/rooms/${roomId}`).then((res) => res.data),
  uploadImage: (payload) =>
    api.post("/admin/rooms/upload-image", payload).then((res) => res.data),
};

export default api;
