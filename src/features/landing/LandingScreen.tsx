import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  gameStakeAmount,
  getDemoQuestion,
  getUserDetails,
  loginUser,
} from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import TopUpModal from "@/features/landing/TopUpModal";

type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

const LandingScreen = ({ navigation }: Props) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [image, setImage] = useState(null);
  const [balance, setBalance] = useState(0);

  const handlePlayPress = (category) => {
    setSelectedCategory(category);
    setStakeAmount("");
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setStakeAmount("");
  };

  const validateStakeAmount = () => {
    const amount = parseFloat(stakeAmount);
    const userBalance = parseFloat(balance.toString());

    if (!stakeAmount || stakeAmount.trim() === "") {
      Alert.alert("Invalid Amount", "Please enter a stake amount");
      return false;
    }

    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0"
      );
      return false;
    }

    if (amount > userBalance) {
      Alert.alert(
        "Insufficient Balance",
        `You can't stake more than your current balance of ₦${userBalance}`
      );
      return false;
    }

    return true;
  };

  const handleStartGame = async () => {
    if (!validateStakeAmount()) return;

    setIsProcessing(true);

    try {
      const response = await gameStakeAmount(stakeAmount, selectedCategory.id);
      console.log("response", response);
      if (response.status === true) {
        // Still update state for other uses
        setQuiz(response.data.questions);
        setSessionId(response.data.sessionId);

        handleCloseModal();
        setIsProcessing(false);

        // Pass data directly from response instead of state
        navigation.navigate("MainGame", {
          quizData: response.data.questions, // Use response data directly
          stakeAmount: stakeAmount,
          initialBalance: balance,
          playerName: getUserName(),
          id: response.data.sessionId, // Use response data directly
        });
      } else {
        Alert.alert("Error", "Failed. Please try again.");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      Alert.alert("Error", "Failed to start game. Please try again.");
      setIsProcessing(false);
    }
  };

  // Fetch user details from AsyncStorage
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userDetailsString = await AsyncStorage.getItem("userInfo");
        if (userDetailsString) {
          const userData = JSON.parse(userDetailsString);
          setUserDetails(userData);
        }
      } catch (error) {
        console.error("Error retrieving user details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const result = await getUserDetails();
        console.log(result.data, "dataaaaailsss");
        setImage(result.data.profileImagePath);
        setBalance(result.data.balance);
        await AsyncStorage.setItem("userDetails", JSON.stringify(result.data));
      } catch (error) {
        console.error("Error retrieving user details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestion = async () => {
      try {
        const result = await getDemoQuestion();
        setQuizData(result.data);
      } catch {
        alert("Login failed. Try again.");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
    fetchQuestion();
    fetchUserDetails();
  }, []);

  // Function to get user's first name or fallback
  const getUserName = () => {
    if (!userDetails) return "User";
    return userDetails.fullName || "User";
  };

  // Function to get user's avatar or fallback
  const getUserAvatar = () => {
    if (!userDetails)
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKgAAACUCAMAAAAwLZJQAAAAMFBMVEXk5ueutLfp6+ymrbCqsbTIzM7d3+GyuLvM0NLU19na3d7R1Na4vcDh4+TBxsjX2tsjwEX5AAADuUlEQVR4nO2c2barIAxAJSKDDP7/316snY+1QGyi67If+7QXkAAxtOsajUaj0Wg0Go1Go9E4NcAtkEOYrHNuGsOBdZWNXvZyoZd+sOp4ttA5r6UUTyRbHd3RVGMSE39JvxlutQegBrlmeXM1gdtwAZz+rHlR9fYI8x/ipuXCwG2ZQv3LcN4GlXv6pyzPZKon1ul3WZaLqmI0tX2+qBATn2eJphB6ZPIcyzwTTKKZcfRAeg5NiKWeyZRjPy0I+Cfol2nQNZ5SU+coGMon/mLqiE1DUQZ9QtPupZBzElmHNp5U1Qq9QHs8qVyhM9ISetaF/BXKwJ/qB1SInm7uazalB9KQDSlgPFM4UXnWJ9EFrYg8weBGVFDFPXicJ90ZCisaiTwR29ICVTSNWFGqg0nhnW6Fs4hKovyEzU6iP4uoJLo5/T+iVFNfd1F+HlEi0dOkp9Mk/NNsoac5lKCPeVSfHmrLOXcckWincKJkV5EOcHcmussdeNR1eaCrQJylAHGekg6qSEYW8zOIXZS27Fif88my/RVVXRonS6ILtQU9wlLelcrAJ/98Uxn4kuMLc80nRp6WjfIBZWrYKN5IJVdjSel1lKuxIN3wi7Ip5QemN0qK5D3159pX8meft51orkbkNWjxrc8bKuO4z9NM8g6Yb02Emnd53gEVN9syYziG50ya/3VVKSPxue4LEKIXb7JSaj8caDSvQLAmavlARzMdrcP5TgijGxLGTSFwt4xuAc9wy6wxewU1WmfMcMEYZ6cxHMoXujCZ6LW+pSP5aHXXOg6W/5FDUlR28KLfSKPi8sghupHvlQPMknOYb25LN1vhoxlZ1oHz648ZPsumlTDQZn9QzvdV93rZezMSrQEAG3XWfH8a2GhIVK0um/E11Z8/H4FgNK4sfnf95WoFMKia+KtqCqxfLQBb3Cb+hZ/UTWDabzRvpKP//qIDNoTWVeO+8w95j4Gq2LWtDN3zsIH0e8U/dPuvzhfTvZ46qZ+szhfVXaYf3UGSY4r/gg+GwHMP01+G0YspsuiDbSEgMkX3CFOZOkJPzDrFN2LRmAZiz+rHTsimoSpq6tKoZxa1VHwxmxg0qxpjsP13lfSFk49uFqumMJvSR/yNws4DlkhaKGouLX8+vR8lh1O+FXqhYO5ZPQs6uGgPI3/wuUOK7bhFk5tLOUNpJnd7IrombYjmJn3GJLqQ2RYXuJdobhsX+uECXjQv56P6gvcRzbuTUF49P5AXTeyxJDL/ecX3/GSJvn7L5iFPtNFoVPAPAlkzJqeJNTcAAAAASUVORK5CYII=";

    return (
      userDetails?.profileImagePath ||
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKgAAACUCAMAAAAwLZJQAAAAMFBMVEXk5ueutLfp6+ymrbCqsbTIzM7d3+GyuLvM0NLU19na3d7R1Na4vcDh4+TBxsjX2tsjwEX5AAADuUlEQVR4nO2c2barIAxAJSKDDP7/316snY+1QGyi67If+7QXkAAxtOsajUaj0Wg0Go1Go9E4NcAtkEOYrHNuGsOBdZWNXvZyoZd+sOp4ttA5r6UUTyRbHd3RVGMSE39JvxlutQegBrlmeXM1gdtwAZz+rHlR9fYI8x/ipuXCwG2ZQv3LcN4GlXv6pyzPZKon1ul3WZaLqmI0tX2+qBATn2eJphB6ZPIcyzwTTKKZcfRAeg5NiKWeyZRjPy0I+Cfol2nQNZ5SU+coGMon/mLqiE1DUQZ9QtPupZBzElmHNp5U1Qq9QHs8qVyhM9ISetaF/BXKwJ/qB1SInm7uazalB9KQDSlgPFM4UXnWJ9EFrYg8weBGVFDFPXicJ90ZCisaiTwR29ICVTSNWFGqg0nhnW6Fs4hKovyEzU6iP4uoJLo5/T+iVFNfd1F+HlEi0dOkp9Mk/NNsoac5lKCPeVSfHmrLOXcckWincKJkV5EOcHcmussdeNR1eaCrQJylAHGekg6qSEYW8zOIXZS27Fif88my/RVVXRonS6ILtQU9wlLelcrAJ/98Uxn4kuMLc80nRp6WjfIBZWrYKN5IJVdjSel1lKuxIN3wi7Ip5QemN0qK5D3159pX8meft51orkbkNWjxrc8bKuO4z9NM8g6Yb02Emnd53gEVN9syYziG50ya/3VVKSPxue4LEKIXb7JSaj8caDSvQLAmavlARzMdrcP5TgijGxLGTSFwt4xuAc9wy6wxewU1WmfMcMEYZ6cxHMoXujCZ6LW+pSP5aHXXOg6W/5FDUlR28KLfSKPi8sghupHvlQPMknOYb25LN1vhoxlZ1oHz648ZPsumlTDQZn9QzvdV93rZezMSrQEAG3XWfH8a2GhIVK0um/E11Z8/H4FgNK4sfnf95WoFMKia+KtqCqxfLQBb3Cb+hZ/UTWDabzRvpKP//qIDNoTWVeO+8w95j4Gq2LWtDN3zsIH0e8U/dPuvzhfTvZ46qZ+szhfVXaYf3UGSY4r/gg+GwHMP01+G0YspsuiDbSEgMkX3CFOZOkJPzDrFN2LRmAZiz+rHTsimoSpq6tKoZxa1VHwxmxg0qxpjsP13lfSFk49uFqumMJvSR/yNws4DlkhaKGouLX8+vR8lh1O+FXqhYO5ZPQs6uGgPI3/wuUOK7bhFk5tLOUNpJnd7IrombYjmJn3GJLqQ2RYXuJdobhsX+uECXjQv56P6gvcRzbuTUF49P5AXTeyxJDL/ecX3/GSJvn7L5iFPtNFoVPAPAlkzJqeJNTcAAAAASUVORK5CYII="
    );
  };

  // Function to get user's points or fallback
  const getUserPoints = () => {
    if (!userDetails) return "0";
    return userDetails.points || userDetails.balance || "0";
  };

  const handleSeeAllCategories = () => {
    // Navigate to categories screen
    if (navigation) {
      navigation.navigate("Categories", {
        balance: balance.toString(),
      });
    } else {
      // For demo purposes, show alert
      alert("Navigate to Categories screen");
    }
  };

  const handleDemo = () => {
    // if (quizData) {
    // Pass the quiz data to the quiz screen
    navigation.navigate("Demo", {
      quizData: quizData,
    });
    // }
  };

  // Function to handle successful top-up
  const handleTopUpSuccess = async (newBalance) => {
    try {
      // Update userDetails with new balance
      setBalance(newBalance.toString());
      const updatedUserDetails = {
        ...userDetails,
        balance: newBalance.toString(),
      };

      // Update state
      setUserDetails(updatedUserDetails);

      // Update AsyncStorage
      await AsyncStorage.setItem(
        "userInfo",
        JSON.stringify(updatedUserDetails)
      );

      console.log("Balance updated successfully:", newBalance);
      console.log("Balance updated successfully:", userDetails);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  return (
    // <View style={styles.container}>
    //     <Text style={styles.welcome}>Welcome to Hunt4Treasure! 🎉</Text>
    //     {/*<Button title="Start Game" onPress={() => navigation.navigate('Game', { wager: 100 })} />*/}
    // </View>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={{ uri: image || getUserAvatar() }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Hi {getUserName()}</Text>
            <Text style={styles.subGreeting}>ready to play</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.pointsContainer}
            onPress={() => setShowTopUpModal(true)} // Open modal on press
          >
            <Text style={styles.pointsIcon}>💎</Text>
            <Text style={styles.points}>{balance}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#1F2937",
            paddingLeft: 20,
            paddingTop: 10,
          }}
        >
          Hunt4Treasure🏆
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>
            Play quiz together with your friends now!
          </Text>
          <TouchableOpacity style={styles.playButton} onPress={handleDemo}>
            <Text style={styles.playButtonText}>Play Demo</Text>
          </TouchableOpacity>
          <View style={styles.charactersContainer}>
            <Text style={styles.character}>👥</Text>
            <Text style={styles.character}>🎮</Text>
            <Text style={styles.character}>🏆</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={handleSeeAllCategories}>
            <Text style={styles.seeAll}>see all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {userDetails?.category.slice(0, 4).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handlePlayPress(category)}
            >
              <View style={styles.gameImageContainer}>
                <Image
                  source={{ uri: category.imageUrl }}
                  style={styles.gameImage}
                />
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categorySubtitle}>
                  {category.shortDescription}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#8B7CF6" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={handleSeeAllCategories}
        >
          <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
          <Text style={styles.seeAll}>Games</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Top Up Modal */}
      <TopUpModal
        visible={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={handleTopUpSuccess}
        currentBalance={balance}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCloseModal}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={() => {}} // Prevent modal from closing when content is tapped
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Ionicons name="game-controller" size={24} color="#8B7CF6" />
                  <Text style={styles.modalTitle}>Start Hunting</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Category Info */}
              {selectedCategory && (
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {selectedCategory.name}
                  </Text>
                  <Text style={styles.categoryDescription}>
                    {selectedCategory.shortDescription}
                  </Text>
                </View>
              )}

              {/* Balance Display */}
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Your Balance</Text>
                <Text style={styles.balanceAmount}>₦{balance}</Text>
              </View>

              {/* Stake Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Stake Amount</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.stakeInput}
                    value={stakeAmount}
                    onChangeText={setStakeAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <Text style={styles.inputHint}>Maximum: ₦{balance}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.startGameButton,
                    (isProcessing || !stakeAmount) && styles.disabledButton,
                  ]}
                  onPress={handleStartGame}
                  disabled={isProcessing || !stakeAmount}
                >
                  <Text
                    style={[
                      styles.startGameButtonText,
                      (isProcessing || !stakeAmount) &&
                        styles.disabledButtonText,
                    ]}
                  >
                    {isProcessing ? "Starting..." : "Start Hunting"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  // container: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     backgroundColor: '#F4FDFD'
  // },
  // welcome: {
  //     fontSize: 20,
  //     fontWeight: 'bold',
  //     marginBottom: 20,
  //     color: '#135D54'
  // }
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  subGreeting: {
    fontSize: 14,
    color: "#6B7280",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsIcon: {
    marginRight: 6,
  },
  points: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  mainCard: {
    backgroundColor: "#8B7CF6",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
    maxWidth: "70%",
  },
  playButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  playButtonText: {
    color: "#8B7CF6",
    fontWeight: "600",
    fontSize: 16,
  },
  cardPlayButton: {
    backgroundColor: "#8B7CF6",
    paddingHorizontal: 30,
    paddingVertical: 5,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  cardPlayButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  gameImageContainer: {
    margin: 0,
  },
  gameImage: {
    height: 114,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  gameInfo: {
    flex: 1,
    margin: 10,
  },
  charactersContainer: {
    position: "absolute",
    right: 20,
    top: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  character: {
    fontSize: 24,
    marginVertical: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  seeAll: {
    fontSize: 16,
    color: "#8B7CF6",
    fontWeight: "500",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%", // This ensures 2 items per row with gap
    // padding: 16,
    borderRadius: 13,
    minHeight: 120,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
    marginTop: 4,
  },
  categorySubtitle: {
    fontSize: 12,
    color: "#000000",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  authorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  authorName: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  navTextActive: {
    color: "#8B7CF6",
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 34,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  categoryInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8B7CF6",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },
  stakeInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  startGameButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#8B7CF6",
  },
  startGameButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});
