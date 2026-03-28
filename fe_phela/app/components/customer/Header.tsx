import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../assets/images/logo.png";
import menuData from '../../data/menuUser.json';
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from '~/AuthContext';
import { RiAccountCircleLine } from "react-icons/ri";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-[1000] flex justify-center items-center px-6 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="flex items-center w-full max-w-7xl justify-between">
        <Link to="/" className="flex-shrink-0">
          <img src={logo} className="h-10 w-auto" alt="Logo" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:block">
          <ul className="flex space-x-10">
            {menuData.mainMenu.map((menu, index) => (
              <li key={index} className="relative group">
                <Link 
                  to={menu.link} 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                    isScrolled ? 'text-[#3d1d11]' : 'text-gray-800'
                  } hover:text-black`}
                >
                  {menu.title}
                </Link>
                {menu.subMenu.length > 0 && (
                  <div className="absolute top-full left-0 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-48 bg-white shadow-xl rounded-xl border border-gray-100 py-2">
                    {menu.subMenu.map((sub, idx) => (
                      <Link key={idx} to={sub.link} className="block px-6 py-2 text-[10px] font-black text-[#3d1d11] hover:bg-gray-50 uppercase tracking-widest">
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="relative group">
              <div className="flex items-center cursor-pointer">
                <RiAccountCircleLine className={`text-2xl ${isScrolled ? 'text-[#3d1d11]' : 'text-gray-800'}`} />
                <span className={`ml-2 text-[10px] font-black uppercase tracking-widest hidden lg:inline ${
                  isScrolled ? 'text-[#3d1d11]' : 'text-gray-800'
                }`}>
                  {user.username}
                </span>
              </div>
              <div className="absolute top-full right-0 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-48 bg-white shadow-xl rounded-xl border border-gray-100 py-2">
                <Link to="/profileCustomer" className="block px-6 py-2 text-[10px] font-black text-amber-900 hover:bg-amber-50 uppercase tracking-widest">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-6 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 uppercase tracking-widest">Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login-register" className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isScrolled ? 'bg-[#3d1d11] text-white shadow-lg shadow-[#3d1d11]/20' : 'bg-white text-[#3d1d11] shadow-xl'
            }`}>
              Login
            </Link>
          )}
          
          <button className="md:hidden text-[#3d1d11]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
             <FaBars size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[2000] p-10"
          >
            <div className="flex justify-between items-center mb-10">
               <img src={logo} className="h-8 w-auto" alt="Logo" />
               <button onClick={() => setIsMenuOpen(false)}><FaTimes size={24} /></button>
            </div>
            <ul className="space-y-6">
              {menuData.mainMenu.map((menu, index) => (
                <li key={index}>
                  <Link to={menu.link} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-amber-900 uppercase">{menu.title}</Link>
                </li>
              ))}
              {user ? (
                <li><button onClick={handleLogout} className="text-2xl font-black text-red-600 uppercase">Logout</button></li>
              ) : (
                <li><Link to="/login-register" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-amber-900 uppercase">Login</Link></li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Header;
