// Recruitment.tsx (Admin)
import React, { useState, useEffect } from 'react';
import Header from '~/components/admin/Header';
import api from '~/config/axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '~/AuthContext';

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED'
}

export enum ExperienceLevel {
  FRESHER = 'FRESHER',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT'
}

interface JobPosting {
  jobPostingId: string;
  jobCode: string;
  title: string;
  description: string;
  requirements: string;
  salaryRange: string;
  experienceLevel: ExperienceLevel;
  branchCode: string;
  branchName: string;
  postingDate: string;
  deadline: string;
  updatedAt: string;
  status: JobStatus;
  applicationCount: number;
}

interface Branch {
  branchCode: string;
  branchName: string;
  city: string;
  district: string;
  address: string;
  status: string;
}

const Recruitment = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobPosting | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [unauthorized, setUnauthorized] = useState<boolean>(false);

  useEffect(() => {

    if (authLoading) return;

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (!user || !allowedRoles.includes(user.role)) {
      setUnauthorized(true);
      toast.error('Bạn không có quyền truy cập trang này', {
        onClose: () => navigate('/admin/dashboard')
      });
      return;
    }

    const fetchData = async () => {
      try {
        const [jobsResponse, branchesResponse] = await Promise.all([
          api.get('/api/job-postings'),
          api.get('/api/branch')
        ]);
        setJobs(jobsResponse.data);
        setBranches(branchesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, navigate]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
      try {
        await api.delete(`/api/job-postings/${id}`);
        setJobs(jobs.filter(job => job.jobPostingId !== id));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Đang mở</span>;
      case 'CLOSED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Đã đóng</span>;
      case 'FILLED':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Đã tuyển</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentJob({
      jobPostingId: '',
      jobCode: '',
      title: '',
      description: '',
      requirements: '',
      salaryRange: '',
      experienceLevel: ExperienceLevel.FRESHER,
      branchCode: branches.length > 0 ? branches[0].branchCode : '',
      branchName: branches.length > 0 ? branches[0].branchName : '',
      postingDate: '',
      deadline: '',
      updatedAt: '',
      status: JobStatus.OPEN,
      applicationCount: 0
    });
    setShowModal(true);
  };

  const openEditModal = (job: JobPosting) => {
    setIsEditMode(true);
    setCurrentJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob) return;

    try {
      const payload = {
        title: currentJob.title,
        description: currentJob.description,
        requirements: currentJob.requirements,
        salaryRange: currentJob.salaryRange,
        experienceLevel: currentJob.experienceLevel,
        branchCode: currentJob.branchCode,
        deadline: currentJob.deadline,
        status: currentJob.status
      };

      console.log('Sending payload:', payload);

      if (isEditMode) {
        await api.put(`/api/job-postings/${currentJob.jobPostingId}`, payload);
      } else {
        await api.post('/api/job-postings', payload);
      }

      const response = await api.get('/api/job-postings');
      setJobs(response.data);
      closeModal();
    } catch (error) {
      console.error('Error saving job:', error);
      console.error('Error response:', error); // Debug log
      alert('Có lỗi khi lưu tin tuyển dụng: ' + (error as any).message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'branchCode' && branches.length > 0) {
      const selectedBranch = branches.find(branch => branch.branchCode === value);
      setCurrentJob(prev => prev ? {
        ...prev,
        branchCode: value,
        branchName: selectedBranch ? selectedBranch.branchName : prev.branchName
      } : prev);
    } else {
      setCurrentJob(prev => prev ? { ...prev, [name]: value } : prev);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiLock className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Quay lại trang Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="border border-gray-200 shadow-lg"
        progressClassName="bg-amber-500"
        closeButton={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Header />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tin tuyển dụng</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            <FaPlus className="mr-2" /> Thêm mới
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="OPEN">Đang mở</option>
                <option value="CLOSED">Đã đóng</option>
                <option value="FILLED">Đã tuyển</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi nhánh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn nộp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số ứng viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.jobPostingId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.branchName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(job.postingDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(job.deadline)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.applicationCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(job)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(job.jobPostingId)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                          <Link
                            to={`/admin/tin-tuyen-dung/${job.jobPostingId}/candidates`}
                            className="text-green-600 hover:text-green-900"
                            title="Xem ứng viên"
                          >
                            👥
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không tìm thấy tin tuyển dụng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && currentJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditMode ? 'Cập nhật tin tuyển dụng' : 'Thêm tin tuyển dụng mới'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                      <input
                        type="text"
                        name="title"
                        value={currentJob.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mức lương</label>
                      <input
                        type="text"
                        name="salaryRange"
                        value={currentJob.salaryRange}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kinh nghiệm</label>
                      <select
                        name="experienceLevel"
                        value={currentJob.experienceLevel}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      >
                        <option value="FRESHER">Không cần kinh nghiệm</option>
                        <option value="JUNIOR">Junior (1-3 năm)</option>
                        <option value="SENIOR">Senior (3-5 năm)</option>
                        <option value="EXPERT">Expert (5+ năm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Chi nhánh</label>
                      <select
                        name="branchCode"
                        value={currentJob.branchCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      >
                        {branches.length > 0 ? (
                          branches.map(branch => (
                            <option key={branch.branchCode} value={branch.branchCode}>
                              {branch.branchName} ({branch.branchCode}) - {branch.city}, {branch.district}
                            </option>
                          ))
                        ) : (
                          <option value="">Không có chi nhánh nào</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
                      <input
                        type="date"
                        name="deadline"
                        value={currentJob.deadline ? currentJob.deadline.split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                      <select
                        name="status"
                        value={currentJob.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="OPEN">Đang mở</option>
                        <option value="CLOSED">Đã đóng</option>
                        <option value="FILLED">Đã tuyển</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả công việc</label>
                    <textarea
                      name="description"
                      value={currentJob.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Yêu cầu công việc</label>
                    <textarea
                      name="requirements"
                      value={currentJob.requirements}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;