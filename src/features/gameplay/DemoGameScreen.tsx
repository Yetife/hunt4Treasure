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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/types";

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Demo'>;

const DemoGameScreen = ({navigation, route}: Props) => {
    const quizData = route.params?.quizData || []

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);

    const currentQuestion = quizData?.[currentQuestionIndex];
    const totalQuestions = quizData?.length;

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && !selectedAnswer && !showTimeUpModal) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !selectedAnswer && !showTimeUpModal) {
            // Time's up - show modal
            setShowTimeUpModal(true);
            setShowCorrectAnswer(true);
        }
    }, [timeLeft, selectedAnswer, showTimeUpModal]);

    const handleAnswerSelect = (answer) => {
        if (selectedAnswer) return; // Prevent multiple selections

        setSelectedAnswer(answer);
        setShowCorrectAnswer(true);

        // Check if answer is correct and update score
        if (answer === currentQuestion.correctAnswer) {
            setScore(score + 100);
        }

        // Auto advance to next question after 2 seconds
        setTimeout(() => {
            moveToNextQuestion();
        }, 2000);
    };

    const moveToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowCorrectAnswer(false);
            setTimeLeft(30);
            setShowTimeUpModal(false);
        } else {
            // Quiz completed
            setIsQuizCompleted(true);
            showQuizCompletedAlert();
        }
    };

    const handleTimeUpContinue = () => {
        setShowTimeUpModal(false);
        // Wait a moment to show the correct answer, then move to next question
        setTimeout(() => {
            moveToNextQuestion();
        }, 1000);
    };

    const showQuizCompletedAlert = () => {
        const percentage = Math.round((score / (totalQuestions * 100)) * 100);
        let message = `You scored ${score} points out of ${totalQuestions * 100} possible points (${percentage}%)`;

        if (percentage >= 80) {
            message += "\n🎉 Excellent work!";
        } else if (percentage >= 60) {
            message += "\n👍 Good job!";
        } else if (percentage >= 40) {
            message += "\n💪 Keep practicing!";
        } else {
            message += "\n📚 Don't give up, try again!";
        }

        Alert.alert(
            'Quiz Completed! 🎊',
            message,
            [
                {
                    text: 'Play Again',
                    onPress: () => {
                        // Reset quiz state
                        setCurrentQuestionIndex(0);
                        setSelectedAnswer(null);
                        setScore(0);
                        setTimeLeft(30);
                        setShowCorrectAnswer(false);
                        setIsQuizCompleted(false);
                    }
                },
                {
                    text: 'Back to Home',
                    onPress: () => navigation.navigate('Landing')
                }
            ]
        );
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

    // Get timer color based on time left
    const getTimerColor = () => {
        if (timeLeft <= 5) return '#f44336'; // Red
        if (timeLeft <= 10) return '#ff9800'; // Orange
        return '#7c3aed'; // Purple
    };

    const getTimerBackgroundColor = () => {
        if (timeLeft <= 5) return '#ffebee'; // Light red
        if (timeLeft <= 10) return '#fff3e0'; // Light orange
        return '#f3f0ff'; // Light purple
    };

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
                <Text style={styles.headerTitle}>Quiz</Text>
                <View style={styles.scoreContainer}>
                    <View style={styles.diamondIcon}>
                        <Text style={styles.diamondText}>💎</Text>
                    </View>
                    <Text style={styles.scoreText}>₦{score}</Text>
                </View>
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
                {currentQuestion?.options?.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={getOptionStyle(option)}
                        onPress={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null || showTimeUpModal}
                    >
                        <Text style={getOptionTextStyle(option)}>
                            {String.fromCharCode(65 + index)}: {option}
                        </Text>
                    </TouchableOpacity>
                ))}
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
        marginRight: 40, // Balance the back button
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8e3ff',
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
    scoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7c3aed',
    },
    progressContainer: {
        marginBottom: 30,
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        marginTop: 'auto',
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 4,
        },
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
});

export default DemoGameScreen;