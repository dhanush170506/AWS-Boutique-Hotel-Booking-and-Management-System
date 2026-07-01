import axios from "axios";

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (typeof window === "undefined") {
    return configuredUrl || "http://localhost:5001/api";
  }

  const { hostname, protocol } = window.location;
  const isLocalPage = hostname === "localhost" || hostname === "127.0.0.1";
  const configuredIsLocal =
    configuredUrl?.includes("localhost") || configuredUrl?.includes("127.0.0.1");

  if (configuredUrl && (!configuredIsLocal || isLocalPage)) {
    return configuredUrl;
  }

  return `${protocol}//${hostname}:5001/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000
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
          message: getMessageFromResponse(error)
        }
      };
    } else if (!error.response.data?.message) {
      const data = typeof error.response.data === "object" && error.response.data !== null
        ? error.response.data
        : {};
      error.response.data = {
        ...data,
        message: getMessageFromResponse(error)
      };
    }
    return Promise.reject(error);
  }
);

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
