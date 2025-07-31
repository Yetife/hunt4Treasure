import React from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export default function CategoriesScreen({ navigation }: Props){
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
                <View style={styles.allCategoriesGrid}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.fullCategoryCard, { backgroundColor: category.color }]}
                        >
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.fullCategoryTitle}>{category.title}</Text>
                            <View style={styles.categoryMeta}>
                                <Text style={styles.categoryTime}>2 month ago • 5.4k</Text>
                                <View style={styles.categoryAuthor}>
                                    <View style={styles.categoryAuthorAvatar}>
                                        <Text style={styles.categoryAuthorText}>
                                            {category.subtitle.charAt(0)}
                                        </Text>
                                    </View>
                                    <Text style={styles.categoryAuthorName}>{category.subtitle}</Text>
                                </View>
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
    categoriesContent: {
        flex: 1,
    },
    allCategoriesGrid: {
        padding: 20,
        gap: 16,
    },
    fullCategoryCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    fullCategoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
        marginTop: 8,
    },
    categoryMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryTime: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    categoryAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryAuthorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    categoryAuthorText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white',
    },
    categoryAuthorName: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    categoryIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
})