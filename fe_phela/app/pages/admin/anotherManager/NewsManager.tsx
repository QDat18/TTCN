import React, { useState, useEffect } from 'react';
import { getAllNews, deleteNews } from '~/services/newsService';
import Header from '~/components/admin/Header';
import Modal from '~/components/admin/Modal';
import NewsForm from '~/components/admin/NewsForm';
import { FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '~/AuthContext';

interface News {
  newsId: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  createdAt: string;
}

const NewsManager = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

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

    fetchNews();
  }, [user, authLoading, navigate]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setNewsList(data);
    } catch (error) {
      toast.error('Không thể tải danh sách tin tức!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModalForCreate = () => {
    setEditingNewsId(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (newsId: string) => {
    setEditingNewsId(newsId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNewsId(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    fetchNews();
  };

  const handleDelete = async (newsId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteNews(newsId);
        toast.success('Xóa bài viết thành công!');
        fetchNews(); // Tải lại danh sách
      } catch (error) {
        toast.error('Xóa bài viết thất bại!');
      }
    }
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
            <h1 className="text-3xl font-bold">Quản lý tin tức</h1>
            <button
              onClick={handleOpenModalForCreate}
              className="bg-primary text-white font-bold py-2 px-4 rounded"
            >
              + Thêm bài viết mới
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ảnh</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((news) => (
                  <tr key={news.newsId}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <img src={news.thumbnailUrl || 'https://placehold.co/100x100?text=No+Img'} alt={news.title} className="w-24 h-16 object-cover rounded" />
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap font-bold">{news.title}</p>
                      <p className="text-gray-600 whitespace-no-wrap">{news.summary}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{new Date(news.createdAt).toLocaleDateString('vi-VN')}</p>

                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() => handleOpenModalForEdit(news.newsId)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(news.newsId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Phần Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingNewsId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
      >
        <NewsForm
          newsId={editingNewsId}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </>
  );
};

export default NewsManager;