import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import OnboardingScreen from '@/features/onboarding/OnboardingScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import SignUpScreen from '@/features/auth/screens/SignUpScreen';
import LandingScreen from '@/features/landing/LandingScreen';
import { useAuthStore } from '@/stores/authStore';
import { hasSeenOnboarding } from '@/utils/onboardingStorage';
import {RootStackParamList} from "@/navigation/types";
import GameScreen from "@/features/gameplay/GameScreen";
import CategoriesScreen from "@/features/landing/CategoriesScreen";
import DemoGameScreen from "@/features/gameplay/DemoGameScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
    const { token, isLoading, restoreSession } = useAuthStore();

    useEffect(() => {
        (async () => {
            const seen = await hasSeenOnboarding();
            setShowOnboarding(seen);
            await restoreSession();
        })();
    }, []);

    if (showOnboarding === null || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#135D54" />
            </View>
        );
    }
    const getInitialRouteName = (): keyof RootStackParamList => {
        if (showOnboarding === false) return 'Onboarding';
        if (token) return 'Landing';
        return 'Login';
    };
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={getInitialRouteName()}>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/>
                <Stack.Screen name={"Categories"} component={CategoriesScreen} options={{ headerShown: false }}/>
                <Stack.Screen name={"Game"} component={GameScreen} options={{ headerShown: false }}/>
                <Stack.Screen name={"Demo"} component={DemoGameScreen} options={{ headerShown: false }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
