import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/";

const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // если используешь cookie
});

// 🔹 Добавляем access токен в каждый запрос
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔹 Перехватываем ошибки и обновляем токен при 401
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если токен истёк и мы ещё не пробовали обновить
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem("refresh");
                if (refresh) {
                    const res = await axios.post(`${BASE_URL}api/accounts/token/refresh/`, {
                        refresh,
                    });

                    const newAccess = res.data.access;
                    localStorage.setItem("access", newAccess);

                    // Обновляем заголовок и повторяем запрос
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return API(originalRequest);
                }
            } catch (err) {
                console.error("🔴 Ошибка обновления refresh токена:", err);
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("user");
                window.location.href = "/login"; // редирект на логин
            }
        }

        return Promise.reject(error);
    }
);

export default API;