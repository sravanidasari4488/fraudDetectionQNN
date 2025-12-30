import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAppStates } from "../../context/AppStates";
import fetchCart from '../../data/getdata/getCart';
import { useUpdateProfile } from "../../hooks/seeUpdateProfile";
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";
import useDimension from "../../hooks/useDimensions";
import headerStyle from "../../styles/Home/headerStyle";
import Badge from "../common/Badge";
import ConfirmModal from "../common/ConfirmModal";
import PressableScale from '../common/PressableScale';
import Text from "../ui/Text";

function Header() {
  const [hasNotification, setHasNotification] = useState(true);
  const { screenHeight, screenWidth } = useDimension();
  const [search, setSearch] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartNavigationLoading, setCartNavigationLoading] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const { userAddress } = useCurrentUserDetails();
  const { selectedLocation, updateSelectedLocation, currentAddress } = useAppStates();
  const router = useRouter();
  const styles = headerStyle();
  const [modal, setModal] = useState({ visible: false, title: null, message: null });
  
  // Function to fetch and update cart count
  const updateCartCount = async () => {
    try {
      const { arr } = await fetchCart();
      const totalItems = arr.reduce((total, category) => 
        total + category.items.reduce((catTotal, item) => catTotal + item.quantity, 0), 0
      );
      setCartCount(totalItems);
    } catch (error) {
      setCartCount(0);
    }
  };

  // Function to handle cart navigation with loading state
  const handleCartNavigation = async () => {
    if (cartNavigationLoading) return; // Prevent multiple clicks
    
    setCartNavigationLoading(true);
    try {
      await router.push('/(modal)/cart');
    } catch (error) {
    } finally {
      // Reset loading state after a short delay to prevent rapid clicks
      setTimeout(() => {
        setCartNavigationLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    // Fetch initial cart count
    updateCartCount();
  }, []);

  // Update cart count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      updateCartCount();
    }, [])
  );
  
  const searchService = async () => {
    if (search.trim()) {
      // Navigate to services tab with search query
      router.push({
        pathname: '/protected/(tabs)/Services',
        params: { searchQuery: search.trim() }
      });
    } else {
      // Navigate to services tab without search query to clear any previous search
      router.push('/protected/(tabs)/Services');
    }
    // Clear the search input after navigation
    setSearch("");
  };
  
  useEffect(() => {
    if (currentAddress) {
      updateSelectedLocation(currentAddress);
    } else if (userAddress && (!selectedLocation || selectedLocation === "Tap to set location")) {
      updateSelectedLocation(userAddress);
    }
    setManualLocation(selectedLocation || "");
  }, [userAddress, selectedLocation, currentAddress]);
  
  // Location functions  
  const { updateProfile } = useUpdateProfile();
  
  const saveManualLocation = async () => {
    if (manualLocation && manualLocation.trim()) {
      setIsSavingLocation(true);
      
      try {
        updateSelectedLocation(manualLocation.trim());
        
        // Save address to backend using updateProfile
        const result = await updateProfile({ address: manualLocation.trim() });
        if (result?.data?.updated) {
        }
        
        setShowLocationModal(false);
      } catch (error) {
        setModal({ visible: true, title: 'Error', message: 'Failed to save address. Please try again.' });
      } finally {
        setIsSavingLocation(false);
      }
    }
  };
  
  const changeAddress = () => {
    setShowLocationModal(true);
  };
  
  return (
    <>
      <ConfirmModal visible={modal.visible} title={modal.title} message={modal.message} onRequestClose={() => setModal({ visible: false })} />
      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLocationModal}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>📍 Update Location</Text>
              <TouchableOpacity 
                onPress={() => setShowLocationModal(false)}
                style={modalStyles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.modalContent}>
              {/* Manual Location Input */}
              <View style={modalStyles.manualSection}>
                <Text style={modalStyles.sectionTitle}>Enter Your Address</Text>
                <View style={modalStyles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#666" style={modalStyles.inputIcon} />
                  <TextInput
                    style={modalStyles.textInput}
                    placeholder="Type your complete address here..."
                    placeholderTextColor="#999"
                    value={manualLocation}
                    onChangeText={setManualLocation}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={modalStyles.buttonContainer}>
                <TouchableOpacity 
                  style={modalStyles.cancelButton}
                  onPress={() => setShowLocationModal(false)}
                >
                  <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    modalStyles.saveButton,
                    ((!manualLocation || !manualLocation.trim()) || isSavingLocation) && modalStyles.saveButtonDisabled
                  ]}
                  onPress={saveManualLocation}
                  disabled={(!manualLocation || !manualLocation.trim()) || isSavingLocation}
                >
                  <Text style={modalStyles.saveButtonText}>
                    {isSavingLocation ? "Saving..." : "Save Location"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <LinearGradient colors={["#4cb6c9", "#3898b3"]} style={styles.header}>
        <View style={styles.rowTop}>
          <View style={styles.locationWrap}>
            <PressableScale accessibilityRole="button" onPress={changeAddress} style={styles.locationButton}>
              <Entypo
                name="location-pin"
                size={18}
                color="#FFEA85"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                {selectedLocation || "Tap to set location"}
              </Text>
              <AntDesign name="down" size={12} color="#FFEA85" style={{ marginLeft: 8 }} />
            </PressableScale>
          </View>

          <View style={styles.iconGroup}>
      <PressableScale accessibilityRole="button" onPress={() => router.navigate('/protected/Notifications')} style={styles.iconButton}>
              <Badge
                pressable={false}
                hasBadge={hasNotification}
                badgeSize={10}
                badgeColor="red"
                badgeTop={-6}
                badgeRight={-6}
        element={<Ionicons name="notifications" size={20} color="white" />}
              />
            </PressableScale>
          </View>
        </View>

        <View style={styles.rowBottom}>
          <View style={styles.searchWrap}>
            <FontAwesome name="search" size={16} color="#3898B3" style={styles.searchIcon} />
            <TextInput
              placeholder="Find services ..."
              style={styles.searchText}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              placeholderTextColor={"#9AA8AE"}
              onSubmitEditing={searchService}
              accessibilityLabel="Search"
            />
          </View>

          <PressableScale 
            accessibilityRole="button" 
            onPress={handleCartNavigation} 
            style={[styles.cartButton, cartNavigationLoading && styles.cartButtonDisabled]}
            disabled={cartNavigationLoading}
          >
            <View style={styles.cartInner}>
              <Feather name="shopping-cart" size={20} color="#3898B3" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </PressableScale>
        </View>
      </LinearGradient>
    </>
  );
}

// Modal Styles
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  manualSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B3D9FF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
};

export default Header;
