import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        webClientId: 'YOUR_WEB_CLIENT_ID',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log("Google Auth Token:", authentication?.accessToken);
            // You can fetch profile info here or send to backend
        }
    }, [response]);

    return { promptAsync };
};
