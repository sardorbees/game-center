import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext({
    user: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Загружаем юзера из localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const access = localStorage.getItem("access");

        if (storedUser && access) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Логин
    const login = (userData, access, refresh) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        setUser(userData);
    };

    // Логаут
    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    };

    // Настройка axios interceptors
    useEffect(() => {
        const axiosInstance = axios.create({
            baseURL: "http://127.0.0.1:8000/",
        });

        // Добавляем access токен в каждый запрос
        axiosInstance.interceptors.request.use(
            (config) => {
                const access = localStorage.getItem("access");
                if (access) {
                    config.headers.Authorization = `Bearer ${access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Перехватываем 401 и обновляем токен
        axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refresh = localStorage.getItem("refresh");
                    if (refresh) {
                        try {
                            const res = await axios.post("http://127.0.0.1:8000/api/accounts/token/refresh/", {
                                refresh,
                            });

                            localStorage.setItem("access", res.data.access);

                            // повторяем запрос с новым access
                            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                            return axiosInstance(originalRequest);
                        } catch (err) {
                            console.error("Refresh token истёк, выполняем logout");
                            logout();
                        }
                    } else {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        // сохраняем в window, чтобы использовать по всему проекту
        window.axiosAuth = axiosInstance;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};