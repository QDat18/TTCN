import React, { useState, useEffect } from 'react';
import Header from '~/components/admin/Header';
import api from '~/config/axios';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '~/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiPercent, FiDollarSign, FiCalendar, FiClock, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface DiscountCode {
  promotionId: string;
  promotionCode: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
}

interface DiscountCodeCreateDTO {
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const DiscountCode = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editDiscountCode, setEditDiscountCode] = useState<DiscountCode | null>(null);
  const [newDiscountCode, setNewDiscountCode] = useState<DiscountCodeCreateDTO>({
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minimumOrderAmount: undefined,
    maxDiscountAmount: undefined,
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });
  const [unauthorized, setUnauthorized] = useState<boolean>(false);

  useEffect(() => {
    if (authLoading) return;

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (!user || !allowedRoles.includes(user.role)) {
      setUnauthorized(true);
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }

    fetchDiscountCodes();
  }, [currentPage, user, authLoading]);

  const fetchDiscountCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/promotion/admin/all?page=${currentPage}&size=10&sortBy=promotionCode`);
      const data = response.data;

      const fetchedDiscountCodes = data.content.map((item: any) => ({
        promotionId: item.promotionId,
        promotionCode: item.promotionCode,
        name: item.name,
        description: item.description || '',
        discountType: item.discountType,
        discountValue: item.discountValue || 0,
        minimumOrderAmount: item.minimumOrderAmount || undefined,
        maxDiscountAmount: item.maxDiscountAmount || undefined,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
      }));

      setDiscountCodes(fetchedDiscountCodes);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('Error fetching discount codes:', error);
      setError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại.');
      toast.error('Lỗi tải danh sách mã giảm giá', {
        className: 'bg-red-100 text-red-800'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateDiscountCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newDiscountCode.name.trim() || newDiscountCode.discountValue <= 0 || !newDiscountCode.startDate || !newDiscountCode.endDate) {
      toast.error('Tên, giá trị giảm giá, ngày bắt đầu và ngày kết thúc là bắt buộc.');
      return;
    }

    const startDate = new Date(newDiscountCode.startDate);
    const endDate = new Date(newDiscountCode.endDate);
    if (startDate >= endDate) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editDiscountCode) {
        const response = await api.put(`/api/promotion/${editDiscountCode.promotionId}`, newDiscountCode);
        setDiscountCodes(discountCodes.map(d => d.promotionId === editDiscountCode.promotionId ? response.data : d));
        toast.success('Cập nhật mã giảm giá thành công!');
      } else {
        const response = await api.post('/api/promotion', newDiscountCode);
        setDiscountCodes([response.data, ...discountCodes]);
        toast.success('Tạo mã giảm giá thành công!');
      }
      setNewDiscountCode({
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minimumOrderAmount: undefined,
        maxDiscountAmount: undefined,
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
      });
      setEditDiscountCode(null);
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Không thể ${editDiscountCode ? 'cập nhật' : 'tạo'} mã giảm giá: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiscountCode = async (promotionId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      await api.delete(`/api/promotion/${promotionId}`);
      setDiscountCodes(discountCodes.filter(d => d.promotionId !== promotionId));
      toast.success('Xóa mã giảm giá thành công!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Không thể xóa mã giảm giá: ${errorMessage}`);
    }
  };

  const openModal = (discountCode?: DiscountCode) => {
    if (discountCode) {
      setEditDiscountCode(discountCode);
      setNewDiscountCode({
        name: discountCode.name,
        description: discountCode.description,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        minimumOrderAmount: discountCode.minimumOrderAmount,
        maxDiscountAmount: discountCode.maxDiscountAmount,
        startDate: discountCode.startDate.slice(0, 16),
        endDate: discountCode.endDate.slice(0, 16),
        status: discountCode.status === 'EXPIRED' ? 'ACTIVE' : discountCode.status,
      });
    } else {
      setEditDiscountCode(null);
      setNewDiscountCode({
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minimumOrderAmount: undefined,
        maxDiscountAmount: undefined,
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditDiscountCode(null);
    setNewDiscountCode({
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minimumOrderAmount: undefined,
      maxDiscountAmount: undefined,
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount?: number) => {
    return amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ' : 'Không có';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiLock className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Quay lại trang Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        toastClassName="border border-gray-200 shadow-lg"
        progressClassName="bg-amber-500"
        closeButton={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Header />
      </div>
      
      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã giảm giá</h1>
          <button
            onClick={() => openModal()}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FiPlus className="mr-2" /> Thêm mã giảm giá
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
          ) : discountCodes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã giảm giá
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại giảm giá
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian áp dụng
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {discountCodes.map((discountCode) => (
                      <tr key={discountCode.promotionId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {discountCode.promotionCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{discountCode.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{discountCode.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {discountCode.discountType === 'PERCENTAGE' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FiPercent className="mr-1" /> Phần trăm
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiDollarSign className="mr-1" /> Tiền mặt
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {discountCode.discountType === 'PERCENTAGE'
                            ? `${discountCode.discountValue}%`
                            : formatCurrency(discountCode.discountValue)}
                          <div className="text-xs text-gray-400">
                            Tối thiểu: {formatCurrency(discountCode.minimumOrderAmount)}
                          </div>
                          {discountCode.maxDiscountAmount && (
                            <div className="text-xs text-gray-400">
                              Tối đa: {formatCurrency(discountCode.maxDiscountAmount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 text-gray-400" />
                            <span>{formatDate(discountCode.startDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-1 text-gray-400" />
                            <span>{formatDate(discountCode.endDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${discountCode.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : discountCode.status === 'EXPIRED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {discountCode.status === 'ACTIVE'
                              ? 'Hoạt động'
                              : discountCode.status === 'EXPIRED'
                                ? 'Hết hạn'
                                : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => openModal(discountCode)}
                            className="text-amber-600 hover:text-amber-900"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscountCode(discountCode.promotionId)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage === totalPages - 1}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Trang <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                          disabled={currentPage === 0}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Trước</span>
                          <FiChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                          disabled={currentPage === totalPages - 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Sau</span>
                          <FiChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <FiPercent className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có mã giảm giá nào</h3>
              <div className="mt-6">
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  Thêm mã giảm giá
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editDiscountCode ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateOrUpdateDiscountCode} className="mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Tên mã giảm giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newDiscountCode.name}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Mô tả
                      </label>
                      <input
                        type="text"
                        id="description"
                        value={newDiscountCode.description}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, description: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
                        Loại giảm giá <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="discountType"
                        value={newDiscountCode.discountType}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, discountType: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      >
                        <option value="PERCENTAGE">Phần trăm</option>
                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
                        Giá trị giảm giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="discountValue"
                        value={newDiscountCode.discountValue}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, discountValue: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="minimumOrderAmount" className="block text-sm font-medium text-gray-700">
                        Đơn hàng tối thiểu
                      </label>
                      <input
                        type="number"
                        id="minimumOrderAmount"
                        value={newDiscountCode.minimumOrderAmount || ''}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, minimumOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700">
                        Giảm giá tối đa
                      </label>
                      <input
                        type="number"
                        id="maxDiscountAmount"
                        value={newDiscountCode.maxDiscountAmount || ''}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        value={newDiscountCode.startDate}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, startDate: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        value={newDiscountCode.endDate}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, endDate: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Trạng thái <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        value={newDiscountCode.status}
                        onChange={(e) => setNewDiscountCode({ ...newDiscountCode, status: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : editDiscountCode ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCode;