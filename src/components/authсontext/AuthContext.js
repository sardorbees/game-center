import React, { createContext, useState, useEffect } from "react";

// Контекст аутентификации
export const AuthContext = createContext({
    user: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const access = localStorage.getItem("access");

        if (storedUser && access) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Функция логина
    const login = (userData, access, refresh) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        setUser(userData);
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    };

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