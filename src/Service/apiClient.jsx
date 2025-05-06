// import axios from "axios";

// const apiClient = axios.create({
//   baseURL: "http://localhost:3000/api",
// });

// apiClient.interceptors.request.use(
//   (config) => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && user.token) {
//       config.headers.Authorization = `Bearer ${user.token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// /**
//  * @param {Promise} requestPromise
//  * @returns {Promise<{data, success, error}>}
//  */
// export const handleApiResponse = async (requestPromise) => {
//   try {
//     const response = await requestPromise;
//     return { data: response.data, success: true, error: null };
//   } catch (error) {
//     const errorMessage =
//       error.response?.data || error.message || "Connection error";
//     return { data: null, success: false, error: errorMessage };
//   }
// };

// export default apiClient;

import axios from "axios";
import { refreshToken } from "./authService";

const apiClient = axios.create({
  baseURL: "https://trid-dtgpbjcyecekdea8.uaenorth-01.azurewebsites.net/api/v1",
});

let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

const clearAndRedirectToLogin = () => {
  localStorage.clear();
  window.location.href = "/login";
};

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/authenticate") &&
      !originalRequest.url.includes("/forgot-password")
    ) {
      originalRequest._retry = true;

      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        clearAndRedirectToLogin();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await refreshToken({
            refreshToken: refreshTokenValue,
          });

          if (response.success) {
            localStorage.setItem("accessToken", response.data.token);
            localStorage.setItem("refreshToken", response.data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            processQueue(null, response.data.token);

            return apiClient(originalRequest);
          } else {
            processQueue(new Error("Token refresh failed"), null);
            clearAndRedirectToLogin();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAndRedirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

/**
 * @param {Promise} requestPromise
 * @returns {Promise<{data, success, error}>}
 */
export const handleApiResponse = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return { data: response.data, success: true, error: null };
  } catch (error) {
    const errorMessage =
      error.response?.data || error.message || "Connection error";
    return { data: null, success: false, error: errorMessage };
  }
};

export default apiClient;
