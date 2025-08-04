import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export default function CategoriesScreen({ navigation }: Props){
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user details from AsyncStorage
    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userDetailsString = await AsyncStorage.getItem('userInfo');
                if (userDetailsString) {
                    const userData = JSON.parse(userDetailsString);
                    setUserDetails(userData);
                }
                console.log(userDetailsString)
            } catch (error) {
                console.error('Error retrieving user details:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserDetails();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.categoriesHeader}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.categoriesTitle}>categories</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoriesContent}>
                {/* Games List */}
                <View style={styles.gamesList}>
                    {userDetails?.category.map((game) => (
                        <TouchableOpacity key={game.id} style={styles.gameCard}>
                            <View style={styles.gameImageContainer}>
                                <Image source={{ uri: game.imageUrl}} style={styles.gameImage} />
                            </View>

                            <View style={styles.gameInfo}>
                                <Text style={styles.gameTitle}>{game.name}</Text>
                                <Text style={styles.gameTitle}>{game.shortDescription}</Text>
                                <TouchableOpacity style={styles.cardPlayButton}>
                                    <Text style={styles.cardPlayButtonText}>Play</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    categoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoriesTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    searchButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardPlayButton: {
        backgroundColor: '#8B7CF6',
        paddingHorizontal: 30,
        paddingVertical: 5,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    cardPlayButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    categoriesContent: {
        flex: 1,
        marginTop: 20
    },
    allCategoriesGrid: {
        padding: 20,
        gap: 16,
    },
    gamesList: {
        paddingHorizontal: 20,
    },
    gameCard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#9F9F9F',
        borderRadius: 16,
        marginBottom: 12,
    },
    gameImageContainer: {
        marginRight: 16,
    },
    gameImage: {
        width: 160,
        height: 140,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    gameIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameIcon: {
        fontSize: 24,
    },
    gameInfo: {
        flex: 1,
        marginTop: 10
    },
    gameTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,

    },
    gameMetaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gameMetaLeft: {
        flex: 1,
    },
    gameTime: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    gameRating: {
        fontSize: 12,
        color: '#6B7280',
    },
})