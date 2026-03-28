import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Header from '~/components/admin/Header';
import Modal from '~/components/admin/Modal';
import { getAllBannersAdmin, createBanner, deleteBanner, updateBannerStatus, BannerStatus } from '~/services/bannerService';
import { FiLock } from 'react-icons/fi';
import { useAuth } from '~/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Banner {
    bannerId: string;
    title: string;
    imageUrl: string;
    createdAt: string;
    status: BannerStatus;
}

const BannerManager = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
    const [newBannerTitle, setNewBannerTitle] = useState<string>('');
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [unauthorized, setUnauthorized] = useState<boolean>(false);

    useEffect(() => {

        if (authLoading) return;

        const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
        if (!user || !allowedRoles.includes(user.role)) {
            setUnauthorized(true);
            toast.error('Bạn không có quyền truy cập trang này', {
                onClose: () => navigate('/admin/dashboard')
            });
            return;
        }

        fetchBanners();
    }, [user, authLoading, navigate]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await getAllBannersAdmin(0, 100); 
            setBanners(data.content || data);
        } catch (error) {
            toast.error("Không thể tải danh sách banner.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewBannerFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBannerFile) {
            toast.warn("Vui lòng chọn một file ảnh.");
            return;
        }

        setIsSubmitting(true);

        try {
            await createBanner({
                title: newBannerTitle || '', // Title is optional, backend doesn't use it
                imageFile: newBannerFile
            });
            toast.success("Thêm banner mới thành công!");
            closeModalAndReset();
            fetchBanners(); // Tải lại danh sách
        } catch (error) {
            toast.error("Thêm banner thất bại!");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (bannerId: string) => {
        setBannerToDelete(bannerId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!bannerToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteBanner(bannerToDelete);
            toast.success("Xóa banner thành công!");
            fetchBanners();
            setIsDeleteModalOpen(false);
            setBannerToDelete(null);
        } catch (error) {
            toast.error("Xóa banner thất bại!");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setBannerToDelete(null);
    };

    const handleStatusChange = async (bannerId: string, newStatus: BannerStatus) => {
        try {
            await updateBannerStatus(bannerId, newStatus);
            toast.success("Cập nhật trạng thái thành công!");
            // Cập nhật lại state để giao diện thay đổi ngay lập tức
            setBanners(banners.map(b => b.bannerId === bannerId ? { ...b, status: newStatus } : b));
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại!");
        }
    };

    const closeModalAndReset = () => {
        setIsModalOpen(false);
        setNewBannerFile(null);
        setNewBannerTitle('');
        setPreview(null);
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
        <>
            <div>
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
                <div className="fixed top-0 left-0 w-full bg-white shadow-md z-40">
                    <Header />
                </div>
                <div className="container mx-auto mt-20 p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Quản lý banner</h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white font-bold py-2 px-4 rounded"
                        >
                            + Thêm banner mới
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {banners.map(banner => (
                            <div key={banner.bannerId} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img src={banner.imageUrl} alt="Banner" className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className={`h-4 w-4 rounded-full mr-2 ${banner.status === BannerStatus.ACTIVE ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <select
                                                value={banner.status}
                                                onChange={(e) => handleStatusChange(banner.bannerId, e.target.value as BannerStatus)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                            >
                                                <option value={BannerStatus.ACTIVE}>Hoạt động</option>
                                                <option value={BannerStatus.INACTIVE}>Không hoạt động</option>
                                            </select>
                                        </div>
                                        <button onClick={() => handleDeleteClick(banner.bannerId)} className="text-red-500 hover:text-red-700 font-semibold">Xóa</button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Ngày tạo: {new Date(banner.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModalAndReset} title="Thêm banner mới">
                <form onSubmit={handleCreateBanner}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bannerTitle">
                            Tiêu đề banner
                        </label>
                        <input
                            id="bannerTitle"
                            type="text"
                            value={newBannerTitle}
                            onChange={(e) => setNewBannerTitle(e.target.value)}
                            placeholder="Nhập tiêu đề banner"
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bannerFile">
                            Chọn ảnh banner
                        </label>
                        <input
                            id="bannerFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {preview && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold mb-2">Xem trước:</p>
                            <img src={preview} alt="Xem trước banner" className="w-full rounded-md object-contain max-h-64" />
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                            {isSubmitting ? 'Đang tải lên...' : 'Lưu banner'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop with blur */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
                        onClick={handleDeleteCancel}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Xác nhận xóa banner
                            </h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BannerManager;