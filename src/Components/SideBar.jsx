import React, { use, useEffect, useState } from 'react';
import {
    LayoutGrid,
    LogOut,
    Menu,
    User,
    Users
} from 'lucide-react';
import '../Styles/SideBar.css';
import { Link, useLocation } from 'react-router';

export default function SideBar({ setVisibilityOfPopup }) {
    const [expanded, setExpanded] = useState(false);

    const { pathname } = useLocation();

    const handleLogout = () => {
        setVisibilityOfPopup(true);
        // TODO: handle logout functionality when we implement authentication
    };


    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    const menuItems = [
        { icon: <LayoutGrid size={18} />, label: 'Dashboard', link: "/" },
        { icon: <Users size={18} />, label: 'Users', link: "/users" },
        { icon: <User size={18} />, label: 'Show Profile', link: "/showAdmin" },
    ];

    return (
        <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
            <Menu size={30} className="menu-icon" onClick={toggleSidebar} />

            {/* Logo section */}
            <div className="logo">
                <img src="vite.svg" alt="this is logo" />
                {expanded && <p className="logoTitle">Mall Dashboard</p>}
            </div>

            {/* Menu section */}
            <nav className="nav-container">
                <ul className="nav-list">
                    {menuItems.map((item, index) => (
                        <Link to={item.link} className='nav-link' key={index}>
                            <li
                                className={`nav-item ${pathname === item.link ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {expanded && <span className="nav-label">{item.label}</span>}
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav>

            {/* Logout section */}
            <div className="logout" onClick={handleLogout}>
                <LogOut size={18} />
                {expanded && <span className="logoutTitle">Logout</span>}
            </div>
        </div>
    );
}
