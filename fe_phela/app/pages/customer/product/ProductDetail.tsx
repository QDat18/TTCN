import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import HeadOrder from '~/components/customer/HeadOrder';
import api from '~/config/axios';
import { useAuth } from '~/AuthContext';
import { ToastContainer, toast } from 'react-toastify';

interface ProductSize {
    productSizeId: string;
    sizeName: string;
    price: number;
}

interface Product {
    productId: string;
    productName: string;
    description: string;
    originalPrice: number;
    imageUrl: string;
    status: string;
    categoryCode: string; // Added categoryCode
    sizes: ProductSize[];
}

interface Topping {
    productId: string;
    productName: string;
    originalPrice: number;
}

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductAndToppings = async () => {
            try {
                const productResponse = await api.get(`/api/product/get/${productId}`);
                const productData = productResponse.data;
                setProduct(productData);

                // Set default size if available
                if (productData.sizes && productData.sizes.length > 0) {
                    const regularSize = productData.sizes.find((s: ProductSize) =>
                        s.sizeName.toUpperCase() === 'PHÊ' || s.sizeName.toUpperCase() === 'REGULAR'
                    );
                    setSelectedSizeId(regularSize ? regularSize.productSizeId : productData.sizes[0].productSizeId);
                }

                // Fetch toppings only if this is not a topping itself
                if (productData.categoryCode !== 'TOPPING') {
                    const toppingResponse = await api.get('/api/product/category/TOPPING');
                    setToppings(toppingResponse.data);
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch product details');
                setLoading(false);
                console.error(err);
            }
        };

        if (productId) {
            fetchProductAndToppings();
        }
    }, [productId]);

    const getSelectedSize = () => {
        return product?.sizes?.find(s => s.productSizeId === selectedSizeId);
    };

    const toggleTopping = (toppingId: string) => {
        setSelectedToppingIds(prev =>
            prev.includes(toppingId)
                ? prev.filter(id => id !== toppingId)
                : [...prev, toppingId]
        );
    };

    const calculateCurrentPrice = () => {
        if (!product) return 0;
        const basePrice = getSelectedSize()?.price || product.originalPrice || 0;
        const toppingsPrice = selectedToppingIds.reduce((sum, id) => {
            const topping = toppings.find(t => t.productId === id);
            return sum + (topping?.originalPrice || 0);
        }, 0);
        return basePrice + toppingsPrice;
    };

    const currentPrice = calculateCurrentPrice();

    const addToCart = async () => {
        if (!user || user.type !== 'customer') {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
                onClick: () => navigate('/login')
            });
            return;
        }

        if (!product) return;

        try {
            const customerId = user.customerId;
            const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
            const cartId = cartResponse.data.cartId;

            if (cartId) {
                const cartItemDTO = {
                    productId: product.productId,
                    productSizeId: selectedSizeId,
                    toppingIds: selectedToppingIds,
                    quantity: quantity,
                    amount: currentPrice * quantity,
                    note: ''
                };
                await api.post(`/api/customer/cart/${cartId}/items`, cartItemDTO);
                window.dispatchEvent(new Event('cartUpdated'));
                toast.success('Đã thêm sản phẩm vào giỏ hàng');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    if (!product) return <div className="flex justify-center items-center h-screen">Product not found</div>;

    return (
        <div className="min-h-screen text-white">
            <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
                <HeadOrder />
            </div>
            <div className='max-w-4xl mx-auto px-4 py-12 pt-16'>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        {/* ĐÃ FIX: Chặn src rỗng và thêm hàm onError */}
                        <img
                            src={product.imageUrl || 'https://placehold.co/500x500?text=Chua+co+anh'}
                            alt={product.productName || 'Sản phẩm'}
                            className="w-full rounded-lg shadow-md object-cover aspect-square"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/500x500?text=Chua+co+anh';
                            }}
                        />
                    </div>
                    <div className="md:w-1/2 space-y-4">
                        <h1 className="text-3xl font-black text-white mb-2">{product.productName}</h1>
                        <p className="text-white/60 leading-relaxed">{product.description}</p>

                        <div className="text-3xl font-black text-[#d48437] mt-4">
                            {currentPrice.toLocaleString()} VND
                        </div>

                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Chọn Size</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size.productSizeId}
                                            onClick={() => setSelectedSizeId(size.productSizeId)}
                                            className={`px-6 py-2 rounded-full border-2 transition-all font-bold ${selectedSizeId === size.productSizeId
                                                ? 'border-[#d48437] bg-[#d48437] text-white shadow-lg shadow-[#d48437]/20'
                                                : 'border-[#3d1d11] bg-[#1f120b] text-white/70 hover:border-[#d48437]/50'
                                                }`}
                                        >
                                            {size.sizeName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {toppings.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Topping (Có thể chọn nhiều)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {toppings.map((topping) => (
                                        <button
                                            key={topping.productId}
                                            onClick={() => toggleTopping(topping.productId)}
                                            className={`px-4 py-2 rounded-full border transition-all text-xs font-bold flex items-center gap-2 ${selectedToppingIds.includes(topping.productId)
                                                ? 'border-[#d48437] bg-[#d48437]/10 text-[#d48437]'
                                                : 'border-[#3d1d11] bg-[#1f120b] text-white/60 hover:border-[#d48437]/30'
                                                }`}
                                        >
                                            {topping.productName} (+{topping.originalPrice.toLocaleString()})
                                            {selectedToppingIds.includes(topping.productId) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-6 mb-8 bg-[#1f120b] p-5 rounded-2xl w-fit border border-[#3d1d11]">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Số lượng</h3>
                            <div className="flex items-center border border-[#3d1d11] rounded-full bg-[#2b1b12] shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 hover:bg-[#1f120b] transition-colors text-[#d48437] font-bold text-xl disabled:opacity-30"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="px-6 py-2 font-bold text-xl text-white border-x border-[#3d1d11] min-w-[60px] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2 hover:bg-[#1f120b] transition-colors text-[#d48437] font-bold text-xl"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className="w-full bg-[#d48437] text-white py-4 px-8 rounded-full font-black hover:bg-[#e59447] transition-all shadow-xl shadow-[#d48437]/20 active:scale-95 transform flex justify-between items-center group"
                                onClick={addToCart}
                            >
                                <span className="group-hover:translate-x-1 transition-transform uppercase tracking-wider">Thêm vào giỏ hàng</span>
                                <span className="bg-black/20 px-4 py-1 rounded-full text-sm font-bold">
                                    {(currentPrice * quantity).toLocaleString()} VND
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-4xl mx-auto px-4 py-12 border-t border-[#3d1d11]'>
                <h2 className="text-xl font-black mb-6 uppercase text-[#d48437] tracking-widest">Thông tin chi tiết</h2>
                <div className="prose prose-invert text-white/70 leading-relaxed">
                    {product.description}
                </div>
            </div>

            <ToastContainer position="bottom-center" autoClose={3000} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .prose { max-width: none; }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .max-w-4xl { animation: slideUp 0.5s ease-out; }
            `}} />
        </div>
    );
};

export default ProductDetail;