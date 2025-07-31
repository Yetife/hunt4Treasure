import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export const setOnboardingSeen = async () => {
    try {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (err) {
        console.error('Failed to set onboarding flag', err);
    }
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value === 'true';
    } catch (err) {
        console.error('Failed to read onboarding flag', err);
        return false;
    }
};
