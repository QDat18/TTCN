import api from '~/config/axios';
import axios from 'axios';

// Get API base URL for public endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phela-backend-dyl7.onrender.com';

// Create a separate axios instance for public endpoints (no auth required)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export enum BannerStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface Banner {
    bannerId: string;
    title: string;
    imageUrl: string;
    status: BannerStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface BannerCreateDTO {
    title: string;
    imageFile: File;
}

// PUBLIC ENDPOINTS - No authentication required
export const getPublicBanners = async () => {
    const response = await publicApi.get('/api/banners');
    return response.data;
};

export const getLatestActiveBanners = async () => {
    const response = await publicApi.get('/api/banners/latest');
    return response.data;
};

export const getPublicBannerById = async (bannerId: string) => {
    const response = await publicApi.get(`/api/banners/${bannerId}`);
    return response.data;
};

// ADMIN ENDPOINTS - Require admin authentication
export const getAllBannersAdmin = async (page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    const response = await api.get(`/api/admin/banners?${params.toString()}`);
    return response.data;
};

export const createBanner = async (bannerData: BannerCreateDTO) => {
    const formData = new FormData();
    // Backend expects 'file' parameter, not 'imageFile'
    formData.append('file', bannerData.imageFile);

    const response = await api.post('/api/admin/banners', formData);
    return response.data;
};

export const updateBannerStatus = async (bannerId: string, status: BannerStatus) => {
    const response = await api.patch(`/api/admin/banners/${bannerId}/status`, null, {
        params: { status }
    });
    return response.data;
};

export const deleteBanner = async (bannerId: string) => {
    const response = await api.delete(`/api/admin/banners/${bannerId}`);
    return response.data;
};

export const updateBanner = async (bannerId: string, bannerData: Partial<BannerCreateDTO>) => {
    const formData = new FormData();

    // Backend expects 'file' parameter, not 'imageFile'
    if (bannerData.imageFile) {
        formData.append('file', bannerData.imageFile);
    }

    const response = await api.put(`/api/admin/banners/${bannerId}`, formData);
    return response.data;
};

// Alias for backwards compatibility
export const getAllBanners = getAllBannersAdmin;