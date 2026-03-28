import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createNews, updateNews, getNewsById } from '~/services/newsService';

interface NewsFormProps {
  newsId?: string | null; 
  onSuccess: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ newsId, onSuccess }) => {
  const isEditMode = Boolean(newsId);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && newsId) {
      const fetchNewsDetail = async () => {
        try {
          const data = await getNewsById(newsId);
          setTitle(data.title);
          setSummary(data.summary);
          setContent(data.content);
          setThumbnailPreview(data.thumbnailUrl);
        } catch (error) {
          toast.error('Không tìm thấy bài viết!');
          onSuccess(); // Đóng modal nếu có lỗi
        }
      };
      fetchNewsDetail();
    }
  }, [newsId, isEditMode, onSuccess]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content) {
      toast.warn('Vui lòng điền đầy đủ các trường.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('content', content);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      if (isEditMode && newsId) {
        await updateNews(newsId, formData);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await createNews(formData);
        toast.success('Tạo bài viết mới thành công!');
      }
      onSuccess(); // Gọi callback khi thành công
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Tiêu đề</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">Tóm tắt</label>
        <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24" />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">Nội dung</label>
        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-48" />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="thumbnail">Ảnh thumbnail</label>
        <input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
        {thumbnailPreview && <img src={thumbnailPreview} alt="Xem trước" className="mt-4 w-48 h-auto rounded" />}
      </div>
      <div className="flex items-center justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
          {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
        </button>
      </div>
    </form>
  );
};

export default NewsForm;