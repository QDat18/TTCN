import React, { useState, useEffect } from 'react';
import Header from '~/components/customer/Header';
import { Link } from 'react-router-dom';
import { getPublicJobPostings, getApplicationCount } from '~/services/jobService';

interface JobPosting {
  jobPostingId: string;
  jobCode: string;
  title: string;
  description: string;
  requirements: string;
  salaryRange: string;
  experienceLevel: string;
  branchCode: string;
  branchName: string;
  postingDate: string;
  deadline: string;
  updatedAt: string;
  status: string;
  applicationCount: number;
}

const Recruitment: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getPublicJobPostings();

        // Add application count to each job
        const jobsWithCount = await Promise.all(
          jobsData.map(async (job: JobPosting) => {
            try {
              const count = await getApplicationCount(job.jobPostingId);
              return { ...job, applicationCount: count };
            } catch {
              return { ...job, applicationCount: 0 };
            }
          })
        );

        setJobs(jobsWithCount);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Không thể tải danh sách tin tuyển dụng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

 const formatDate = (dateString: string) => {
    // Kiểm tra xem chuỗi có phải là định dạng YYYY-MM-DD không
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
       // Nếu là định dạng đầy đủ (có giờ phút), dùng cách cũ an toàn hơn
       const date = new Date(dateString);
       return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
       });
    }

    // Nếu là YYYY-MM-DD, xử lý thủ công để tránh lỗi timezone
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-3xl mx-auto" role="alert">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-700 rounded-xl p-8 mb-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Tuyển dụng</h1>
          <p className="text-lg max-w-3xl">
            Chúng tôi luôn tìm kiếm những tài năng mới để gia nhập đội ngũ. Nếu bạn đam mê công việc và muốn phát triển trong môi trường chuyên nghiệp, hãy khám phá các cơ hội dưới đây.
          </p>
        </div>

        {/* Job Listings */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-amber-200 inline-block">
            Vị trí đang tuyển dụng
          </h2>
          
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <div
                  key={job.jobPostingId}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {job.branchName}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{job.salaryRange}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{job.experienceLevel}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Hạn nộp: {formatDate(job.deadline)}</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/tuyen-dung/${job.jobPostingId}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg transition-colors duration-300 font-medium"
                    >
                      Xem chi tiết
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm max-w-2xl mx-auto">
              <svg className="w-16 h-16 mx-auto text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Hiện không có vị trí nào đang tuyển dụng</h3>
              <p className="text-gray-500">Vui lòng quay lại sau để xem các cơ hội mới từ chúng tôi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;