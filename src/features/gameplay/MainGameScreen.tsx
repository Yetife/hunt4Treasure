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
import {registerUser, userCashOut} from "@/services/authService";

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
    const [currentBalance, setCurrentBalance] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [showGameEndModal, setShowGameEndModal] = useState(false);
    const [winnings, setWinnings] = useState(0);

    // Lives system - players get 2 lives before question 5
    const [livesRemaining, setLivesRemaining] = useState(2);
    const [showLifeLostModal, setShowLifeLostModal] = useState(false);

    // Game info modal
    const [showGameInfoModal, setShowGameInfoModal] = useState(true);

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

    const calculateAccumulatedWinnings = (consecutiveCount) => {
        if (consecutiveCount < 5) {
            return 0; // No winnings until 5 consecutive
        } else if (consecutiveCount === 5) {
            return Math.round(stakeAmount * 0.5); // 50% of stake for 5 correct
        } else if (consecutiveCount > 6 && consecutiveCount < 10) {
            // Accumulated winnings: 50% base + additional 20% per question beyond 5
            // const baseAmount = Math.round(stakeAmount * 0.5);
            // const additionalAmount = Math.round(stakeAmount * 0.2 * (consecutiveCount - 5));
            // return baseAmount + additionalAmount;
            return currentBalance
        } else {
            // 10+ consecutive: accumulated winnings continue to grow
            const baseAmount = Math.round(stakeAmount * 0.5); // 50% for first 5
            const midTierAmount = Math.round(stakeAmount * 0.2 * 4); // 80% for questions 6-9
            const highTierAmount = Math.round(stakeAmount * 0.3 * (consecutiveCount - 9)); // 30% per question after 10
            return baseAmount + midTierAmount + highTierAmount;
        }
    };

// Calculate what player gets if they fail (different from cashout)
    const calculateFailureWinnings = (consecutiveCount) => {
        if (consecutiveCount < 5) {
            return 0; // No prize if less than 5 consecutive correct
        } else if (consecutiveCount >= 5 && consecutiveCount < 10) {
            return Math.round(stakeAmount * 0.5); // 50% of stake for 5-9 correct
        } else {
            // 10+ correct but failed: only get 100% of stake (lose accumulated winnings)
            return stakeAmount; // 100% of stake for 10+ correct (penalty for not cashing out)
        }
    };

// Get current cashout amount (what they can take right now)
    const getCurrentCashoutAmount = (consecutiveCount) => {
        if (consecutiveCount < 5) {
            return 0; // Cannot cashout
        } else if (consecutiveCount === 5) {
            return Math.round(stakeAmount * 0.5); // 50% of stake
        } else {
            return calculateAccumulatedWinnings(consecutiveCount); // Full accumulated amount
        }
    };

// Updated handleCashout function
    const handleCashout = async () => {
        if (consecutiveCorrect < 5 || gameEnded) {
            Alert.alert("Cannot Cashout", "You need to answer at least 5 consecutive questions correctly to cashout.");
            return;
        }

        const cashoutAmount = getCurrentCashoutAmount(consecutiveCorrect);
        let cashoutMessage = '';

        if (consecutiveCorrect === 5) {
            cashoutMessage = `You will receive 50% of your stake amount: ₦${cashoutAmount}`;
        } else if (consecutiveCorrect < 10) {
            cashoutMessage = `You will receive your accumulated winnings: ₦${cashoutAmount}\n(Base 50% + bonuses for ${consecutiveCorrect - 5} extra correct answers)`;
        } else {
            cashoutMessage = `You will receive your accumulated winnings: ₦${cashoutAmount}\nWarning: If you continue and fail, you'll only get ₦${stakeAmount} (100% stake)`;
        }

        const payload = {
            sessionId: id,
            fiftyfifty: fiftyFiftyUsed,
            skipped: skipUsed,
            numberOfAnsweredQuestions: consecutiveCorrect,
            cashoutAmount: cashoutAmount
        }

        Alert.alert(
            'Cashout Confirmation',
            cashoutMessage,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cashout',
                    onPress: () => {
                        setCurrentBalance(currentBalance + cashoutAmount);
                        setGameEnded(true);
                        Alert.alert('Success!', `₦${cashoutAmount} has been added to your balance!`, [
                            { text: 'OK', onPress: async () => {
                                    try{
                                        const result = await userCashOut(payload);
                                        if(result.status === true){
                                            navigation.navigate('Landing')
                                        }
                                    }catch(err){
                                        console.error(err);
                                        alert('Unable to cashout. Try again.');
                                    }
                                } }
                        ]);
                    }
                }
            ]
        );

    };

    const calculateWinnings = (correctAnswers) => {
        return calculateFailureWinnings(correctAnswers);
    };

