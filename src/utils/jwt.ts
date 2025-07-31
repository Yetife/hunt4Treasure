import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    exp: number; // in seconds
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: DecodedToken = jwtDecode(token);
        const now = Date.now() / 1000;
        return decoded.exp < now;
    } catch (e) {
        return true; // if token is invalid
    }
};
