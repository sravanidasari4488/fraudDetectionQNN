import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useModal } from '../../context/ModalProvider';
import { useUpdateProfile } from '../../hooks/seeUpdateProfile';
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";
import LoadinScreen from '../common/LoadingScreen';
import SuccessModal from '../common/SuccessModal';
import Text from "../ui/Text";



const screenWidth = Dimensions.get("window").width;

const ProfileForm = ({ onValidationChange, onSave, onProfileUpdate }) => {
  const {
    name,
    email,
    userAddress,
    phone,
    profileImage,
    _id,
    reviews,
    ratings,
    userId,
    service,
  } = useCurrentUserDetails();
  
  const { isSuccessModalOpen, setIsSuccessModalOpen } = useModal();
  const { setUser, refreshUserDetails } = useAuth();

  const [formData, setFormData] = useState({
    fullName: name || "",
    email: email || "",
    phone: phone || "",
    address: userAddress || "",
  });

  const [isEditing, setIsEditing] = useState(false); // Start with edit mode off
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loadingspin, setLoadingspin] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim())
      newErrors.fullName = "Full name is required";
    if (formData.email?.trim() && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange && onValidationChange(isValid);
    return isValid;
  };

  // Only validate after user has interacted with the form
  useEffect(() => {
    if (hasInteracted) {
      validateForm();
    }
  }, []);

  // Check if form is initially valid (for first-time users)
  useEffect(() => {
    const isInitiallyValid =
      formData.fullName.trim() &&
      (formData.email.trim() === "" || /\S+@\S+\.\S+/.test(formData.email)) &&
      formData.phone.trim() &&
      formData.address.trim();
    onValidationChange && onValidationChange(isInitiallyValid);
  }, []);

  // Auto-close success modal after 2 seconds
  useEffect(() => {
    if (isSuccessModalOpen) {
      const timer = setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen, setIsSuccessModalOpen]);

  const handleInputChange = (name, value) => {
    setHasInteracted(true); // Mark that user has interacted with the form
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
      return updatedForm;
    });
  };
  const [refreshKey, setRefreshKey] = useState(0);
  const { updateProfile, loading, error } = useUpdateProfile();

  const handleSave = async () => {
    setLoadingspin(true);
    if (!validateForm()) {
      setLoadingspin(false); // Add this line
      return;
    }
    setIsSaving(true);

    const updates = {
      full_name: formData.fullName,
      email: formData.email,
      address: formData.address,
      ph_no: formData.phone, // Add phone number to main save
    };

    const result = await updateProfile(updates);
    if (result?.data?.updated) {
      setIsSuccessModalOpen(true);
      setRefreshKey((prev) => prev + 1);

      // Refresh user data from database
      await refreshUserDetails();

      onProfileUpdate?.();
      setIsEditing(false); // Exit edit mode after successful save
    } else {
      setModal({ visible: true, title: "Error", message: "Failed to update profile" });
    }
    setLoadingspin(false);
    setIsSaving(false);
  };

  const [modal, setModal] = useState({ visible: false, title: null, message: null });

  const renderInputField = (
    name,
    icon,
    placeholder,
    keyboardType = "default",
    additionalProps = {}
  ) => {
    const isEmailField = name === "email";
    const fieldEditable = isEmailField ? false : isEditing;
    
    return (
      <View style={styles.inputGroup}>
        <FontAwesome name={icon} size={18} color="#0097B3" style={styles.icon} />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors[name] && styles.inputError,
              isEmailField && styles.inputDisabled,
            ]}
            value={formData[name]}
            onChangeText={(text) => handleInputChange(name, text)}
            onFocus={() => setHasInteracted(true)} // Mark interaction on focus
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="#808080"
            editable={fieldEditable}
            {...additionalProps}
          />
          {hasInteracted && errors[name] && (
            <Text style={styles.errorText}>{errors[name]}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loadingspin) return <LoadinScreen />;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          {/* Edit Button at top right */}
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editButtonSmall} 
              onPress={() => setIsEditing(true)}
            >
              <FontAwesome name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Personal Information */}
          {renderInputField("fullName", "user", "Full Name")}
          {renderInputField(
            "email",
            "envelope",
            "Email Address (Optional)",
            "email-address",
            { autoCapitalize: "none" }
          )}
          {renderInputField("phone", "phone", "Phone Number", "phone-pad")}

          {/* Address Information */}
          {renderInputField(
            "address",
            "map-marker",
            "Complete Address",
            "default",
            { multiline: true }
          )}

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <SuccessModal />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  icon: {
    marginLeft: 16,
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FFF5F5',
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  saveButton: {
    backgroundColor: '#0097B3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0097B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0097B3',
    marginTop: 20,
  },
  editButtonText: {
    color: '#0097B3',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonSmall: {
    position: 'absolute',
    top: -20,
    right: -10,
    backgroundColor: '#0097B3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ProfileForm;