import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Header.css is loaded via root.tsx links
import logo from "../../assets/images/logo.png";
import menuData from '../../data/menuAdmin.json';
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { useAuth } from '~/AuthContext';
import { RiAccountCircleLine } from "react-icons/ri";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/admin'); 
  };

  return (
    <div className="nav">
      <div>
        <Link to="/admin/dashboard"><img src={logo} className="w-16 h-10 mr-20" alt="Logo" /></Link>
      </div>

      <button className="hamburger-icon ml-auto" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes/> : <FaBars />}
      </button>

      <div className={`text-white menu-container ${isMenuOpen ? 'open' : ''}`}>
        <ul className="main-menu">
          {menuData.mainMenu.map((menu, index) => (
            <li key={index} className="menu-item group">
              <Link to={menu.link} onClick={() => setIsMenuOpen(false)}>
                {menu.title}
              </Link>
              {menu.subMenu.length > 0 && (
                <ul className="sub-menu">
                  {menu.subMenu.map((subMenu, subIndex) => (
                    <li key={subIndex}>
                      <Link to={subMenu.link} onClick={() => setIsMenuOpen(false)}>{subMenu.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-links ml-7 relative">
        {user ? (
          <div className="user-menu group">
           <div className="flex items-center cursor-pointer">
              <RiAccountCircleLine className='text-white mr-1 text-2xl' />
              <span className="mr-2 uppercase">{user.username}</span>
            </div>
            <div className="dropdown-menu group-hover:visible group-hover:opacity-100">
              <Link
                to="/admin/profileAdmin"
                className="dropdown-item uppercase no-underline"
              >
                Thông tin cá nhân
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item uppercase w-full text-left"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <Link to="/admin" className="btn-login">
            Đăng nhập
          </Link>
        )}
      </div>

    </div>
  );
}

export default Header;