// src/stores/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isTokenExpired} from "@/utils/jwt";

interface AuthState {
    user: any;
    token: string | null;
    isLoading: boolean;
    restoreSession: () => Promise<void>;
    login: (user: any, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,

    restoreSession: async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userJson = await AsyncStorage.getItem('userInfo');
            const user = userJson ? JSON.parse(userJson) : null;

            if (token && user && !isTokenExpired(token)) {
                set({ token, user, isLoading: false });
            } else {
                await AsyncStorage.clear();
                set({ token: null, user: null, isLoading: false });
            }
        } catch (err) {
            set({ isLoading: false });
        }
    },

    login: async (user, token) => {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        set({ user, token });
    },

    logout: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('userDetails');
        set({ user: null, token: null });
    }
}));
