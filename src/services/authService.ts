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
    console.log('Data being sent to editUserProfile:', data);
    //const response = await api.post('Profile/UpdateUser', data);
    const response = await api.post('Profile/UpdateUser', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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
