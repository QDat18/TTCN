import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '~/components/customer/Header';
import Footer from '~/components/customer/Footer';
import { getPublicNewsById } from '~/services/newsService';

// Định nghĩa kiểu dữ liệu chi tiết
interface NewsDetailArticle {
  title: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
}

const NewDetail = () => {
  const { newsId } = useParams<{ newsId: string }>();
 const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (newsId) {
      const fetchDetail = async () => {
        try {
          const data = await getPublicNewsById(newsId);
          setArticle(data);
        } catch (error) {
          toast.error("Không tìm thấy bài viết.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [newsId]);

  if (loading) {
    return <div>Đang tải bài viết...</div>;
  }

  if (!article) {
    return <div>Không tìm thấy bài viết.</div>;
  }

  return (
    <div>
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Header />
      </div>

      {/* Banner */}
      <div 
        className="w-full h-[300px] bg-cover bg-center"
        style={{ backgroundImage: `url(${article.thumbnailUrl || 'https://placehold.co/1200x300?text=News+Banner'})` }}
      ></div>

 
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{article.title}</h1>
        <p className="text-md text-gray-500 mb-8">
          Ngày đăng: {new Date(article.createdAt).toLocaleDateString('vi-VN')}
        </p>
        
      
        <div className="prose lg:prose-xl max-w-none whitespace-pre-wrap">
          {article.content}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewDetail;