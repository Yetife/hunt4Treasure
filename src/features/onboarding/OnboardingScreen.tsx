import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import Slide from './Slide';
import { onboardingSlides } from './data';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { setOnboardingSeen } from '@/utils/onboardingStorage';

const OnboardingScreen = () => {
    const swiperRef = useRef<Swiper>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleNext = async (index: number) => {
        if (index === onboardingSlides.length - 1) {
            await setOnboardingSeen();
            navigation.navigate('Login');
        } else {
            swiperRef.current?.scrollBy(1);
        }
    };

    return (
        <Swiper
            ref={swiperRef}
            loop={false}
            showsPagination
            dotColor="#ccc"
            activeDotColor="#135D54"
            showsButtons={false}
        >
            {onboardingSlides.map((item, index) => (
                <View style={styles.slide} key={item.key}>
                    <View style={styles.skip}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ color: '#999' }}>Skip</Text>
                        </TouchableOpacity>
                    </View>
                    <Slide title={item.title} description={item.description} image={item.image}  />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleNext(index)}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>
                            {index === onboardingSlides.length - 1 ? 'Start' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </Swiper>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        backgroundColor: '#f6faff',
        paddingTop: 60
    },
    skip: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10
    },
    button: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#135D54',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 30
    }
});
