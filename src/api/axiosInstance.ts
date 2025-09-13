import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: { "Content-Type": "application/json" },
});

// TODO: Add auth token to the request

// Request Interceptor
// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// Response Interceptor
// axiosInstance.interceptors.response.use(
//   response => {
//     return response;
//   },
//   (error: AxiosError) => {
//     if (error.response && error.response.status === 401) {
//       console.error("UNAUTHORIZED, logging out...");
//       localStorage.removeItem("authToken");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
