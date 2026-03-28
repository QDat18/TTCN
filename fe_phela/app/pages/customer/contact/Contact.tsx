import React, { useState } from 'react'
import Header from '~/components/customer/Header'
import Footer from '~/components/customer/Footer'
import imgContact from '~/assets/images/contact.png'
import { AiFillEnvironment } from "react-icons/ai";
import { GiRotaryPhone } from "react-icons/gi";
import { IoMailSharp } from "react-icons/io5";
import api from '~/config/axios';

interface FormData {
  fullName: string; 
  email: string;
  content: string;
}

interface ContactResponse {
  contactId: string; 
  fullName: string;
  email: string;
  content: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    content: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitMessage) setSubmitMessage('');
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      setSubmitError('Vui lòng nhập họ và tên');
      return;
    }
    
    if (!formData.email.trim()) {
      setSubmitError('Vui lòng nhập email');
      return;
    }
    
    if (!formData.content.trim()) {
      setSubmitError('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {

      const response = await api.post<ContactResponse>('/api/contacts', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        content: formData.content.trim()
      });

      if (response.data) {
 
        setFormData({ fullName: '', email: '', content: '' });
        setSubmitMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
        
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => {
          setSubmitMessage('');
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn';
        setSubmitError(`Lỗi: ${errorMessage}`);
      } else if (error.request) {
        setSubmitError('Không thể kết nối đến server. Vui lòng thử lại sau.');
      } else {
        setSubmitError('Có lỗi không mong muốn xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-white">
      <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
        <Header />
      </div>
      {/* Banner */}
      <div className="relative w-full h-72 mt-14">
        <img
          src={imgContact}
          alt="Phong cách khác biệt"
          className="w-full h-72 object-cover brightness-50"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <h1 className="text-5xl font-black uppercase text-white text-center drop-shadow-2xl tracking-tighter">
            Liên hệ <span className="text-[#d48437]">với chúng tôi</span>
          </h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className='text-4xl font-black uppercase tracking-tight mb-16'>Phê La <span className="text-[#d48437]">-</span> Nốt Hương Đặc Sản</h1>
        
        <div className="grid grid-cols-1 gap-12">
            <div className='flex items-start group'>
                <div className="w-14 h-14 bg-[#1f120b] rounded-2xl flex items-center justify-center border border-[#3d1d11] group-hover:border-[#d48437] transition-all">
                    <AiFillEnvironment className='text-3xl text-[#d48437]'/>
                </div>
                <div className='px-6'>
                    <p className='font-black uppercase tracking-widest text-xs text-[#d48437] mb-2'>Địa chỉ trụ sở</p>
                    <p className="text-white/60 font-bold leading-relaxed">289 Đinh Bộ Lĩnh, Phường 26, Quận Bình Thạnh, Thành phố Hồ Chí Minh</p>
                </div>
            </div>

            <div className='flex items-start group'>
                <div className="w-14 h-14 bg-[#1f120b] rounded-2xl flex items-center justify-center border border-[#3d1d11] group-hover:border-[#d48437] transition-all">
                    <GiRotaryPhone className='text-3xl text-[#d48437]'/>
                </div>
                <div className='px-6'>
                    <p className='font-black uppercase tracking-widest text-xs text-[#d48437] mb-2'>Hotline hỗ trợ</p>
                    <p className="text-white font-black text-2xl tracking-tighter">1900 3013</p>
                </div>
            </div>

            <div className='flex items-start group'>
                <div className="w-14 h-14 bg-[#1f120b] rounded-2xl flex items-center justify-center border border-[#3d1d11] group-hover:border-[#d48437] transition-all">
                    <IoMailSharp className='text-3xl text-[#d48437]'/>
                </div>
                <div className='px-6'>
                    <p className='font-black uppercase tracking-widest text-xs text-[#d48437] mb-2'>Email liên hệ</p>
                    <p className="text-white font-black text-xl lowercase opacity-80">info@phela.vn</p>
                </div>
            </div>
        </div>

        {/* Form Liên Hệ */}
        <div className='mt-24 max-w-4xl mx-auto p-10 rounded-[2.5rem] bg-[#1f120b] border border-[#3d1d11] shadow-2xl'>
          <h2 className='text-3xl font-black mb-3 uppercase tracking-tight'>Gửi lời nhắn</h2>
          <p className='text-white/40 mb-10 font-bold uppercase tracking-widest text-[10px]'>
            Chúng tôi luôn lắng nghe những chia sẻ từ bạn
          </p>
          
          {/* Success Message */}
          {submitMessage && (
            <div className="mb-8 p-5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black text-xs uppercase tracking-widest text-center">
              {submitMessage}
            </div>
          )}
          
          {/* Error Message */}
          {submitError && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest text-center">
              {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label htmlFor="fullName" className='block text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.2em] ml-1'>
                Họ và tên*
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className='w-full px-6 py-4 bg-[#2b1b12] border border-[#3d1d11] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#d48437]/20 focus:border-[#d48437] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-white/10'
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <div>
              <label htmlFor="email" className='block text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.2em] ml-1'>
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className='w-full px-6 py-4 bg-[#2b1b12] border border-[#3d1d11] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#d48437]/20 focus:border-[#d48437] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-white/10'
                placeholder="Nhập địa chỉ email của bạn"
              />
            </div>

            <div>
              <label htmlFor="content" className='block text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.2em] ml-1'>
                Nội dung*
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                required
                disabled={isSubmitting}
                className='w-full px-6 py-4 bg-[#2b1b12] border border-[#3d1d11] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#d48437]/20 focus:border-[#d48437] text-white font-bold transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-white/10'
                placeholder="Nhập nội dung tin nhắn của bạn..."
              />
            </div>

            <div className='pt-6'>
              <button
                type="submit"
                disabled={isSubmitting}
                className='w-full bg-[#d48437] hover:bg-[#e59447] text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 transform hover:shadow-2xl hover:shadow-[#d48437]/30 focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] text-xs'
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi yêu cầu...
                  </div>
                ) : (
                  'Gửi lời nhắn ngay'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Contact