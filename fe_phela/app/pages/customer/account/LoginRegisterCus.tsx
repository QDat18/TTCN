import { useState, useEffect } from "react";
import Login from "./LoginCus";
import Register from "./RegisterCus";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

// --- DANH SÁCH ẢNH PR PHÊ LA ---
// Tạm thời mình để ảnh mẫu chất lượng cao. 
// Bạn hãy thay các link này bằng link ảnh Cloudinary thật của Phê La nhé!
const PR_IMAGES = [
    "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=1000&auto=format&fit=crop", // Ảnh trà sữa/cà phê 1
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop", // Ảnh không gian quán 2
    "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000&auto=format&fit=crop", // Ảnh hạt cà phê/nguyên liệu 3
];

const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Xử lý logic tự động chuyển ảnh mỗi 5 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === PR_IMAGES.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // 5000ms = 5 giây

        return () => clearInterval(timer); // Dọn dẹp timer khi component unmount
    }, []);

    return (
        <div className="min-h-screen bg-orange-50/30 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(230,115,0,0.15)] flex flex-col md:flex-row overflow-hidden border border-orange-100 relative z-10 min-h-[600px]">

                {/* --- KHU VỰC ẢNH PR BÊN TRÁI --- */}
                <div className="hidden md:flex md:w-5/12 relative flex-col justify-between p-12 overflow-hidden">
                    {/* Render các ảnh PR với hiệu ứng Fade */}
                    {PR_IMAGES.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Phe La PR ${index + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                                }`}
                        />
                    ))}

                    {/* Lớp phủ Gradient mờ màu đen để làm nổi bật chữ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    {/* Text bên trên ảnh */}
                    <div className="relative z-10 mt-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-white leading-tight mb-4 italic tracking-tight drop-shadow-lg"
                        >
                            Phê La <br />
                            <span className="text-amber-400 not-italic">Delivery</span>
                        </motion.h1>
                        <p className="text-gray-100 text-base font-medium max-w-xs leading-relaxed drop-shadow-md">
                            Cùng chúng mình viết tiếp câu chuyện đặc sản nông sản Việt Nam.
                        </p>
                    </div>

                    {/* Thanh gạch ngang (Chuyển động theo slide ảnh) */}
                    <div className="relative z-10 mb-8">
                        <div className="flex gap-2 mb-6">
                            {PR_IMAGES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${index === currentImageIndex
                                            ? "w-8 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                                            : "w-2 bg-white/50 hover:bg-white/80"
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-white text-xs font-bold tracking-[0.2em] uppercase drop-shadow-md">
                            Premium Coffee & Tea
                        </p>
                    </div>
                </div>

                {/* --- KHU VỰC FORM BÊN PHẢI --- */}
                <div className="w-full md:w-7/12 flex flex-col p-8 sm:p-12 relative bg-white">

                    {/* Nút Quay lại trang chủ */}
                    <Link
                        to="/"
                        className="absolute top-6 right-8 flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-colors font-medium text-sm z-20"
                    >
                        <FiArrowLeft /> Về Menu
                    </Link>

                    {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
                    <div className="flex bg-orange-50/50 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-8 border border-orange-100/50 mt-4 sm:mt-0">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${isLogin
                                    ? "bg-white text-orange-600 shadow-sm border border-orange-100/50"
                                    : "text-gray-400 hover:text-orange-500"
                                }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${!isLogin
                                    ? "bg-white text-orange-600 shadow-sm border border-orange-100/50"
                                    : "text-gray-400 hover:text-orange-500"
                                }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    <div className="flex-1 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col justify-center"
                            >
                                {isLogin ? <Login /> : <Register />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;