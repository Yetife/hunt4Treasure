import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Dimensions,
    Modal,
    Alert,
    TextInput,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/types";

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'MainGame'>;

const MainGameScreen = ({navigation, route}: Props) => {
    const quizData = route.params?.quizData || [];
    const stakeAmount = route.params?.stakeAmount || 0;
    const initialBalance = route.params?.initialBalance || 0;
    const playerName = route.params?.playerName || "Player";
    const id = route.params?.id || ""

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(initialBalance - stakeAmount);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [showGameEndModal, setShowGameEndModal] = useState(false);
    const [winnings, setWinnings] = useState(0);

    // Lifelines
    const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
    const [skipUsed, setSkipUsed] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(null);

    // Modals
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Withdraw form
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');

    const currentQuestion = quizData?.[currentQuestionIndex];
    const totalQuestions = quizData?.length;

    // Calculate prize amounts (20% of stake, increasing by 20% each question)
    const calculatePrizeAmount = (questionIndex) => {
        return Math.round(stakeAmount * 0.2 * (questionIndex + 1));
    };

    const currentPrize = calculatePrizeAmount(currentQuestionIndex);

    // Calculate winnings based on game rules
    const calculateWinnings = (correctAnswers) => {
        if (correctAnswers < 5) {
            return 0; // No prize if less than 5 consecutive correct
        } else if (correctAnswers >= 5 && correctAnswers < 10) {
            return Math.round(stakeAmount * 0.5); // 50% of stake for 5-9 correct
        } else {
            return stakeAmount; // 100% of stake for 10+ correct (loses accumulated winnings)
        }
    };

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && !selectedAnswer && !showTimeUpModal && !gameEnded) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !selectedAnswer && !showTimeUpModal && !gameEnded) {
            // Time's up - end game
            handleGameEnd(false);
        }
    }, [timeLeft, selectedAnswer, showTimeUpModal, gameEnded]);

    const handleAnswerSelect = (answer) => {
        if (selectedAnswer || gameEnded) return; // Prevent multiple selections

        setSelectedAnswer(answer);
        setShowCorrectAnswer(true);

        // Check if answer is correct
        if (answer === currentQuestion.correctAnswer) {
            setConsecutiveCorrect(consecutiveCorrect + 1);
            // Update balance with prize money (this is just for display during game)
            setCurrentBalance(currentBalance + currentPrize);

            // Auto advance to next question after 2 seconds
            setTimeout(() => {
                moveToNextQuestion();
            }, 2000);
        } else {
            // Wrong answer - end game
            setTimeout(() => {
                handleGameEnd(false);
            }, 2000);
        }
    };

    const handleGameEnd = (isCorrect) => {
        setGameEnded(true);
        const finalCorrectAnswers = isCorrect ? consecutiveCorrect + 1 : consecutiveCorrect;
        const finalWinnings = calculateWinnings(finalCorrectAnswers);
        setWinnings(finalWinnings);

        // Show time up modal first if time ran out
        if (timeLeft === 0 && !selectedAnswer) {
            setShowTimeUpModal(true);
            setShowCorrectAnswer(true);
            setTimeout(() => {
                setShowTimeUpModal(false);
                setShowGameEndModal(true);
            }, 3000);
        } else {
            // Show game end modal after showing correct answer
            setTimeout(() => {
                setShowGameEndModal(true);
            }, 1000);
        }
    };

    const moveToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1 && !gameEnded) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowCorrectAnswer(false);
            setTimeLeft(30);
            setShowTimeUpModal(false);
            setFilteredOptions(null); // Reset filtered options for new question
        } else if (!gameEnded) {
            // Quiz completed successfully
            handleGameEnd(true);
        }
    };

    const handleTimeUpContinue = () => {
        setShowTimeUpModal(false);
        // This will be handled by the game end logic
    };

    const handleFiftyFifty = () => {
        if (fiftyFiftyUsed || !currentQuestion || selectedAnswer !== null || gameEnded) return;

        setFiftyFiftyUsed(true);
        const correctAnswer = currentQuestion.correctAnswer;
        const incorrectOptions = currentQuestion.options.filter(option => option !== correctAnswer);

        // Randomly remove 2 incorrect answers, keep 1 incorrect + 1 correct
        const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random());
        const remainingIncorrect = shuffledIncorrect.slice(0, 1);

        const filteredOpts = [correctAnswer, ...remainingIncorrect].sort(() => 0.5 - Math.random());
        setFilteredOptions(filteredOpts);
    };

    const handleSkip = () => {
        if (skipUsed || gameEnded) return;

        setSkipUsed(true);
        moveToNextQuestion();
    };

    const handleCashout = () => {
        if (consecutiveCorrect < 5 || gameEnded) {
            Alert.alert("Cannot Cashout", "You need to answer at least 5 consecutive questions correctly to cashout.");
            return;
        }

        const cashoutAmount = Math.round(stakeAmount * 0.5);

        Alert.alert(
            'Cashout Confirmation',
            `You will receive 50% of your stake amount: ₦${cashoutAmount}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cashout',
                    onPress: () => {
                        setCurrentBalance(currentBalance + cashoutAmount);
                        setGameEnded(true);
                        Alert.alert('Success!', `₦${cashoutAmount} has been added to your balance!`, [
                            { text: 'OK', onPress: () => navigation.navigate('MainGame') }
                        ]);
                    }
                }
            ]
        );
    };

    const handleTopUp = () => {
        setShowBalanceModal(false);
        // Navigate to payment platform
        Alert.alert('Top-up', 'Redirecting to payment platform...');
    };

    const handleWithdrawSubmit = () => {
        if (!accountNumber.trim() || !bankName.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        Alert.alert(
            'Withdrawal Request',
            `Withdrawing ₦${currentBalance} to:\nAccount: ${accountNumber}\nBank: ${bankName}\nName: ${playerName}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        setShowWithdrawModal(false);
                        setShowBalanceModal(false);
                        Alert.alert('Success!', 'Withdrawal request submitted successfully!', [
                            { text: 'OK', onPress: () => navigation.navigate('Landing') }
                        ]);
                    }
                }
            ]
        );
    };

    const handleGameEndContinue = () => {
        setShowGameEndModal(false);
        // Add winnings to balance
        if (winnings > 0) {
            setCurrentBalance(currentBalance + winnings);
        }
        navigation.navigate('Landing');
    };

    const getOptionStyle = (option) => {
        if (!showCorrectAnswer) {
            return selectedAnswer === option ? styles.selectedOption : styles.option;
        }

        if (option === currentQuestion.correctAnswer) {
            return styles.correctOption;
        }

        if (selectedAnswer === option && option !== currentQuestion.correctAnswer) {
            return styles.wrongOption;
        }

        return styles.option;
    };

    const getOptionTextStyle = (option) => {
        if (option === currentQuestion.correctAnswer && showCorrectAnswer) {
            return [styles.optionText, { color: '#fff' }];
        }
        if (selectedAnswer === option && option !== currentQuestion.correctAnswer && showCorrectAnswer) {
            return [styles.optionText, { color: '#fff' }];
        }
        return styles.optionText;
    };

    const getTimerColor = () => {
        if (timeLeft <= 5) return '#f44336';
        if (timeLeft <= 10) return '#ff9800';
        return '#7c3aed';
    };

    const getTimerBackgroundColor = () => {
        if (timeLeft <= 5) return '#ffebee';
        if (timeLeft <= 10) return '#fff3e0';
        return '#f3f0ff';
    };

    // Get options to display (filtered by 50/50 or all)
    const displayOptions = filteredOptions || currentQuestion?.options || [];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Live Quiz</Text>
                <TouchableOpacity
                    style={styles.balanceContainer}
                    onPress={() => setShowBalanceModal(true)}
                >
                    <View style={styles.diamondIcon}>
                        <Text style={styles.diamondText}>💰</Text>
                    </View>
                    <Text style={styles.balanceText}>₦{currentBalance}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Prize Display */}
                <View style={styles.prizeContainer}>
                    <Text style={styles.prizeLabel}>Prize for this question:</Text>
                    <Text style={styles.prizeAmount}>₦{currentPrize}</Text>
                    <Text style={styles.consecutiveText}>
                        Consecutive Correct: {consecutiveCorrect}
                    </Text>
                    <Text style={styles.gameRulesText}>
                        {consecutiveCorrect < 5
                            ? "Need 5 consecutive correct answers to win prizes"
                            : consecutiveCorrect < 10
                                ? "✅ Eligible for 50% stake if you fail now"
                                : "🎯 Eligible for 100% stake if you fail now"
                        }
                    </Text>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        {currentQuestionIndex + 1}/{totalQuestions}
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* Lifelines */}
                <View style={styles.lifelinesContainer}>
                    <TouchableOpacity
                        style={[styles.lifelineButton, (fiftyFiftyUsed || gameEnded) && styles.lifelineDisabled]}
                        onPress={handleFiftyFifty}
                        disabled={fiftyFiftyUsed || selectedAnswer !== null || gameEnded}
                    >
                        <Text style={[styles.lifelineText, (fiftyFiftyUsed || gameEnded) && styles.lifelineDisabledText]}>
                            50/50 {fiftyFiftyUsed && '✗'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.lifelineButton, (skipUsed || gameEnded) && styles.lifelineDisabled]}
                        onPress={handleSkip}
                        disabled={skipUsed || selectedAnswer !== null || gameEnded}
                    >
                        <Text style={[styles.lifelineText, (skipUsed || gameEnded) && styles.lifelineDisabledText]}>
                            Skip {skipUsed && '✗'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cashoutButton, (consecutiveCorrect < 5 || gameEnded) && styles.cashoutDisabled]}
                        onPress={handleCashout}
                        disabled={consecutiveCorrect < 5 || gameEnded}
                    >
                        <Text style={[styles.cashoutText, (consecutiveCorrect < 5 || gameEnded) && styles.cashoutDisabledText]}>
                            Cashout
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Question Card */}
                <View style={styles.questionCard}>
                    <Text style={styles.questionText}>
                        {currentQuestion?.text}
                    </Text>
                    {currentQuestion?.category && (
                        <Text style={styles.categoryText}>
                            {currentQuestion.category} • {currentQuestion.difficulty}
                        </Text>
                    )}
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {displayOptions.map((option, index) => {
                        const originalIndex = currentQuestion?.options?.indexOf(option) || index;
                        return (
                            <TouchableOpacity
                                key={`${option}-${originalIndex}`}
                                style={getOptionStyle(option)}
                                onPress={() => handleAnswerSelect(option)}
                                disabled={selectedAnswer !== null || showTimeUpModal || gameEnded}
                            >
                                <Text style={getOptionTextStyle(option)}>
                                    {String.fromCharCode(65 + originalIndex)}: {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Timer */}
                <View style={styles.timerContainer}>
                    <View style={[
                        styles.timerCircle,
                        {
                            borderColor: getTimerColor(),
                            backgroundColor: getTimerBackgroundColor()
                        }
                    ]}>
                        <Text style={[styles.timerText, { color: getTimerColor() }]}>
                            {timeLeft}
                        </Text>
                    </View>
                    <Text style={styles.timerLabel}>seconds left</Text>
                </View>
            </ScrollView>

            {/* Time Up Modal */}
            <Modal
                visible={showTimeUpModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.timeUpModal}>
                        <View style={styles.timeUpIcon}>
                            <Ionicons name="time-outline" size={48} color="#f44336" />
                        </View>
                        <Text style={styles.timeUpTitle}>Time's Up! ⏰</Text>
                        <Text style={styles.timeUpMessage}>
                            You ran out of time for this question.
                        </Text>
                        <View style={styles.correctAnswerContainer}>
                            <Text style={styles.correctAnswerLabel}>The correct answer was:</Text>
                            <Text style={styles.correctAnswerText}>
                                {currentQuestion?.correctAnswer}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleTimeUpContinue}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Game End Modal */}
            <Modal
                visible={showGameEndModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.gameEndModal}>
                        <View style={styles.gameEndIcon}>
                            <Ionicons
                                name={winnings > 0 ? "trophy-outline" : "close-circle-outline"}
                                size={48}
                                color={winnings > 0 ? "#4caf50" : "#f44336"}
                            />
                        </View>
                        <Text style={styles.gameEndTitle}>
                            {winnings > 0 ? "Congratulations! 🎉" : "Game Over"}
                        </Text>
                        <Text style={styles.gameEndMessage}>
                            You answered {consecutiveCorrect} questions correctly.
                        </Text>
                        <View style={styles.winningsContainer}>
                            <Text style={styles.winningsLabel}>Your Winnings:</Text>
                            <Text style={[styles.winningsAmount, { color: winnings > 0 ? "#4caf50" : "#f44336" }]}>
                                ₦{winnings}
                            </Text>
                            {winnings === 0 && (
                                <Text style={styles.noWinningsText}>
                                    You need at least 5 consecutive correct answers to win prizes.
                                </Text>
                            )}
                            {winnings > 0 && consecutiveCorrect >= 10 && (
                                <Text style={styles.bonusText}>
                                    You earned the maximum stake amount! All accumulated winnings are forfeited as per game rules.
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleGameEndContinue}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Balance Modal */}
            <Modal
                visible={showBalanceModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.balanceModal}>
                        <Text style={styles.balanceModalTitle}>Balance: ₦{currentBalance}</Text>

                        <TouchableOpacity
                            style={styles.balanceActionButton}
                            onPress={handleTopUp}
                        >
                            <Text style={styles.balanceActionText}>Top-up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.balanceActionButton}
                            onPress={() => setShowWithdrawModal(true)}
                        >
                            <Text style={styles.balanceActionText}>Withdraw</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowBalanceModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                visible={showWithdrawModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.withdrawModal}>
                        <Text style={styles.withdrawTitle}>Withdraw Funds</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Account Name</Text>
                            <Text style={styles.accountNameDisplay}>{playerName}</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Account Number</Text>
                            <TextInput
                                style={styles.textInput}
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                placeholder="Enter account number"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Bank Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={bankName}
                                onChangeText={setBankName}
                                placeholder="Enter bank name"
                            />
                        </View>

                        <View style={styles.withdrawButtonContainer}>
                            <TouchableOpacity
                                style={styles.submitWithdrawButton}
                                onPress={handleWithdrawSubmit}
                            >
                                <Text style={styles.submitWithdrawText}>Withdraw ₦{currentBalance}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowWithdrawModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    diamondIcon: {
        marginRight: 6,
    },
    diamondText: {
        fontSize: 14,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2e7d32',
    },
    prizeContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    prizeLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    prizeAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4caf50',
        marginBottom: 8,
    },
    consecutiveText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    gameRulesText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    lifelinesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    lifelineButton: {
        backgroundColor: '#2196f3',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 70,
    },
    lifelineDisabled: {
        backgroundColor: '#ccc',
    },
    lifelineText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    lifelineDisabledText: {
        color: '#999',
    },
    cashoutButton: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cashoutDisabled: {
        backgroundColor: '#ccc',
    },
    cashoutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    cashoutDisabledText: {
        color: '#999',
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#7c3aed',
        borderRadius: 4,
    },
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        minHeight: 120,
        justifyContent: 'center',
    },
    questionText: {
        fontSize: 18,
        lineHeight: 26,
        color: '#333',
        textAlign: 'center',
        fontWeight: '400',
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    optionsContainer: {
        marginBottom: 40,
    },
    option: {
        backgroundColor: '#ffa726',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedOption: {
        backgroundColor: '#ff9800',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    correctOption: {
        backgroundColor: '#4caf50',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    wrongOption: {
        backgroundColor: '#f44336',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    timerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 8,
    },
    timerText: {
        fontSize: 24,
        fontWeight: '600',
    },
    timerLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    timeUpModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        maxWidth: 350,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    timeUpIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    timeUpTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    timeUpMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    correctAnswerContainer: {
        backgroundColor: '#f0f9ff',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0f2fe',
    },
    correctAnswerLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    correctAnswerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0369a1',
        textAlign: 'center',
    },
    gameEndModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        maxWidth: 350,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    gameEndIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    gameEndTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    gameEndMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    winningsContainer: {
        backgroundColor: '#f8fffe',
        padding: 20,
        borderRadius: 12,
        width: '100%',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0f2f1',
        alignItems: 'center',
    },
    winningsLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    winningsAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    noWinningsText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 8,
    },
    bonusText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 8,
        lineHeight: 18,
    },
    continueButton: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
        width: '100%',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    balanceModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        maxWidth: 350,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    balanceModalTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    balanceActionButton: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        width: '100%',
        marginBottom: 15,
    },
    balanceActionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#ccc',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        width: '100%',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    withdrawModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    withdrawTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    accountNameDisplay: {
        fontSize: 16,
        color: '#666',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    withdrawButtonContainer: {
        marginTop: 20,
    },
    submitWithdrawButton: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        width: '100%',
        marginBottom: 15,
    },
    submitWithdrawText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        width: '100%',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default MainGameScreen;