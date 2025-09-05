import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        const access = localStorage.getItem("access");
        if (!access) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await API.get("api/accounts/api/accounts/profile/");
            setUser(res.data);
        } catch (err) {
            console.error("Ошибка загрузки профиля:", err);
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setUser(null);
        window.dispatchEvent(new Event("authChanged"));
    };

    useEffect(() => {
        loadUser();

        // 🔹 слушаем событие от Login.jsx
        const handler = () => loadUser();
        window.addEventListener("authChanged", handler);

        return () => window.removeEventListener("authChanged", handler);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);