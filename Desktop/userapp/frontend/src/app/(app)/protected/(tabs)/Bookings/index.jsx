import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import Text from "../../../../../components/ui/Text";

import AppHeader from '../../../../../components/common/AppHeader';

import getbookings from '../../../../../data/getdata/getbookings';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Bookings() {
  const router = useRouter();
  const { view } = useLocalSearchParams();
  const [bookings, setbookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];



  useEffect(() => {
    const getbookingsdata = async () => {
      const { arr, error } = await getbookings(); // ✅ use arr, not data
      if (error) {
        setLoading(false);
        return;
      }
      setbookings(arr); // ✅ directly set array
      setLoading(false);
    };

    getbookingsdata();
  }, []);


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

  const filteredBookings = useMemo(() => {
    const filtered = activeTab === 'All'
      ? [...bookings].sort((a, b) => {
          // Extract numeric part from booking ID (e.g., "BK0001" -> 1)
          const aId = parseInt(a.bookingId.replace(/\D/g, '')) || 0;
          const bId = parseInt(b.bookingId.replace(/\D/g, '')) || 0;
          return bId - aId; // Higher numbers first
        })
      : bookings.filter(booking => booking.status === activeTab).sort((a, b) => {
          // Extract numeric part from booking ID (e.g., "BK0001" -> 1)
          const aId = parseInt(a.bookingId.replace(/\D/g, '')) || 0;
          const bId = parseInt(b.bookingId.replace(/\D/g, '')) || 0;
          return bId - aId; // Higher numbers first
        });
    return filtered;
  }, [bookings, activeTab]);

  // Group bookings by cart UUID and category
  const groupedBookings = useMemo(() => {
    const groupBookings = (bookings) => {
      const grouped = {};
      
      bookings.forEach(booking => {
        const groupKey = `${booking.cart_uuid}_${booking.category}`;
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            groupKey,
            cart_uuid: booking.cart_uuid,
            otp: booking.otp,
            category: booking.category,
            date: booking.date,
            time: booking.time,
            location: booking.location,
            provider: booking.provider,
            status: booking.status,
            paymentMethod: booking.paymentMethod,
            razorpay_oid: booking.razorpay_oid,
            taskMaster: booking.taskMaster,
            contact: booking.contact || booking.Contact,
            bookings: []
          };
        }
        
        grouped[groupKey].bookings.push(booking);
      });
      
      return Object.values(grouped).sort((a, b) => {
        // Sort by the highest booking ID in each group
        const aMaxId = Math.max(...a.bookings.map(b => parseInt(b.bookingId.replace(/\D/g, '')) || 0));
        const bMaxId = Math.max(...b.bookings.map(b => parseInt(b.bookingId.replace(/\D/g, '')) || 0));
        return bMaxId - aMaxId;
      });
    };

    return groupBookings(filteredBookings);
  }, [filteredBookings]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // Handle different time formats
    if (!timeString) return '';
    
    // If it's already in AM/PM format, return as is
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
      return timeString;
    }
    
    // Parse time string (assuming format like "14:30" or "2:30")
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const minute = minutes || '00';
    
    // Convert to 12-hour format
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minute} ${ampm}`;
  };

  const renderTabButton = (tab, index) => {
    const isActive = activeTab === tab;

    return (
      <View key={tab} style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            isActive && styles.activeTabButton
          ]}
          onPress={() => setActiveTab(tab)}
          activeOpacity={1}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              isActive && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="My Bookings"
        showBack
        onBack={() => router.back()}
        rightElement={null}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 4 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab, index) => renderTabButton(tab, index))}
          </ScrollView>
        </View>

        {/* Bookings List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3898B3" />
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : groupedBookings.length > 0 ? (
            groupedBookings.map((group) => (
                <View
                  key={group.groupKey}
                  style={styles.bookingCard}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceTitleRow}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(group.status) }]} />
                        <Text style={styles.service_name}>{group.category.charAt(0).toUpperCase() + group.category.slice(1)} Services</Text>
                      </View>
                      <Text style={styles.serviceCount}>({group.bookings.length} service{group.bookings.length > 1 ? 's' : ''})</Text>
                      <View style={styles.bookingIdRow}>
                        <Text style={styles.razorpayOidText}>
                          {group.razorpay_oid !== "Pay after service " ? `Payment ID: ${group.razorpay_oid}` : `Payment Mode: ${group.razorpay_oid}`}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(group.status) }]}>
                      <Ionicons
                        name={getStatusIcon(group.status)}
                        size={14}
                        color="white"
                        style={styles.statusIcon}
                      />
                      <Text style={styles.statusText}>{group.status}</Text>
                    </View>
                  </View>

                  {/* Services List */}
                  <View style={styles.servicesListContainer}>
                    {group.bookings.map((booking, index) => (
                      <View key={booking.id} style={[styles.serviceItem, index !== group.bookings.length - 1 && styles.serviceItemBorder]}>
                        <View style={styles.serviceItemLeft}>
                          <Text style={styles.serviceItemName}>{booking.service_name}</Text>
                          <Text style={styles.serviceItemId}>ID: {booking.bookingId}</Text>
                          {booking.count > 1 && (
                            <Text style={styles.serviceItemQty}>Qty: {booking.count}</Text>
                          )}
                        </View>
                        <Text style={styles.serviceItemPrice}>₹{booking.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardBodyLeft}>
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{formatDate(group.date)} at {formatTime(group.time)}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.infoText} numberOfLines={1}>{group.location}</Text>
                      </View>

                      {/* Only show provider info if booking is not pending */}
                      {group.status !== 'Pending' && group.provider && (
                        <View style={styles.infoRow}>
                          <Ionicons name="construct-outline" size={16} color="#666" />
                          <Text style={styles.infoText}>{group.provider}</Text>
                        </View>
                      )}

                      {/* Show pending message for pending bookings */}
                      {group.status === 'Pending' && (
                        <View style={styles.infoRow}>
                          <Ionicons name="time-outline" size={16} color="#FFA500" />
                          <Text style={styles.infoText}>Provider will be assigned soon</Text>
                        </View>
                      )}

                      {/* Only show provider payment for Pay on Service */}
                      {(group.paymentMethod && 
                        (group.paymentMethod.toLowerCase().includes('pay on service'))) && (
                        <View style={styles.infoRow}>
                          <Ionicons name="wallet-outline" size={16} color="#4CAF50" />
                          <Text style={styles.providerPaymentText}>
                            Pay on Service: ₹{group.bookings.reduce((sum, booking) => sum + (parseFloat(booking.tm_share) || 0), 0).toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Show OTP on the right side for accepted and completed bookings */}
                    {(group.status === 'Accepted' || group.status === 'Completed') && group.otp && (
                      <View style={styles.otpContainer}>
                        <View style={styles.otpBadge}>
                          <Text style={styles.otpNumber}>{group.otp}</Text>
                        </View>
                        <Text style={styles.otpLabel}>OTP</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>₹{group.bookings.reduce((sum, booking) => sum + booking.price, 0).toFixed(2)}</Text>
                      <Text style={styles.countText}>Total for {group.bookings.length} service{group.bookings.length > 1 ? 's' : ''}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => {
                        // Navigate to group details page with all bookings data
                        router.push({
                          pathname: `/protected/(tabs)/Bookings/group`,
                          params: {
                            groupData: JSON.stringify(group),
                            bookingsData: JSON.stringify(group.bookings)
                          }
                        });
                      }}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#3898B3" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#DDD" />
                <Text style={styles.emptyTitle}>No bookings found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'All'
                    ? 'You haven\'t made any bookings yet'
                    : `No ${activeTab.toLowerCase()} bookings`}
                </Text>
              </View>
            )
}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80, // Adjusted for AppHeader height
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3898B3',
    paddingTop: screenHeight * 0.05, // Adjusted padding dynamically
    paddingBottom: screenHeight * 0.03, // Adjusted padding dynamically
    borderBottomLeftRadius: screenWidth * 0.08, // Dynamic radius
    borderBottomRightRadius: screenWidth * 0.08, // Dynamic radius
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance the back button
  },
  headerSubtitle: {
    // headerSubtitle removed - AppHeader has no subheading
  },
  filterButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  timelineDay: {
    marginBottom: 18,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timelineMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3898B3',
    marginRight: 12,
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 18, // Align with service title (statusDot width + margin)
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  servicesListContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 8,
    paddingBottom: 12,
  },
  serviceItemLeft: {
    flex: 1,
  },
  serviceItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  serviceItemId: {
    fontSize: 11,
    color: '#3898B3',
    fontFamily: 'monospace',
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceItemQty: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  serviceItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3898B3',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#3898B3',
    fontWeight: '600',
    marginRight: 6,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 15,
    marginTop: 10,
  },
  tabsContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  tabContainer: {
    marginRight: 12,
  },
  tabButton: {
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    width: 85,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#3898B3',
  },
  tabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Extra space at the bottom
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  service_name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bookingIdRow: {
    marginBottom: 6,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3898B3',
    fontFamily: 'monospace',
  },
  razorpayOidText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'monospace',
  },
  category: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardBodyLeft: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  providerPaymentText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  otpText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 15,
  },
  otpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  otpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 4,
  },
  otpNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000ff',
    marginLeft: 6,
  },
  otpLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3898B3',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3898B3',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});