// Update the prize display text to show accumulated winnings
    const getPrizeDisplayText = () => {
        if (consecutiveCorrect < 5) {
            return "Need 5 consecutive correct answers to win prizes";
        } else if (consecutiveCorrect === 5) {
            return "✅ Eligible for 50% stake cashout";
        } else if (consecutiveCorrect < 10) {
            const accumulatedAmount = calculateAccumulatedWinnings(consecutiveCorrect);
            return `💰 Accumulated winnings: ₦${accumulatedAmount} (Can cashout anytime)`;
        } else {
            const accumulatedAmount = calculateAccumulatedWinnings(consecutiveCorrect);
            return `🎯 High risk zone! Accumulated: ₦${accumulatedAmount}\n⚠️ Failure = only ₦${stakeAmount} (100% stake)`;
        }
    };

    // Calculate prize amounts (20% of stake, increasing by 20% each question)
    const calculatePrizeAmount = (consecutiveCount) => {
        // Prize is based on consecutive correct answers, not question index
        // Only award meaningful prize if they have consecutive correct answers
        if (consecutiveCount === 0) {
            return Math.round(stakeAmount * 0.2); // Small base prize for first question
        }
        return Math.round(stakeAmount * 0.2 * consecutiveCount);
    };

    const currentPrize = calculatePrizeAmount(consecutiveCorrect + 1); // +1 for potential current answer


    // Calculate winnings based on game rules
    // const calculateWinnings = (correctAnswers) => {
    //     if (correctAnswers < 5) {
    //         return 0; // No prize if less than 5 consecutive correct
    //     } else if (correctAnswers >= 5 && correctAnswers < 10) {
    //         return Math.round(stakeAmount * 0.5); // 50% of stake for 5-9 correct
    //     } else {
    //         return stakeAmount; // 100% of stake for 10+ correct (loses accumulated winnings)
    //     }
    // };

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && !selectedAnswer && !showTimeUpModal && !gameEnded && !showGameInfoModal) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !selectedAnswer && !showTimeUpModal && !gameEnded && !showGameInfoModal) {
            // Time's up - handle based on lives system
            handleWrongAnswer(false);
        }
    }, [timeLeft, selectedAnswer, showTimeUpModal, gameEnded, showGameInfoModal]);

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
            // Wrong answer - handle based on lives system
            setTimeout(() => {
                handleWrongAnswer(true);
            }, 2000);
        }
    };

    const handleWrongAnswer = (answerSelected) => {
        const isBeforeQuestion5 = currentQuestionIndex < 4; // Questions 0-3 are before question 5

        if (isBeforeQuestion5 && livesRemaining > 1) {
            // Player has lives remaining, show life lost modal
            setLivesRemaining(livesRemaining - 1);

            // CRUCIAL: Reset consecutive correct count when wrong answer
            setConsecutiveCorrect(0);

            if (!answerSelected) {
                // Time ran out
                setShowTimeUpModal(true);
                setShowCorrectAnswer(true);
                setTimeout(() => {
                    setShowTimeUpModal(false);
                    setShowLifeLostModal(true);
                }, 3000);
            } else {
                // Wrong answer selected
                setShowLifeLostModal(true);
            }
        } else {
            // Game over - either no lives left or after question 5
            // Also reset consecutive count for game over
            setConsecutiveCorrect(0);
            handleGameEnd(false);
        }
    };

    const handleLifeLostContinue = () => {
        setShowLifeLostModal(false);
        // Move to next question
        moveToNextQuestion();
    };

    const handleGameEnd = (isCorrect) => {
        setGameEnded(true);
        const finalCorrectAnswers = isCorrect ? consecutiveCorrect + 1 : consecutiveCorrect;
        const finalWinnings = calculateWinnings(finalCorrectAnswers);
        setWinnings(finalWinnings);

        // Reset consecutive count when game ends
        if (!isCorrect) {
            setConsecutiveCorrect(0);
        }

        // Show time up modal first if time ran out and no lives left
        if (timeLeft === 0 && !selectedAnswer && (currentQuestionIndex >= 4 || livesRemaining <= 1)) {
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
        // This will be handled by the game end logic or life lost logic
    };

    const handleGameInfoOkay = () => {
        setShowGameInfoModal(false);
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

    // const handleCashout = () => {
    //     if (consecutiveCorrect < 5 || gameEnded) {
    //         Alert.alert("Cannot Cashout", "You need to answer at least 5 consecutive questions correctly to cashout.");
    //         return;
    //     }
    //
    //     const cashoutAmount = Math.round(stakeAmount * 0.5);
    //
    //     Alert.alert(
    //         'Cashout Confirmation',
    //         `You will receive 50% of your stake amount: ₦${cashoutAmount}`,
    //         [
    //             { text: 'Cancel', style: 'cancel' },
    //             {
    //                 text: 'Cashout',
    //                 onPress: () => {
    //                     setCurrentBalance(currentBalance + cashoutAmount);
    //                     setGameEnded(true);
    //                     Alert.alert('Success!', `₦${cashoutAmount} has been added to your balance!`, [
    //                         { text: 'OK', onPress: () => navigation.navigate('Landing') }
    //                     ]);
    //                 }
    //             }
    //         ]
    //     );
    // };

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
                {/* Lives Display (only show before question 5) */}
                {currentQuestionIndex < 4 && (
                    <View style={styles.livesContainer}>
                        <Text style={styles.livesLabel}>Lives Remaining:</Text>
                        <View style={styles.livesDisplay}>
                            {[...Array(2)].map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.lifeHeart,
                                        index < livesRemaining ? styles.lifeHeartActive : styles.lifeHeartInactive
                                    ]}
                                >
                                    <Text style={[
                                        styles.lifeHeartText,
                                        index < livesRemaining ? styles.lifeHeartTextActive : styles.lifeHeartTextInactive
                                    ]}>
                                        ❤️
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Prize Display */}
                {/*<View style={styles.prizeContainer}>*/}
                {/*    <Text style={styles.prizeLabel}>Prize for this question:</Text>*/}
                {/*    <Text style={styles.prizeAmount}>₦{currentPrize}</Text>*/}
                {/*    <Text style={styles.consecutiveText}>*/}
                {/*        Consecutive Correct: {consecutiveCorrect}*/}
                {/*    </Text>*/}
                {/*    <Text style={styles.gameRulesText}>*/}
                {/*        {consecutiveCorrect < 5*/}
                {/*            ? "Need 5 consecutive correct answers to win prizes"*/}
                {/*            : consecutiveCorrect < 10*/}
                {/*                ? "✅ Eligible for 50% stake if you fail now"*/}
                {/*                : "🎯 Eligible for 100% stake if you fail now"*/}
                {/*        }*/}
                {/*    </Text>*/}
                {/*</View>*/}
                {/* Prize Display */}
                <View style={styles.prizeContainer}>
                    <Text style={styles.prizeLabel}>Prize for this question:</Text>
                    <Text style={styles.prizeAmount}>₦{currentPrize}</Text>
                    <Text style={styles.consecutiveText}>
                        Consecutive Correct: {consecutiveCorrect}
                    </Text>

                    {/* Current Status */}
                    <Text style={styles.gameRulesText}>
                        {getPrizeDisplayText()}
                    </Text>

                    {/* Show accumulated winnings if applicable */}
                    {consecutiveCorrect >= 5 && (
                        <View style={styles.accumulatedContainer}>
                            <Text style={styles.accumulatedLabel}>
                                {consecutiveCorrect === 5 ? "Cashout Available:" : "Accumulated Winnings:"}
                            </Text>
                            <Text style={styles.accumulatedAmount}>
                                ₦{getCurrentCashoutAmount(consecutiveCorrect)}
                            </Text>
                        </View>
                    )}

                    {/* Risk warning for 10+ streak */}
                    {consecutiveCorrect >= 10 && (
                        <Text style={styles.riskWarningText}>
                            ⚠️ RISK: Fail now = lose accumulated winnings!
                        </Text>
                    )}

                    {consecutiveCorrect === 0 && currentQuestionIndex > 0 && (
                        <Text style={styles.resetWarningText}>
                            ⚠️ Prize resets after wrong answers
                        </Text>
                    )}
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
                {/*<View style={styles.lifelinesContainer}>*/}
                {/*    <TouchableOpacity*/}
                {/*        style={[styles.lifelineButton, (fiftyFiftyUsed || gameEnded) && styles.lifelineDisabled]}*/}
                {/*        onPress={handleFiftyFifty}*/}
                {/*        disabled={fiftyFiftyUsed || selectedAnswer !== null || gameEnded}*/}
                {/*    >*/}
                {/*        <Text style={[styles.lifelineText, (fiftyFiftyUsed || gameEnded) && styles.lifelineDisabledText]}>*/}
                {/*            50/50 {fiftyFiftyUsed && '✗'}*/}
                {/*        </Text>*/}
                {/*    </TouchableOpacity>*/}

                {/*    <TouchableOpacity*/}
                {/*        style={[styles.lifelineButton, (skipUsed || gameEnded) && styles.lifelineDisabled]}*/}
                {/*        onPress={handleSkip}*/}
                {/*        disabled={skipUsed || selectedAnswer !== null || gameEnded}*/}
                {/*    >*/}
                {/*        <Text style={[styles.lifelineText, (skipUsed || gameEnded) && styles.lifelineDisabledText]}>*/}
                {/*            Skip {skipUsed && '✗'}*/}
                {/*        </Text>*/}
                {/*    </TouchableOpacity>*/}

                {/*    <TouchableOpacity*/}
                {/*        style={[styles.cashoutButton, (consecutiveCorrect < 5 || gameEnded) && styles.cashoutDisabled]}*/}
                {/*        onPress={handleCashout}*/}
                {/*        disabled={consecutiveCorrect < 5 || gameEnded}*/}
                {/*    >*/}
                {/*        <Text style={[styles.cashoutText, (consecutiveCorrect < 5 || gameEnded) && styles.cashoutDisabledText]}>*/}
                {/*            Cashout*/}
                {/*        </Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}

                {/* Updated Lifelines section with better cashout button text */}
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
                            {consecutiveCorrect < 5
                                ? "Cashout"
                                : `Cashout ₦${getCurrentCashoutAmount(consecutiveCorrect)}`
                            }
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

            {/* Game Info Modal */}
            <Modal
                visible={showGameInfoModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.gameInfoModal}>
                        <View style={styles.gameInfoIcon}>
                            <Ionicons name="information-circle-outline" size={48} color="#7c3aed" />
                        </View>
                        <Text style={styles.gameInfoTitle}>Game Information 📚</Text>

                        <ScrollView style={styles.gameInfoContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.gameInfoSection}>
                                <Text style={styles.gameInfoSectionTitle}>🎯 Game Rules</Text>
                                <Text style={styles.gameInfoText}>
                                    • Answer questions correctly to win prizes{'\n'}
                                    • Need 5+ consecutive correct answers to win{'\n'}
                                    • 1-5 correct questions: gives 50% of stake amount as lifeline{'\n'}
                                    • 10+ correct questions: 100% of stake amount as lifeline
                                </Text>
                            </View>

                            <View style={styles.gameInfoSection}>
                                <Text style={styles.gameInfoSectionTitle}>❤️ Lives System</Text>
                                <Text style={styles.gameInfoText}>
                                    • You get 2 lives for questions 1-4{'\n'}
                                    • After question 5, wrong answers end the game{'\n'}
                                    • Lives don't carry over after question 4
                                </Text>
                            </View>

                            <View style={styles.gameInfoSection}>
                                <Text style={styles.gameInfoSectionTitle}>🆘 Lifelines</Text>
                                <Text style={styles.gameInfoText}>
                                    • 50/50: Removes 2 wrong answers{'\n'}
                                    • Skip: Skip current question{'\n'}
                                    • Cashout: Take 50% stake after 5 correct
                                </Text>
                            </View>

                            <View style={styles.gameInfoSection}>
                                <Text style={styles.gameInfoSectionTitle}>⏰ Timer</Text>
                                <Text style={styles.gameInfoText}>
                                    • 30 seconds per question{'\n'}
                                    • Time up counts as wrong answer
                                </Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.gameInfoOkayButton}
                            onPress={handleGameInfoOkay}
                        >
                            <Text style={styles.gameInfoOkayText}>Got it! Let's Play 🎮</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Life Lost Modal */}
            <Modal
                visible={showLifeLostModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.lifeLostModal}>
                        <View style={styles.lifeLostIcon}>
                            <Text style={styles.lifeLostEmoji}>💔</Text>
                        </View>
                        <Text style={styles.lifeLostTitle}>Life Lost!</Text>
                        <Text style={styles.lifeLostMessage}>
                            {timeLeft === 0 ? "Time ran out!" : "Wrong answer!"} You have {livesRemaining} {livesRemaining === 1 ? 'life' : 'lives'} remaining.
                        </Text>
                        <View style={styles.correctAnswerContainer}>
                            <Text style={styles.correctAnswerLabel}>The correct answer was:</Text>
                            <Text style={styles.correctAnswerText}>
                                {currentQuestion?.correctAnswer}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleLifeLostContinue}
                        >
                            <Text style={styles.continueButtonText}>Continue ❤️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
            {/*<Modal*/}
            {/*    visible={showGameEndModal}*/}
            {/*    transparent={true}*/}
            {/*    animationType="fade"*/}
            {/*>*/}
            {/*    <View style={styles.modalOverlay}>*/}
            {/*        <View style={styles.gameEndModal}>*/}
            {/*            <View style={styles.gameEndIcon}>*/}
            {/*                <Ionicons*/}
            {/*                    name={winnings > 0 ? "trophy-outline" : "close-circle-outline"}*/}
            {/*                    size={48}*/}
            {/*                    color={winnings > 0 ? "#4caf50" : "#f44336"}*/}
            {/*                />*/}
            {/*            </View>*/}
            {/*            <Text style={styles.gameEndTitle}>*/}
            {/*                {winnings > 0 ? "Congratulations! 🎉" : "Game Over"}*/}
            {/*            </Text>*/}
            {/*            <Text style={styles.gameEndMessage}>*/}
            {/*                You answered {consecutiveCorrect} questions correctly.*/}
            {/*            </Text>*/}
            {/*            <View style={styles.winningsContainer}>*/}
            {/*                <Text style={styles.winningsLabel}>Your Winnings:</Text>*/}
            {/*                <Text style={[styles.winningsAmount, { color: winnings > 0 ? "#4caf50" : "#f44336" }]}>*/}
            {/*                    ₦{winnings}*/}
            {/*                </Text>*/}
            {/*                {winnings === 0 && (*/}
            {/*                    <Text style={styles.noWinningsText}>*/}
            {/*                        You need at least 5 consecutive correct answers to win prizes.*/}
            {/*                    </Text>*/}
            {/*                )}*/}
            {/*                {winnings > 0 && consecutiveCorrect >= 10 && (*/}
            {/*                    <Text style={styles.bonusText}>*/}
            {/*                        You earned the maximum stake amount! All accumulated winnings are forfeited as per game rules.*/}
            {/*                    </Text>*/}
            {/*                )}*/}
            {/*            </View>*/}
            {/*            <TouchableOpacity*/}
            {/*                style={styles.continueButton}*/}
            {/*                onPress={handleGameEndContinue}*/}
            {/*            >*/}
            {/*                <Text style={styles.continueButtonText}>Continue</Text>*/}
            {/*            </TouchableOpacity>*/}
            {/*        </View>*/}
            {/*    </View>*/}
            {/*</Modal>*/}

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
                            You answered {consecutiveCorrect} questions correctly in a row.
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
                            {winnings > 0 && consecutiveCorrect >= 5 && consecutiveCorrect < 10 && (
                                <Text style={styles.bonusText}>
                                    You earned 50% of your stake amount!
                                </Text>
                            )}
                            {winnings > 0 && consecutiveCorrect >= 10 && (
                                <Text style={styles.penaltyText}>
                                    You reached 10+ consecutive but didn't cash out your accumulated winnings.
                                    You receive 100% of stake amount as consolation.
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
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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

    // Lives system styles
    livesContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    livesLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    livesDisplay: {
        flexDirection: 'row',
    },
    lifeHeart: {
        marginLeft: 8,
        padding: 4,
    },
    lifeHeartActive: {
        opacity: 1,
    },
    lifeHeartInactive: {
        opacity: 0.3,
    },
    lifeHeartText: {
        fontSize: 20,
    },
    lifeHeartTextActive: {
        color: '#e91e63',
    },
    lifeHeartTextInactive: {
        color: '#999',
    },

    // Prize and progress styles
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

    // Lifelines styles
    lifelinesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    lifelineButton: {
        flex: 1,
        backgroundColor: '#7c3aed',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    lifelineDisabled: {
        backgroundColor: '#ccc',
    },
    lifelineText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    lifelineDisabledText: {
        color: '#999',
    },
    cashoutButton: {
        flex: 1,
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    cashoutDisabled: {
        backgroundColor: '#ccc',
    },
    cashoutText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    cashoutDisabledText: {
        color: '#999',
    },

    // Question styles
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

    // Modal overlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    // Game Info Modal styles
    gameInfoModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: '92%',
    },
    gameInfoIcon: {
        alignItems: 'center',
        marginBottom: 16,
    },
    gameInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    gameInfoContent: {
        maxHeight: 500,
        marginBottom: 20,
    },
    gameInfoSection: {
        marginBottom: 16,
    },
    gameInfoSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7c3aed',
        marginBottom: 8,
    },
    gameInfoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    gameInfoOkayButton: {
        backgroundColor: '#7c3aed',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    gameInfoOkayText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    // Life Lost Modal styles
    lifeLostModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
    },
    lifeLostIcon: {
        marginBottom: 16,
    },
    lifeLostEmoji: {
        fontSize: 48,
    },
    lifeLostTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f44336',
        marginBottom: 12,
        textAlign: 'center',
    },
    lifeLostMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },

    // Time Up Modal styles
    timeUpModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
    },
    timeUpIcon: {
        marginBottom: 16,
    },
    timeUpTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f44336',
        marginBottom: 12,
        textAlign: 'center',
    },
    timeUpMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },

    // Game End Modal styles
    gameEndModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
    },
    gameEndIcon: {
        marginBottom: 16,
    },
    gameEndTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#333',
    },
    gameEndMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },

    // Winnings styles
    winningsContainer: {
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        width: '100%',
    },
    winningsLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    winningsAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    noWinningsText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
    bonusText: {
        fontSize: 12,
        color: '#4caf50',
        textAlign: 'center',
        lineHeight: 16,
        marginTop: 4,
    },

    // Correct Answer Display styles
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

    // Continue Button styles
    continueButton: {
        backgroundColor: '#7c3aed',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: 120,
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    // Balance Modal styles

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
        backgroundColor: '#e0e0e0',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },

    // Withdraw Modal styles
    withdrawModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 350,
    },
    withdrawTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    accountNameDisplay: {
        fontSize: 16,
        color: '#666',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    textInput: {
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    withdrawButtonContainer: {
        marginTop: 8,
    },
    submitWithdrawButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    submitWithdrawText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    accumulatedContainer: {
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4caf50',
    },
    accumulatedLabel: {
        fontSize: 12,
        color: '#2e7d32',
        fontWeight: '600',
        marginBottom: 4,
    },
    accumulatedAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1b5e20',
    },
    riskWarningText: {
        fontSize: 11,
        color: '#f44336',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 6,
        backgroundColor: '#ffebee',
        padding: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#f44336',
    },
    resetWarningText: {
        fontSize: 11,
        color: '#ff9800',
        textAlign: 'center',
        fontWeight: '500',
        marginTop: 4,
        fontStyle: 'italic',
    },
    penaltyText: {
        fontSize: 12,
        color: '#ff9800',
        textAlign: 'center',
        lineHeight: 16,
        marginTop: 4,
        backgroundColor: '#fff3e0',
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ff9800',
    },
});

export default MainGameScreen;