import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  deleteAvatar,
  uploadAvatar,
} from "../../app/api/userServices";
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";
import useDimension from "../../hooks/useDimensions";
import ConfirmModal from "../common/ConfirmModal";
import SuccessIndicator from "../common/SuccessIndicator";
import Text from "../ui/Text";

const ProfileHeader = ({
  isGeneral = true,
  setIsGeneral = () => {},
  onProfileUpdate,
}) => {
  const { name, email, profileImage, userId, refreshUserDetails, setUser } =
    useCurrentUserDetails();
  useEffect(() => {
    refreshUserDetails?.();
  }, []);
  useEffect(() => {
    setUserName(name || "User's Name");
  }, [name]);
  useEffect(() => {
    setSelectedImage(profileImage);
  }, [profileImage]);
  const sliderPosition = useRef(new Animated.Value(isGeneral ? 0 : 1)).current;
  const { screenWidth } = useDimension();
  const [userName, setUserName] = useState(name || "User's Name");
  const [selectedImage, setSelectedImage] = useState(profileImage);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [tempImageUri, setTempImageUri] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: null, message: null, buttons: null });

  // Upload image to backend
  const uploadImageToBackend = async (imageUri) => {
    setIsUpdatingPhoto(true);
    try {

      // Add timeout to prevent infinite loading
      const uploadPromise = uploadAvatar(imageUri);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 30000)
      );

      const result = await Promise.race([uploadPromise, timeoutPromise]);


      if (result?.error) {
        setConfirmModal({ visible: true, title: "Error", message: "Failed to update profile picture. Please try again.", buttons: [{ text: 'OK' }] });
        setTempImageUri(null);
        return;
      }
       

      // setSelectedImage(result?.avatar_url || imageUri);
      setTempImageUri(null);
      setShowSuccessModal(true);
      
      // Immediately refresh user details to update the profile image
      refreshUserDetails?.();
      onProfileUpdate?.();
    } catch (error) {
      setConfirmModal({ visible: true, title: "Error", message: `Upload failed: ${error.message || "Unknown error"}` });
      setTempImageUri(null);
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  // Confirm image selection
  const confirmImageSelection = (imageUri) => {
    setTempImageUri(imageUri);
    setShowConfirmModal(true);
  };

  // Handle confirm button in modal
  const handleConfirmImage = () => {
    setShowConfirmModal(false);
    uploadImageToBackend(tempImageUri);
  };

  // Handle cancel button in modal
  const handleCancelImage = () => {
    setShowConfirmModal(false);
    setTempImageUri(null);
  };
  // Camera function
  const takePhoto = async () => {
    if (isUpdatingPhoto) return; // Prevent multiple clicks during upload

    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        setConfirmModal({ visible: true, title: 'Permission required', message: 'Camera permission is needed to take photos' });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.3,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        confirmImageSelection(imageUri);
      }
    } catch (error) {
      setConfirmModal({ visible: true, title: 'Camera Error', message: 'There was an issue accessing your camera. Please check camera permissions and try again.' });
    }
  };

  // Gallery function
  const pickFromGallery = async () => {
    if (isUpdatingPhoto) return; // Prevent multiple clicks during upload

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setConfirmModal({ visible: true, title: 'Permission required', message: 'Gallery permission is needed to select photos' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        confirmImageSelection(imageUri);
      }
    } catch (error) {
      // More specific error handling for PhotoPicker issues
      if (error.message && error.message.includes("PhotoPicker")) {
        setConfirmModal({ visible: true, title: 'Gallery Error', message: 'There was an issue accessing your photo library. Please try again or use the camera option.' });
      } else {
        setConfirmModal({ visible: true, title: 'Error', message: `Failed to pick image: ${error.message}` });
      }
    }
  };

  // Remove photo function
  const removePhoto = () => {
    if (isUpdatingPhoto) return;

    setConfirmModal({
      visible: true,
      title: 'Remove Profile Picture',
      message: 'Are you sure you want to remove your profile picture?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsUpdatingPhoto(true);
            try {
              const result = await deleteAvatar();

              if (result?.error) {
                setConfirmModal({ visible: true, title: 'Error', message: 'Failed to remove profile picture. Please try again.' });
                return;
              }

              setSelectedImage(null);
              setConfirmModal({ visible: true, title: 'Success', message: 'Profile picture removed successfully!' });
            } catch (error) {
              setConfirmModal({ visible: true, title: 'Error', message: 'Failed to remove profile picture. Please try again.' });
            } finally {
              setIsUpdatingPhoto(false);
            }
          },
        },
      ],
    });
  };

  const toggleWidth = Math.min(screenWidth * 0.9, 340);
  const padding = 4; // Internal padding of the toggle container
  const sliderWidth = (toggleWidth - padding * 2) / 2; // Half width minus padding

  const sliderStyle = {
    width: sliderWidth,
    transform: [
      {
        translateX: sliderPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [0, sliderWidth],
        }),
      },
    ],
  };

  useEffect(() => {
    Animated.timing(sliderPosition, {
      toValue: isGeneral ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isGeneral]);

  // Confirmation Modal Component
  const ConfirmImageModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={handleCancelImage}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalHeader}>
            <Ionicons name="camera" size={32} color="#0097B3" />
            <Text style={styles.confirmModalTitle}>
              Confirm Profile Picture
            </Text>
          </View>

          {tempImageUri && (
            <View style={styles.previewImageContainer}>
              <Image
                source={{ uri: tempImageUri }}
                style={styles.previewImage}
              />
            </View>
          )}

          <Text style={styles.confirmModalText}>
            Do you want to set this as your profile picture?
          </Text>

          <View style={styles.confirmModalButtons}>
            <TouchableOpacity
              style={styles.confirmCancelButton}
              onPress={handleCancelImage}
            >
              <Text style={styles.confirmCancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmImage}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Success Modal Component
  const SuccessModal = () => {
    // Auto-close the modal after 2 seconds and refresh user details
    useEffect(() => {
      if (showSuccessModal) {
        const timer = setTimeout(() => {
          setShowSuccessModal(false);
          // Refresh user details to get the updated profile image
          refreshUserDetails?.();
        }, 2000); // 2 seconds

        return () => clearTimeout(timer);
      }
    }, [showSuccessModal]);

    return (
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <SuccessIndicator
              title="Success!"
              subtitle="Profile picture updated successfully"
              message="Your new profile picture has been saved and will be visible across the app."
              iconColor="#0097B3"
            />
          </View>
        </View>
      </Modal>
    );
  };

  const handleProfileImagePress = () => {
    if (isUpdatingPhoto) {
      return;
    }

    setConfirmModal({
      visible: true,
      title: 'Profile Picture',
      message: 'Choose an option',
      buttons: [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        ...(profileImage ? [{ text: 'Remove Photo', style: 'destructive', onPress: removePhoto }] : []),
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };


  return (
    <View style={styles.container}>
      <ConfirmModal visible={confirmModal.visible} title={confirmModal.title} message={confirmModal.message} buttons={confirmModal.buttons} onRequestClose={() => setConfirmModal({ visible: false })} />
      <ConfirmImageModal />
      <SuccessModal />

      <View style={styles.profileSection}>
        <TouchableOpacity
          style={[
            styles.profileIconContainer,
            isUpdatingPhoto && styles.profileIconContainerLoading,
          ]}
          onPress={handleProfileImagePress}
          disabled={isUpdatingPhoto}
        >
          {isUpdatingPhoto ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0097B3" />
              <Text style={styles.loadingText}>Updating...</Text>
            </View>
          ) : (
            <>
              {selectedImage || profileImage ? (
                <Image
                  source={{
                    uri:
                      selectedImage ||
                      profileImage ||
                      "https://img.myloview.com/posters/default-profile-picture-avatar-photo-placeholder-vector-illustration-700-197279432.jpg",
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <FontAwesome name="user" size={60} color="gray" />
              )}
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.username}>{userName}</Text>
          {/* <Text style={styles.userid}>ID: {userId || "N/A"}</Text> */}
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {email || "No email provided"}
          </Text>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <Animated.View style={[styles.slider, sliderStyle]} />

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsGeneral(true)}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.toggleText, isGeneral && styles.activeToggleText]}
          >
            General
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsGeneral(false)}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.toggleText, !isGeneral && styles.activeToggleText]}
          >
            Advanced
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 400,
    paddingRight: 10,
  },
  profileIconContainer: {
    width: 131,
    height: 131,
    borderRadius: 65.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  profileIconContainerLoading: {
    opacity: 0.7,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#0097B3',
    fontWeight: '500',
  },
  profileImage: {
    width: 131,
    height: 131,
    borderRadius: 65.5,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0097B3',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
    minWidth: 0, // This is crucial for text truncation
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'black',
    marginBottom: 4,
  },
  userid: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  email: {
    color: '#0b437cff',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    width: '100%',
    maxWidth: 345,
    height: 66,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    alignSelf: 'center',
    position: 'relative',
    padding: 0,
  },
  slider: {
    position: 'absolute',
    height: 55,
    backgroundColor: '#0097B3',
    borderRadius: 36,
    top: 4,
    left: 4,
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    color: '#616161',
    fontSize: 16,
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
  },
  // Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  previewImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0097B3',
  },
  confirmModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0097B3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Success Modal Styles
  successModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  // Error Modal Styles
  errorModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  errorModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  errorModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 10,
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  errorModalButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  errorModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileHeader;