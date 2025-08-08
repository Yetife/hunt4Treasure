import api from './api';

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('Auth/SignIn', { email, password });
    return response.data; // should return token, user info
};

export const googleLogin = async (accessToken: string) => {
    const response = await api.post('Auth/google', { accessToken});
    return response.data; // should return token, user info
};

export const registerUser = async (data: any) => {
    const response = await api.post('Auth/Internal', data);
    return response.data;
};

export const editUserProfile = async (data: any) => {
    const response = await api.post('Profile/UpdateUser', data);
    return response.data;
};
export const topUpBalance = async (data: any) => {
    const response = await api.post(`Payment/TopUp?Amount=${data}`);
    return response.data;
};
export const gameStakeAmount = async (amount: any, id: string) => {
    const response = await api.post(`Question/GetQuestions?amountStaked=${amount}&category=${id}`);
    return response.data;
};
export const getDemoQuestion = async () => {
    const response = await api.get('Question/GetSampleQuestions');
    return response.data;
};
export const getUserDetails = async () => {
    const response = await api.post('Profile/GetDetial');
    return response.data;
};


//
// export const loginUser = async (email: string, password: string) => {
//     if (email === 'demo@example.com' && password === 'password') {
//         return {
//             user: { id: 1, name: 'Demo User', email },
//             token: 'mock-token-1234'
//         };
//     } else {
//         throw new Error('Invalid credentials');
//     }
// };
//
// export const registerUser = async (data: any) => {
//     return {
//         user: { id: Date.now(), name: `${data.firstName} ${data.lastName}`, email: data.email },
//         token: 'mock-token-1234'
//     };
// };

