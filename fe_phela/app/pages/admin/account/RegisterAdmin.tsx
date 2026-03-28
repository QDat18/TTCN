import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin } from '~/services/authServices';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from "react-icons/fi";

const RegisterAdmin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        password: '',
        confirmPassword: '',
        dob: '',
        email: '',
        phone: '',
        gender: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formatDateToDDMMYYYY = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async () => {
        // Kiểm tra dữ liệu phía client trước
        if (!formData.fullname || !formData.username || !formData.password || !formData.confirmPassword || !formData.dob || !formData.email || !formData.phone || !formData.gender) {
            toast.error('Không được để trống bất kỳ trường nào!');
            return;
        }

        if (!validatePassword(formData.password)) {
            toast.error('Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không trùng khớp.');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...rest } = formData;
            const formattedData = {
                ...rest,
                dob: rest.dob ? formatDateToDDMMYYYY(rest.dob) : '',
            };

            await registerAdmin(formattedData);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
            
            // Reset form và chuyển hướng sau một khoảng trễ ngắn để người dùng đọc toast
            setTimeout(() => {
                setFormData({
                    fullname: '', username: '', password: '', confirmPassword: '', dob: '', email: '', phone: '', gender: ''
                });
                navigate('/');
            }, 2000);

        } catch (err: any) {
            // Handle structured error response from backend
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Đăng ký không thành công! Vui lòng thử lại sau!';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center p-10 bg-yellow-50 text-black h-screen overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6">Admin Register</h2>

            {/* Các trường input không thay đổi */}
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="flex flex-col items-center">
                <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    placeholder="Fullname"
                    autoComplete="name"
                    className="p-2 mb-4 w-80 rounded border"
                />
                <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Username"
                    autoComplete="username"
                    className="p-2 mb-4 w-80 rounded border"
                />
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password"
                        autoComplete="new-password"
                        className="p-2 mb-4 w-80 rounded border pr-10"
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
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                        className="p-2 mb-4 w-80 rounded border pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center text-lg text-gray-500 hover:text-gray-700"
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                    autoComplete="email"
                    className="p-2 mb-4 w-80 rounded border"
                />          
                <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    placeholder="Date of Birth"
                    autoComplete="bday"
                    className="p-2 mb-4 w-80 rounded border"
                />
                <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone (10-11 digits)"
                    autoComplete="tel"
                    className="p-2 mb-4 w-80 rounded border"
                />
                <select 
                    className="p-2 mb-4 w-80 rounded border" 
                    value={formData.gender} 
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    autoComplete="sex"
                >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-64 p-2 bg-black text-white rounded transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 drop-shadow-lg disabled:bg-gray-500"
                >
                    {loading ? 'Đang xử lý...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default RegisterAdmin;