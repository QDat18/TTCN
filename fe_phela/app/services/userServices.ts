import api from '../config/axios';

// Interface cho dữ liệu Customer
interface Customer {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  latitude?: number; 
  longitude?: number;
}

// Interface cho dữ liệu Admin
interface Admin {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: string; // Chuỗi định dạng "dd/MM/yyyy"
}

// Lấy thông tin Customer
export const getCustomerProfile = async (username: string) => {
  try {
    const response = await api.get(`/api/customer/${username}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message
      || error.message
      || 'Failed to fetch customer profile';
    throw new Error(errorMessage);
  }
};

export const updateCustomerProfile = async (username: string, data: Partial<Customer>): Promise<Customer> => {
  try {
    const response = await api.put(`/api/customer/updateInfo/${username}`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message
      || error.message
      || 'Failed to update customer profile';
    throw new Error(errorMessage);
  }
};

// Lấy thông tin Admin
export const getAdminProfile = async (username: string) => {
  try {
    const response = await api.get(`/api/admin/${username}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message
      || error.message
      || 'Failed to fetch admin profile';
    throw new Error(errorMessage);
  }
};

// Cập nhật thông tin Admin
export const updateAdminProfile = async (username: string, data: Partial<Admin>, currentUsername: string): Promise<Admin> => {
  try {
    const response = await api.put(`/api/admin/updateInfo/${username}?curentUsername=${currentUsername}`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message
      || error.message
      || 'Failed to update admin profile';
    throw new Error(errorMessage);
  }
};