// src/features/onboarding/Slide.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SlideProps {
    title: string;
    description: string;
    image: any;
}

const Slide = ({ title, description, image }: SlideProps) => (
    <View style={styles.container}>
        <Image source={image} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
    </View>
);

export default Slide;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width
    },
    image: {
        width: width * 0.6,
        height: width * 0.6,
        marginBottom: 30
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginBottom: 10
    },
    desc: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
        color: '#666'
    }
});
