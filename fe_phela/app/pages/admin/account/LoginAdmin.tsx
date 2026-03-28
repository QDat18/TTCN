import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "~/AuthContext";
import { toast } from 'react-toastify';
import api from '~/config/axios';
import { sendOtpForAdminPasswordReset, verifyOtpAndResetAdminPassword } from '~/services/authServices';

const LoginAdmin = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); //
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password states for Admin
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetStage, setResetStage] = useState<'email' | 'otp' | 'success'>('email');

    const handleLogin = async () => {
        if (!username || !password) {
            toast.error("Vui lòng nhập tài khoản và mật khẩu.");
            return;
        }
        
        setLoading(true);
        try {
            await login({ username, password }, 'admin'); //
            toast.success('Đăng nhập thành công!');
            setTimeout(() => navigate('/admin/dashboard'), 1500);
        } catch (err: any) {
            // Handle structured error response from backend
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Tài khoản hoặc mật khẩu không đúng!';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!forgotPasswordEmail) {
            toast.error("Vui lòng nhập email của bạn.");
            return;
        }
        setLoading(true);
        try {
            await sendOtpForAdminPasswordReset(forgotPasswordEmail);
            toast.success("Mã OTP đã được gửi đến email quản trị viên của bạn.");
            setResetStage('otp'); // Move to OTP stage
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Gửi OTP thất bại.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmNewPassword) {
            toast.error("Vui lòng nhập đủ thông tin.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }
        setLoading(true);
        try {
            await verifyOtpAndResetAdminPassword({
                email: forgotPasswordEmail,
                otp,
                newPassword
            });
            toast.success("Mật khẩu quản trị viên của bạn đã được đặt lại thành công.");
            setResetStage('success'); // Move to success stage
            setTimeout(() => {
                handleCloseForgotPassword();
            }, 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Đặt lại mật khẩu thất bại.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseForgotPassword = () => {
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setResetStage('email'); // Reset stage for next time
    };

    return (
        <div className="flex flex-col justify-center items-center p-10 bg-white h-screen">
            <h2 className="text-3xl font-bold mb-6">Login</h2>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="flex flex-col items-center">
                <input
                    type="text"
                    placeholder="Username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-2 mb-4 w-80 rounded border"
                />
                <div className="relative w-80 mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 w-full rounded border pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center text-lg text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>

                <div className="flex justify-between w-80 mb-4">
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" /> Remember me
                    </label>
                    <a href="#" className="text-sm text-gray-500" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); setResetStage('email'); }}>
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-64 p-2 bg-yellow-50 text-black rounded hover:bg-yellow-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 drop-shadow-lg disabled:bg-gray-400"
                >
                    {loading ? 'Đang đăng nhập...' : 'Login'}
                </button>
            </form>


            {/* Forgot Password Section for Admin */}
            {showForgotPassword && (
                <div className="fixed inset-0 flex justify-start items-center bg-gray-600 bg-opacity-50"> {/* Thay đổi justify-center thành justify-start */}
                    <div className="bg-white p-8 rounded-lg shadow-xl w-1/2 h-full flex flex-col justify-center items-center"> {/* Thêm w-1/2 và h-full */}
                        {resetStage === 'email' && (
                            <>
                                <h3 className="text-2xl font-bold mb-4 text-center">Quên mật khẩu (Admin)</h3>
                                <p className="mb-4 text-center">Vui lòng nhập email của bạn để nhận mã OTP.</p>
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    autoComplete="email"
                                    className="p-2 mb-4 w-full rounded border max-w-sm" 
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                />
                                <button
                                    className="w-full p-2 bg-yellow-50 text-black rounded hover:bg-yellow-100 disabled:bg-gray-400 mb-2 max-w-sm"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                >
                                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                                </button>
                                <button
                                    className="w-full p-2 bg-gray-200 text-black rounded hover:bg-gray-300 max-w-sm"
                                    onClick={handleCloseForgotPassword}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                            </>
                        )}

                        {resetStage === 'otp' && (
                            <>
                                <h3 className="text-2xl font-bold mb-4 text-center">Xác nhận OTP và Đặt lại mật khẩu (Admin)</h3>
                                <p className="mb-4 text-center">Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã OTP và mật khẩu mới.</p>
                                <input
                                    type="text"
                                    placeholder="Mã OTP"
                                    className="p-2 mb-4 w-full rounded border max-w-sm"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Mật khẩu mới"
                                    autoComplete="new-password"
                                    className="p-2 mb-4 w-full rounded border max-w-sm"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu mới"
                                    autoComplete="new-password"
                                    className="p-2 mb-4 w-full rounded border max-w-sm"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                                <button
                                    className="w-full p-2 bg-yellow-50 text-black rounded hover:bg-yellow-100 disabled:bg-gray-400 mb-2 max-w-sm"
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                >
                                    {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                                </button>
                                <button
                                    className="w-full p-2 bg-gray-200 text-black rounded hover:bg-gray-300 max-w-sm"
                                    onClick={handleCloseForgotPassword}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                            </>
                        )}

                        {resetStage === 'success' && (
                            <>
                                <h3 className="text-2xl font-bold mb-4 text-center text-green-600">Thành công!</h3>
                                <p className="mb-4 text-center">Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đóng cửa sổ này.</p>
                                <button
                                    className="w-full p-2 bg-yellow-50 text-black rounded hover:bg-yellow-100 max-w-sm"
                                    onClick={handleCloseForgotPassword}
                                >
                                    Đóng
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginAdmin;