
import { Link } from "react-router-dom";
import '../styles/Navbar.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // إذا كنت تستخدم React Router

export default function Navebar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // التحقق من تسجيل الدخول عند تحميل الصفحة
        const email = localStorage.getItem("email");
        if (email) {
            setIsLoggedIn(true); // المستخدم مسجل الدخول
            console.log("User is logged in:", email);
        } else {
            setIsLoggedIn(false); // المستخدم ليس مسجلاً
            console.log("No user logged in.");
        }
    }, []); // يتم تشغيل `useEffect` مرة واحدة فقط عند التحميل

    const handleLogout = () => {
        // تسجيل الخروج
        localStorage.removeItem("email");
        setIsLoggedIn(false);
        console.log("User logged out.");
        navigate("/login"); // إعادة التوجيه إلى صفحة تسجيل الدخول
    };
    const toggleNavbar = () => {
        // فتح/إغلاق شريط التنقل
        setIsNavbarOpen(!isNavbarOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg nav_container" >
            <div className="container">
                {/* شعار الموقع */}
                <img src="logo.png" alt="Logo" width="80px" style={{ marginRight: '20px' }} />

                {/* زر التبديل للشاشات الصغيرة */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleNavbar}
                    aria-controls="navbarSupportedContent"
                    aria-expanded={isNavbarOpen ? "true" : "false"}
                    aria-label="Toggle navigation"
                >
                    <FontAwesomeIcon
                        icon={isNavbarOpen ? faTimes : faBars}
                        style={{ color: "white", fontSize: "24px" }}
                    />
                </button>

                {/* روابط التنقل */}
                <div className={`collapse navbar-collapse ${isNavbarOpen ? "show" : ""}`} id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link active items custom-link" aria-current="page" href="\" style={{ color: "white" }} >Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link items custom-link" href="/video" style={{ color: "white" }}>video</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link items custom-link" href="/Dashboard" style={{ color: "white" }} >Chat Bot</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link items custom-link" href="#" style={{ color: "white" }} >About</a>
                        </li>
                    </ul>

                    {/* أزرار تسجيل الدخول والتسجيل */}
                    {!isLoggedIn ? (
                        <div className="auth-buttons">
                            <Link
                                href="/login"
                                className="btn btn-login"
                                style={{
                                    borderRadius: '20px 0px 0px 20px',
                                    padding: '10px 30px',
                                    backgroundColor: '#545D74',
                                    color: 'white',
                                    textDecoration: 'none',
                                    marginRight: '5px',
                                }}
                                onChange={e => (e.target.value)}
                            >
                                Login
                            </Link>
                            <a
                                href="/register"
                                className="btn"
                                style={{
                                    borderRadius: '0px 20px 20px 0px',
                                    padding: '10px 30px',
                                    backgroundColor: '#AD998A',
                                    color: 'white',
                                    textDecoration: 'none',
                                }}
                            >
                                Register
                            </a>
                        </div>
                    ) : (
                        <a
                            onClick={handleLogout}
                            href="#"
                            className="login"
                            style={{
                                borderRadius: '20px',
                                padding: '10px 30px',
                                backgroundColor: '#AD998A',
                                color: 'white',
                                textDecoration: 'none',
                            }}
                        >
                            Log Out
                        </a>
                    )}
                </div>
            </div>
        </nav>

    )
}