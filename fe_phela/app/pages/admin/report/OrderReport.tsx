import React, { useState, useEffect } from 'react';
import Header from '~/components/admin/Header';
import api from '~/config/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '~/AuthContext';
import { FiChevronLeft, FiChevronRight, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface DashboardStats {
  orderCountByStatus: { [key: string]: number };
  cancellationRate: number;
  productsSoldByCategory: { categoryName: string; totalQuantity: number }[];
}

const OrderReport = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Màu sắc được hệ thống hóa
  const colors = {
    primary: '#4f46e5',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

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

    fetchStats();
  }, [authLoading, navigate, user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
      toast.error('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.', {
        className: 'bg-red-100 text-red-800'
      });
    } finally {
      setLoading(false);
    }
  };

  const statusChartData = {
    labels: stats ? Object.keys(stats.orderCountByStatus) : [],
    datasets: [{
      data: stats ? Object.values(stats.orderCountByStatus) : [],
      backgroundColor: [
        colors.danger,
        colors.success,
        colors.warning,
        colors.info,
        colors.primary
      ],
      borderWidth: 1,
    }],
  };

  const categoryChartData = {
    labels: stats ? stats.productsSoldByCategory.map(c => c.categoryName) : [],
    datasets: [{
      label: 'Số lượng sản phẩm bán ra',
      data: stats ? stats.productsSoldByCategory.map(c => c.totalQuantity) : [],
      backgroundColor: `rgba(${colors.primary.replace('#', '')}, 0.7)`,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 16,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    maintainAspectRatio: false
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
    <div className="relative min-h-screen bg-gray-50">
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
      
      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Báo cáo Đơn hàng</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Cancellation Rate Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tỷ lệ hủy đơn</h3>
                <p className="text-3xl font-bold mt-1 text-gray-800">
                  {stats?.cancellationRate.toFixed(2) || 0}%
                  <span className="text-sm ml-2 text-gray-500">(30 ngày qua)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tổng số đơn hàng</h3>
                <p className="text-3xl font-bold mt-1 text-gray-800">
                  {stats ? Object.values(stats.orderCountByStatus).reduce((a, b) => a + b, 0) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Phân bổ đơn hàng theo trạng thái</h2>
            <div className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                </div>
              ) : (
                <Doughnut
                  data={statusChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Products by Category Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Sản phẩm bán theo danh mục</h2>
            <div className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                </div>
              ) : (
                <Bar
                  data={categoryChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          precision: 0
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Data Summary */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Chi tiết trạng thái đơn hàng</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats && Object.entries(stats.orderCountByStatus).map(([status, count]) => {
                      const total = Object.values(stats.orderCountByStatus).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      return (
                        <tr key={status} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {status.toLowerCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderReport;