import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import API from "../api";
import FloatingButtons from "../floatingbuttons/FloatingButtons";
import "../assets/css/app.min.css";
import "../assets/css/style.css";
import "../assets/css/Burger.css";
import "../assets/css/GameClub.css";

import { useLang } from "../translator/Translator";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        phone_number: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { lang } = useLang();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post("api/accounts/register/", form, {
                headers: { "Content-Type": "application/json" },
            });

            alert(
                lang === "uz"
                    ? "✅ Roʻyxatdan oʻtish muvaffaqiyatli yakunlandi"
                    : "✅ Регистрация прошла успешно"
            );

            // после регистрации → на логин
            navigate("/login");
        } catch (err) {
            console.error(err.response?.data || err);
            const serverError =
                err.response?.data?.detail ||
                err.response?.data?.username?.[0] ||
                err.response?.data?.phone_number?.[0] ||
                (lang === "uz" ? "Roʻyxatdan oʻtishda xatolik" : "❌ Ошибка регистрации");

            alert(serverError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <FloatingButtons />

            {/* Шапка страницы */}
            <div
                className="breadcumb-wrapper"
                data-bg-src="assets/img/bg/breadcumb-bg.jpg"
            >
                <div className="container">
                    <div className="breadcumb-content">
                        <h1 className="breadcumb-title">
                            <br />
                            {lang === "uz" ? "Roʻyxatdan oʻtish" : "Регистрация"}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Форма регистрации */}
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>
                        {lang === "uz" ? "Foydalanuvchi nomi" : "Имя пользователя"}
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder={
                            lang === "uz" ? "Foydalanuvchi nomi" : "Имя пользователя"
                        }
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div className="input-group">
                    <label>{lang === "uz" ? "Parol" : "Пароль"}</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder={lang === "uz" ? "Parol" : "Пароль"}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="theme-togglee"
                            aria-label={
                                showPassword
                                    ? lang === "uz"
                                        ? "Parolni yashirish"
                                        : "Скрыть пароль"
                                    : lang === "uz"
                                        ? "Parolni ko‘rsatish"
                                        : "Показать пароль"
                            }
                        >
                            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </button>
                    </div>
                </div>

                <br />

                <div className="input-group">
                    <label>{lang === "uz" ? "Telefon raqami" : "Телефон"}</label>
                    <input
                        type="tel"
                        name="phone_number"
                        placeholder={lang === "uz" ? "Telefon raqami" : "Телефон"}
                        value={form.phone_number}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div className="checkbox-group">
                    <input type="checkbox" id="agreement" defaultChecked required />
                    <label htmlFor="agreement">
                        {lang === "uz"
                            ? "Men ommaviy taklif shartlarini qabul qilaman"
                            : "Я принимаю условия публичной оферты"}
                        <br />
                        <a href="/login">
                            {lang === "uz"
                                ? "Akkountingiz bormi? Kirish"
                                : "Уже есть аккаунт? Войти"}
                        </a>
                    </label>
                </div>

                <button type="submit" className="button" disabled={loading}>
                    {loading
                        ? lang === "uz"
                            ? "Yuklanmoqda..."
                            : "Загрузка..."
                        : lang === "uz"
                            ? "Roʻyxatdan oʻtish"
                            : "Регистрация →"}
                </button>
            </form>
        </div>
    );
}