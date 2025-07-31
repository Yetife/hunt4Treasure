// src/features/auth/components/AuthInput.tsx
import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';

interface Props {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric';
    error?: string;
}

export const AuthInput = ({ label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default', error }: Props) => (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, error && styles.errorInput]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 14, marginBottom: 4, color: '#333' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        fontSize: 16,
        backgroundColor: '#fff'
    },
    errorInput: {
        borderColor: 'red'
    },
    errorText: {
        color: 'red',
        marginTop: 4,
        fontSize: 12
    }
});
