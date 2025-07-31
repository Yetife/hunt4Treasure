import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    currentIndex: number;
    wager: number;
}

const WinningsLadder = ({ currentIndex, wager }: Props) => {
    const winnings = Array.from({ length: 15 }, (_, i) => (i + 1) * 0.2 * wager);

    return (
        <View style={styles.container}>
            {winnings.map((amount, i) => (
                <Text key={i} style={[styles.text, i === currentIndex && styles.active]}>
                    Q{i + 1}: ₦{Math.round(amount)}
                </Text>
            ))}
        </View>
    );
};

export default WinningsLadder;

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8
    },
    text: {
        fontSize: 13,
        color: '#333'
    },
    active: {
        fontWeight: 'bold',
        color: '#135D54'
    }
});
