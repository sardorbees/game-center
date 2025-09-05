import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    withCredentials: true,
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

// 🔹 Если access истёк → пробуем обновить
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // если 401 (токен просрочен) и мы ещё не пробовали обновить
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem("refresh");
                if (refresh) {
                    const res = await axios.post("http://127.0.0.1:8000/api/accounts/token/refresh/", {
                        refresh,
                    });
                    const newAccess = res.data.access;
                    localStorage.setItem("access", newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return API(originalRequest); // повторяем запрос
                }
            } catch (err) {
                console.error("🔴 Refresh token error:", err);
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("user");
                window.location.href = "/login"; // выкидываем на логин
            }
        }

        return Promise.reject(error);
    }
);

export default API;