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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const LandingScreen = ({ navigation }: Props) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user details from AsyncStorage
    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userDetailsString = await AsyncStorage.getItem('userDetails');
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

    // Function to get user's first name or fallback
    const getUserName = () => {
        if (!userDetails) return 'User';
        return userDetails.fullName || 'User';
    };

    // Function to get user's avatar or fallback
    const getUserAvatar = () => {
        if (!userDetails) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';

        return userDetails.avatar ||
            userDetails.profilePicture ||
            userDetails.image ||
            userDetails.photo ||
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';
    };

    // Function to get user's points or fallback
    const getUserPoints = () => {
        if (!userDetails) return '0';

        return userDetails.points ||
            userDetails.balance ||
            '0';
    };
    const categories = [
        {
            id: 1,
            title: 'Get Smart with Productivity Quiz...',
            subtitle: 'Franklin smith',
            color: '#8B7CF6',
            icon: '🧠',
        },
        {
            id: 2,
            title: 'Great Ideas Come from brilliant man',
            subtitle: 'Emmanuel',
            color: '#F59E0B',
            icon: '💡',
        },
        {
            id: 3,
            title: 'Science & Discovery',
            subtitle: 'Dr. Sarah',
            color: '#10B981',
            icon: '🔬',
        },
        {
            id: 4,
            title: 'History & Culture',
            subtitle: 'Prof. Johnson',
            color: '#EF4444',
            icon: '🏛️',
        },
        {
            id: 5,
            title: 'Sports & Fitness',
            subtitle: 'Coach Mike',
            color: '#3B82F6',
            icon: '⚽',
        },
        {
            id: 6,
            title: 'Art & Creativity',
            subtitle: 'Artist Luna',
            color: '#EC4899',
            icon: '🎨',
        },
        {
            id: 7,
            title: 'Technology & Future',
            subtitle: 'Tech Guru',
            color: '#6366F1',
            icon: '🚀',
        },
        {
            id: 8,
            title: 'Music & Entertainment',
            subtitle: 'DJ Alex',
            color: '#F59E0B',
            icon: '🎵',
        },
    ];

    // Only show first 3 categories on home screen
    const displayCategories = categories.slice(0, 3);

    const handleSeeAllCategories = () => {
        // Navigate to categories screen
        if (navigation) {
            navigation.navigate('Categories');
        } else {
            // For demo purposes, show alert
            alert('Navigate to Categories screen');
        }
    };

    return (
        // <View style={styles.container}>
        //     <Text style={styles.welcome}>Welcome to Hunt4Treasure! 🎉</Text>
        //     {/*<Button title="Start Game" onPress={() => navigation.navigate('Game', { wager: 100 })} />*/}
        // </View>
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.greeting}>Hi {getUserName()}</Text>
                        <Text style={styles.subGreeting}>ready to play</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.pointsContainer}>
                        <Text style={styles.pointsIcon}>💎</Text>
                        <Text style={styles.points}>{getUserPoints()}</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Main Card */}
                <View style={styles.mainCard}>
                    <Text style={styles.mainCardTitle}>Play quiz together with your friends now!</Text>
                    <TouchableOpacity style={styles.playButton}>
                        <Text style={styles.playButtonText}>Play Game</Text>
                    </TouchableOpacity>
                    <View style={styles.charactersContainer}>
                        <Text style={styles.character}>👥</Text>
                        <Text style={styles.character}>🎮</Text>
                        <Text style={styles.character}>🏆</Text>
                    </View>
                </View>

                {/* Categories Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>categories</Text>
                    <TouchableOpacity onPress={handleSeeAllCategories}>
                        <Text style={styles.seeAll}>see all</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {displayCategories.map((category) => (
                        <TouchableOpacity key={category.id} style={[styles.categoryCard, { backgroundColor: category.color }]}>
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.categoryTitle}>{category.title}</Text>
                            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

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
                                <View style={styles.gameMetaContainer}>
                                    {/*<View style={styles.authorContainer}>*/}
                                    {/*    <View style={styles.authorAvatar}>*/}
                                    {/*        <Text style={styles.authorText}>{game.author.charAt(0)}</Text>*/}
                                    {/*    </View>*/}
                                    {/*    <Text style={styles.authorName}>{game.author}</Text>*/}
                                    {/*</View>*/}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#8B7CF6" />
                    <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>Games</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default LandingScreen;

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: '#F4FDFD'
    // },
    // welcome: {
    //     fontSize: 20,
    //     fontWeight: 'bold',
    //     marginBottom: 20,
    //     color: '#135D54'
    // }
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    subGreeting: {
        fontSize: 14,
        color: '#6B7280',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pointsIcon: {
        marginRight: 6,
    },
    points: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    mainCard: {
        backgroundColor: '#8B7CF6',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    mainCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 16,
        maxWidth: '70%',
    },
    playButton: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    playButtonText: {
        color: '#8B7CF6',
        fontWeight: '600',
        fontSize: 16,
    },
    charactersContainer: {
        position: 'absolute',
        right: 20,
        top: 20,
        flexDirection: 'column',
        alignItems: 'center',
    },
    character: {
        fontSize: 24,
        marginVertical: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    seeAll: {
        fontSize: 14,
        color: '#8B7CF6',
        fontWeight: '500',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%', // This ensures 2 items per row with gap
        padding: 16,
        borderRadius: 16,
        minHeight: 120,
    },
    categoryIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    gamesList: {
        paddingHorizontal: 20,
    },
    gameCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    gameImageContainer: {
        marginRight: 16,
    },
    gameImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
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
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F59E0B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    authorText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    authorName: {
        fontSize: 12,
        color: '#6B7280',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    navTextActive: {
        color: '#8B7CF6',
        fontWeight: '600',
    },
});
