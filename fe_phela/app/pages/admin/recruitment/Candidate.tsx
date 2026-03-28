import React, { useState, useEffect } from 'react';
import Header from '~/components/admin/Header';
import api from '~/config/axios';
import { FaSearch, FaFilter, FaFileDownload, FaEnvelope, FaPhone, FaEye } from 'react-icons/fa';
import { FiLock } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '~/AuthContext';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

interface Candidate {
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  jobPostingId: string;
  jobTitle: string;
  status: ApplicationStatus;
  applicationDate: string;
  updatedAt: string;
}

const Candidate = () => {
  const { jobPostingId } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [jobTitle, setJobTitle] = useState('Tất cả ứng viên');
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
        if (jobPostingId) {
          // Fetch job details
          const jobResponse = await api.get(`/api/job-postings/${jobPostingId}`);
          setJobTitle(jobResponse.data.title ? `Ứng viên cho: ${jobResponse.data.title}` : 'Không tìm thấy tiêu đề');

          // Fetch candidates for this job
          const candidatesResponse = await api.get(`/api/applications/job-postings/${jobPostingId}`);
          const candidatesWithJobTitle = candidatesResponse.data.map((candidate: any) => ({
            ...candidate,
            jobTitle: jobResponse.data.title
          }));
          setCandidates(candidatesWithJobTitle);
        } else {
          // Fetch all candidates
          const response = await api.get('/api/applications');
          setCandidates(response.data || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        alert('Có lỗi khi tải dữ liệu: ' + (error as Error).message);
      }
    };
    fetchData();
  }, [jobPostingId, user, authLoading, navigate]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Chờ xử lý</span>;
      case ApplicationStatus.REVIEWED:
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Đã xem</span>;
      case ApplicationStatus.ACCEPTED:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Đã chấp nhận</span>;
      case ApplicationStatus.REJECTED:
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Đã từ chối</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      if (!jobPostingId) {
        // Nếu không có jobPostingId, sử dụng API cập nhật trạng thái chung
        await api.patch(`/api/applications/${applicationId}/status`, { status: newStatus });
      } else {
        // Nếu có jobPostingId, sử dụng API như cũ
        await api.patch(
          `/api/job-postings/${jobPostingId}/applications/${applicationId}/status?status=${newStatus}`
        );
      }

      setCandidates(candidates.map(candidate =>
        candidate.applicationId === applicationId ? { ...candidate, status: newStatus } : candidate
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi khi cập nhật trạng thái: ' + (error as Error).message);
    }
  };

  const downloadCV = async (applicationId: string, fullName: string) => {
    try {
      const response = await api.get(`/api/cv/download/${applicationId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_${fullName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Không thể tải CV: ' + (error as Error).message);
    }
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý ứng viên</h1>
            <p className="text-gray-600">{jobTitle}</p>
          </div>
          {jobPostingId && (
            <Link
              to="/admin/candidates"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Xem tất cả ứng viên
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value={ApplicationStatus.PENDING}>Chờ xử lý</option>
                <option value={ApplicationStatus.REVIEWED}>Đã xem</option>
                <option value={ApplicationStatus.ACCEPTED}>Chấp nhận</option>
                <option value={ApplicationStatus.REJECTED}>Từ chối</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên ứng viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vị trí ứng tuyển</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày ứng tuyển</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.applicationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{candidate.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaEnvelope className="mr-2" /> {candidate.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaPhone className="mr-2" /> {candidate.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {candidate.jobPostingId ? (
                          <Link
                            to={`/admin/recruitment/${candidate.jobPostingId}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {candidate.jobTitle || 'Không có tiêu đề'}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">{candidate.jobTitle || 'Không có tiêu đề'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(candidate.applicationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(candidate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.cvUrl ? (
                          <button
                            onClick={() => downloadCV(candidate.applicationId, candidate.fullName)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            title="Tải xuống CV"
                          >
                            <FaFileDownload className="mr-1" /> Tải CV
                          </button>
                        ) : (
                          <span className="text-gray-400">Không có CV</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <select
                            value={candidate.status}
                            onChange={(e) => handleStatusChange(candidate.applicationId, e.target.value as ApplicationStatus)}
                            className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={ApplicationStatus.PENDING}>Chờ xử lý</option>
                            <option value={ApplicationStatus.REVIEWED}>Đã xem</option>
                            <option value={ApplicationStatus.ACCEPTED}>Chấp nhận</option>
                            <option value={ApplicationStatus.REJECTED}>Từ chối</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => sendEmail(candidate.email)}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 flex items-center"
                            >
                              <FaEnvelope className="mr-1" /> Email
                            </button>

                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không tìm thấy ứng viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Candidate;