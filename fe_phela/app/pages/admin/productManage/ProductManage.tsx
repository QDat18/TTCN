import React, { useState, useEffect } from 'react';
import Header from '~/components/admin/Header';
import api from '~/config/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '~/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiX, FiEye, FiEyeOff, FiImage, FiLock } from 'react-icons/fi';

interface Product {
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  originalPrice: number;
  imageUrl: string;
  status: 'SHOW' | 'HIDE';
  categoryCode: string;
}

interface ProductCreateDTO {
  productName: string;
  description: string;
  originalPrice: number;
  categoryCode: string;
  imageUrl?: string;
}

interface Category {
  categoryCode: string;
  categoryName: string;
}

const ProductManage = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<ProductCreateDTO>({
    productName: '',
    description: '',
    originalPrice: 0,
    categoryCode: '',
    imageUrl: '',
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [searchPrefix, setSearchPrefix] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);
  const navigate = useNavigate();
  

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

    fetchCategories();
    fetchProducts();
  }, [currentPage, searchPrefix, filterCategory, user, authLoading]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories/getAll?page=0&size=100&sortBy=categoryName');
      const data = response.data;
      setCategories(data.content.map((item: any) => ({
        categoryCode: item.categoryCode,
        categoryName: item.categoryName,
      })));
    } catch (error: any) {
      console.error('Error fetching categories:', error.response ? error.response.data : error.message);
      toast.error('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/product/all?page=${currentPage}&size=10&sortBy=productName`;

      if (searchPrefix) {
        url = `/api/admin/product/search?prefix=${searchPrefix}&page=${currentPage}&size=10&sortBy=productName`;
      }
      else if (filterCategory) {
        url = `/api/admin/product/category/${filterCategory}?page=${currentPage}&size=10&sortBy=productName`;
      }

      const response = await api.get(url);
      let data = response.data;

      let fetchedProducts = data.content.map((item: any) => ({
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        description: item.description || '',
        originalPrice: item.originalPrice || 0,
        imageUrl: item.imageUrl || '',
        status: item.status,
        categoryCode: item.categoryCode || '',
      }));

      setProducts(fetchedProducts);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('Error fetching products:', error.response ? error.response.data : error.message);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
      toast.error('Lỗi tải danh sách sản phẩm. Kiểm tra console để biết thêm chi tiết.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!editProduct) {
      if (!newProduct.productName.trim() || !newProduct.categoryCode || newProduct.originalPrice <= 0) {
        toast.error('Tên sản phẩm, danh mục và giá gốc là bắt buộc khi tạo mới.');
        return;
      }
      if (!selectedImage) {
        toast.error('Vui lòng chọn ảnh khi tạo sản phẩm mới.');
        return;
      }
    }

    if (editProduct && !newProduct.productName.trim()) {
      toast.error('Tên sản phẩm không được để trống.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Create product DTO (excluding categoryCode and imageUrl from the object)
      const productDTO = {
        productName: newProduct.productName,
        description: newProduct.description,
        originalPrice: newProduct.originalPrice
      };

      formData.append('product', new Blob([JSON.stringify(productDTO)], { type: 'application/json' }));
      formData.append('categoryCode', newProduct.categoryCode);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (editProduct) {
        const response = await api.put(`/api/admin/product/${editProduct.productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts(products.map(p => p.productId === editProduct.productId ? response.data : p));
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        const response = await api.post('/api/admin/product/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts([response.data, ...products]);
        toast.success('Tạo sản phẩm thành công!');
      }
      setNewProduct({ productName: '', description: '', originalPrice: 0, categoryCode: '', imageUrl: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setEditProduct(null);
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Error in create/update product:', errorMessage);
      toast.error(`Không thể ${editProduct ? 'cập nhật' : 'tạo'} sản phẩm: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái sản phẩm này?')) return;
    try {
      const response = await api.patch(`/api/admin/product/${productId}/toggle-status`);
      const updatedProduct: Product = {
        productId: response.data.productId,
        productCode: response.data.productCode,
        productName: response.data.productName,
        description: response.data.description || '',
        originalPrice: response.data.originalPrice || 0,
        imageUrl: response.data.imageUrl || '',
        status: response.data.status,
        categoryCode: response.data.categoryCode || '',
      };
      setProducts(products.map(p => p.productId === productId ? updatedProduct : p));
      toast.success('Thay đổi trạng thái thành công!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Error toggling status:', errorMessage);
      toast.error(`Không thể thay đổi trạng thái: ${errorMessage}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditProduct(product);
      setNewProduct({
        productName: product.productName,
        description: product.description,
        originalPrice: product.originalPrice,
        categoryCode: product.categoryCode || '',
        imageUrl: product.imageUrl || '',
      });
      setImagePreview(product.imageUrl || null);
    } else {
      setEditProduct(null);
      setNewProduct({ productName: '', description: '', originalPrice: 0, categoryCode: '', imageUrl: '' });
      setSelectedImage(null);
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
    setNewProduct({ productName: '', description: '', originalPrice: 0, categoryCode: '', imageUrl: '' });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getCategoryName = (categoryCode: string) => {
    const category = categories.find(cat => cat.categoryCode === categoryCode);
    return category ? category.categoryName : 'Không xác định';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
            Chỉ quản trị viên mới có quyền truy cập trang quản lý sản phẩm.
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
    />
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <button
            onClick={() => openModal()}
            className="mt-4 md:mt-0 flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition duration-200"
            disabled={isModalOpen}
          >
            <FiPlus className="mr-2" />
            Thêm sản phẩm
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm sản phẩm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchPrefix}
                  onChange={(e) => {
                    setSearchPrefix(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Nhập tên hoặc mô tả..."
                  disabled={loading || isModalOpen}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo danh mục</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(0);
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                disabled={loading || isModalOpen}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.categoryCode} value={category.categoryCode}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`bg-white shadow rounded-lg overflow-hidden ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
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
                    {products.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              {product.imageUrl ? (
                                <img className="h-16 w-16 rounded-md object-cover" src={product.imageUrl} alt={product.productName} />
                              ) : (
                                <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                                  <FiImage className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                              <div className="text-sm text-gray-500">{product.productCode}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs" title={product.description}>
                                {product.description || 'Không có mô tả'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getCategoryName(product.categoryCode)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatPrice(product.originalPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'SHOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.status === 'SHOW' ? 'Hiển thị' : 'Ẩn'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => openModal(product)}
                            className="text-amber-600 hover:text-amber-900 transition duration-150"
                            disabled={loading || isModalOpen}
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="inline-block" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(product.productId)}
                            className={product.status === 'SHOW' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            disabled={loading || isModalOpen}
                            title={product.status === 'SHOW' ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                          >
                            {product.status === 'SHOW' ? <FiEyeOff className="inline-block" /> : <FiEye className="inline-block" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0 || loading || isModalOpen}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-primary "
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage === totalPages - 1 || loading || isModalOpen}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-primary"
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
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                          disabled={currentPage === 0 || loading || isModalOpen}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Trước</span>
                          <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                          disabled={currentPage === totalPages - 1 || loading || isModalOpen}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Sau</span>
                          <FiChevronRight className="h-5 w-5" aria-hidden="true" />
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
                <FiImage className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchPrefix || filterCategory ? 'Thử thay đổi điều kiện tìm kiếm' : 'Bắt đầu bằng cách thêm sản phẩm mới'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  Thêm sản phẩm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
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
                    {editProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateOrUpdateProduct} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="productName"
                        value={newProduct.productName}
                        onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Nhập tên sản phẩm..."
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="categoryCode" className="block text-sm font-medium text-gray-700">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="categoryCode"
                        value={newProduct.categoryCode}
                        onChange={(e) => setNewProduct({ ...newProduct, categoryCode: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      >
                        <option value="">Chọn danh mục...</option>
                        {categories.map((category) => (
                          <option key={category.categoryCode} value={category.categoryCode}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
                        Giá gốc (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="originalPrice"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, originalPrice: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Nhập giá gốc..."
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giá hiển thị
                      </label>
                      <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm">
                        {formatPrice(newProduct.originalPrice)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      placeholder="Nhập mô tả sản phẩm..."
                    />
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Ảnh sản phẩm {!editProduct && <span className="text-red-500">*</span>}
                    </label>
                    {editProduct && editProduct.imageUrl && !imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">Ảnh hiện tại:</p>
                        <div className="flex items-center space-x-4">
                          <img
                            src={editProduct.imageUrl}
                            alt="Current product"
                            className="h-24 w-24 rounded-md object-cover border"
                          />
                          <div className="text-sm text-gray-500">
                            <p>Ảnh này sẽ được giữ nguyên nếu bạn không chọn ảnh mới.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {(imagePreview || (editProduct && !editProduct.imageUrl)) && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">Ảnh mới:</p>
                        <img
                          src={imagePreview || ''}
                          alt="Preview"
                          className="h-24 w-24 rounded-md object-cover border"
                        />
                      </div>
                    )}
                    <div className="mt-2">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Chọn file ảnh để {editProduct ? 'cập nhật' : 'tải lên'} (JPEG, PNG, JPG)
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      disabled={isSubmitting}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                      disabled={isSubmitting || (!editProduct && !selectedImage)}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : editProduct ? 'Cập nhật' : 'Thêm mới'}
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

export default ProductManage;