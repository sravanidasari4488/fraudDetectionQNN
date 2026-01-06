import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useBookings } from "../../context/bookingsContext";
import earningsService from "../../services/earnings";
import Text from '../ui/Text';

const formatAmount = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace('₹', '').replace(',', '')) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export default function Data({ userStats, isLoading }) {
  const { user, userData } = useAuth();
  const { inProgressBookings, completedBookings, refreshAllBookings, loading: bookingsLoading } = useBookings();
  const router = useRouter();
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [earningsData, setEarningsData] = useState({ totalEarned: 0, wallet: 0, withdrawn: 0 });
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(userData?.blocked_status ?? false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  
  // Refresh bookings when component mounts and when user focuses on home tab
  useFocusEffect(
    useCallback(() => {
      refreshAllBookings();
      loadEarningsData();
    }, [])
  );
  
  // Load earnings data from Supabase
  const loadEarningsData = async () => {
    if (!user?.id) return;
    
    try {
      setEarningsLoading(true);
      const earningsSummary = await earningsService.getEarningsSummary(user.id);
      setEarningsData({
        totalEarned: earningsSummary.totalEarned || 0,
        wallet: earningsSummary.wallet || 0,
        withdrawn: earningsSummary.withdrawn || 0
      });
    } catch (error) {
      console.error('Error loading earnings data:', error);
      // Keep default values if loading fails
    } finally {
      setEarningsLoading(false);
    }
  };
  
  // Sync isActive with user.isActive
  useEffect(() => {
    if (user?.isActive !== undefined) {
      setIsActive(user.isActive);
    }
  }, [user?.isActive]);

  // Sync blocked status with userData
  useEffect(() => {
    if (userData?.blocked_status !== undefined) {
      setIsBlocked(userData.blocked_status);
    }
  }, [userData?.blocked_status]);

  // Show modal when user is blocked
  useEffect(() => {
    if (isBlocked && userData?.blocked_status === true) {
      setShowBlockedModal(true);
    }
  }, [isBlocked, userData?.blocked_status]);
  
  // Get user's primary category/niche - default to 'Electrician' if not available
  const userCategory = user?.services?.primaryCategory || user?.primaryCategory || 'Electrician';

  const handleToggleStatus = async (value) => {
    setIsActive(value);
    // TODO: Here you would make an API call to update the user's status
    // Example: await userService.updateStatus(value);
  };

  // WhatsApp contact function
  const openWhatsApp = () => {
    const phoneNumber = '+919121377419'; // Company WhatsApp number
    const userName = userData?.name || user?.email || 'TaskMaster User';
    const userId = userData?.id || user?.id || 'Unknown';
    
    const message = `Hello OnlyClick Support Team,

I am ${userName} (ID: ${userId}) and I need assistance regarding my account status.

${isBlocked ? 'My account appears to be blocked. Could you please help me understand why and what steps I need to take to resolve this?' : 'I have some queries about my account.'}

Thank you for your support.`;

    // Try multiple WhatsApp URL formats
    const whatsappUrls = [
      `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
    ];

    const tryOpenWhatsApp = async (urlIndex = 0) => {
      if (urlIndex >= whatsappUrls.length) {
        Alert.alert(
          'Unable to Open WhatsApp',
          'Please make sure WhatsApp is installed on your device or contact us at +91 9121377419',
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
        return;
      }

      try {
        const url = whatsappUrls[urlIndex];
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
        } else {
          tryOpenWhatsApp(urlIndex + 1);
        }
      } catch (error) {
        tryOpenWhatsApp(urlIndex + 1);
      }
    };

    tryOpenWhatsApp();
  };
  const styles = StyleSheet.create({
    container: {
      top: 15,
      height: "100%",
      width: "100%",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    loadingContainer: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    servicesButton: {
      backgroundColor: "#fff",
      marginTop: 20,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: "#4ab9cf",
    },
    servicesButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    servicesButtonText: {
      flex: 1,
      marginLeft: 12,
    },
    servicesButtonTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 2,
    },
    servicesButtonSubtitle: {
      fontSize: 13,
      color: "#666",
    },
    statusToggleContainer: {
      backgroundColor: "#fff",
      marginTop: 20,
      borderRadius: 12,
      padding: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderLeftWidth: 4,
    },
    statusToggleContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusInfo: {
      flex: 1,
    },
    statusTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: "#333",
      marginBottom: 4,
    },
    statusSubtitle: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
    },
    accountStatusContainer: {
      backgroundColor: "#fff",
      marginTop: 20,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    statusIndicator: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    blockedStatus: {
      backgroundColor: "#FFEBEE",
    },
    activeStatus: {
      backgroundColor: "#E8F5E8",
    },
    blockedText: {
      color: "#D32F2F",
    },
    activeText: {
      color: "#388E3C",
    },
    contactButton: {
      backgroundColor: "#25D366",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    contactButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 25,
      margin: 20,
      maxWidth: 350,
      width: "90%",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
    },
    modalHeader: {
      alignItems: "center",
      marginBottom: 20,
    },
    modalIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#FFEBEE",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#D32F2F",
      textAlign: "center",
    },
    modalMessage: {
      fontSize: 15,
      color: "#666",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 25,
    },
    modalButtons: {
      gap: 12,
    },
    modalButton: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    primaryButton: {
      backgroundColor: "#25D366",
    },
    secondaryButton: {
      backgroundColor: "#f5f5f5",
      borderWidth: 1,
      borderColor: "#ddd",
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    secondaryButtonText: {
      color: "#333",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  // Default values with real data integration
  const totalEarnings = earningsData.totalEarned || 0;
  const jobsFinished = completedBookings?.length || 0; // Completed jobs from context
  const totalRequests = userStats?.totalBookings || 0;
  const totalAssigned = inProgressBookings?.length || 0; // Pending jobs from context

  const data = [
    {
      number: jobsFinished,
      text: "Jobs Finished",
      bgColor: "#3ea2bb",
      textColor: "white",
    },
    {
      number: totalAssigned,
      text: "Total Assigned",
      bgColor: "#3ea2bb",
      textColor: "white",
    },
  ];

  // Get recent bookings from context (completed and in-progress only)
  const allBookings = [...(completedBookings || []), ...(inProgressBookings || [])];
  const sortedBookings = allBookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const recentBookings = sortedBookings.slice(0, 3);

  if (isLoading || bookingsLoading || earningsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ab9cf" />
          <Text style={{ marginTop: 10, color: "#666" }}>Loading statistics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "#F1C40F",
          borderRadius: 15,
          paddingVertical: 15,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
          Total Earnings
        </Text>
        <Text
          style={{
            backgroundColor: "white",
            color: "#1e1e1e",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            fontWeight: "500",
          }}
        >
          {formatAmount(totalEarnings)}
        </Text>
      </View>

      {/* Account Status Section - Only show when blocked */}
      {isBlocked && (
        <View style={styles.accountStatusContainer}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, styles.blockedStatus]}>
              <Ionicons 
                name="close-circle" 
                size={16} 
                color="#D32F2F" 
              />
              <Text style={[styles.statusText, styles.blockedText]}>
                Blocked
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={openWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            fontSize: 13,
            color: "#D32F2F",
            marginTop: 8,
            fontStyle: "italic",
            lineHeight: 18,
          }}>
            Your account is currently blocked. Please contact our support team for assistance.
          </Text>
        </View>
      )}

      {/* Worker Status Toggle */}
      {/* <View 
        style={[
          styles.statusToggleContainer, 
          { borderLeftColor: isActive ? "#4CAF50" : "#FF5722" }
        ]}
      >
        <View style={styles.statusToggleContent}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              Work Status: {isActive ? "Active" : "Inactive"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isActive 
                ? "You're available for new jobs" 
                : "You won't receive new job requests"
              }
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={handleToggleStatus}
            trackColor={{ false: "#FF5722", true: "#4CAF50" }}
            thumbColor={isActive ? "#fff" : "#fff"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View> */}

      {/* View Services Button */}
      {/* <TouchableOpacity 
        style={styles.servicesButton}
        onPress={() => router.push('/(app)/protected/Services')}
      >
        <View style={styles.servicesButtonContent}>
          <Ionicons name="construct" size={24} color="#4ab9cf" />
          <View style={styles.servicesButtonText}>
            <Text style={styles.servicesButtonTitle}>View My Services</Text>
            <Text style={styles.servicesButtonSubtitle}>
              See {userCategory} services & pricing
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4ab9cf" />
        </View>
      </TouchableOpacity> */}

      <View
        style={{
          flexDirection: "row",
          top: 30,
          justifyContent: "space-around",
          gap: 10,
        }}
      >
        {data.map((item, index) => {
          return (
            <View key={index} style={{ alignItems: "center" }}>
              <View
                style={{
                  height: 80,
                  width: 80,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 40,
                  backgroundColor: item.bgColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: item.textColor,
                  }}
                >
                  {item.number}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "400",
                  top: 10,
                  textAlign: "center",
                }}
              >
                {item.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Recent Bookings Section */}
      {recentBookings && recentBookings.length > 0 && (
        <View style={{ top: 50, marginBottom: 150 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 15 }}>
            Recent Bookings
          </Text>
          {recentBookings.slice(0, 3).map((booking, index) => {
            // Check if booking is in completedBookings array to determine status
            const isCompleted = completedBookings?.some(job => job._id === booking._id);
            const statusColor = isCompleted ? '#4CAF50' : '#FFC107';
            const statusBgColor = isCompleted ? '#E8F5E8' : '#FFF8E1';
            const statusText = isCompleted ? 'Completed' : 'In Progress';
            
            return (
              <View
                key={booking._id || index}
                style={{
                  backgroundColor: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: statusColor,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600", color: "#333", flex: 1, marginRight: 10 }}>
                    {booking.serviceName || booking.serviceType || "Service"}
                  </Text>
                  <View style={{
                    backgroundColor: statusBgColor,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ 
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: "600",
                    }}>
                      {statusText}
                    </Text>
                  </View>
                </View>
                
                <Text style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>
                  {new Date(booking.createdAt).toLocaleDateString()}
                </Text>
                
                {(booking.payment || booking.amount) && (
                  <Text style={{ color: "#4ab9cf", fontSize: 13, fontWeight: "600" }}>
                    {formatAmount(booking.payment || booking.amount)}
                  </Text>
                )}
                
                {booking.customerName && (
                  <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>
                    Customer: {booking.customerName}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Service List Modal */}
  {/* ServiceListModal is kept in the repo for backward compatibility but navigation now opens the full screen Services page */}
      
      {/* Blocked Account Modal */}
      <Modal
        visible={showBlockedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBlockedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="close-circle" size={40} color="#D32F2F" />
              </View>
              <Text style={styles.modalTitle}>Account Blocked</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Your account has been temporarily blocked. Please contact our support team to understand the reason and get assistance with resolving this issue.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.primaryButton]}
                onPress={() => {
                  setShowBlockedModal(false);
                  openWhatsApp();
                }}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Contact Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setShowBlockedModal(false)}
              >
                <Text style={styles.secondaryButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
