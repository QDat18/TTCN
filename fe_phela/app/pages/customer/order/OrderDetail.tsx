import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeadOrder from '~/components/customer/HeadOrder';
import api from '~/config/axios';
import { useAuth } from '~/AuthContext';

// --- Định nghĩa các kiểu dữ liệu ---
interface Product {
    productId: string;
    productName: string;
    originalPrice: number;
    imageUrl: string;
}

interface OrderItem {
    productId: string;
    productSizeId?: string;
    productSizeName?: string;
    quantity: number;
    price: number;
    amount: number;
    note: string;
    product?: Product;
}

interface Address {
    recipientName: string;
    phone: string;
    detailedAddress: string;
    ward: string;
    district: string;
    city: string;
}

interface Order {
    orderId: string;
    orderCode: string;
    totalAmount: number;
    shippingFee: number;
    totalDiscount: number;
    finalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
    paymentMethod: 'COD' | 'BANK_TRANSFER';
    paymentStatus: 'PENDING' | 'AWAITING_PAYMENT' | 'COMPLETED' | 'FAILED';
    orderDate: string;
    address: Address;
    orderItems: OrderItem[];
}

const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductDetails = async (productId: string): Promise<Product> => {
        try {
            const response = await api.get(`/api/product/get/${productId}`);
            return response.data;
        } catch (err) {
            console.error(`Lỗi khi tải sản phẩm ${productId}:`, err);
            return {
                productId,
                productName: 'Sản phẩm không xác định',
                originalPrice: 0,
                imageUrl: '/images/default-product.png'
            };
        }
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            // ĐÃ FIX: Nếu user chưa kịp load từ AuthContext, chỉ return để chờ (giữ trạng thái Loading)
            if (!user) {
                return;
            }

            if (!orderId) {
                setError("Thiếu mã đơn hàng.");
                setLoading(false);
                return;
            }

            try {
                // ĐÃ FIX: Phải xóa trạng thái lỗi cũ trước khi bắt đầu gọi API
                setError(null);
                setLoading(true);

                const response = await api.get(`/api/order/${orderId}`);
                let orderData: Order = response.data;

                const itemsWithProducts = await Promise.all(
                    orderData.orderItems.map(async (item) => {
                        const product = await fetchProductDetails(item.productId);
                        return { ...item, product };
                    })
                );
                orderData.orderItems = itemsWithProducts;

                setOrder(orderData);
            } catch (err: any) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", err);
                setError(err.response?.data?.message || "Không thể tải được chi tiết đơn hàng.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, user]);

    const getStatusText = (status: Order['status']) => {
        const statuses = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            DELIVERING: 'Đang giao hàng',
            DELIVERED: 'Đã giao hàng',
            CANCELLED: 'Đã hủy'
        };
        return statuses[status] || status;
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

        try {
            await api.delete(`/api/order/${orderId}/cancel`);
            alert('Đơn hàng đã được hủy thành công');
            // Refresh the order details
            const response = await api.get(`/api/order/${orderId}`);
            setOrder(response.data);
        } catch (err: any) {
            console.error('Error cancelling order:', err);
            alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    if (loading) return (
        <div className="text-center py-20 flex flex-col justify-center items-center min-h-screen text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-[#d48437] mb-6"></div>
            <p className="text-[#d48437] font-black uppercase tracking-widest text-sm">Đang tải chi tiết đơn hàng...</p>
        </div>
    );
    if (error) return (
        <div className="text-center py-20 min-h-screen flex flex-col items-center justify-center text-red-500">
            <p className="text-2xl font-black mb-4 uppercase tracking-widest">Đã xảy ra lỗi</p>
            <p className="text-white/60 mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600/10 border border-red-600/30 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600/20 transition-all">Thử lại</button>
        </div>
    );
    if (!order) return (
        <div className="text-center py-20 min-h-screen flex flex-col items-center justify-center text-white/40 uppercase font-black tracking-widest">
            Không tìm thấy thông tin đơn hàng
        </div>
    );

    return (
        <div className="text-white pb-20">
            <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
                <HeadOrder />
            </div>
            <div className="container mx-auto pt-28 p-4 max-w-4xl min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tight">Chi tiết đơn hàng <span className="text-[#d48437]">#{order.orderCode}</span></h1>
                    <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border ${order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : (order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-[#d48437]/10 text-[#d48437] border-[#d48437]/20')}`}>
                        {getStatusText(order.status)}
                    </span>
                </div>

                <div className="bg-[#1f120b] p-8 rounded-3xl border border-[#3d1d11] shadow-xl mb-8">
                    <h2 className="text-sm font-black text-[#d48437] mb-6 border-b border-[#3d1d11] pb-4 uppercase tracking-[0.2em]">Thông tin chung</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-bold text-white/60">
                        <p className="flex justify-between">Ngày đặt hàng: <span className="text-white ml-2">{new Date(order.orderDate).toLocaleString('vi-VN')}</span></p>
                        <p className="flex justify-between">Thanh toán: <span className="text-white ml-2">{order.paymentMethod === 'COD' ? 'Khi nhận hàng' : 'Chuyển khoản'}</span></p>
                        <p className="flex justify-between">Trạng thái: <span className={order.paymentStatus === 'COMPLETED' ? 'text-green-500 ml-2' : 'text-[#d48437] ml-2'}>{order.paymentStatus.replace('_', ' ')}</span></p>
                    </div>

                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.paymentMethod === 'COD' && (
                        <div className="mt-8 pt-6 border-t border-[#331d11]">
                            <button
                                onClick={handleCancelOrder}
                                className="px-8 py-3 bg-red-600/10 text-red-500 border border-red-600/30 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600/20 transition-all"
                            >
                                Hủy đơn hàng
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="bg-[#1f120b] p-8 rounded-3xl border border-[#3d1d11] shadow-xl h-full">
                            <h2 className="text-sm font-black text-[#d48437] mb-6 border-b border-[#3d1d11] pb-4 uppercase tracking-[0.2em]">Địa chỉ giao hàng</h2>
                            <div className="space-y-4 text-sm font-bold text-white/60">
                                <p className="flex justify-between">Người nhận: <span className="text-white ml-2">{order.address.recipientName}</span></p>
                                <p className="flex justify-between">Điện thoại: <span className="text-white ml-2">{order.address.phone}</span></p>
                                <p className="text-left mt-2 leading-relaxed">
                                    <span className="block mb-1">Địa chỉ:</span>
                                    <span className="text-white">{`${order.address.detailedAddress}, ${order.address.ward}, ${order.address.district}, ${order.address.city}`}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="bg-[#1f120b] p-8 rounded-3xl border border-[#3d1d11] shadow-xl h-full">
                            <h2 className="text-sm font-black text-[#d48437] mb-6 border-b border-[#3d1d11] pb-4 uppercase tracking-[0.2em]">Tổng kết</h2>
                            <div className="space-y-3 text-sm font-bold text-white/40 uppercase tracking-widest">
                                <div className="flex justify-between"><span>Tiền hàng:</span> <span className="text-white">{order.totalAmount.toLocaleString()}₫</span></div>
                                <div className="flex justify-between"><span>Vận chuyển:</span> <span className="text-white">{order.shippingFee.toLocaleString()}₫</span></div>
                                {order.totalDiscount > 0 && <div className="flex justify-between text-green-500"><span>Giảm giá:</span> <span>-{order.totalDiscount.toLocaleString()}₫</span></div>}
                                <div className="flex justify-between text-2xl font-black text-[#d48437] pt-4 border-t border-[#331d11] mt-4 tracking-tighter"><span>Tổng:</span> <span>{order.finalAmount.toLocaleString()}₫</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1f120b] p-8 rounded-3xl border border-[#3d1d11] shadow-xl mt-8">
                    <h2 className="text-sm font-black text-[#d48437] mb-8 border-b border-[#3d1d11] pb-4 uppercase tracking-[0.2em]">Danh sách sản phẩm</h2>
                    <div className="space-y-4">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center text-sm border-b border-[#331d11] pb-6 last:border-b-0 group">
                                <div className="relative w-20 h-20 mr-6 flex-shrink-0">
                                    <img
                                        src={item.product?.imageUrl || 'https://placehold.co/100x100?text=Chua+co+anh'}
                                        alt={item.product?.productName}
                                        className="w-full h-full object-cover rounded-xl brightness-90 group-hover:brightness-110 transition-all border border-[#331d11]"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Chua+co+anh';
                                        }}
                                    />
                                    <span className="absolute -top-2 -right-2 bg-[#d48437] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#1f120b]">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                    <div>
                                        <p className="font-black text-white uppercase tracking-wide text-base">
                                            {item.product?.productName || 'Sản phẩm'}
                                            {item.productSizeName && <span className="ml-2 text-[10px] text-[#d48437] bg-[#d48437]/10 px-2 py-0.5 rounded-full border border-[#d48437]/20 uppercase">{item.productSizeName}</span>}
                                        </p>
                                        {item.note && <p className="text-xs text-white/40 mt-2 font-bold italic">{item.note}</p>}
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-black text-lg text-[#d48437] tracking-tight">{item.amount.toLocaleString()}₫</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12 pb-12">
                    <Link to="/my-orders" className="text-[#d48437] font-black uppercase tracking-widest text-[10px] hover:text-[#e59447] transition-all flex items-center justify-center gap-2">
                        ← Lịch sử đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;