import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
    used5050: boolean;
    usedSkip: boolean;
    on5050: () => void;
    onSkip: () => void;
}

const LifelineButtons = ({ used5050, usedSkip, on5050, onSkip }: Props) => {
    return (
        <View style={styles.row}>
            <TouchableOpacity
                style={[styles.btn, used5050 && styles.disabled]}
                onPress={on5050}
                disabled={used5050}
            >
                <Text style={styles.text}>50/50</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.btn, usedSkip && styles.disabled]}
                onPress={onSkip}
                disabled={usedSkip}
            >
                <Text style={styles.text}>Skip</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LifelineButtons;

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    btn: {
        backgroundColor: '#135D54',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6
    },
    text: {
        color: '#fff',
        fontWeight: 'bold'
    },
    disabled: {
        backgroundColor: '#A9A9A9'
    }
});
