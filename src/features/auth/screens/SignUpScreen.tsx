// src/features/auth/screens/SignUpScreen.tsx
import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView, TextInput, Image, Animated, ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthInput } from '@/components/AuthInput';
import { signUpSchema } from '@/validation/schema';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import {useAuthStore} from "@/stores/authStore";
import {registerUser} from "@/services/authService";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // ✅ plural "types"

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const AnimatedButton = ({
                            title,
                            onPress,
                            disabled,
                            loading,
                            style,
                            textStyle,
                            loadingColor = 'white'
                        }) => {
    const [buttonScale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
                style={[style, disabled && styles.buttonDisabled]}
                onPress={onPress}
                disabled={disabled || loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
            >
                <View style={styles.buttonContent}>
                    {loading && (
                        <ActivityIndicator
                            size="small"
                            color={loadingColor}
                            style={styles.loadingIndicator}
                        />
                    )}
                    <Text
                        style={[
                            textStyle,
                            loading && styles.loadingText,
                            disabled && styles.disabledText
                        ]}
                    >
                        {loading ? 'Processing...' : title}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function SignUpScreen({ navigation }: Props) {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
        },
    });
    const [isChecked, setChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loader, setLoader] = useState(false);

    const onSubmit = async (data: any) => {
        const payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: data.password,
            profileImagePath: "",
            ageConfirmed: isChecked
        }
        setLoader(true)
        try {
            const result = await registerUser(payload);
            await useAuthStore.getState().login(result.data, result.data.token);
            navigation.navigate('Landing');
        } catch (err) {
            console.error(err);
            alert('Sign-up failed. Try again.');
            setLoader(false)
        }finally {
            setLoader(false)
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={require('@/assets/loginImg.png')}  resizeMode="contain" />

            <View style={styles.header}>
                <Text style={styles.title}>Sign up</Text>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First name</Text>
                    <Controller
                        control={control}
                        name="firstName"
                        rules={{
                            required: 'First name is required',
                            minLength: {
                                value: 2,
                                message: 'First name must be at least 2 characters',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.firstName && styles.inputError,
                                ]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Enter your first name"
                                autoCapitalize="words"
                            />
                        )}
                    />
                    {errors.firstName && (
                        <Text style={styles.errorText}>{errors.firstName.message}</Text>
                    )}
                </View>

                {/* Last Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Last name</Text>
                    <Controller
                        control={control}
                        name="lastName"
                        rules={{
                            required: 'Last name is required',
                            minLength: {
                                value: 2,
                                message: 'Last name must be at least 2 characters',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.lastName && styles.inputError,
                                ]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Enter your last name"
                                autoCapitalize="words"
                            />
                        )}
                    />
                    {errors.lastName && (
                        <Text style={styles.errorText}>{errors.lastName.message}</Text>
                    )}
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.email && styles.inputError,
                                ]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        )}
                    />
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}
                </View>

                {/* Phone Number */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone Number</Text>
                    <Controller
                        control={control}
                        name="phoneNumber"
                        rules={{
                            required: 'Phone number is required',
                            // pattern: {
                            //     // value: /^[\+]?[1-9][\d]{0,11}$/,
                            //     message: 'Invalid phone number',
                            // },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.phoneNumber && styles.inputError,
                                ]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                            />
                        )}
                    />
                    {errors.phoneNumber && (
                        <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
                    )}
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters',
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                    message: 'Password must contain uppercase, lowercase, and number',
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        styles.passwordInput,
                                        errors.password && styles.inputError,
                                    ]}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Enter your password"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                            )}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeIconText}>
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                </View>

                {/* Checkbox */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', marginRight: 5 }}>
                        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} color={isChecked ? '#1C36E5' : undefined} />
                    </View>
                    <Text style={{ color: '#a7a7a7' }}>I am above 18 years</Text>
                </View>

                {/*<Controller*/}
                {/*    name="above18"*/}
                {/*    control={control}*/}
                {/*    render={({ field: { value, onChange } }) => (*/}
                {/*        <TouchableOpacity style={styles.checkboxRow} onPress={() => onChange(!value)}>*/}
                {/*            <View style={[styles.checkbox, value && styles.checked]} />*/}
                {/*            <Text style={styles.checkboxText}>I am above 18 years</Text>*/}
                {/*        </TouchableOpacity>*/}
                {/*    )}*/}
                {/*/>*/}
                {/*{errors.above18 && <Text style={styles.error}>{errors.above18.message}</Text>}*/}

                {/* Sign Up Button */}
                <AnimatedButton
                    title="Sign Up"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid}
                    loading={loader}
                    style={styles.signInButton}
                    textStyle={styles.signInButtonText}
                    loadingColor="white"

                />

                {/* Submit */}
                {/*<TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>*/}
                {/*    <Text style={styles.buttonText}>Sign Up</Text>*/}
                {/*</TouchableOpacity>*/}

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', flexGrow: 1 },
    header: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: -40 },
    // input: {
    //     borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    //     padding: 12, marginBottom: 12
    // },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    checkbox: {
        width: 20, height: 20, borderRadius: 4,
        borderWidth: 1, borderColor: '#999', marginRight: 10
    },
    checked: { backgroundColor: '#1C36E5' },
    checkboxText: { fontSize: 14 },
    button: {
        backgroundColor: '#1C36E5', padding: 14,
        borderRadius: 8, alignItems: 'center', marginTop: 10
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    link: { marginTop: 16, textAlign: 'center', color: '#333' },
    linkBold: { color: '#1C36E5', fontWeight: '600' },
    error: { color: 'red', fontSize: 12, marginBottom: 8 },
    form: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 20,
    },
    inputContainer: {
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginTop: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },

    signInButton: {
        backgroundColor: '#1C36E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    buttonDisabled: {
        backgroundColor: '#B0B0B0',
    },
    signInButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        color: '#666',
        fontSize: 14,
        paddingHorizontal: 15,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
        paddingHorizontal: 60,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C36E5',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: '#666',
        fontSize: 16,
    },
    signUpLink: {
        color: '#1C36E5',
        fontSize: 16,
        fontWeight: '600',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingRight: 50, // Make room for eye icon
        fontSize: 16,
        backgroundColor: '#F8F9FA',
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 14,
        padding: 5,
    },
    eyeIconText: {
        fontSize: 18,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingIndicator: {
        marginRight: 8,
    },
    loadingText: {
        opacity: 0.8,
    },
    disabledText: {
        opacity: 0.6,
    },
    socialButtonLoading: {
        opacity: 0.7,
    },
});
