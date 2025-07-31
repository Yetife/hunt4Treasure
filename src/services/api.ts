
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Auto add token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto logout on 401
api.interceptors.response.use(
    res => res,
    async err => {
        if (err.response?.status === 401) {
            await useAuthStore.getState().logout();
        }
        return Promise.reject(err);
    }
);

export default api;
