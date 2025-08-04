import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { editUserProfile } from "@/services/authService";
import {useAuthStore} from "@/stores/authStore"; // Add this import

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: Props) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(null);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Fetch user details from AsyncStorage
    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userDetailsString = await AsyncStorage.getItem('userDetails');
                if (userDetailsString) {
                    const userData = JSON.parse(userDetailsString);
                    setUserDetails(userData);
                    // Set bank details if they exist
                    setBankName(userData.bankName || '');
                    setAccountNumber(userData.accountNumber || '');
                    setProfileImage(userData.profilePicx || getUserAvatar(userData));
                }
            } catch (error) {
                console.error('Error retrieving user details:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserDetails();
    }, []);

    // Function to get user's avatar or fallback
    const getUserAvatar = (userData = userDetails) => {
        if (!userData) return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKgAAACUCAMAAAAwLZJQAAAAMFBMVEXk5ueutLfp6+ymrbCqsbTIzM7d3+GyuLvM0NLU19na3d7R1Na4vcDh4+TBxsjX2tsjwEX5AAADuUlEQVR4nO2c2barIAxAJSKDDP7/316snY+1QGyi67If+7QXkAAxtOsajUaj0Wg0Go1Go9E4NcAtkEOYrHNuGsOBdZWNXvZyoZd+sOp4ttA5r6UUTyRbHd3RVGMSE39JvxlutQegBrlmeXM1gdtwAZz+rHlR9fYI8x/ipuXCwG2ZQv3LcN4GlXv6pyzPZKon1ul3WZaLqmI0tX2+qBATn2eJphB6ZPIcyzwTTKKZcfRAeg5NiKWeyZRjPy0I+Cfol2nQNZ5SU+coGMon/mLqiE1DUQZ9QtPupZBzElmHNp5U1Qq9QHs8qVyhM9ISetaF/BXKwJ/qB1SInm7uazalB9KQDSlgPFM4UXnWJ9EFrYg8weBGVFDFPXicJ90ZCisaiTwR29ICVTSNWFGqg0nhnW6Fs4hKovyEzU6iP4uoJLo5/T+iVFNfd1F+HlEi0dOkp9Mk/NNsoac5lKCPeVSfHmrLOXcckWincKJkV5EOcHcmussdeNR1eaCrQJylAHGekg6qSEYW8zOIXZS27Fif88my/RVVXRonS6ILtQU9wlLelcrAJ/98Uxn4kuMLc80nRp6WjfIBZWrYKN5IJVdjSel1lKuxIN3wi7Ip5QemN0qK5D3159pX8meft51orkbkNWjxrc8bKuO4z9NM8g6Yb02Emnd53gEVN9syYziG50ya/3VVKSPxue4LEKIXb7JSaj8caDSvQLAmavlARzMdrcP5TgijGxLGTSFwt4xuAc9wy6wxewU1WmfMcMEYZ6cxHMoXujCZ6LW+pSP5aHXXOg6W/5FDUlR28KLfSKPi8sghupHvlQPMknOYb25LN1vhoxlZ1oHz648ZPsumlTDQZn9QzvdV93rZezMSrQEAG3XWfH8a2GhIVK0um/E11Z8/H4FgNK4sfnf95WoFMKia+KtqCqxfLQBb3Cb+hZ/UTWDabzRvpKP//qIDNoTWVeO+8w95j4Gq2LWtDN3zsIH0e8U/dPuvzhfTvZ46qZ+szhfVXaYf3UGSY4r/gg+GwHMP01+G0YspsuiDbSEgMkX3CFOZOkJPzDrFN2LRmAZiz+rHTsimoSpq6tKoZxa1VHwxmxg0qxpjsP13lfSFk49uFqumMJvSR/yNws4DlkhaKGouLX8+vR8lh1O+FXqhYO5ZPQs6uGgPI3/wuUOK7bhFk5tLOUNpJnd7IrombYjmJn3GJLqQ2RYXuJdobhsX+uECXjQv56P6gvcRzbuTUF49P5AXTeyxJDL/ecX3/GSJvn7L5iFPtNFoVPAPAlkzJqeJNTcAAAAASUVORK5CYII='
        return userData.profilePicx ||
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKgAAACUCAMAAAAwLZJQAAAAMFBMVEXk5ueutLfp6+ymrbCqsbTIzM7d3+GyuLvM0NLU19na3d7R1Na4vcDh4+TBxsjX2tsjwEX5AAADuUlEQVR4nO2c2barIAxAJSKDDP7/316snY+1QGyi67If+7QXkAAxtOsajUaj0Wg0Go1Go9E4NcAtkEOYrHNuGsOBdZWNXvZyoZd+sOp4ttA5r6UUTyRbHd3RVGMSE39JvxlutQegBrlmeXM1gdtwAZz+rHlR9fYI8x/ipuXCwG2ZQv3LcN4GlXv6pyzPZKon1ul3WZaLqmI0tX2+qBATn2eJphB6ZPIcyzwTTKKZcfRAeg5NiKWeyZRjPy0I+Cfol2nQNZ5SU+coGMon/mLqiE1DUQZ9QtPupZBzElmHNp5U1Qq9QHs8qVyhM9ISetaF/BXKwJ/qB1SInm7uazalB9KQDSlgPFM4UXnWJ9EFrYg8weBGVFDFPXicJ90ZCisaiTwR29ICVTSNWFGqg0nhnW6Fs4hKovyEzU6iP4uoJLo5/T+iVFNfd1F+HlEi0dOkp9Mk/NNsoac5lKCPeVSfHmrLOXcckWincKJkV5EOcHcmussdeNR1eaCrQJylAHGekg6qSEYW8zOIXZS27Fif88my/RVVXRonS6ILtQU9wlLelcrAJ/98Uxn4kuMLc80nRp6WjfIBZWrYKN5IJVdjSel1lKuxIN3wi7Ip5QemN0qK5D3159pX8meft51orkbkNWjxrc8bKuO4z9NM8g6Yb02Emnd53gEVN9syYziG50ya/3VVKSPxue4LEKIXb7JSaj8caDSvQLAmavlARzMdrcP5TgijGxLGTSFwt4xuAc9wy6wxewU1WmfMcMEYZ6cxHMoXujCZ6LW+pSP5aHXXOg6W/5FDUlR28KLfSKPi8sghupHvlQPMknOYb25LN1vhoxlZ1oHz648ZPsumlTDQZn9QzvdV93rZezMSrQEAG3XWfH8a2GhIVK0um/E11Z8/H4FgNK4sfnf95WoFMKia+KtqCqxfLQBb3Cb+hZ/UTWDabzRvpKP//qIDNoTWVeO+8w95j4Gq2LWtDN3zsIH0e8U/dPuvzhfTvZ46qZ+szhfVXaYf3UGSY4r/gg+GwHMP01+G0YspsuiDbSEgMkX3CFOZOkJPzDrFN2LRmAZiz+rHTsimoSpq6tKoZxa1VHwxmxg0qxpjsP13lfSFk49uFqumMJvSR/yNws4DlkhaKGouLX8+vR8lh1O+FXqhYO5ZPQs6uGgPI3/wuUOK7bhFk5tLOUNpJnd7IrombYjmJn3GJLqQ2RYXuJdobhsX+uECXjQv56P6gvcRzbuTUF49P5AXTeyxJDL/ecX3/GSJvn7L5iFPtNFoVPAPAlkzJqeJNTcAAAAASUVORK5CYII='
            // 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
    };

    // Function to get user's points or fallback
    const getUserPoints = () => {
        if (!userDetails) return '0';
        return userDetails.points || userDetails.balance || '0';
    };

    // Function to handle image picker
    const pickImage = async () => {
        // Request permission
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const newImageUri = result.assets[0].uri;
            setProfileImage(newImageUri);

            // Call API to update profile image
            try {
                const payload = {
                    bankName: bankName || '',
                    accountNumber: accountNumber || '',
                    profilePic: newImageUri
                };

                console.log(payload, "editPayload")

                const response = await editUserProfile(payload);

                if (response.success) {
                    // Update local storage with new image
                    const updatedUserDetails = {
                        ...userDetails,
                        profileImage: newImageUri,
                        profilePic: newImageUri
                    };
                    await AsyncStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
                    setUserDetails(updatedUserDetails);
                    Alert.alert('Success', 'Profile image updated successfully!');
                } else {
                    // Revert image if API call failed
                    setProfileImage(getUserAvatar());
                    Alert.alert('Error', response.message || 'Failed to update profile image');
                }
            } catch (error) {
                console.error('Error updating profile image:', error);
                // Revert image if API call failed
                setProfileImage(getUserAvatar());
                Alert.alert('Error', 'Failed to update profile image. Please try again.');
            }
        }
    };

    // Function to save bank details
    const saveBankDetails = async () => {
        if (!bankName.trim() || !accountNumber.trim()) {
            Alert.alert('Validation Error', 'Please fill in both bank name and account number');
            return;
        }

        try {
            const payload = {
                bankName: bankName.trim(),
                accountNumber: accountNumber.trim(),
                profilePic: profileImage || getUserAvatar()
            };
            console.log(payload, "editPayload")
            const response = await editUserProfile(payload);

            if (response.success) {
                // Update local storage with new bank details
                const updatedUserDetails = {
                    ...userDetails,
                    bankName: bankName.trim(),
                    accountNumber: accountNumber.trim()
                };
                await AsyncStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
                setUserDetails(updatedUserDetails);
                setIsEditing(false);
                Alert.alert('Success', 'Bank details updated successfully!');
            } else {
                Alert.alert('Error', response.message || 'Failed to update bank details');
            }
        } catch (error) {
            console.error('Error saving bank details:', error);
            Alert.alert('Error', 'Failed to save bank details. Please try again.');
        }
    };

    // Function to get user's full name parts
    const getFirstName = () => {
        if (!userDetails) return '';
        if (userDetails.firstName) return userDetails.firstName;
        const fullName = userDetails.fullName || '';
        return fullName.split(' ')[0] || '';
    };

    const getLastName = () => {
        if (!userDetails) return '';
        if (userDetails.lastName) return userDetails.lastName;
        const fullName = userDetails.fullName || '';
        const nameParts = fullName.split(' ');
        return nameParts.slice(1).join(' ') || '';
    };

    const getEmail = () => {
        return userDetails?.email || userDetails?.emailAddress || '';
    };

    const getPhoneNumber = () => {
        return userDetails?.phoneNumber || userDetails?.phone || userDetails?.mobile || '';
    };

    const handleLogout = async () => {
        await useAuthStore.getState().logout()
        navigation.navigate('Login')
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                {/*<View style={styles.headerRight}>*/}
                {/*    <View style={styles.pointsContainer}>*/}
                {/*        <Text style={styles.pointsIcon}>💎</Text>*/}
                {/*        <Text style={styles.points}>{getUserPoints()}</Text>*/}
                {/*    </View>*/}
                {/*</View>*/}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Profile Image Section */}
                <View style={styles.profileImageSection}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: profileImage || getUserAvatar() }}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity
                            style={styles.changePhotoButton}
                            onPress={pickImage}
                        >
                            <Ionicons name="camera" size={20} color="#8B7CF6" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>
                        {userDetails?.fullName || `${getFirstName()} ${getLastName()}`}
                    </Text>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={getFirstName()}
                            editable={false}
                            placeholder="First Name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={getLastName()}
                            editable={false}
                            placeholder="Last Name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={getEmail()}
                            editable={false}
                            placeholder="Email Address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={getPhoneNumber()}
                            editable={false}
                            placeholder="Phone Number"
                        />
                    </View>
                </View>

                {/* Bank Information Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bank Information</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (isEditing) {
                                    saveBankDetails();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                        >
                            <Text style={styles.editButton}>
                                {isEditing ? 'Save' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Bank Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={bankName}
                            onChangeText={setBankName}
                            editable={isEditing}
                            placeholder="Enter your bank name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Account Number</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            editable={isEditing}
                            placeholder="Enter your account number"
                            keyboardType="numeric"
                        />
                    </View>

                    {isEditing && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setIsEditing(false);
                                // Reset to original values
                                setBankName(userDetails?.bankName || '');
                                setAccountNumber(userDetails?.accountNumber || '');
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Additional Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="#6B7280" />
                        <Text style={styles.actionButtonText}>Privacy & Security</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
                        <Text style={styles.actionButtonText}>Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                        <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Logout</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Landing')}
                >
                    <Ionicons name="home-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>Games</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person" size={24} color="#8B7CF6" />
                    <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FA',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
        marginRight: 40, // To center the title properly
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pointsIcon: {
        marginRight: 6,
    },
    points: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    scrollView: {
        flex: 1,
    },
    profileImageSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: 'white',
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#E5E7EB',
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
    },
    section: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 20,
    },
    editButton: {
        fontSize: 16,
        color: '#8B7CF6',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#1F2937',
    },
    disabledInput: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    actionButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
        fontWeight: '500',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    navTextActive: {
        color: '#8B7CF6',
        fontWeight: '600',
    },
});