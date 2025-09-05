import API from "../api";

// 🔹 Логин
export const login = async (username, password) => {
    const res = await API.post("api/accounts/login/", { username, password });
    const { access, refresh, user } = res.data;

    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
};

// 🔹 Регистрация
export const register = async (formData) => {
    return await API.post("api/accounts/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// 🔹 Профиль
export const getProfile = async () => {
    const res = await API.get("api/accounts/profile/");
    return res.data;
};

// 🔹 Обновить профиль
export const updateProfile = async (data) => {
    const res = await API.put("api/accounts/edit-profile/", data);
    return res.data;
};

// 🔹 Смена пароля
export const changePassword = async (old_password, new_password) => {
    return await API.post("api/accounts/change-password/", {
        old_password,
        new_password,
    });
};

// 🔹 Выход
export const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
};
