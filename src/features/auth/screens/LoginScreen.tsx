import React, {useState} from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image, ActivityIndicator, Animated,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/validation/schema';
import { useAuthStore } from '@/stores/authStore';
import { loginUser } from '@/services/authService';
import { RootStackParamList } from '@/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Custom Animated Button Component
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

export default function LoginScreen({ navigation }: Props) {
    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const [isChecked, setChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loader, setLoader] = useState(false);

    const onSubmit = async (data: any) => {
        setLoader(true)
        try {
            console.log(data)
            const result = await loginUser(data.email, data.password);
            console.log(result.data, "dataaaaa")
            await useAuthStore.getState().login(result.data, result.data.token);
            await AsyncStorage.setItem("userDetails", JSON.stringify(result.data));
            navigation.navigate('Game');
        } catch {
            alert('Login failed. Try again.');
            setLoader(false)
        }finally {
            setLoader(false)
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={require('@/assets/loginImg.png')}  resizeMode="contain" />

            <View style={styles.header}>

                <Text style={styles.title}>Sign in</Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email address</Text>
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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
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


                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', marginRight: 5 }}>
                        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} color={isChecked ? '#1C36E5' : undefined} />
                    </View>
                    <Text style={{ color: '#a7a7a7' }}>Remember me</Text>
                </View>

                {/* Sign In Button */}
                <AnimatedButton
                    title="Sign in"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid}
                    loading={loader}
                    style={styles.signInButton}
                    textStyle={styles.signInButtonText}
                    loadingColor="white"

                />

                {/*<TouchableOpacity style={[styles.button, (!isValid || !isChecked) && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={!isValid || !isChecked}>*/}
                {/*    <Text style={styles.buttonText}>Sign In</Text>*/}
                {/*</TouchableOpacity>*/}

                <Text style={styles.orText}>or register with</Text>
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.social}><Image source={require('@/assets/googleIcon.png')}  resizeMode="contain" /></TouchableOpacity>
                    <TouchableOpacity style={styles.social}><Text><Image source={require('@/assets/appleIcon.png')}  resizeMode="contain" /></Text></TouchableOpacity>
                    <TouchableOpacity style={styles.social}><Text></Text></TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.link}>Don’t have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {  backgroundColor: '#fff', flexGrow: 1 },
    header: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: -40 },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
        padding: 12, marginBottom: 12
    },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    icon: { position: 'absolute', right: 10 },
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
    orText: { textAlign: 'center', marginVertical: 12 },
    socialRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    social: {
        backgroundColor: '#eee', padding: 12,
        width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center'
    },
    link: { textAlign: 'center', color: '#333' },
    linkBold: { color: '#1C36E5', fontWeight: '600' },
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
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#FF6B6B',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginTop: 4,
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
