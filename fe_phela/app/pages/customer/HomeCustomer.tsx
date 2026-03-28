import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getLatestActiveBanners } from '~/services/bannerService';
import Header from '~/components/customer/Header'
import Footer from '~/components/customer/Footer'
import home from '~/assets/images/home.jpg';
import ChatWidget from '~/components/customer/ChatWidget';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '~/components/common/ScrollReveal';

interface Banner {
    bannerId: string;
    imageUrl: string;
}

const Home = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data: Banner[] = await getLatestActiveBanners();
                setBanners(data.filter(banner => banner.imageUrl)); 
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const nextBanner = () => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    };

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(nextBanner, 5000);
            return () => clearInterval(timer);
        }
    }, [banners]);

    const currentBanner = banners.length > 0 ? banners[currentBannerIndex] : null;

    return (
        <div className="min-h-screen text-white">
            <Header />
            <ChatWidget />
            
            {/* Banner Section */}
            <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden pt-16">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            className="absolute inset-0 flex items-center justify-center bg-[#1f120b]"
                        >
                             <div className="w-10 h-10 border-4 border-white/10 border-t-[#d48437] rounded-full animate-spin" />
                        </motion.div>
                    ) : currentBanner ? (
                        <motion.div
                            key={currentBanner.bannerId}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
                        >
                            <div className="absolute inset-0 bg-black/10" />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                    <ScrollReveal>
                        <h1 className="text-white text-7xl md:text-9xl font-black tracking-tighter mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] uppercase italic">
                            Phê La
                        </h1>
                        <p className="text-[#d48437] text-xs md:text-sm tracking-[0.5em] font-black uppercase drop-shadow-md">
                            Nốt Hương Đặc Sản
                        </p>
                    </ScrollReveal>
                </div>
            </div>
            
            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <ScrollReveal>
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight leading-none">Phê La <span className="text-[#d48437]">&</span> Những Điều Khác Biệt</h2>
                        <div className="w-24 h-1 bg-[#d48437] mx-auto rounded-full opacity-40"></div>
                    </div>
                </ScrollReveal>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <ScrollReveal delay={0.3}>
                        <div className="space-y-8">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Câu Chuyện Thương Hiệu</h3>
                            <p className="text-white/50 leading-relaxed text-xl font-bold">
                                Nốt Hương Đặc Sản - Phê La luôn trân quý, nâng niu những giá trị Nguyên Bản ở mỗi vùng đất mà chúng tôi đi qua, nơi tâm hồn được đồng điệu với thiên nhiên, với nỗi vất vả nhọc nhằn của người nông dân.
                            </p>
                            <Link 
                                to="/product" 
                                className="inline-block bg-[#d48437] text-white px-10 py-5 rounded-full font-black text-xs tracking-[0.2em] uppercase hover:bg-[#e59447] transition-all shadow-2xl shadow-[#d48437]/20 hover:-translate-y-1 active:scale-95"
                            >
                                Khám phá ngay
                            </Link>
                        </div>
                    </ScrollReveal>
                    
                    <ScrollReveal delay={0.5}>
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                            <img 
                                src={home} 
                                alt="Phê La" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
