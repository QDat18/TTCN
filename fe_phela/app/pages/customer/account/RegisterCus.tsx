import { useState } from 'react';
import { toast } from 'react-toastify';
import { registerCustomer } from '~/services/authServices';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiPhone, FiInfo } from "react-icons/fi";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "", fullname: "", phone: "", password: "", confirmPassword: "", email: "", gender: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = (password: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    const validatePhone = (phone: string) => /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone);

    const handleRegister = async () => {
        if (!formData.username || !formData.fullname || !formData.phone || !formData.password || !formData.email || !formData.gender) {
            toast.error("Vui lòng điền đầy đủ tất cả các trường."); return;
        }
        if (!validatePhone(formData.phone)) { toast.error("Số điện thoại không hợp lệ."); return; }
        if (!validatePassword(formData.password)) { toast.error("Mật khẩu: Ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt."); return; }
        if (formData.password !== formData.confirmPassword) { toast.error("Mật khẩu xác nhận không khớp."); return; }

        setLoading(true);
        try {
            const { confirmPassword, ...payload } = formData;
            await registerCustomer(payload);
            toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
            setTimeout(() => { window.location.reload(); }, 3000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Đăng ký thất bại!");
        } finally { setLoading(false); }
    };

    // Shared Styles Sáng sủa
    const inputWrapper = "relative flex items-center group";
    const inputClasses = "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-800 text-sm font-medium hover:border-orange-200";
    const iconClasses = "absolute left-3.5 text-gray-400 text-base transition-colors group-focus-within:text-orange-500";

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-gray-800 mb-1">Gia nhập Phê La</h2>
                <p className="text-gray-500 text-sm">Đăng ký thành viên để nhận ưu đãi</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={inputWrapper}>
                        <FiUser className={iconClasses} />
                        <input type="text" placeholder="Tên đăng nhập" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={inputClasses} />
                    </div>
                    <div className={inputWrapper}>
                        <FiInfo className={iconClasses} />
                        <input type="text" placeholder="Họ và tên" value={formData.fullname} onChange={(e) => setFormData({ ...formData, fullname: e.target.value })} className={inputClasses} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={inputWrapper}>
                        <FiPhone className={iconClasses} />
                        <input type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClasses} />
                    </div>
                    <div className={inputWrapper}>
                        <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={`${inputClasses} appearance-none cursor-pointer text-gray-600`}>
                            <option value="" disabled>-- Giới tính --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                        <div className="absolute right-4 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className={inputWrapper}>
                    <FiMail className={iconClasses} />
                    <input type="email" placeholder="Địa chỉ Email (Để nhận mã xác nhận)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClasses} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={inputWrapper}>
                        <FiLock className={iconClasses} />
                        <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClasses} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-gray-400 hover:text-orange-600 transition-colors">
                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                    <div className={inputWrapper}>
                        <FiLock className={iconClasses} />
                        <input type={showConfirmPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={inputClasses} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-gray-400 hover:text-orange-600 transition-colors">
                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/30 hover:bg-orange-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-gray-200 w-full absolute"></div>
                    <span className="bg-white px-4 text-xs font-bold text-gray-400 tracking-wider relative">HOẶC TẠO TÀI KHOẢN VỚI</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.href = "http://localhost:8081/oauth2/authorization/google"}
                        className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-100 hover:text-orange-600 transition-all text-sm font-bold text-gray-600"
                    >
                        <FaGoogle className="text-red-500 text-base" /> Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-all text-sm font-bold text-gray-600">
                        <FaFacebookF className="text-blue-600 text-base" /> Facebook
                    </button>
                </div>
            </div>

            <p className="mt-5 text-center text-xs font-medium text-gray-400">
                Bằng việc đăng ký, bạn đồng ý với các <span className="text-orange-600 hover:text-orange-700 underline cursor-pointer">điều khoản</span> của chúng tôi.
            </p>
        </div>
    );
};

export default Register;