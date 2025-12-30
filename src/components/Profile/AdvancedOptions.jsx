import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { deleteUser } from '../../app/api/delete.js';
import Text from "../../components/ui/Text";
import { useAppStates } from '../../context/AppStates';
import { useAuth } from '../../context/AuthProvider';
import ConfirmModal from "../common/ConfirmModal";

const screenWidth = Dimensions.get("window").width;

const AdvancedOptions = () => {
  const { setUser, setIsLoggedIn } = useAuth();
  const {  
    setIsProfileCompleted, 
    setSelectedLocation, 
    setSelectedLocationObject, 
    setSelectedMobileNumber 
  } = useAppStates();
  const [confirm, setConfirm] = useState({ visible: false, title: null, message: null, buttons: null });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
  });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleDeleteAccount = async () => {
    setConfirm({
      visible: true,
      title: 'Delete account',
      message: 'This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete user account and clear all app state
              const data = await deleteUser();
              
              // Reset all app states to default values
              setUser(null);
              setIsLoggedIn(false);
             
              setIsProfileCompleted(false);
              setSelectedLocation("Tap to set location");
              setSelectedLocationObject({});
              setSelectedMobileNumber("");
              
              // Navigate to intro/onboarding
              router.replace('/auth/sign-in');
              
            } catch (error) {
              setConfirm({ 
                visible: true, 
                title: 'Error', 
                message: 'Failed to delete account. Please check your internet connection and try again.' 
              });
            }
          },
        },
      ],
    });
  };





  // const handleSaveBankDetails = () => {
  //   if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
  //     Alert.alert('Error', 'Please fill in all required bank details');
  //     return;
  //   }
  //   setIsEditingBank(false);
  //   Alert.alert('Success', 'Bank details saved successfully!');
  // };

  // const renderBankDetailsForm = () => (
  //   <View style={styles.bankForm}>
  //     <Text style={styles.formTitle}>Bank Account Details</Text>
  //     <TextInput
  //       style={styles.input}
  //       placeholder="Account Holder Name"
  //       value={bankDetails.accountHolderName}
  //       onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
  //     />
  //     <TextInput
  //       style={styles.input}
  //       placeholder="Bank Name"
  //       value={bankDetails.bankName}
  //       onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
  //     />
  //     <TextInput
  //       style={styles.input}
  //       placeholder="Account Number"
  //       value={bankDetails.accountNumber}
  //       onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
  //       keyboardType="number-pad"
  //     />
  //     <TextInput
  //       style={styles.input}
  //       placeholder="IFSC Code"
  //       value={bankDetails.ifscCode}
  //       onChangeText={(text) => setBankDetails(prev => ({ ...prev, ifscCode: text.toUpperCase() }))}
  //       autoCapitalize="characters"
  //       maxLength={11}
  //     />
  //     <View style={styles.formActions}>
  //       <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditingBank(false)}>
  //         <Text style={styles.cancelBtnText}>Cancel</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBankDetails}>
  //         <Text style={styles.saveBtnText}>Save</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ConfirmModal visible={confirm.visible} title={confirm.title} message={confirm.message} buttons={confirm.buttons} onRequestClose={() => setConfirm({ visible: false })} />
      {/* Bank Details Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Information</Text>
        {isEditingBank ? (
          renderBankDetailsForm()
        ) : (
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setIsEditingBank(true)}
          >
            <View style={styles.buttonContent}>
              <FontAwesome name="credit-card" size={18} color="#808080" style={styles.icon} />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Bank Details</Text>
                <Text style={styles.buttonSubtext}>
                  {bankDetails.accountNumber ? 'Account configured' : 'Add bank account'}
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#808080" />
          </TouchableOpacity>
        )}
      </View> */}

      {/* Other Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.push('/protected/(tabs)/Bookings')}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="history" size={18} color="#808080" style={styles.icon} />
            <Text style={styles.buttonText}>Booking History</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#808080" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="lock-closed" size={18} color="#808080" style={styles.icon} />
            <Text style={styles.buttonText}>Privacy Policy</Text>
          </View>
          <Ionicons
            name={showPrivacyPolicy ? "chevron-up" : "chevron-down"}
            size={16}
            color="#808080"
          />
        </TouchableOpacity>

        {showPrivacyPolicy && (
          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Terms of Service & Privacy Policy</Text>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>1. Terms of Service</Text>
              <Text style={styles.policyText}>
                Welcome to OnlyClick! By using our service, you agree to these terms. Our platform connects customers with professional service providers for various home and business services.
              </Text>
              <Text style={styles.policyText}>
                • You must be at least 18 years old to use our services{'\n'}
                • You agree to provide accurate and complete information{'\n'}
                • You are responsible for maintaining the confidentiality of your account{'\n'}
                • Service providers must deliver quality work as agreed upon
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>2. Privacy Policy</Text>
              <Text style={styles.policyText}>
                We are committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data.
              </Text>
              <Text style={styles.policyText}>
                • We collect information you provide directly to us{'\n'}
                • We use your data to provide and improve our services{'\n'}
                • We do not sell your personal information to third parties{'\n'}
                • Your payment information is encrypted and secure
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>3. Data Collection</Text>
              <Text style={styles.policyText}>
                We collect the following types of information:
              </Text>
              <Text style={styles.policyText}>
                • Personal information (name, email, phone, address){'\n'}
                • Service preferences and booking history{'\n'}
                • Payment information (processed securely){'\n'}
                • Device and usage information for app improvement
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>4. Data Usage</Text>
              <Text style={styles.policyText}>
                Your information is used to:
              </Text>
              <Text style={styles.policyText}>
                • Provide and personalize our services{'\n'}
                • Process payments and bookings{'\n'}
                • Communicate with you about your services{'\n'}
                • Improve our platform and customer experience{'\n'}
                • Comply with legal obligations
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>5. Data Security</Text>
              <Text style={styles.policyText}>
                We implement robust security measures to protect your data:
              </Text>
              <Text style={styles.policyText}>
                • SSL encryption for all data transmission{'\n'}
                • Secure payment processing{'\n'}
                • Regular security audits and updates{'\n'}
                • Limited access to personal data within our organization
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>6. Your Rights</Text>
              <Text style={styles.policyText}>
                You have the right to:
              </Text>
              <Text style={styles.policyText}>
                • Access and update your personal information{'\n'}
                • Request deletion of your data{'\n'}
                • Opt out of marketing communications{'\n'}
                • File a complaint regarding data usage
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.sectionHeader}>7. Contact Us</Text>
              <Text style={styles.policyText}>
                If you have any questions about these terms or our privacy practices, please contact us:
              </Text>
              <Text style={styles.contactInfo}>
                Email: onlyclick.connect@gmail.com{'\n'}
                Phone: +91 - 9121377419{'\n'}
                Address: Only Click Office, Vijayawada, Andhra Pradesh, India

              </Text>
            </View>

            <Text style={styles.lastUpdated}>Last updated: September 1, 2025</Text>
          </View>
        )}
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={[styles.optionButton, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="trash" size={18} color="#FF4D4F" style={styles.icon} />
            <Text style={[styles.buttonText, { color: '#FF4D4F' }]}>Delete Account</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#808080" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionButton: {
    width: screenWidth * 0.9,
    height: 66,
    borderWidth: 1,
    borderColor: '#8080805c',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  icon: {
    marginRight: 16,
  },
  deleteButton: {
    borderColor: '#FF4D4F',
  },

  // Bank Details Form Styles
  bankForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0097B3',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Privacy Policy Styles
  privacyContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  policySection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0097B3',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default AdvancedOptions;