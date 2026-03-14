import axios, { AxiosError, type AxiosInstance } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Axios: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("Authorization");

  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>)["Authorization"] = token || "";

  return config;
});

Axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = refreshRes.data.payload.accessToken;
        localStorage.setItem("Authorization", newToken);

        if (!originalRequest.headers) originalRequest.headers = {};
        (originalRequest.headers as Record<string, string>)["Authorization"] =
          newToken;

        return Axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default Axios;
