import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuestionCard from "@/components/QuestionCard";
import LifelineButtons from "@/components/LifelineButtons";
import WinningsLadder from "@/components/WinningsLadder";

const GameScreen = () => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [wagerAmount, setWagerAmount] = useState(100); // example amount
    const [used5050, setUsed5050] = useState(false);
    const [usedSkip, setUsedSkip] = useState(false);
    const [cashoutEnabled, setCashoutEnabled] = useState(false);

    const questions = [
        {
            id: 1,
            question: 'What is the capital of Nigeria?',
            correct: 'Abuja',
            options: ['Lagos', 'Abuja', 'Kano', 'Jos']
        },
        // Add more questions
    ];

    const currentQuestion = questions[questionIndex];

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.balance}>Balance: ₦500</Text>
                <Text style={styles.timer}>⏱️ 30s</Text>
            </View>

            <QuestionCard
                question={currentQuestion}
                used5050={used5050}
            />

            <LifelineButtons
                used5050={used5050}
                usedSkip={usedSkip}
                on5050={() => setUsed5050(true)}
                onSkip={() => {
                    setUsedSkip(true);
                    setQuestionIndex(prev => prev + 1);
                }}
            />

            <WinningsLadder
                currentIndex={questionIndex}
                wager={wagerAmount}
            />
        </View>
    );
};

export default GameScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F4FDFD'
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    balance: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#135D54'
    },
    timer: {
        fontSize: 16,
        color: '#FF6B00'
    }
});
