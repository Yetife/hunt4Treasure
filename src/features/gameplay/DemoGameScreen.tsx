import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/navigation/types";

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Demo'>;

const DemoGameScreen = ({navigation, route}: Props) => {
    // Sample data based on your API structure
    const quizData = route.params?.quizData || []

    // const [quizData] = useState({
    //     status: true,
    //     data: [
    //         {
    //             id: "3dc81c60-8887-4056-b9ba-6e6264853357",
    //             text: "The \"British Invasion\" was a cultural phenomenon in music where British boy bands became popular in the USA in what decade?",
    //             options: ["50's", "40's", "30's", "60's"],
    //             correctAnswer: "60's",
    //             category: "Entertainment: Music",
    //             difficulty: "easy"
    //         },
    //         {
    //             id: "768d157a-f205-45b5-b046-1231e620b3d4",
    //             text: "In the game \"Hearthstone\", what is the best rank possible?",
    //             options: ["Rank 1 Elite", "Rank 1 Master", "Rank 1 Supreme", "Rank 1 Legend"],
    //             correctAnswer: "Rank 1 Legend",
    //             category: "Entertainment: Video Games",
    //             difficulty: "easy"
    //         },
    //         {
    //             id: "d45c52a2-893d-4bf9-9616-1aa20eb4b3fb",
    //             text: "When was the iPhone released?",
    //             options: ["2005", "2006", "2004", "2007"],
    //             correctAnswer: "2007",
    //             category: "Science: Gadgets",
    //             difficulty: "easy"
    //         },
    //         {
    //             id: "a810ad00-62b4-43dc-8723-a86b9359ba75",
    //             text: "In the show \"Futurama\" what is Fry's full name?",
    //             options: ["Fry J. Philip", "Fry Rodríguez", "Fry Philip", "Philip J. Fry"],
    //             correctAnswer: "Philip J. Fry",
    //             category: "Entertainment: Television",
    //             difficulty: "easy"
    //         },
    //         {
    //             id: "ec95e49d-5c08-4be6-9b17-b86656ef58f0",
    //             text: "What is the capital of the US State of New York?",
    //             options: ["Buffalo", "New York", "Rochester", "Albany"],
    //             correctAnswer: "Albany",
    //             category: "Geography",
    //             difficulty: "easy"
    //         }
    //     ],
    //     message: "Record Found Successfully"
    // });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(105);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    const currentQuestion = quizData?.[currentQuestionIndex];
    const totalQuestions = quizData?.length;

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && !selectedAnswer) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, selectedAnswer]);

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
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
                setShowCorrectAnswer(false);
                setTimeLeft(30);
            }else {
                // Quiz completed, navigate back to landing page
                navigation.navigate('Landing'); // Replace 'LandingPage' with your actual landing page route name
                // Or use navigation.goBack() if you want to go back to previous screen
                // navigation.goBack();
            }
        }, 2000);
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quiz</Text>
                <View style={styles.scoreContainer}>
                    <View style={styles.diamondIcon}>
                        <Text style={styles.diamondText}>💎</Text>
                    </View>
                    <Text style={styles.scoreText}>${score}</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {currentQuestionIndex + 1}/{totalQuestions}
                </Text>
            </View>

            {/* Question Card */}
            <View style={styles.questionCard}>
                <Text style={styles.questionText}>
                    {currentQuestion.text}
                </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={getOptionStyle(option)}
                        onPress={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null}
                    >
                        <Text style={getOptionTextStyle(option)}>
                            {String.fromCharCode(65 + index)}: {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
                <View style={styles.timerCircle}>
                    <Text style={styles.timerText}>{timeLeft}</Text>
                </View>
            </View>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
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
    },
    optionsContainer: {
        marginTop: 40,
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
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#7c3aed',
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
    },
    timerText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#7c3aed',
    },
});

export default DemoGameScreen;