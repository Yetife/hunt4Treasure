import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    question: {
        question: string;
        options: string[];
        correct: string;
    };
    used5050: boolean;
}

const QuestionCard = ({ question, used5050 }: Props) => {
    const filteredOptions = used5050
        ? [question.correct, question.options.find(o => o !== question.correct)!]
        : question.options;

    return (
        <View style={styles.card}>
            <Text style={styles.q}>{question.question}</Text>
            {filteredOptions.map((opt, index) => (
                <TouchableOpacity key={index} style={styles.option}>
                    <Text>{opt}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default QuestionCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12
    },
    q: {
        fontWeight: 'bold',
        marginBottom: 12,
        fontSize: 16
    },
    option: {
        backgroundColor: '#E6F5F3',
        padding: 12,
        borderRadius: 6,
        marginVertical: 4
    }
});
