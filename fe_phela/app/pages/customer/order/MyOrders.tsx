import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import HeadOrder from '~/components/customer/HeadOrder';
import api from '~/config/axios';
import { useAuth } from '~/AuthContext';

// --- Định nghĩa kiểu dữ liệu cho một đơn hàng trong danh sách ---
interface OrderSummary {
    orderId: string;
    orderCode: string;
    orderDate: string;
    finalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'AWAITING_PAYMENT' | 'COMPLETED' | 'FAILED';
    paymentMethod: 'COD' | 'BANK_TRANSFER';
}

// --- Component Lịch sử Đơn hàng ---
const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user && user.type === 'customer') {
                try {
                    const response = await api.get(`/api/order/customer/${user.customerId}`);
                    setOrders(response.data);
                } catch (err: any) {
                    console.error("Lỗi khi tải lịch sử đơn hàng:", err);
                    setError(err.response?.data?.message || "Không thể tải được lịch sử đơn hàng.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    // Helper để lấy màu và chữ cho từng trạng thái
    const getStatusStyle = (status: OrderSummary['status']) => {
        switch (status) {
            case 'DELIVERED':
                return { text: 'Đã giao', className: 'bg-green-100 text-green-800' };
            case 'CANCELLED':
                return { text: 'Đã hủy', className: 'bg-red-100 text-red-800' };
            case 'DELIVERING':
                return { text: 'Đang giao', className: 'bg-yellow-100 text-yellow-800' };
            case 'CONFIRMED':
                return { text: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' };
            case 'PENDING':
            default:
                return { text: 'Chờ xác nhận', className: 'bg-gray-100 text-gray-800' };
        }
    };

    const getPaymentStatusStyle = (status: OrderSummary['paymentStatus']) => {
        switch (status) {
            case 'COMPLETED':
                return { text: 'Đã thanh toán', className: 'bg-green-100 text-green-800' };
            case 'AWAITING_PAYMENT':
                return { text: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' };
            case 'FAILED':
                return { text: 'Thanh toán thất bại', className: 'bg-red-100 text-red-800' };
            case 'PENDING':
            default:
                return { text: 'Chờ xử lý', className: 'bg-gray-100 text-gray-800' };
        }
    };

    // --- Giao diện Render ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-[#d48437] mb-6"></div>
                <p className="text-[#d48437] font-black uppercase tracking-widest text-xs">Đang tải lịch sử đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-500 p-8 text-center">
                <p className="text-xl font-black uppercase mb-4 tracking-widest">Đã xảy ra lỗi</p>
                <p className="text-white/60 mb-8 max-w-md">{error}</p>
                <button onClick={() => window.location.reload()} className="px-10 py-3 bg-red-600/10 border border-red-600/30 text-red-500 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600/20 transition-all">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-20">
            <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-40">
                <HeadOrder />
            </div>
            <div className="container mx-auto pt-28 p-4 max-w-5xl">
                <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Lịch sử đơn hàng</h1>

                {orders.length > 0 ? (
                    <div className="bg-[#1f120b] rounded-3xl shadow-2xl border border-[#3d1d11] overflow-hidden">
                        <table className="min-w-full divide-y divide-[#331d11]">
                            <thead className="bg-[#2b1b12]">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Mã Đơn Hàng</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ngày Đặt</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tổng Tiền</th>
                                    <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Trạng Thái Đơn</th>
                                    <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Thanh Toán</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Hành động</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1f120b] divide-y divide-[#331d11]">
                                {orders.map((order) => {
                                    const statusStyle = getStatusStyle(order.status);
                                    const paymentStatusStyle = getPaymentStatusStyle(order.paymentStatus);
                                    return (
                                        <tr key={order.orderId} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-white group-hover:text-[#d48437]">#{order.orderCode}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-white/60">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-[#d48437]">{order.finalAmount.toLocaleString()}₫</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-black rounded-full uppercase tracking-widest border ${statusStyle.className.replace('bg-green-100 text-green-800', 'bg-green-500/10 text-green-500 border-green-500/20').replace('bg-red-100 text-red-800', 'bg-red-500/10 text-red-500 border-red-500/20').replace('bg-yellow-100 text-yellow-800', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20').replace('bg-blue-100 text-blue-800', 'bg-blue-500/10 text-blue-500 border-blue-500/20').replace('bg-gray-100 text-gray-800', 'bg-white/10 text-white/60 border-white/20')}`}>
                                                    {statusStyle.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-black rounded-full uppercase tracking-widest border ${paymentStatusStyle.className.replace('bg-green-100 text-green-800', 'bg-green-500/10 text-green-500 border-green-500/20').replace('bg-red-100 text-red-800', 'bg-red-500/10 text-red-500 border-red-500/20').replace('bg-yellow-100 text-yellow-800', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20').replace('bg-gray-100 text-gray-800', 'bg-white/10 text-white/60 border-white/20')}`}>
                                                    {paymentStatusStyle.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                                                <Link to={`/my-orders/${order.orderId}`} className="text-white font-black text-[10px] uppercase tracking-widest hover:text-[#d48437] transition-all flex items-center justify-end gap-1">
                                                    Chi tiết <FiChevronRight />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#1f120b] rounded-3xl border border-[#3d1d11] shadow-2xl">
                        <div className="w-20 h-20 bg-[#2b1b12] rounded-full flex items-center justify-center mx-auto mb-6">
                           <FiShoppingBag className="text-3xl text-white/10" />
                        </div>
                        <p className="text-white/40 uppercase tracking-[0.2em] font-black text-sm mb-8">Bạn chưa có đơn hàng nào</p>
                        <Link to="/products" className="inline-block px-10 py-4 bg-[#d48437] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#e59447] transition-all hover:-translate-y-1 shadow-xl shadow-[#d48437]/20">
                            Khám phá menu ngay
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;