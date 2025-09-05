import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../assets/css/user.css";
import { FaUser } from "react-icons/fa6";
import { IoIosSettings, IoIosNotifications } from "react-icons/io";
import { MdOutlineSecurity } from "react-icons/md";
import { IoFastFood } from "react-icons/io5";
import "../assets/css/OrderList.css";

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editData, setEditData] = useState({
        username: "",
        phone_number: "",
        email: "",
        address: "",
    });
    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
    });

    const navigate = useNavigate();

    // Загружаем сессии
    useEffect(() => {
        API.get("api/accounts/sessions/")
            .then((res) => setSessions(res.data))
            .catch(() => console.error("Ошибка загрузки сессий"));
    }, []);

    // Загружаем данные профиля
    useEffect(() => {
        API.get("api/accounts/api/accounts/profile/")
            .then((res) => {
                setUser(res.data);
                setEditData({
                    username: res.data.username || "",
                    phone_number: res.data.phone_number || "",
                    email: res.data.email || "",
                    address: res.data.address || "",
                });
            })
            .catch(() => {
                navigate("/login");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    // Загружаем заказы
    useEffect(() => {
        if (!user) return;
        API.get("api/menu/api/orders/")
            .then((res) => setOrders(res.data || []))
            .catch(() => console.error("Ошибка загрузки заказов"));
    }, [user]);

    // Загружаем уведомления
    const fetchNotifications = async () => {
        try {
            const res = await API.get("api/bron_Pc/notifications/");
            setNotes(res.data || []);
        } catch (err) {
            console.error("Ошибка загрузки уведомлений", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // каждые 5 секунд
        return () => clearInterval(interval);
    }, []);

    // Обновление профиля
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await API.put("api/accounts/edit-profile/", editData);
            setUser(res.data);
            alert("✅ Профиль обновлен");
        } catch {
            alert("❌ Ошибка обновления профиля");
        }
    };

    // Смена пароля
    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await API.post("api/accounts/change-password/", passwordData);
            alert("🔑 Пароль изменён");
            setPasswordData({ old_password: "", new_password: "" });
        } catch {
            alert("❌ Ошибка смены пароля");
        }
    };

    // Завершение сессии
    const handleDelete = async (id) => {
        if (!window.confirm("Завершить эту сессию?")) return;
        try {
            await API.delete(`api/accounts/sessions/${id}/delete/`);
            setSessions((prev) => prev.filter((s) => s.id !== id));
        } catch {
            alert("❌ Ошибка завершения сессии");
        }
    };

    // Выход
    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        alert("🚪 Вы вышли");
        navigate("/login");
    };

    // Отметить уведомление как прочитанное
    const markRead = async (id) => {
        try {
            await API.patch(`api/bron_Pc/notifications/${id}/`, { is_read: true });
            setNotes((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (!user) return <p>Для просмотра профиля нужно авторизоваться</p>;

    return (
        <div>
            {/* Шапка */}
            <div className="breadcumb-wrapper" data-bg-src="assets/img/bg/breadcumb-bg.jpg">
                <div className="container">
                    <div className="breadcumb-content">
                        <br />
                        <h1 className="breadcumb-title">Профиль</h1>
                    </div>
                </div>
            </div>

            <div className="containeree">
                <h1 className="welcome">Добро пожаловать, {user.username} 🎉</h1>

                <div className="row gutters-sm type">
                    {/* Боковое меню */}
                    <div className="col-md-4 d-nonen d-md-block">
                        <div className="cardd">
                            <div className="card-body">
                                <nav className="nav flex-column nav-pills nav-gap-y-1">
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`nav-iteme nav-link ${activeTab === "profile" ? "active" : ""}`}
                                    >
                                        <FaUser /> Информация профиля
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("account")}
                                        className={`nav-iteme nav-link ${activeTab === "account" ? "active" : ""}`}
                                    >
                                        <IoIosSettings /> Активные сессии
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("security")}
                                        className={`nav-iteme nav-link ${activeTab === "security" ? "active" : ""}`}
                                    >
                                        <MdOutlineSecurity /> Безопасность
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("notification")}
                                        className={`nav-iteme nav-link ${activeTab === "notification" ? "active" : ""}`}
                                    >
                                        <IoIosNotifications /> Уведомления
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("billing")}
                                        className={`nav-iteme nav-link ${activeTab === "billing" ? "active" : ""}`}
                                    >
                                        <IoFastFood /> Заказы
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Контент */}
                    <div className="col-md-8">
                        <div className="carde">
                            <div className="card-body tab-content">
                                {/* === Профиль === */}
                                {activeTab === "profile" && (
                                    <form onSubmit={handleUpdateProfile}>
                                        <h6>Редактирование профиля</h6>
                                        <hr />
                                        <div className="form-group">
                                            <label>Имя пользователя</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.username}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, username: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Телефон</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.phone_number}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, phone_number: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editData.email}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, email: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Адрес</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editData.address}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, address: e.target.value })
                                                }
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primarye">
                                            Сохранить изменения
                                        </button>
                                    </form>
                                )}

                                {/* === Сессии === */}
                                {activeTab === "account" && (
                                    <div className="list-group">
                                        {sessions.length === 0 ? (
                                            <p>Нет активных сессий ✅</p>
                                        ) : (
                                            sessions.map((s) => (
                                                <div
                                                    key={s.id}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <p><strong>Устройство:</strong> {s.device}</p>
                                                        <p><strong>IP:</strong> {s.ip_address}</p>
                                                        <p><strong>Начало:</strong> {new Date(s.session_start).toLocaleString()}</p>
                                                        <p><strong>Последняя активность:</strong> {new Date(s.last_activity).toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(s.id)}
                                                    >
                                                        Завершить
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* === Безопасность === */}
                                {activeTab === "security" && (
                                    <div>
                                        <h6>Смена пароля</h6>
                                        <hr />
                                        <form onSubmit={handleChangePassword}>
                                            <input
                                                type="password"
                                                placeholder="Старый пароль"
                                                className="form-control mb-2"
                                                value={passwordData.old_password}
                                                onChange={(e) =>
                                                    setPasswordData({ ...passwordData, old_password: e.target.value })
                                                }
                                            />
                                            <input
                                                type="password"
                                                placeholder="Новый пароль"
                                                className="form-control mb-2"
                                                value={passwordData.new_password}
                                                onChange={(e) =>
                                                    setPasswordData({ ...passwordData, new_password: e.target.value })
                                                }
                                            />
                                            <button type="submit" className="btn btn-warning">
                                                Изменить пароль
                                            </button>
                                        </form>
                                        <hr />
                                        <button onClick={handleLogout} className="btn btn-dangere">
                                            🚪 Выйти
                                        </button>
                                    </div>
                                )}

                                {/* === Уведомления === */}
                                {activeTab === "notification" && (
                                    <div>
                                        <h6>Мои уведомления</h6>
                                        {notes.length === 0 ? (
                                            <p className="no-notifications">Уведомлений нет 🎉</p>
                                        ) : (
                                            <ul className="notifications-list">
                                                {notes.map((n) => (
                                                    <li
                                                        key={n.id}
                                                        className={`notification-item ${n.is_read ? "read" : "unread"}`}
                                                    >
                                                        <div className="notification-header">
                                                            <b>{n.message}</b>
                                                        </div>
                                                        <div className="notification-body">
                                                            ПК: {n.pc_number} | Тариф: {n.tariff}
                                                        </div>
                                                        <div className="notification-footer">
                                                            Дата: {n.booking_date} {n.booking_time}
                                                        </div>
                                                        <div className="notification-status">
                                                            Статус: {n.is_approved ? "✅ Одобрено" : "⏳ В ожидании"}
                                                        </div>
                                                        {!n.is_read && (
                                                            <button
                                                                className="mark-read-btn"
                                                                onClick={() => markRead(n.id)}
                                                            >
                                                                Отметить прочитанным
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* === Заказы === */}
                                {activeTab === "billing" && (
                                    <div>
                                        <h6><IoFastFood /> Мои заказы</h6>
                                        <hr />
                                        {orders.length === 0 ? (
                                            <p>Заказы отсутствуют</p>
                                        ) : (
                                            orders.map((order) => (
                                                <div key={order.id} className="order">
                                                    <h3>
                                                        Заказ #{order.id} —{" "}
                                                        {new Date(order.created_at).toLocaleString()}
                                                    </h3>
                                                    <p>
                                                        <b>Кабинет:</b> {order.cabinet} |{" "}
                                                        <b>Комната:</b> {order.room} |{" "}
                                                        <b>Место:</b> {order.seat} |{" "}
                                                        <b>Зоны и Тарифы:</b> {order.order_type}
                                                    </p>
                                                    <ul>
                                                        {order.items.map((item) => (
                                                            <li key={item.id}>
                                                                {item.title} — {item.quantity} шт —{" "}
                                                                {Number(item.price) * item.quantity} сум
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p>
                                                        <b>Итого:</b> {order.total} сум
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;