import React, { useState, useEffect, useCallback } from 'react';
import HeadOrder from '~/components/customer/HeadOrder';
import api from '~/config/axios';
import { useAuth } from '~/AuthContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMapPin, FiHome, FiTag, FiChevronRight, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// --- Giữ nguyên các Interface ---
interface Product {
  productId: string;
  productName: string;
  imageUrl: string;
  originalPrice: number;
}

interface CartItem {
  cartItemId: string;
  productId: string;
  productSizeId?: string;
  productSizeName?: string;
  quantity: number;
  amount: number;
  note: string;
  product?: Product;
  selectedToppings?: Product[];
}

interface Address {
  addressId: string;
  city: string;
  district: string;
  ward: string;
  recipientName: string;
  phone: string;
  detailedAddress: string;
  isDefault: boolean;
}

interface Branch {
  branchCode: string;
  branchName: string;
  city: string;
  district: string;
  address: string;
}

interface Promotion {
  promotionId: string;
  promotionCode: string;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  discountAmount?: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  status: string;
}

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [distance, setDistance] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [appliedPromotions, setAppliedPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promotionLoading, setPromotionLoading] = useState<string | null>(null);

  // --- Các hàm fetch dữ liệu sản phẩm ---
  const fetchProductDetails = async (productId: string): Promise<Product> => {
    try {
      const response = await api.get(`/api/product/get/${productId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching product ${productId}:`, err);
      return {
        productId,
        productName: 'Sản phẩm không xác định',
        imageUrl: 'https://placehold.co/100x100?text=Chua+co+anh',
        originalPrice: 0,
      };
    }
  };

  const fetchAllProducts = async (items: CartItem[]): Promise<CartItem[]> => {
    return Promise.all(
      items.map(async (item) => {
        const product = await fetchProductDetails(item.productId);
        return { ...item, product };
      }),
    );
  };

  const updateFullCartState = useCallback(async (customerId: string) => {
    try {
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartData = cartResponse.data;

      const itemsWithProducts = await fetchAllProducts(cartData.cartItems || []);

      setCartItems(itemsWithProducts);
      setTotalAmount(cartData.totalAmount || 0);
      setShippingFee(cartData.shippingFee || 0);
      setFinalAmount(cartData.finalAmount || 0);
      setAppliedPromotions(cartData.promotionCarts || []);
      setDistance(cartData.distance || 0);

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error updating full cart state:", err);
      setError("Không thể cập nhật thông tin giỏ hàng.");
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (user && user.type === 'customer') {
        setLoading(true);
        try {
          const customerId = user.customerId;
          let cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
          let cartData = cartResponse.data;

          if (!cartData || !cartData.cartId) {
            cartResponse = await api.post(`/api/customer/cart/create/${customerId}`);
            cartData = cartResponse.data;
          }

          await updateFullCartState(customerId);

          const [branchResponse, promoResponse, addressResponse] = await Promise.all([
            api.get('/api/branch'),
            api.get('/api/promotion/active'),
            api.get(`/api/address/customer/${customerId}`),
          ]);

          setBranches(branchResponse.data);
          setSelectedBranch(cartData.branch?.branchCode || '');

          setAddresses(addressResponse.data);
          const defaultAddress = addressResponse.data.find((addr: Address) => addr.isDefault) || addressResponse.data[0] || null;
          setSelectedAddress(defaultAddress);

          setPromotions(promoResponse.data);

        } catch (err) {
          console.error('Error fetching initial cart details:', err);
          setError('Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [user, updateFullCartState]);


  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    if (!user || user.type !== 'customer') return;
    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      const itemToUpdate = cartItems.find(item => item.cartItemId === cartItemId);
      if (!itemToUpdate) return;

      if (newQuantity === 0) {
        await removeItem(cartItemId);
        return;
      }

      await api.post(`/api/customer/cart/${cartId}/items`, {
        productId: itemToUpdate.productId,
        productSizeId: itemToUpdate.productSizeId,
        toppingIds: itemToUpdate.selectedToppings?.map(t => t.productId) || [],
        quantity: newQuantity,
      });

      await updateFullCartState(customerId);

    } catch (err: any) {
      console.error('Error updating quantity:', err);
      alert(`Có lỗi khi cập nhật số lượng sản phẩm: ${err.response?.data?.message || err.message}`);
    }
  };

  const updateBranch = async (branchCode: string) => {
    if (!branchCode) {
      setSelectedBranch('');
      return;
    }
    if (!user || user.type !== 'customer') return;
    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      await api.patch(`/api/customer/cart/${cartId}/update-branch?branchCode=${branchCode}`);
      setSelectedBranch(branchCode);
      await updateFullCartState(customerId);
    } catch (err: any) {
      console.error('Error updating branch:', err);
      alert(`Có lỗi khi thay đổi cơ sở cửa hàng: ${err.response?.data?.message || err.message}`);
    }
  };

  const updateAddress = async (addressId: string) => {
    if (!addressId) {
      setSelectedAddress(null);
      return;
    }
    if (!user || user.type !== 'customer') return;
    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      await api.patch(`/api/customer/cart/${cartId}/update-address?addressId=${addressId}`);
      setSelectedAddress(addresses.find(addr => addr.addressId === addressId) || null);
      await updateFullCartState(customerId);

    } catch (err: any) {
      console.error('Error updating address:', err);
      alert(`Có lỗi khi thay đổi địa chỉ giao hàng: ${err.response?.data?.message || err.message}`);
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!user || user.type !== 'customer') return;
    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      const itemToRemove = cartItems.find(item => item.cartItemId === cartItemId);
      if (!itemToRemove) return;

      await api.delete(`/api/customer/cart/${cartId}/items/${itemToRemove.cartItemId}`);
      await updateFullCartState(customerId);

    } catch (err: any) {
      console.error('Error removing item:', err);
      alert(`Có lỗi khi xóa sản phẩm: ${err.response?.data?.message || err.message}`);
    }
  };

  const applyPromotion = async (promotionCode: string) => {
    if (!user || user.type !== 'customer') return;
    if (promotionLoading) return;

    setPromotionLoading(promotionCode);
    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      const response = await api.post(`/api/customer/cart/${cartId}/apply-promotion`, { promotionCode });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      await updateFullCartState(customerId);
    } catch (err: any) {
      console.error('Error applying promotion:', err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Không thể áp dụng mã khuyến mãi do có lỗi xảy ra.');
      }
    } finally {
      setPromotionLoading(null);
    }
  };

  const removePromotion = async (promotionId: string) => {
    if (!user || user.type !== 'customer') return;
    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      await api.delete(`/api/customer/cart/${cartId}/promotions/${promotionId}`);
      await updateFullCartState(customerId);

    } catch (err: any) {
      console.error('Error removing promotion:', err);
      alert(err.response?.data?.message || 'Không thể xóa mã khuyến mãi.');
    }
  };

  const updateNote = async (cartItemId: string, type: 'đường' | 'đá', value: string) => {
    if (!user || user.type !== 'customer') return;

    try {
      const customerId = user.customerId;
      const cartResponse = await api.get(`/api/customer/cart/getCustomer/${customerId}`);
      const cartId = cartResponse.data.cartId;

      const itemToUpdate = cartItems.find(item => item.cartItemId === cartItemId);
      if (!itemToUpdate) return;

      let sugarLevel = '100% đường';
      let iceLevel = '100% đá';

      if (itemToUpdate.note) {
        const parts = itemToUpdate.note.split(', ');
        parts.forEach(part => {
          if (part.includes('đường')) sugarLevel = part;
          if (part.includes('đá')) iceLevel = part;
        });
      }

      if (type === 'đường') {
        sugarLevel = `${value}% đường`;
      } else {
        iceLevel = `${value}% đá`;
      }

      const newNote = `${sugarLevel}, ${iceLevel}`;

      await api.post(`/api/customer/cart/${cartId}/items`, {
        productId: itemToUpdate.productId,
        productSizeId: itemToUpdate.productSizeId,
        toppingIds: itemToUpdate.selectedToppings?.map(t => t.productId) || [],
        quantity: itemToUpdate.quantity,
        note: newNote
      });

      await updateFullCartState(customerId);
    } catch (err: any) {
      console.error('Error updating note:', err);
      alert(`Có lỗi khi cập nhật ghi chú: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360, borderTopColor: ["#d48437", "#f59e0b", "#d48437"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/10 border-t-[#d48437] rounded-full mb-4"
        />
        <p className="text-[#d48437] font-medium uppercase tracking-widest text-sm">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center">
        <div className="bg-[#1f120b] text-red-500 p-8 rounded-3xl max-w-md text-center border border-red-900/50 shadow-2xl">
          <FiInfo className="text-4xl mx-auto mb-4" />
          <p className="font-bold text-lg mb-2">Đã xảy ra lỗi</p>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-full transition-all font-black text-xs uppercase tracking-widest border border-red-600/30">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-white">
      <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
        <HeadOrder />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-[#1f120b] rounded-3xl shadow-2xl border border-[#3d1d11] max-w-2xl mx-auto"
          >
            <div className="w-32 h-32 bg-[#2b1b12] rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-5xl text-[#d48437]/30" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Giỏ hàng của bạn đang trống</h2>
            <p className="text-white/40 mb-8 max-w-xs mx-auto">Hãy khám phá thêm các món nước đặc biệt từ Phê La nhé!</p>
            <Link to="/san-pham" className="px-10 py-4 bg-[#d48437] text-white rounded-full font-black hover:bg-[#e59447] transition-all hover:shadow-xl hover:shadow-[#d48437]/20 hover:-translate-y-1 inline-block uppercase tracking-widest text-xs">
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* --- CỘT TRÁI: DANH SÁCH & THÔNG TIN --- */}
            <div className="lg:w-2/3 space-y-6">

              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 mb-2 uppercase">
                <FiShoppingBag className="text-[#d48437]" /> Giỏ Hàng
              </h1>

              {/* Khối Giao Hàng */}
              <div className="bg-[#1f120b] p-6 md:p-8 rounded-3xl shadow-xl border border-[#3d1d11]">
                <h2 className="text-lg font-black text-[#d48437] mb-6 pb-4 border-b border-[#3d1d11] flex items-center gap-2 uppercase tracking-wider">
                  Giao hàng đến đâu?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest">
                      <FiHome className="text-[#d48437]" /> Cửa hàng Phê La
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedBranch}
                        onChange={(e) => updateBranch(e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 bg-[#2b1b12] border border-[#3d1d11] rounded-xl focus:ring-4 focus:ring-[#d48437]/20 focus:border-[#d48437] outline-none text-sm font-bold text-white appearance-none cursor-pointer hover:border-[#d48437]/50 transition-all"
                      >
                        <option value="" className="bg-[#1f120b]">-- Chọn cửa hàng --</option>
                        {branches.map((branch) => (
                          <option key={branch.branchCode} value={branch.branchCode} className="bg-[#1f120b]">
                            {branch.branchName} ({branch.district})
                          </option>
                        ))}
                      </select>
                      <FiChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none group-hover:text-[#d48437]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest">
                        <FiMapPin className="text-[#d48437]" /> Địa chỉ nhận hàng
                      </label>
                      <Link to="/my-address" className="text-[10px] font-black text-[#d48437] hover:text-[#e59447] underline uppercase tracking-widest">Chỉnh sửa</Link>
                    </div>
                    <div className="relative group">
                      {addresses.length > 0 ? (
                        <select
                          value={selectedAddress?.addressId || ''}
                          onChange={(e) => updateAddress(e.target.value)}
                          className="w-full pl-4 pr-10 py-3.5 bg-[#2b1b12] border border-[#3d1d11] rounded-xl focus:ring-4 focus:ring-[#d48437]/20 focus:border-[#d48437] outline-none text-sm font-bold text-white appearance-none cursor-pointer hover:border-[#d48437]/50 transition-all"
                        >
                          <option value="" className="bg-[#1f120b]">-- Chọn địa chỉ --</option>
                          {addresses.map((addr) => (
                            <option key={addr.addressId} value={addr.addressId} className="bg-[#1f120b]">
                              {addr.recipientName} - {addr.detailedAddress}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full pl-4 py-3.5 bg-red-600/5 border border-red-900/30 text-red-500 rounded-xl text-sm font-bold">
                          Chưa có địa chỉ giao hàng
                        </div>
                      )}
                      <FiChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none group-hover:text-[#d48437]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Khối Danh sách Món */}
              <div className="bg-[#1f120b] p-6 md:p-8 rounded-3xl shadow-xl border border-[#3d1d11]">
                <h2 className="text-lg font-black text-[#d48437] mb-2 pb-4 border-b border-[#3d1d11] uppercase tracking-wider">
                  Món đã chọn ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </h2>

                <div className="space-y-6 mt-6">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-50 last:border-0 last:pb-0 relative group">
                      {/* Nút Xóa (Góc trên Mobile, Góc phải Desktop) */}
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="absolute top-4 right-0 sm:top-1/2 sm:-translate-y-1/2 sm:right-0 p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        title="Xóa món"
                      >
                        <FiTrash2 size={18} />
                      </button>

                      <div className="w-24 h-24 bg-[#2b1b12] rounded-2xl overflow-hidden flex-shrink-0 border border-[#3d1d11]">
                        <Link to={`/san-pham/${item.productId}`}>
                          <img
                            src={item.product?.imageUrl || 'https://placehold.co/100x100?text=Chua+co+anh'}
                            alt={item.product?.productName}
                            className="w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Chua+co+anh'; }}
                          />
                        </Link>
                      </div>

                      <div className="flex-1 pr-10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <Link to={`/san-pham/${item.productId}`} className="text-base font-black text-white hover:text-[#d48437] transition-colors line-clamp-2 uppercase tracking-wide">
                              {item.product?.productName || 'Sản phẩm không xác định'}
                                {item.productSizeName && (
                                  <span className="ml-2 px-2 py-0.5 bg-[#d48437]/20 text-[#d48437] text-[10px] rounded-md border border-[#d48437]/30 font-black">
                                    Size: {item.productSizeName}
                                  </span>
                                )}
                            </Link>
                            <p className="text-[#d48437] font-black mt-1 text-lg">
                              {item.product?.originalPrice?.toLocaleString() || '0'}₫
                            </p>
                          </div>

                          {/* Bộ tăng giảm số lượng */}
                          <div className="flex items-center bg-[#2b1b12] border border-[#3d1d11] rounded-full w-fit overflow-hidden h-10 shadow-inner">
                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-4 text-white/40 hover:bg-[#1f120b] hover:text-[#d48437] transition-all font-black text-lg">-</button>
                            <span className="w-10 text-center text-sm font-black text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-4 text-white/40 hover:bg-[#1f120b] hover:text-[#d48437] transition-all font-black text-lg">+</button>
                          </div>
                        </div>

                        {/* Meta Info (Size, Toppings) */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {/* Size Tag đã được chuyển lên gần tên sản phẩm */}
                          {item.selectedToppings?.map(t => (
                            <span key={t.productId} className="px-3 py-1 bg-[#d48437]/10 text-[10px] rounded-full border border-[#d48437]/20 text-[#d48437] font-black uppercase tracking-widest">
                              + {t.productName}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Đường</span>
                            <select
                              value={item.note?.includes('50% đường') ? '50' : item.note?.includes('70% đường') ? '70' : '100'}
                              onChange={(e) => updateNote(item.cartItemId, 'đường', e.target.value)}
                              className="text-[10px] py-1.5 pl-3 pr-8 bg-[#2b1b12] border border-[#3d1d11] rounded-lg outline-none font-black text-white/80 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNkNDg0MzciIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_8px_center] bg-[length:10px_10px] hover:border-[#d48437]/50 transition-all uppercase tracking-widest"
                            >
                              <option value="100" className="bg-[#1f120b]">100%</option>
                              <option value="70" className="bg-[#1f120b]">70%</option>
                              <option value="50" className="bg-[#1f120b]">50%</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Đá</span>
                            <select
                              value={item.note?.includes('50% đá') ? '50' : item.note?.includes('70% đá') ? '70' : '100'}
                              onChange={(e) => updateNote(item.cartItemId, 'đá', e.target.value)}
                              className="text-[10px] py-1.5 pl-3 pr-8 bg-[#2b1b12] border border-[#3d1d11] rounded-lg outline-none font-black text-white/80 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNkNDg0MzciIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_8px_center] bg-[length:10px_10px] hover:border-[#d48437]/50 transition-all uppercase tracking-widest"
                            >
                              <option value="100" className="bg-[#1f120b]">100%</option>
                              <option value="70" className="bg-[#1f120b]">70%</option>
                              <option value="50" className="bg-[#1f120b]">50%</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Khối Ưu Đãi */}
              <div className="bg-[#1f120b] p-6 md:p-8 rounded-3xl shadow-xl border border-[#3d1d11]">
                <h2 className="text-lg font-black text-[#d48437] mb-5 pb-4 border-b border-[#3d1d11] flex items-center gap-2 uppercase tracking-wider">
                  <FiTag className="text-[#d48437]" /> Ưu đãi từ Phê La
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {promotions.length > 0 ? (
                    promotions.map((promo) => {
                      const isApplied = appliedPromotions.some(p => p.promotionId === promo.promotionId);
                      return (
                        <div
                          key={promo.promotionId}
                          onClick={() => !isApplied && applyPromotion(promo.promotionCode)}
                          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${isApplied
                            ? 'border-[#d48437] bg-[#d48437]/10'
                            : 'border-[#3d1d11] bg-[#2b1b12] hover:border-[#d48437]/50'
                            }`}
                        >
                          {/* Răng cưa giả lập Ticket */}
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1f120b] rounded-full border-r-2 border-[#3d1d11]"></div>
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1f120b] rounded-full border-l-2 border-[#3d1d11]"></div>

                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-black text-white uppercase tracking-tight">{promo.name}</h3>
                            {isApplied && (
                              <button
                                onClick={(e) => { e.stopPropagation(); removePromotion(promo.promotionId); }}
                                className="text-[10px] bg-red-600/10 text-red-500 px-2.5 py-1 rounded-full font-black hover:bg-red-600/20 transition-all uppercase tracking-widest"
                              >
                                Bỏ chọn
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                            Giảm {promo.discountValue}{promo.discountType === 'PERCENTAGE' ? '%' : '₫'}
                            {promo.maxDiscountAmount && promo.discountType === 'PERCENTAGE' && (
                              <span className="text-[#d48437]"> (Tối đa {promo.maxDiscountAmount.toLocaleString()}₫)</span>
                            )}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-white/30 italic font-bold uppercase tracking-widest col-span-full">Hiện chưa có mã khuyến mãi nào khả dụng.</p>
                  )}
                </div>
              </div>
            </div>

            {/* --- CỘT PHẢI: TỔNG KẾT --- */}
            <div className="lg:w-1/3">
              <div className="bg-[#1f120b] p-6 md:p-8 rounded-3xl shadow-2xl border border-[#3d1d11] sticky top-28">
                <h2 className="text-xl font-black text-[#d48437] mb-6 pb-4 border-b border-[#3d1d11] tracking-widest uppercase text-center">
                  Thanh Toán
                </h2>

                <div className="space-y-4 text-xs font-black text-white/40 mb-8 uppercase tracking-widest">
                  <div className="flex justify-between items-center">
                    <span>Tạm tính ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} món)</span>
                    <span className="text-white font-black">{totalAmount.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Phí giao hàng <span className="text-[10px] bg-[#2b1b12] px-2 py-1 rounded-full ml-2 text-[#d48437]">{distance > 0 ? `${distance.toFixed(1)}km` : 'N/A'}</span></span>
                    <span className="text-white font-black">{shippingFee.toLocaleString()}₫</span>
                  </div>
                  {appliedPromotions.length > 0 && (
                    <div className="flex justify-between items-center text-green-500">
                      <span>Khuyến mãi</span>
                      <span className="font-black">-{appliedPromotions.reduce((sum, promo) => sum + (promo.discountAmount || 0), 0).toLocaleString()}₫</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-[#331d11] pt-6 mb-8 flex justify-between items-end">
                  <span className="text-sm font-black text-white/40 uppercase tracking-widest">Toàn bộ</span>
                  <span className="text-4xl font-black text-[#d48437] tracking-tighter">
                    {finalAmount.toLocaleString()}₫
                  </span>
                </div>

                <Link
                  to="/payment"
                  className="w-full flex items-center justify-center gap-3 py-5 bg-[#d48437] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#d48437]/20 hover:bg-[#e59447] hover:shadow-2xl hover:shadow-[#d48437]/30 hover:-translate-y-1 transition-all active:scale-[0.98]"
                >
                  Đặt Hàng Ngay <FiChevronRight className="text-lg" />
                </Link>
                <p className="text-center text-[9px] text-white/20 mt-6 font-black uppercase tracking-[0.3em]">
                  Mọi giao dịch đều được mã hóa an toàn
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;