import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeadOrder from '~/components/customer/HeadOrder';
import api from '~/config/axios';
import { useAuth } from '~/AuthContext';


interface Product {
  productId: string;
  productName: string;
  originalPrice: number;
}

interface CartItem {
  productId: string;
  productSizeId?: string;
  productSizeName?: string;
  quantity: number;
  amount: number;
  note: string;
  product?: Product;
}

interface Address {
  addressId: string;
  recipientName: string;
  phone: string;
  detailedAddress: string;
  ward: string;
  district: string;
  city: string;
}

interface PromotionCart {
  promotionId: string;
  discountAmount: number;
}

interface Cart {
  cartId: string;
  branch: {
    branchCode: string;
    branchName: string;
  };
  address: Address;
  cartItems: CartItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  promotionCarts: PromotionCart[];
}


const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const getBankTransferFallbackUrl = () => {
    const paymentMethodPath = encodeURIComponent('BANK_TRANSFER');
    return `/cart?retryPaymentMethod=${paymentMethodPath}`;
  };
  const fetchProductDetails = async (productId: string): Promise<Product> => {
    try {
      const response = await api.get(`/api/product/get/${productId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching product ${productId}:`, err);
      return { productId, productName: 'Sản phẩm không thể tải', originalPrice: 0 };
    }
  };

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (user && user.type === 'customer') {
        try {
          const response = await api.get(`/api/customer/cart/getCustomer/${user.customerId}`);
          let cartData = response.data;

          if (!cartData.address) {
            setError("Vui lòng chọn địa chỉ giao hàng trong giỏ hàng trước.");
            return;
          }
          if (cartData.cartItems.length === 0) {
            setError("Giỏ hàng của bạn đang trống.");
            navigate('/cart');
            return;
          }

          const itemsWithProducts = await Promise.all(
            cartData.cartItems.map(async (item: CartItem) => {
              const product = await fetchProductDetails(item.productId);
              return { ...item, product };
            })
          );
          cartData.cartItems = itemsWithProducts;

          setCart(cartData);
        } catch (err) {
          console.error("Error fetching cart for payment:", err);
          setError("Không thể tải thông tin giỏ hàng. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCartDetails();
  }, [user, navigate]);


  const handleCreateOrder = async () => {
    if (!cart || !user) return;

    setIsProcessing(true);

    try {
      const orderPayload = {
        cartId: cart.cartId,
        addressId: cart.address.addressId,
        branchCode: cart.branch.branchCode,
        paymentMethod: paymentMethod,
      };

      console.log('Creating order:', orderPayload);
      const response = await api.post('/api/order/create', orderPayload);
      const newOrder = response.data;
      console.log('Order created:', newOrder);

      if (paymentMethod === 'COD') {
        setOrderId(newOrder.orderId);
        setShowSuccessModal(true);

      } else if (paymentMethod === 'BANK_TRANSFER') {
        const paymentPayload = {
          amount: newOrder.finalAmount,
          orderInfo: newOrder.orderCode,
        };

        console.log('Creating PayOS payment:', paymentPayload);
        const paymentUrlResponse = await api.post('/api/payment/create-payment', paymentPayload);
        console.log('PayOS response:', paymentUrlResponse.data);
        
        const paymentUrl = paymentUrlResponse.data.url;
        if (paymentUrl) {
          console.log('Redirecting to PayOS:', paymentUrl);
          window.location.href = paymentUrl;
        } else {
          console.error('PayOS response missing URL:', paymentUrlResponse.data);
          throw new Error("Không thể tạo URL thanh toán.");
        }
      }
    } catch (err: any) {
      console.error("Error creating order:", err);
      let errorMessage = "Đã xảy ra lỗi khi tạo đơn hàng";

      if (err.code === 'ECONNABORTED') {
        errorMessage = "Yêu cầu bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Dữ liệu không hợp lệ";
      } else if (err.response?.status === 500) {
        errorMessage = "Lỗi hệ thống, vui lòng thử lại sau";
      }

      alert(errorMessage);
      setIsProcessing(false);
      if (paymentMethod === 'BANK_TRANSFER') {
        navigate(getBankTransferFallbackUrl());
      }
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải thông tin thanh toán...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>{error}</p>
        <button onClick={() => navigate('/cart')} className="mt-4 px-4 py-2 bg-primary text-white rounded">
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  if (!cart) {
    return <div className="text-center py-20">Không có thông tin giỏ hàng.</div>;
  }

  const totalDiscount = cart.promotionCarts.reduce((sum, promo) => sum + promo.discountAmount, 0);

  return (
    <div className="min-h-screen bg-[#FCF8F1]">
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <HeadOrder />
      </div>
      <div className="container mx-auto pt-24 pb-4 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Xác nhận Đơn hàng</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột thông tin giao hàng và sản phẩm */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin giao hàng</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Người nhận:</strong> {cart.address.recipientName}</p>
                <p><strong>Điện thoại:</strong> {cart.address.phone}</p>
                <p><strong>Địa chỉ:</strong> {`${cart.address.detailedAddress}, ${cart.address.ward}, ${cart.address.district}, ${cart.address.city}`}</p>
                <p><strong>Cửa hàng xử lý:</strong> {cart.branch.branchName}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Chi tiết sản phẩm</h2>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cart.cartItems.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">
                        {item.product?.productName || 'Sản phẩm'}
                        {item.productSizeName && <span className="ml-1 text-xs text-gray-500">({item.productSizeName})</span>}
                        (x{item.quantity})
                      </p>
                      {item.note && <p className="text-xs text-gray-500 mt-1">{item.note}</p>}
                    </div>
                    <span className="text-gray-600">{item.amount.toLocaleString()} VND</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột tổng kết và thanh toán */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Tổng kết đơn hàng</h2>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Tổng tiền hàng:</span> <span>{cart.totalAmount.toLocaleString()} VND</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển:</span> <span>{cart.shippingFee.toLocaleString()} VND</span></div>
                {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá:</span> <span>-{totalDiscount.toLocaleString()} VND</span></div>}
                <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t mt-2"><span>Thành tiền:</span> <span>{cart.finalAmount.toLocaleString()} VND</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Chọn phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'COD' ? 'border-primary bg-primary-light' : ''}`}>
                  <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="h-4 w-4 text-primary focus:ring-primary" />
                  <span className="ml-3 font-medium">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary-light' : ''}`}>
                  <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="h-4 w-4 text-primary focus:ring-primary" />
                  <div className="ml-3">
                    <span className="font-medium">Thanh toán qua PayOS</span>
                    <p className="text-xs text-gray-500">Hỗ trợ Chuyển khoản ngân hàng, QR Code.</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={isProcessing}
              className="mt-8 w-full py-3 bg-primary text-white font-bold text-lg rounded-lg transition-colors hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận và Đặt hàng'}
            </button>
          </div>
        </div>

        {/* Modal xác nhận đặt hàng thành công */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
                <p className="text-gray-600 mb-6">
                  Đơn hàng của bạn đã được tạo và đang được xử lý. Cảm ơn bạn đã mua hàng!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Xem đơn hàng
                  </button>
                  <button
                    onClick={() => navigate(`/my-orders/${orderId}`)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Chi tiết đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;