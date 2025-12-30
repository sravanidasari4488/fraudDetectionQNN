import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import AppHeader from '../../../../../components/common/AppHeader';
import Text from "../../../../../components/ui/Text";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GroupBookingDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [group, setGroup] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    try {
      if (params.groupData && params.bookingsData) {
        const groupData = JSON.parse(params.groupData);
        const bookingsData = JSON.parse(params.bookingsData);
        
        setGroup(groupData);
        setBookings(bookingsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error parsing group data:', error);
      setLoading(false);
    }
  }, [params.groupData, params.bookingsData]); // More specific dependencies

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FFA500';
      case 'Accepted': return '#4CAF50';
      case 'Completed': return '#2196F3';
      case 'Cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'time-outline';
      case 'Accepted': return 'checkmark-circle-outline';
      case 'Completed': return 'checkmark-done-circle';
      case 'Cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
      return timeString;
    }
    
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const minute = minutes || '00';
    
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minute} ${ampm}`;
  };

  const handleCancelBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCancelModal(false);
    setSelectedBooking(null);
  }, []);

  const confirmCancellation = useCallback(() => {
    if (selectedBooking) {
      const message = `I want to cancel my booking:\n\nBooking ID: ${selectedBooking.bookingId}\nService: ${selectedBooking.service_name}\nDate: ${formatDate(selectedBooking.date)}\nTime: ${formatTime(selectedBooking.time)}\nAmount: ₹${selectedBooking.price.toFixed(2)}\n\nPlease process the cancellation.`;
      
      const phoneNumber = '+919121377419';
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      
      Linking.openURL(whatsappUrl).catch(() => {
        const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        Linking.openURL(webUrl);
      });
    }
    handleCloseModal();
  }, [selectedBooking, handleCloseModal]);

  const CancelModal = () => (
    <Modal visible={showCancelModal} transparent animationType="fade">
      <View style={styles.cancelModalOverlay}>
        <View style={styles.cancelModalContainer}>
          <View style={styles.cancelIconContainer}>
            <Ionicons name="warning" size={64} color="#F44336" />
          </View>
          
          <Text style={styles.cancelModalTitle}>Cancel Booking?</Text>
          
          <Text style={styles.cancelModalMessage}>
            Are you sure you want to cancel this booking? This will send a cancellation request to our support team via WhatsApp.
          </Text>
          
          {selectedBooking && (
            <View style={styles.cancelBookingSummary}>
              <Text style={styles.cancelSummaryTitle}>Booking Details:</Text>
              <Text style={styles.cancelSummaryText}>ID: {selectedBooking.bookingId}</Text>
              <Text style={styles.cancelSummaryText}>Service: {selectedBooking.service_name}</Text>
              <Text style={styles.cancelSummaryText}>Date: {formatDate(selectedBooking.date)}</Text>
              <Text style={styles.cancelSummaryText}>Time: {formatTime(selectedBooking.time)}</Text>
              <Text style={styles.cancelSummaryText}>Amount: ₹{selectedBooking.price.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.cancelModalButtons}>
            <TouchableOpacity 
              style={styles.cancelModalButtonSecondary}
              onPress={handleCloseModal}
            >
              <Text style={styles.cancelModalButtonSecondaryText}>Keep Booking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelModalButtonPrimary}
              onPress={confirmCancellation}
            >
              <View style={styles.whatsappButtonContent}>
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text style={styles.cancelModalButtonPrimaryText}>Send to WhatsApp</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Booking Details"
          showBack
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3898B3" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (!group || !bookings) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Booking Details"
          showBack
          onBack={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Error Loading Details</Text>
          <Text style={styles.errorMessage}>Unable to load booking details</Text>
        </View>
      </View>
    );
  }

  const totalAmount = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalTMShare = bookings.reduce((sum, booking) => sum + (parseFloat(booking.tm_share) || 0), 0);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Booking Details"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.groupTitle}>
              {group.category.charAt(0).toUpperCase() + group.category.slice(1)} Services
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(group.status) }]}>
              <Ionicons name={getStatusIcon(group.status)} size={14} color="white" />
              <Text style={styles.statusText}>{group.status}</Text>
            </View>
          </View>
          <Text style={styles.serviceCount}>{bookings.length} service{bookings.length > 1 ? 's' : ''}</Text>
        </View>

        {/* Booking Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#3898B3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDate(group.date)} at {formatTime(group.time)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#3898B3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{group.location}</Text>
            </View>
          </View>

          {group.status !== 'Pending' && group.provider && (
            <View style={styles.infoRow}>
              <Ionicons name="construct-outline" size={20} color="#3898B3" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Service Provider</Text>
                <Text style={styles.infoValue}>{group.provider}</Text>
                {group.contact && (
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => Linking.openURL(`tel:${group.contact}`)}
                  >
                    <Ionicons name="call" size={16} color="#4CAF50" />
                    <Text style={styles.contactText}>{group.contact}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {(group.status === 'Accepted' || group.status === 'Completed') && group.otp && (
            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={20} color="#3898B3" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Service OTP</Text>
                <View style={styles.otpContainer}>
                  <Text style={styles.otpValue}>{group.otp}</Text>
                  <Text style={styles.otpNote}>Share this OTP with the service provider</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Services List */}
        <View style={styles.servicesCard}>
          <Text style={styles.sectionTitle}>Services Booked</Text>
          
          {bookings.map((booking, index) => (
            <View key={booking.id} style={[styles.serviceItem, index !== bookings.length - 1 && styles.serviceItemBorder]}>
              <View style={styles.serviceItemHeader}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceItemName}>{booking.service_name}</Text>
                  <Text style={styles.serviceItemId}>Booking ID: {booking.bookingId}</Text>
                  <Text style={styles.serviceItemDescription}>{booking.description}</Text>
                  {booking.count > 1 && (
                    <Text style={styles.serviceItemQty}>Quantity: {booking.count}</Text>
                  )}
                  
                </View>
                <View style={styles.serviceItemRight}>
                  <Text style={styles.serviceItemPrice}>₹{booking.price.toFixed(2)}</Text>
                  {booking.count > 1 && (
                    <Text style={styles.serviceItemUnitPrice}>₹{booking.priceOfOne.toFixed(2)} each</Text>
                  )}
                </View>
              </View>
              
              {/* Individual Cancel Button */}
              {(group.status === 'Pending' || group.status === 'Accepted') && (
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => handleCancelBooking(booking)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#F44336" />
                  <Text style={styles.cancelButtonText}>Cancel This Service</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Payment Information */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>{group.paymentMethod}</Text>
          </View>

          {group.razorpay_oid !== "Pay after service " && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment ID</Text>
              <Text style={styles.paymentValueId}>{group.razorpay_oid}</Text>
            </View>
          )}

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          {group.paymentMethod && group.paymentMethod.toLowerCase().includes('pay on service') && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Pay to Provider</Text>
              <Text style={styles.providerAmount}>₹{totalTMShare.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Service Notes */}
        {bookings[0]?.serviceNotes && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Service Notes</Text>
            <Text style={styles.notesText}>{bookings[0].serviceNotes}</Text>
          </View>
        )}
      </ScrollView>

      <CancelModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  groupHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  serviceCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  otpContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  otpValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  otpNote: {
    fontSize: 12,
    color: '#666',
  },
  servicesCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceItem: {
    paddingVertical: 16,
  },
  serviceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  serviceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  serviceItemId: {
    fontSize: 12,
    color: '#3898B3',
    fontFamily: 'monospace',
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  serviceItemQty: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  serviceItemDuration: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  serviceItemRight: {
    alignItems: 'flex-end',
  },
  serviceItemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3898B3',
  },
  serviceItemUnitPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
    marginLeft: 4,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  paymentValueId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3898B3',
  },
  providerAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  notesCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3898B3',
  },
  // Cancel Modal Styles
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cancelModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  cancelModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  cancelBookingSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  cancelSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3898B3',
    marginBottom: 8,
  },
  cancelSummaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  cancelModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelModalButtonSecondary: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelModalButtonPrimary: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelModalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});