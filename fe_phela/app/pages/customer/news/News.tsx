import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '~/components/customer/Header';
import Footer from '~/components/customer/Footer';
import { getPublicNews } from '~/services/newsService';

// Định nghĩa kiểu dữ liệu
interface NewsArticle {
  newsId: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
}

const News = () => {
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getPublicNews();
        setNewsList(data);
      } catch (error) {
        toast.error("Không thể tải tin tức. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-[#d48437] mb-6"></div>
        <p className="text-[#d48437] font-black uppercase tracking-widest text-xs">Đang tải bản tin Phê La...</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
        <Header />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <h1 className="text-5xl font-black text-center mb-4 uppercase tracking-tighter">Tin Tức <span className="text-[#d48437]">&</span> Sự Kiện</h1>
        <p className="text-center text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-16">Cập nhật những hành trình mới nhất từ chúng tôi</p>
        
        {/* Lưới hiển thị tin tức */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newsList.map((article) => (
            <div key={article.newsId} className="bg-[#1f120b] rounded-3xl shadow-2xl overflow-hidden transform hover:-translate-y-3 transition-all duration-500 border border-[#3d1d11] group">
              <Link to={`/tin-tuc/${article.newsId}`} className="block overflow-hidden">
                <img 
                  src={article.thumbnailUrl || 'https://placehold.co/400x250?text=News+Thumbnail'} 
                  alt={article.title} 
                  className="w-full h-64 object-cover brightness-90 group-hover:brightness-110 group-hover:scale-110 transition-all duration-700"
                />
              </Link>
              <div className="p-8">
                <Link to={`/tin-tuc/${article.newsId}`}>
                  <h2 className="text-xl font-black mb-4 text-white hover:text-[#d48437] transition-colors uppercase tracking-tight leading-tight line-clamp-2">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3 font-bold">
                  {article.summary}
                </p>
                <Link to={`/tin-tuc/${article.newsId}`} className="text-[10px] font-black text-[#d48437] uppercase tracking-widest hover:text-[#e59447] transition-all flex items-center gap-2">
                  Xem chi tiết <span className="w-8 h-px bg-[#d48437]/30 group-hover:w-12 transition-all"></span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default News;