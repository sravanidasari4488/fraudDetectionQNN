import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useUpdateProfile } from '../../hooks/seeUpdateProfile';
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";
import { setIsNewUser as setStoredIsNewUser } from "../../utils/storage";
import ConfirmModal from "../common/ConfirmModal";
import Text from "../ui/Text";

const screenWidth = Dimensions.get("window").width;

const StandaloneProfileForm = ({ onValidationChange, onProfileUpdate, onProceed }) => {
  const {
    name,
    userAddress,
    phone,
    userId,
  } = useCurrentUserDetails();

  const { setUser, refreshUserDetails, setIsNewUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: name || "",
    phone: phone || "",
    address: userAddress || "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loadingspin, setLoadingspin] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim())
      newErrors.fullName = "Full name is required";
    // Phone validation is now handled on blur, not here
    if (!formData.address?.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 && formData.phone.length === 10;
    onValidationChange && onValidationChange(isValid);
    return isValid;
  };

  // Only validate after user has interacted with the form (excluding phone which validates on blur)
  useEffect(() => {
    if (hasInteracted) {
      const newErrors = {};
      if (!formData.fullName?.trim())
        newErrors.fullName = "Full name is required";
      if (!formData.address?.trim()) newErrors.address = "Address is required";
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  }, [formData.fullName, formData.address, hasInteracted]);

  // Check if form is initially valid (for first-time users)
  useEffect(() => {
    const isInitiallyValid =
      formData.fullName.trim() &&
      formData.phone.length === 10 &&
      formData.address.trim();
    onValidationChange && onValidationChange(isInitiallyValid);
  }, []);

  const handlePhoneChange = (text) => {
    // Only allow digits and limit to 10 characters
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setFormData(prev => ({ ...prev, phone: numericText }));
    }
  };

  const handlePhoneBlur = () => {
    // Validate phone number only when user finishes typing
    const phone = formData.phone;
    if (phone && phone.length !== 10) {
      setErrors(prev => ({ ...prev, phone: "Phone number must be 10 digits" }));
    } else if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

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

  const { updateProfile, loading, error } = useUpdateProfile();

  const handleProceed = async () => {
    setLoadingspin(true);
    
    // Validate all fields including phone
    const newErrors = {};
    if (!formData.fullName?.trim())
      newErrors.fullName = "Full name is required";
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoadingspin(false);
      return;
    }
    
    setIsSaving(true);

    const updates = {
      full_name: formData.fullName,
      ph_no: formData.phone,
      address: formData.address,
    };

    const result = await updateProfile(updates);
    if (result?.data?.updated) {
      // Profile successfully updated - user is no longer new
      setIsNewUser(false);
      await setStoredIsNewUser(false);
      
      // Refresh user data from database
      await refreshUserDetails();

      onProfileUpdate?.();
      
      // Navigate to main app after successful save
      onProceed?.();
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
  ) => (
    <View style={styles.inputGroup}>
      <FontAwesome name={icon} size={18} color="#0097B3" style={styles.icon} />
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            errors[name] && styles.inputError,
            name === "phone" ? styles.phoneInput : null,
          ]}
          value={formData[name]}
          onChangeText={name === "phone" ? handlePhoneChange : (text) => handleInputChange(name, text)}
          onFocus={() => setHasInteracted(true)} // Mark interaction on focus
          onBlur={name === "phone" ? handlePhoneBlur : undefined}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#808080"
          editable={true} // Always editable
          maxLength={name === "phone" ? 10 : undefined}
          {...additionalProps}
        />
        {hasInteracted && errors[name] && (
          <Text style={styles.errorText}>{errors[name]}</Text>
        )}
      </View>
    </View>
  );

  if (loadingspin) return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F9FAFB",
    }}>
      <ActivityIndicator size="large" color="#2CA6A4" />
      <Text style={{
        marginTop: 12,
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
      }}>
        Saving Profile...
      </Text>
      
    </View>
  );

  return (
    <View style={styles.container}>
      <ConfirmModal visible={modal.visible} title={modal.title} message={modal.message} onRequestClose={() => setModal({ visible: false })} />
      <View style={styles.formContainer}>
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderInputField("fullName", "user", "Full Name")}
        {renderInputField("phone", "phone", "Phone Number", "phone-pad")}
        {renderInputField("address", "map-marker", "Address", "default", { multiline: true, numberOfLines: 3 })}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.proceedButton, isSaving && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={isSaving}
        >
          <Text style={styles.proceedButtonText}>
            {isSaving ? "Saving..." : "Continue to App"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    marginTop: 10,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    minHeight: 40,
  },
  phoneInput: {
    backgroundColor: "#ffffff", // Normal background for phone field
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginTop: 4,
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  proceedButton: {
    backgroundColor: "#3898B3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3898B3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonDisabled: {
    backgroundColor: "#9fc7c4",
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default StandaloneProfileForm;