import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff, FiUser, FiLock, FiMail, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { useAuth } from "~/AuthContext";
import { toast } from 'react-toastify';
import api from '~/config/axios';
import { sendOtpForCustomerPasswordReset, verifyOtpAndResetCustomerPassword } from '~/services/authServices';
import { motion, AnimatePresence } from "framer-motion";

const LoginCustomer = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetStage, setResetStage] = useState<'email' | 'otp' | 'success'>('email');

    const handleLogin = async () => {
        if (!username || !password) { toast.error("Vui lòng nhập tài khoản và mật khẩu."); return; }
        setLoading(true);
        try {
            await login({ username, password }, 'customer');
            toast.success(`Chào mừng ${username}! Đang chuẩn bị...`);
            navigate('/');
            updateLocation();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Tài khoản hoặc mật khẩu không đúng!');
            setLoading(false);
        }
    };

    const updateLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await api.patch(`/api/customer/updateLocation/${username}`, {
                        latitude: position.coords.latitude, longitude: position.coords.longitude
                    });
                } catch (error) { }
            },
            () => { },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
    };

    const handleSendOtp = async () => {
        if (!forgotPasswordEmail) { toast.error("Vui lòng nhập email của bạn."); return; }
        setLoading(true);
        try {
            await sendOtpForCustomerPasswordReset(forgotPasswordEmail);
            toast.success("Mã OTP đã được gửi!");
            setResetStage('otp');
        } catch (err: any) { toast.error(err.response?.data?.message || 'Gửi OTP thất bại.'); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmNewPassword) { toast.error("Vui lòng nhập đủ thông tin."); return; }
        if (newPassword !== confirmNewPassword) { toast.error("Mật khẩu không khớp."); return; }
        setLoading(true);
        try {
            await verifyOtpAndResetCustomerPassword({ email: forgotPasswordEmail, otp, newPassword });
            toast.success("Đặt lại mật khẩu thành công!");
            setResetStage('success');
            setTimeout(() => { handleCloseForgotPassword(); }, 3000);
        } catch (err: any) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setLoading(false); }
    };

    const handleCloseForgotPassword = () => {
        setShowForgotPassword(false);
        setForgotPasswordEmail(''); setOtp(''); setNewPassword(''); setConfirmNewPassword('');
        setResetStage('email');
    };

    // Shared Styles cao cấp - Tone nâu đậm
    const inputWrapper = "relative flex items-center group";
    const inputClasses = "w-full pl-11 pr-10 py-3.5 bg-[#2b1b12] border border-[#3d1d11] rounded-xl focus:ring-4 focus:ring-[#d48437]/20 focus:border-[#d48437] outline-none transition-all placeholder:text-gray-500 text-white text-sm font-medium hover:border-[#d48437]/50";
    const iconClasses = "absolute left-4 text-white/40 text-lg transition-colors group-focus-within:text-[#d48437]";

    return (
        <div className="w-full max-w-sm mx-auto bg-[#1f120b] p-8 rounded-3xl border border-[#3d1d11] shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Chào mừng!</h2>
                <p className="text-white/60 text-sm">Đăng nhập để nhận ngàn ưu đãi từ Phê La</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div className={inputWrapper}>
                    <FiUser className={iconClasses} />
                    <input type="text" placeholder="Tên đăng nhập" className={inputClasses} value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                <div className={inputWrapper}>
                    <FiLock className={iconClasses} />
                    <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" className={inputClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-orange-600 transition-colors">
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                </div>

                <div className="flex justify-between items-center text-sm py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-white/60 hover:text-white transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-[#3d1d11] bg-[#2b1b12] text-[#d48437] focus:ring-[#d48437]/20 cursor-pointer" />
                        <span className="font-medium">Ghi nhớ</span>
                    </label>
                    <button type="button" className="font-bold text-[#d48437] hover:text-[#e59447] transition-colors" onClick={() => setShowForgotPassword(true)}>
                        Quên mật khẩu?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#d48437] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#d48437]/20 hover:bg-[#e59447] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6">
                    <div className="border-t border-[#3d1d11] w-full absolute"></div>
                    <span className="bg-[#1f120b] px-4 text-xs font-bold text-white/40 tracking-wider relative uppercase">HOẶC ĐĂNG NHẬP VỚI</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.href = "http://localhost:8081/oauth2/authorization/google"}
                        className="flex items-center justify-center gap-2 py-2.5 bg-[#2b1b12] border border-[#3d1d11] rounded-xl hover:bg-[#d48437]/10 hover:border-[#d48437]/50 transition-all text-sm font-bold text-white/80"
                    >
                        <FaGoogle className="text-red-500 text-base" /> Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-[#2b1b12] border border-[#3d1d11] rounded-xl hover:bg-[#d48437]/10 hover:border-[#d48437]/50 transition-all text-sm font-bold text-white/80">
                        <FaFacebookF className="text-blue-600 text-base" /> Facebook
                    </button>
                </div>
            </div>

            {/* Modal Quên Mật Khẩu Tươi Sáng Hơn */}
            <AnimatePresence>
                {showForgotPassword && (
                    <div className="fixed inset-0 flex p-4 items-center justify-center bg-gray-900/40 backdrop-blur-sm z-[100]">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1f120b] p-8 rounded-3xl border border-[#3d1d11] shadow-2xl w-full max-w-md"
                        >
                            {resetStage === 'email' && (
                                <div className="space-y-5">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-[#d48437]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#d48437]">
                                            <FiMail size={28} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white">Quên mật khẩu?</h3>
                                        <p className="text-sm text-white/60 mt-2">Nhập email để nhận mã OTP</p>
                                    </div>
                                    <div className={inputWrapper}>
                                        <FiMail className={iconClasses} />
                                        <input type="email" placeholder="Email của bạn" className={inputClasses} value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} />
                                    </div>
                                    <div className="pt-2 flex gap-3">
                                        <button className="flex-1 py-3 text-sm font-bold text-white/40 hover:bg-white/5 rounded-xl transition-colors" onClick={handleCloseForgotPassword}>Hủy</button>
                                        <button className="flex-1 py-3 bg-[#d48437] text-white text-sm font-bold rounded-xl hover:bg-[#e59447] shadow-md shadow-[#d48437]/20 transition-colors disabled:opacity-50" onClick={handleSendOtp} disabled={loading}>{loading ? "Đang gửi..." : "Gửi OTP"}</button>
                                    </div>
                                </div>
                            )}

                            {resetStage === 'otp' && (
                                <div className="space-y-5">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-black text-white">Nhập mã OTP</h3>
                                    </div>
                                    <input type="text" placeholder="Nhập mã OTP (6 số)" className={`${inputClasses} text-center tracking-widest font-bold text-lg px-4`} value={otp} onChange={(e) => setOtp(e.target.value)} />
                                    <div className={inputWrapper}>
                                        <FiLock className={iconClasses} />
                                        <input type="password" placeholder="Mật khẩu mới" className={inputClasses} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                    </div>
                                    <div className={inputWrapper}>
                                        <FiLock className={iconClasses} />
                                        <input type="password" placeholder="Xác nhận mật khẩu" className={inputClasses} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                                    </div>
                                    <button className="w-full py-3 bg-[#d48437] text-white text-sm font-bold rounded-xl mt-4 shadow-md shadow-[#d48437]/20" onClick={handleResetPassword} disabled={loading}>Cập nhật mật khẩu</button>
                                </div>
                            )}

                            {resetStage === 'success' && (
                                <div className="py-6 text-center space-y-4">
                                    <FiCheckCircle className="text-6xl text-green-500 mx-auto" />
                                    <h3 className="text-2xl font-black text-white">Thành công!</h3>
                                    <p className="text-sm text-white/60">Mật khẩu đã được đổi. Vui lòng chờ...</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginCustomer;