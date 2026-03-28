import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '~/assets/images/logo.png';
import { useAuth } from '~/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FaShoppingCart } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import api from '~/config/axios';

const HeadOrder = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (user && user.type === 'customer') {
        try {
          const customerId = user.customerId;
          const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
          const fetchedCartId = cartResponse.data.cartId;

          if (fetchedCartId) {
            const countResponse = await api.get(`/api/customer/cart/${fetchedCartId}/item-count`);
            const itemCount = countResponse.data;
            setCartCount(itemCount);
          } else {
            setCartCount(0);
          }
        } catch (error) {
          console.error('Error fetching cart details:', error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartDetails();

    const handleCartUpdated = () => fetchCartDetails();
    window.addEventListener('cartUpdated', handleCartUpdated);

    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="navbar-order bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-[100]"
    >
      <div className="navbar-logo">
        <Link to="/" className="hover:scale-105 transition-transform inline-block">
          <img src={logo} alt="Phê La" className="h-10 w-auto object-contain" />
        </Link>
      </div>
      
      <div className="navbar-links flex items-center space-x-8">
        {user ? (
          <div className="flex items-center space-x-6">
            {user.type === 'customer' && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to="/cart" className="relative block">
                  <FaShoppingCart className="text-[#3d1d11] text-2xl cursor-pointer hover:text-black transition-colors" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )}
            
            <div 
              className="user-menu relative group"
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center cursor-pointer space-x-2 py-1">
                <RiAccountCircleLine className="text-[#3d1d11] text-2xl group-hover:text-black transition-colors" />
                <span className="text-[#3d1d11] font-bold uppercase tracking-widest text-[10px] group-hover:text-black transition-colors hidden sm:block">
                  {user.username}
                </span>
                <FiChevronRight className={`text-[#3d1d11]/40 text-sm transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} />
              </div>
              
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    {user.type === 'customer' && (
                      <div className="py-1">
                        <Link to="/profileCustomer" className="block px-4 py-2 text-[10px] font-black text-[#3d1d11] hover:bg-gray-50 uppercase tracking-widest">
                          Thông tin cá nhân
                        </Link>
                        <Link to="/my-address" className="block px-4 py-2 text-[10px] font-black text-[#3d1d11] hover:bg-gray-50 uppercase tracking-widest">
                          Quản lý địa chỉ
                        </Link>
                        <Link to="/my-orders" className="block px-4 py-2 text-[10px] font-black text-[#3d1d11] hover:bg-gray-50 uppercase tracking-widest">
                          Đơn hàng của tôi
                        </Link>
                      </div>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 uppercase tracking-widest"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login-register" className="px-6 py-2 bg-[#3d1d11] text-white rounded-full text-xs font-black tracking-widest uppercase hover:bg-black transition-colors">
              Đăng nhập
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HeadOrder;
