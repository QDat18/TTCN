import React, { useState, useEffect, useRef } from 'react';
import HeadOrder from '~/components/customer/HeadOrder';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '~/AuthContext';
import { FiShoppingCart, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { getPublicCategories } from '~/services/categoryService';
import { getPublicProductsByCategory, getPublicProductById } from '~/services/productService';
import { getCustomerCart, addToCart as addItemToCart } from '~/services/cartService';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '~/components/common/ScrollReveal';

// --- Giữ nguyên các Interface ---
interface Product {
    productId: string;
    productName: string;
    description: string;
    originalPrice: number;
    imageUrl: string;
    status: string;
}

interface Category {
    categoryCode: string;
    categoryName: string;
    products: Product[];
}

const Product = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement }>({});
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- Giữ nguyên các State Tìm kiếm/Lọc ---
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    // --- Giữ nguyên Logic Fetch dữ liệu ---
    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
            try {
                const categoriesResponse = await getPublicCategories();

                const categoriesData = categoriesResponse.content.filter(
                    (category: { categoryCode: string; categoryName: string }) =>
                        category.categoryCode.toUpperCase() !== 'TOPPING'
                );

                const categoriesWithProducts = await Promise.all(
                    categoriesData.map(async (category: { categoryCode: string; categoryName: string }) => {
                        const productsData = await getPublicProductsByCategory(category.categoryCode);
                        return {
                            categoryCode: category.categoryCode,
                            categoryName: category.categoryName,
                            products: productsData
                        };
                    })
                );

                setCategories(categoriesWithProducts);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh mục sản phẩm');
                setLoading(false);
            }
        };

        fetchCategoriesAndProducts();
    }, []);

    // --- Giữ nguyên Logic Scroll & Giỏ hàng ---
    const scrollToCategory = (categoryCode: string) => {
        const element = categoryRefs.current[categoryCode];
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }
    };

    const addToCart = async (productId: string) => {
        if (!user || user.type !== 'customer') {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
                onClick: () => navigate('/login')
            });
            return;
        }

        try {
            const product = await getPublicProductById(productId);
            const customerId = user.customerId;
            const cart = await getCustomerCart(customerId);
            const cartId = cart.cartId;

            if (cartId) {
                const cartItemDTO = {
                    productId: product.productId,
                    quantity: 1,
                    amount: product.originalPrice * 1,
                    note: ''
                };
                await addItemToCart(cartId, cartItemDTO);
                window.dispatchEvent(new Event('cartUpdated'));
                toast.success('Đã thêm sản phẩm vào giỏ hàng');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng');
        }
    };

    // --- Giữ nguyên Logic Lọc dữ liệu ---
    const getFilteredCategories = () => {
        return categories.map(category => {
            let filteredProducts = category.products.filter(product => {
                const matchSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
                let matchPrice = true;
                if (priceFilter === 'under30') matchPrice = product.originalPrice < 30000;
                else if (priceFilter === '30to50') matchPrice = product.originalPrice >= 30000 && product.originalPrice <= 50000;
                else if (priceFilter === 'over50') matchPrice = product.originalPrice > 50000;
                return matchSearch && matchPrice;
            });

            if (sortBy === 'priceAsc') {
                filteredProducts.sort((a, b) => a.originalPrice - b.originalPrice);
            } else if (sortBy === 'priceDesc') {
                filteredProducts.sort((a, b) => b.originalPrice - a.originalPrice);
            }

            return { ...category, products: filteredProducts };
        }).filter(category => category.products.length > 0);
    };

    const filteredCategories = getFilteredCategories();

    // --- UI/UX: Nâng cấp Loading State ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-[#2b1b12]">
                <motion.div
                    animate={{ rotate: 360, borderTopColor: ["#a64b18", "#d48437", "#a64b18"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#3d2518] border-t-[#a64b18] rounded-full shadow-[0_0_15px_rgba(166,75,24,0.3)]"
                />
                <p className="text-[#a69b91] font-black text-sm uppercase tracking-[0.3em] animate-pulse">
                    Đang chuẩn bị menu...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#2b1b12]">
                <div className="text-center p-6 bg-[#1f120b] border border-red-900/30 rounded-lg shadow-xl">
                    <p className="text-red-500 font-bold">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#a64b18] hover:bg-[#8a3c10] text-white rounded transition-colors text-xs font-bold uppercase tracking-wider">Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2b1b12]">
            <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-[0_4px_30px_rgba(0,0,0,0.4)] z-50 border-b border-[#3d2518]">
                <HeadOrder />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- SIDEBAR DANH MỤC (Nâng cấp độ đậm font) --- */}
                    <aside className="lg:w-1/4 bg-[#1f120b] p-8 rounded-[2rem] shadow-xl sticky top-28 h-fit border border-[#3d2518]">
                        <h3 className="text-2xl font-black text-white mb-8 pb-4 border-b border-[#3d2518] tracking-tight">DANH MỤC</h3>
                        <nav>
                            <ul className="space-y-4">
                                {filteredCategories.map((category) => (
                                    <li key={category.categoryCode}>
                                        <button
                                            onClick={() => scrollToCategory(category.categoryCode)}
                                            className="flex items-center justify-between w-full p-4 text-[#a69b91] hover:text-white rounded-xl hover:bg-[#2b1b12] hover:border-[#4a2e1d] transition-all group border border-transparent"
                                        >
                                            {/* UI/UX: Chuyển sang font-bold để rõ ràng hơn */}
                                            <span className="font-bold text-left tracking-tight group-hover:translate-x-1 transition-transform">{category.categoryName}</span>
                                            <span className="text-[10px] bg-[#3d2518] px-3 py-1.5 rounded-full font-black text-[#a69b91] group-hover:bg-[#d48437] group-hover:text-white transition-all shadow-inner">
                                                {category.products.length}
                                            </span>
                                        </button>
                                    </li>
                                ))},
                                {filteredCategories.length === 0 && (
                                    <li className="text-[#a69b91] text-xs italic p-4">Không tìm thấy danh mục phù hợp</li>
                                )}
                            </ul>
                        </nav>
                    </aside>

                    {/* --- NỘI DUNG CHÍNH --- */}
                    <div className="lg:w-3/4">

                        {/* UI/UX: Sửa căn giữa cho Toolbar và nâng cấp Style */}
                        <div className="bg-[#1f120b] p-6 rounded-[2rem] shadow-xl mb-10 flex flex-col md:flex-row gap-6 justify-between items-center z-10 relative border border-[#3d2518]">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <FiSearch className="text-[#a69b91]" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm món ngon..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 border border-[#3d2518] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#d48437]/20 focus:border-[#d48437] transition-all text-sm bg-[#2b1b12] text-white placeholder:text-[#a69b91]/60 font-medium"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <div className="relative flex items-center group">
                                    <FiFilter className="absolute left-4 text-[#a69b91] pointer-events-none" />
                                    <select
                                        value={priceFilter}
                                        onChange={(e) => setPriceFilter(e.target.value)}
                                        className="w-full sm:w-auto pl-12 pr-12 py-4 border border-[#3d2518] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#d48437]/20 focus:border-[#d48437] text-sm font-bold text-[#fdfaf6] appearance-none bg-[#2b1b12] cursor-pointer tracking-wider uppercase"
                                    >
                                        <option value="all">Mức giá</option>
                                        <option value="under30">Dưới 30k</option>
                                        <option value="30to50">30k - 50k</option>
                                        <option value="over50">Trên 50k</option>
                                    </select>
                                    <div className="absolute right-4 pointer-events-none">
                                        <FiChevronRight className="rotate-90 text-[#a69b91]" />
                                    </div>
                                </div>

                                <div className="relative flex items-center group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full sm:w-auto pl-6 pr-12 py-4 border border-[#3d2518] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#d48437]/20 focus:border-[#d48437] text-sm font-bold text-[#fdfaf6] appearance-none bg-[#2b1b12] cursor-pointer tracking-wider uppercase"
                                    >
                                        <option value="default">Sắp xếp</option>
                                        <option value="priceAsc">Giá thấp → cao</option>
                                        <option value="priceDesc">Giá cao → thấp</option>
                                    </select>
                                    <div className="absolute right-4 pointer-events-none">
                                        <FiChevronRight className="rotate-90 text-[#a69b91]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UI/UX: Nâng cấp Empty State */}
                        <AnimatePresence mode="popLayout">
                            {filteredCategories.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="bg-[#1f120b] p-16 rounded-[40px] shadow-xl text-center border border-[#3d2518] flex flex-col items-center gap-6"
                                >
                                    <div className="w-24 h-24 bg-[#2b1b12] rounded-full flex items-center justify-center border border-[#3d2518]">
                                        <FiSearch className="text-5xl text-[#d48437]/30" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white">Không tìm thấy món này</h3>
                                    <p className="text-sm text-[#a69b91] max-w-sm mb-4 leading-relaxed">Hãy thử tìm với từ khóa khác nhé.</p>
                                    <button
                                        onClick={() => { setSearchTerm(''); setPriceFilter('all'); setSortBy('default'); }}
                                        className="px-8 py-3.5 bg-[#a64b18] hover:bg-[#8a3c10] text-white rounded-full text-xs font-black hover:scale-105 transition-all uppercase tracking-widest border border-[#d48437]/20 shadow-lg"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                </motion.div>
                            ) : (
                                filteredCategories.map((category) => (
                                    <section
                                        key={category.categoryCode}
                                        ref={(el) => { if (el) categoryRefs.current[category.categoryCode] = el; }}
                                        className="mb-20"
                                    >
                                        <ScrollReveal>
                                            <div className="flex items-center gap-4 mb-10 group">
                                                <div className="h-10 w-2.5 bg-[#a64b18] rounded-full group-hover:h-12 transition-all shadow-[0_0_10px_rgba(166,75,24,0.4)]" />
                                                <h4 className="text-3xl font-black text-white tracking-tight uppercase">
                                                    {category.categoryName}
                                                </h4>
                                                <span className="text-xs font-black text-[#d48437] bg-[#3d2518] px-4 py-1.5 rounded-full ml-auto tracking-widest border border-[#d48437]/10">
                                                    {category.products.length} MÓN
                                                </span>
                                            </div>

                                            {/* UI/UX: Nâng cấp danh sách Grid và khoảng cách gap */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                                                {category.products.map((product: Product) => (
                                                    <motion.div
                                                        key={product.productId}
                                                        className="group bg-[#1f120b] rounded-[2.5rem] overflow-hidden border border-[#3d2518] hover:border-[#d48437]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 flex flex-col h-full hover:-translate-y-2"
                                                    >
                                                        {/* UI/UX: Giảm chiều cao ảnh thẻ sản phẩm */}
                                                        <div className="relative h-60 overflow-hidden bg-[#2b1b12]">
                                                            <Link to={`/san-pham/${product.productId}`}>
                                                                <img
                                                                    src={product.imageUrl || 'https://placehold.co/300x300?text=Chua+co+anh'}
                                                                    alt={product.productName || 'Sản phẩm'}
                                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Chua+co+anh'; }}
                                                                />
                                                            </Link>
                                                            {product.status === 'HOT' && (
                                                                <div className="absolute top-5 left-5 bg-[#d48437] text-[#1f120b] text-[9px] font-black px-3.5 py-1.5 rounded-full shadow-lg tracking-widest uppercase border border-white/20">
                                                                    Hot Item
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* UI/UX: Sửa Style cho khối thông tin sản phẩm */}
                                                        <div className="p-8 flex flex-col flex-grow">
                                                            <Link
                                                                to={`/san-pham/${product.productId}`}
                                                                className="block font-black text-white hover:text-[#d48437] mb-3 transition-colors text-xl flex-grow leading-tight tracking-tight line-clamp-2"
                                                            >
                                                                {product.productName}
                                                            </Link>
                                                            <div className="mt-auto flex items-end justify-between mb-8">
                                                                {/* UI/UX: Chuyển màu giá tiền sang Cam và kích thước to hơn */}
                                                                <div className="text-[#d48437] font-black text-2xl tracking-tighter">
                                                                    {product.originalPrice.toLocaleString('vi-VN')}₫
                                                                </div>
                                                                <div className="text-[10px] font-bold text-[#a69b91] uppercase tracking-widest pb-1">
                                                                    Nguyên bản
                                                                </div>
                                                            </div>

                                                            {/* UI/UX: Thêm Nút "Mua Ngay" rõ ràng ở cuối thẻ */}
                                                            <button
                                                                onClick={() => addToCart(product.productId)}
                                                                className="w-full flex items-center justify-center gap-3 px-8 py-4.5 rounded-3xl text-xs font-black text-white bg-[#a64b18] hover:bg-[#8a3c10] border border-[#d48437]/20 transition-all hover:shadow-[0_10px_25px_rgba(166,75,24,0.3)] active:scale-95 uppercase tracking-[0.2em]"
                                                            >
                                                                MUA NGAY
                                                                <FiChevronRight className="text-base group-hover:translate-x-1.5 transition-transform duration-500" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </ScrollReveal>
                                    </section>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            {/* UI/UX: Nâng cấp Toast Container cho đồng bộ Dark Mode */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        </div>
    );
};

export default Product;