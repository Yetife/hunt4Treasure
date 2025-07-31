// src/features/auth/validations/schema.ts
import * as yup from 'yup';

export const signUpSchema = yup.object().shape({
    firstName: yup.string().required('First name required'),
    lastName: yup.string().required('Last name required'),
    email: yup.string().email('Invalid email').required('Email required'),
    phone: yup.string().min(10).max(15).required('Phone number required'),
    password: yup.string().length(8, 'Password must be 8 characters').required('Password required'),
    above18: yup.boolean().oneOf([true], 'You must be above 18')
});

export const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email required'),
    password: yup.string().required('Password required'),
    remember: yup.boolean()
});
