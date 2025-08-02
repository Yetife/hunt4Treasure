import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {googleLogin, loginUser} from "@/services/authService";
import {useAuthStore} from "@/stores/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: 'http://335471388791-hui5erq4i9qo2hpraq3ac0t4au76ud73.apps.googleusercontent.com',
        // iosClientId: 'YOUR_IOS_CLIENT_ID',
        // webClientId: 'YOUR_WEB_CLIENT_ID',
        // redirectUri: Google.makeRedirectUri({
        //     scheme: 'hunt4treasure', // must match scheme in app.json
        // }),
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log("Google Auth Token:", authentication?.accessToken);
            const result = googleLogin(authentication?.accessToken);
            console.log(result, "dataaaaa")
            // useAuthStore.getState().login(result, result.token);
            // AsyncStorage.setItem("userDetails", JSON.stringify(result.data));
            // You can fetch profile info here or send to backend
        }
    }, [response]);

    return { promptAsync };
};
