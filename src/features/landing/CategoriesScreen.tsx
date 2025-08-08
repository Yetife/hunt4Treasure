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
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {gameStakeAmount, topUpBalance} from "@/services/authService";

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export default function CategoriesScreen({ navigation }: Props){
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false)
    const [quizData, setQuizData] = useState(null);
    const [sessionId, setSessionId] = useState("");

    // Fetch user details from AsyncStorage
    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userDetailsString = await AsyncStorage.getItem('userInfo');
                if (userDetailsString) {
                    const userData = JSON.parse(userDetailsString);
                    setUserDetails(userData);
                }
            } catch (error) {
                console.error('Error retrieving user details:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserDetails();
    }, []);

    const getUserBalance = () => {
        if (!userDetails) return '0';
        return userDetails.balance || '0';
    };

    const getUserName = () => {
        if (!userDetails) return 'User';
        return userDetails.fullName || 'User';
    };

    const handlePlayPress = (category) => {
        setSelectedCategory(category);
        setStakeAmount('');
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCategory(null);
        setStakeAmount('');
    };

    const validateStakeAmount = () => {
        const amount = parseFloat(stakeAmount);
        const balance = parseFloat(getUserBalance());

        if (!stakeAmount || stakeAmount.trim() === '') {
            Alert.alert('Invalid Amount', 'Please enter a stake amount');
            return false;
        }

        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
            return false;
        }

        if (amount > balance) {
            Alert.alert('Insufficient Balance', `You can't stake more than your current balance of ₦${balance}`);
            return false;
        }

        return true;
    };

    const handleStartGame = async () => {
        if (!validateStakeAmount()) return;

        setIsProcessing(true);

        try {
            const response = await gameStakeAmount(stakeAmount, selectedCategory.id);
            console.log('response', response);
            if (response.status === true) {
                // Still update state for other uses
                setQuizData(response.data.questions);
                setSessionId(response.data.sessionId);

                handleCloseModal();
                setIsProcessing(false);

                // Pass data directly from response instead of state
                navigation.navigate('MainGame', {
                    quizData: response.data.questions,  // Use response data directly
                    stakeAmount: stakeAmount,
                    initialBalance: getUserBalance(),
                    playerName: getUserName(),
                    id: response.data.sessionId         // Use response data directly
                });

            } else {
                Alert.alert('Error', 'Failed. Please try again.');
            }

        } catch (error) {
            console.error('Error starting game:', error);
            Alert.alert('Error', 'Failed to start game. Please try again.');
            setIsProcessing(false);
        }
    };

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
                                <Text style={styles.gameDescription}>{game.shortDescription}</Text>
                                <TouchableOpacity
                                    style={styles.cardPlayButton}
                                    onPress={() => handlePlayPress(game)}
                                >
                                    <Text style={styles.cardPlayButtonText}>Play</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Play Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={handleCloseModal}
                    >
                        <TouchableOpacity
                            style={styles.modalContent}
                            activeOpacity={1}
                            onPress={() => {}} // Prevent modal from closing when content is tapped
                        >
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <View style={styles.modalHeaderLeft}>
                                    <Ionicons name="game-controller" size={24} color="#8B7CF6" />
                                    <Text style={styles.modalTitle}>Start Hunting</Text>
                                </View>
                                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Category Info */}
                            {selectedCategory && (
                                <View style={styles.categoryInfo}>
                                    <Text style={styles.categoryName}>{selectedCategory.name}</Text>
                                    <Text style={styles.categoryDescription}>{selectedCategory.shortDescription}</Text>
                                </View>
                            )}

                            {/* Balance Display */}
                            <View style={styles.balanceContainer}>
                                <Text style={styles.balanceLabel}>Your Balance</Text>
                                <Text style={styles.balanceAmount}>₦{getUserBalance()}</Text>
                            </View>

                            {/* Stake Amount Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Enter Stake Amount</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.currencySymbol}>₦</Text>
                                    <TextInput
                                        style={styles.stakeInput}
                                        value={stakeAmount}
                                        onChangeText={setStakeAmount}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <Text style={styles.inputHint}>
                                    Maximum: ₦{getUserBalance()}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCloseModal}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.startGameButton,
                                        (isProcessing || !stakeAmount) && styles.disabledButton
                                    ]}
                                    onPress={handleStartGame}
                                    disabled={isProcessing || !stakeAmount}
                                >
                                    <Text style={[
                                        styles.startGameButtonText,
                                        (isProcessing || !stakeAmount) && styles.disabledButtonText
                                    ]}>
                                        {isProcessing ? 'Starting...' : 'Start Hunting'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
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
    gameDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 34,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    categoryInfo: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#8B7CF6',
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginRight: 8,
    },
    stakeInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 14,
        color: '#1F2937',
        fontWeight: '600',
    },
    inputHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    startGameButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#8B7CF6',
    },
    startGameButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
    },
    disabledButtonText: {
        color: '#9CA3AF',
    },
});