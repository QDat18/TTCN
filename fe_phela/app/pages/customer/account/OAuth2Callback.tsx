import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCustomerProfile } from "~/services/userServices";
import { toast } from "react-toastify";

const OAuth2Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const username = searchParams.get("username");
        const role = searchParams.get("role");

        if (token && username && role) {
            handleLogin(token, username, role);
        } else {
            const error = searchParams.get("error");
            if (error) {
                toast.error("Lỗi đăng nhập: " + error);
            } else {
                toast.error("Đăng nhập thất bại. Thiếu thông tin xác thực.");
            }
            navigate("/login-register");
        }
    }, [searchParams]);

    const handleLogin = async (token: string, username: string, role: string) => {
        try {
            localStorage.setItem("token", token);
            // profile fetch might fail if token is not yet picked up by axios interceptor
            // but axios interceptor usually reads from localStorage on every request
            const profile = await getCustomerProfile(username);
            
            const userData = {
                ...profile,
                username,
                role,
                type: 'customer',
                token
            };

            localStorage.setItem("user", JSON.stringify(userData));
            toast.success("Đăng nhập Google thành công!");
            // Redirect using window.location to force a full app reload and trigger AuthContext initializeAuth
            window.location.href = "/";
        } catch (error) {
            console.error("OAuth2 Login Error:", error);
            toast.error("Đăng nhập thất bại. Không thể tải hồ sơ.");
            navigate("/login-register");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Đang xác thực với Google...</p>
            </div>
        </div>
    );
};

export default OAuth2Callback;
