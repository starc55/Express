import axios from "axios";

const API_BASE = "https://backendcarrier.xpresstransportation.org/";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const publicEndpoints = [
      "/api/v1/auth/jwt/create/",
      "/api/v1/auth/jwt/refresh/",
      "/api/v1/auth/jwt/verify/",
      "/api/v1/login/",
      "/api/v1/logout/",
      "/api/v1/register/",
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn("401 Unauthorized → Refresh token is working...");

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const refreshResponse = await axios.post(
          `${API_BASE}/api/v1/auth/jwt/refresh/`,
          { refresh: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const { access } = refreshResponse.data;

        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
