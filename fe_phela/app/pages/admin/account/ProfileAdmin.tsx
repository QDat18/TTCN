import React, { useState, useEffect } from 'react';
import Header from '~/components/admin/Header';
import api from '~/config/axios';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '~/AuthContext';
import { FiEdit, FiLock, FiSave, FiX, FiUser, FiMail, FiPhone, FiCalendar, FiChevronDown } from 'react-icons/fi';

interface Admin {
  employCode: string;
  fullname: string;
  username: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  branch: string;
}

interface PasswordUpdate {
  password: string;
}

const ProfileAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<PasswordUpdate>({ password: '' });
  const [formData, setFormData] = useState({
    fullname: '',
    dob: '',
    email: '',
    phone: '',
    gender: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/admin';
      return;
    }
    fetchAdmin();
  }, [user, authLoading]);

  const fetchAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/admin/${user?.username}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const adminData: Admin = {
        employCode: response.data.employCode,
        fullname: response.data.fullname,
        username: response.data.username,
        gender: response.data.gender,
        dob: response.data.dob,
        email: response.data.email,
        phone: response.data.phone,
        role: response.data.role,
        status: response.data.status,
        branch: response.data.branch || 'Chưa sắp xếp',
      };
      setAdmin(adminData);
      setFormData({
        fullname: adminData.fullname,
        dob: adminData.dob || '',
        email: adminData.email,
        phone: adminData.phone,
        gender: adminData.gender || '',
      });
    } catch (error: any) {
      console.error('Error fetching admin:', error);
      setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
      toast.error('Lỗi tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi định dạng ngày từ frontend (yyyy-MM-dd) sang backend (dd/MM/yyyy)
  const formatDateToBackend = (date: string): string => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      password: value,
    }));
  };

  const validateFormData = () => {
    if (!formData.fullname || formData.fullname.trim() === '') {
      setError('Họ và tên không được để trống.');
      return false;
    }
    if (!formData.dob) {
      setError('Ngày sinh không được để trống.');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Email không hợp lệ.');
      return false;
    }
    if (!formData.phone.match(/^0[0-9]{9}$/)) {
      setError('Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số.');
      return false;
    }
    if (!formData.gender) {
      setError('Giới tính không được để trống.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Kiểm tra dữ liệu trước khi gửi
    if (!validateFormData()) {
      setLoading(false);
      toast.error('Vui lòng kiểm tra lại dữ liệu.');
      return;
    }

    try {
      const updateData = {
        fullname: formData.fullname,
        dob: formatDateToBackend(formData.dob),
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
      };

      console.log('Update Data:', updateData);
      console.log('Token:', user?.token);

      const response = await api.put(`/api/admin/updateInfo/${admin?.username}`, updateData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      console.log('Update Response:', response.data);

      // Cập nhật lại admin với dữ liệu mới
      setAdmin((prev) => ({
        ...prev!,
        fullname: response.data.fullname,
        dob: response.data.dob, // Backend trả về yyyy-MM-dd
        email: response.data.email,
        phone: response.data.phone,
        gender: response.data.gender,
      }));
      // Cập nhật lại formData để hiển thị đúng
      setFormData({
        fullname: response.data.fullname,
        dob: response.data.dob || '',
        email: response.data.email,
        phone: response.data.phone,
        gender: response.data.gender || '',
      });
      toast.success('Cập nhật thông tin tài khoản thành công!');
    } catch (error: any) {
      console.error('Error updating admin:', error.response ? error.response.data : error.message);
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền cập nhật thông tin này.');
      } else {
        setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
      toast.error('Lỗi cập nhật thông tin. Kiểm tra console để biết thêm chi tiết.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/api/admin/${admin?.username}/password`, passwordData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      console.log('Password Update Response:', response.data);

      // Reset form mật khẩu
      setPasswordData({ password: '' });
      setShowPasswordForm(false);
      toast.success('Cập nhật mật khẩu thành công!');
    } catch (error: any) {
      console.error('Error updating password:', error.response ? error.response.data : error.message);
      if (error.response?.status === 400) {
        setError('Mật khẩu không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền cập nhật mật khẩu này.');
      } else {
        setError('Không thể cập nhật mật khẩu. Vui lòng thử lại.');
      }
      toast.error('Lỗi cập nhật mật khẩu. Kiểm tra console để biết thêm chi tiết.');
    } finally {
      setLoading(false);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Không tìm thấy thông tin tài khoản</h2>
          <button 
            onClick={fetchAdmin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiUser className="mr-2" /> Thông tin cá nhân
            </h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Thông tin không thể chỉnh sửa */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{admin.employCode}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{admin.username}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{admin.role}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin có thể chỉnh sửa */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullname"
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Tiếp tục với các trường khác */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        required
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FiChevronDown className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{admin.branch}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <FiLock className="mr-2" /> Đổi mật khẩu
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Form đổi mật khẩu */}
            {showPasswordForm && (
              <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiLock className="mr-2" /> Đổi mật khẩu
                  </h3>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;