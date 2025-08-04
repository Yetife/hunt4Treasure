import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { topUpBalance } from '@/services/authService';

const { width } = Dimensions.get('window');

const TopUpModal = ({ visible, onClose, onSuccess, currentBalance }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to format number input (only numbers and one decimal point)
    const formatAmountInput = (text) => {
        // Remove any non-numeric characters except decimal point
        let cleaned = text.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
            cleaned = parts[0] + '.' + parts[1].substring(0, 2);
        }

        return cleaned;
    };

    const handleAmountChange = (text) => {
        const formattedAmount = formatAmountInput(text);
        setAmount(formattedAmount);
    };

    const handleTopUp = async () => {
        // Validation
        if (!amount || amount === '' || amount === '0') {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
            return;
        }

        console.log(numericAmount, "amountttttt")

        if (numericAmount < 0) {
            Alert.alert('Minimum Amount', 'Minimum top-up amount is ₦100');
            return;
        }

        setLoading(true);

        try {
            const response = await topUpBalance(numericAmount);
            console.log('response', response);
            if (response.status === true) {
                Alert.alert(
                    'Top-up Successful',
                    `₦${numericAmount.toLocaleString()} has been added to your account`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setAmount('');
                                onSuccess(response.data || (parseFloat(currentBalance) + numericAmount));
                                onClose();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Top-up Failed', response.message || 'Failed to process top-up');
            }
        } catch (error) {
            console.error('Top-up error:', error);
            Alert.alert('Error', 'An error occurred while processing your top-up');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setAmount('');
            onClose();
        }
    };

    // Quick amount buttons
    const quickAmounts = [500, 1000, 2000, 5000];

    const selectQuickAmount = (quickAmount) => {
        setAmount(quickAmount.toString());
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Top Up Balance</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Current Balance */}
                    <View style={styles.currentBalanceContainer}>
                        <Text style={styles.currentBalanceLabel}>Current Balance</Text>
                        <Text style={styles.currentBalanceAmount}>₦{parseFloat(currentBalance || 0).toLocaleString()}</Text>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.amountSection}>
                        <Text style={styles.inputLabel}>Enter Amount</Text>
                        <View style={styles.amountInputContainer}>
                            <View style={styles.currencyIcon}>
                                <Text style={styles.nairaSymbol}>₦</Text>
                            </View>
                            <TextInput
                                style={styles.amountInput}
                                value={amount}
                                onChangeText={handleAmountChange}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                editable={!loading}
                                maxLength={10}
                            />
                        </View>

                        {/* Quick Amount Buttons */}
                        <View style={styles.quickAmountsContainer}>
                            <Text style={styles.quickAmountsLabel}>Quick Select:</Text>
                            <View style={styles.quickAmountsGrid}>
                                {quickAmounts.map((quickAmount) => (
                                    <TouchableOpacity
                                        key={quickAmount}
                                        style={[
                                            styles.quickAmountButton,
                                            amount === quickAmount.toString() && styles.quickAmountButtonActive
                                        ]}
                                        onPress={() => selectQuickAmount(quickAmount)}
                                        disabled={loading}
                                    >
                                        <Text style={[
                                            styles.quickAmountText,
                                            amount === quickAmount.toString() && styles.quickAmountTextActive
                                        ]}>
                                            ₦{quickAmount.toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <View style={styles.previewContainer}>
                            <View style={styles.previewRow}>
                                <Text style={styles.previewLabel}>Amount to add:</Text>
                                <Text style={styles.previewAmount}>₦{parseFloat(amount).toLocaleString()}</Text>
                            </View>
                            <View style={styles.previewRow}>
                                <Text style={styles.previewLabel}>New balance:</Text>
                                <Text style={styles.previewNewBalance}>
                                    ₦{(parseFloat(currentBalance || 0) + parseFloat(amount)).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.topUpButton, loading && styles.topUpButtonDisabled]}
                            onPress={handleTopUp}
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.topUpButtonText}>Top Up</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default TopUpModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: width - 40,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    currentBalanceContainer: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    currentBalanceLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    currentBalanceAmount: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
    },
    amountSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 12,
    },
    amountInputContainer: {
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    currencyIcon: {
        backgroundColor: '#8B7CF6',
        paddingHorizontal: 16,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nairaSymbol: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    amountInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 18,
        fontWeight: '500',
        color: '#1F2937',
    },
    quickAmountsContainer: {
        marginTop: 16,
    },
    quickAmountsLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    quickAmountsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    quickAmountButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quickAmountButtonActive: {
        backgroundColor: '#8B7CF6',
        borderColor: '#8B7CF6',
    },
    quickAmountText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    quickAmountTextActive: {
        color: 'white',
    },
    previewContainer: {
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    previewLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    previewAmount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    previewNewBalance: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
    },
    topUpButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#8B7CF6',
        alignItems: 'center',
    },
    topUpButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    topUpButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});