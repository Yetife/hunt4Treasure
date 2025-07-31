import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useNavigation } from '@react-navigation/native';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { token} = useAuthStore();
    const navigation = useNavigation();

    React.useEffect(() => {
        if (!token) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        }
    }, [ token]);

    // // if (!isReady) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //             <ActivityIndicator size="large" color="#135D54" />
    //         </View>
    //     );
    // // }

    return <>{token ? children : null}</>;
};

export default ProtectedRoute;
