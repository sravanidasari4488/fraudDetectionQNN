import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import { addOneInCart, removeAllFromCart, removeOneFromCart } from '../../app/api/cart';
import confirmBookings from '../../app/api/confirmbookings';
import { createRazorpayOrder } from '../../app/api/razoroay';
import { useAuth } from '../../context/AuthProvider';
import fetchCart from '../../data/getdata/getCart';
import ConfirmModal from '../common/ConfirmModal';
import Text from "../ui/Text";

export default function Cart() {
  const router = useRouter();
  const { userData } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Home - 123 Main Street, City');
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: null, message: null, buttons: null });

  // Real cart data state
  const [cartData, setCartData] = useState([]);
  const [rawcart, setRawcart] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Coupon related state
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [prebookingDiscount, setPrebookingDiscount] = useState(0);
  const [prebookingDiscountPercent, setPrebookingDiscountPercent] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Gesture handling for modal
  const modalY = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical gestures at the top of the modal
        return Math.abs(gestureState.dy) > 5 && gestureState.y0 < 100;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          modalY.setValue(gestureState.dy);
          modalOpacity.setValue(1 - gestureState.dy / 300);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Close modal with animation
          Animated.parallel([
            Animated.timing(modalY, {
              toValue: Dimensions.get('window').height,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowCancellationPolicy(false);
            setShowLocationModal(false);
            modalY.setValue(0);
            modalOpacity.setValue(1);
          });
        } else {
          // Reset position with animation
          Animated.parallel([
            Animated.timing(modalY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Reset if gesture is terminated
        Animated.parallel([
          Animated.timing(modalY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  // Function to fetch cart data from server
  const fetchCartData = async () => {
    try {
      const { serviceCharge, subTotal, onlinePaymentDiscount, onlineDiscountPercent, totalAmount, totalAmountWithOnlineDiscount, totalAmountPaise, totalAmountWithOnlineDiscountPaise, arr, rawCartData, prebookingDiscount, prebookingDiscountPercent, isCouponApplied: couponApplied } = await fetchCart(isCouponApplied);
      setSubTotal(subTotal);
      setServiceCharge(serviceCharge);
      setTotalAmount(totalAmount);
      setCartData(arr);
      setRawcart(rawCartData);
      // Set prebooking discount data
      setPrebookingDiscount(prebookingDiscount || 0);
      setPrebookingDiscountPercent(prebookingDiscountPercent || 0);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, [isCouponApplied]); // Refresh when coupon state changes

  // Coupon application functions
  const applyCoupon = async () => {
    if (couponCode.trim().toLowerCase() === "prebooking30") {
      setIsCouponApplied(true);
      setShowCouponInput(false);
      await fetchCartData(); // Refresh cart with coupon applied
      Toast.show({
        type: 'success',
        text1: 'Coupon Applied!',
        text2: '30% prebooking discount applied successfully',
        position: 'bottom',
        bottomOffset: 100,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Invalid Coupon',
        text2: 'Please enter a valid coupon code',
        position: 'bottom',
        bottomOffset: 100,
      });
    }
  };

  const removeCoupon = async () => {
    setIsCouponApplied(false);
    setCouponCode("");
    await fetchCartData(); // Refresh cart without coupon
    Toast.show({
      type: 'info',
      text1: 'Coupon Removed',
      text2: 'Prebooking discount has been removed',
      position: 'bottom',
      bottomOffset: 100,
    });
  };

  const calculateCategoryTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateGrandTotal = () => {
    return cartData.reduce((total, category) => total + calculateCategoryTotal(category.items), 0);
  };

  const handleQuantityChange = async (categoryIndex, itemIndex, change) => {
    const item = cartData[categoryIndex]?.items[itemIndex];
    if (!item) return;

    try {
      if (change > 0) {
        await addOneInCart(item.service_id);
      } else {
        await removeOneFromCart(item.service_id);
      }
      await fetchCartData(); // Refresh cart after change
      Toast.show({
        type: 'success',
        text1: 'Cart Updated',
        text2: `Quantity ${change > 0 ? 'increased' : 'decreased'} for ${item.name}`,
        position: 'bottom',
        bottomOffset: 100,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update cart',
        position: 'bottom',
        bottomOffset: 100,
      });
    }
  };

  const handleRemoveItem = (categoryIndex, itemIndex) => {
    const item = cartData[categoryIndex]?.items[itemIndex];
    if (!item) return;

    setConfirmModal({
      visible: true,
      title: 'Remove Item',
      message: `Are you sure you want to remove ${item.name} from cart?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            try {
              await removeAllFromCart(item.service_id);
              await fetchCartData(); // Refresh cart after removal
              Toast.show({
                type: 'success',
                text1: 'Item Removed',
                text2: `${item.name} has been removed from cart`,
                position: 'bottom',
                bottomOffset: 100,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove item',
                position: 'bottom',
                bottomOffset: 100,
              });
            }
          }
        }
      ]
    });
  };

  const handleClearCart = () => {
    setConfirmModal({
      visible: true,
      title: 'Clear Cart',
      message: 'Are you sure you want to remove all items from cart?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive', onPress: () => {
          }
        }
      ]
    });
  };

  const handlePayment = async () => {
    if (!selectedLocation || selectedLocation === 'Tap to set location') {
      Toast.show({
        type: 'error',
        text1: 'Location Required',
        text2: 'Please select a service location',
        position: 'bottom',
        bottomOffset: 100,
      });
      return;
    }

    try {
      // 1. Create Order
      const order = await createRazorpayOrder(rawcart, totalAmount);
      if (order.error) {
        Toast.show({
          type: 'error',
          text1: 'Order Creation Failed',
          text2: 'Could not initiate payment',
          position: 'bottom',
          bottomOffset: 100,
        });
        return;
      }

      // 2. Open Razorpay
      const options = {
        description: 'Service Payment',
        image: 'https://onlyclick.in/logo.png', // Placeholder
        currency: 'INR',
        key: Constants.expoConfig.extra.expoPublicRazorPayKeyId,
        amount: order.amount,
        name: 'Only Click',
        order_id: order.id,
        prefill: {
          email: userData?.email || 'user@example.com',
          contact: userData?.phone || '',
          name: userData?.name || ''
        },
        theme: { color: '#3898B3' }
      };

      RazorpayCheckout.open(options).then(async (data) => {
        // 3. Confirm Booking
        const bookingPayload = {
          payment_id: data.razorpay_payment_id,
          order_id: data.razorpay_order_id,
          signature: data.razorpay_signature,
          cart: rawcart,
          address: selectedLocation,
          amount: totalAmount,
          coupon: isCouponApplied ? couponCode : null,
          discount: prebookingDiscount
        };

        const res = await confirmBookings(bookingPayload);

        if (res.error) {
          Toast.show({
            type: 'error',
            text1: 'Booking Failed',
            text2: res.error,
            position: 'bottom',
            bottomOffset: 100,
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Booking Confirmed!',
            text2: 'Your service has been booked successfully',
            position: 'bottom',
            bottomOffset: 100,
          });
          // Navigate to bookings or success page
          router.replace('/(app)/protected/(tabs)/Bookings');
        }
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: error.description || 'Payment was cancelled',
          position: 'bottom',
          bottomOffset: 100,
        });
      });

    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
        position: 'bottom',
        bottomOffset: 100,
      });
    }
  };

  const renderCartItem = (item, categoryIndex, itemIndex) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDuration}>{item.duration}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(categoryIndex, itemIndex, -1)}
          >
            <Ionicons name="remove" size={16} color="#3898B3" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(categoryIndex, itemIndex, 1)}
          >
            <Ionicons name="add" size={16} color="#3898B3" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(categoryIndex, itemIndex)}
        >
          <Ionicons name="trash-outline" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategorySection = (categoryData, categoryIndex) => (
    <View key={categoryData.category} style={styles.categorySection}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryData.category}</Text>
        <Text style={styles.categoryTotal}>₹{calculateCategoryTotal(categoryData.items)}</Text>
      </View>

      {/* Provider Info */}
      <View style={styles.providerCard}>
        <View style={styles.providerHeader}>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{categoryData.provider.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{categoryData.provider.rating}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={16} color="#3898B3" />
          </TouchableOpacity>
        </View>

        {/* OTP Details */}
        <View style={styles.otpContainer}>
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>Start OTP</Text>
            <Text style={styles.otpCode}>{categoryData.otpDetails.startOTP}</Text>
          </View>
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>End OTP</Text>
            <Text style={styles.otpCode}>{categoryData.otpDetails.endOTP}</Text>
          </View>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.itemsList}>
        {categoryData.items.map((item, itemIndex) =>
          renderCartItem(item, categoryIndex, itemIndex)
        )}
      </View>
    </View>
  );

  const LocationModal = () => (
    <Modal visible={showLocationModal} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Gesture Indicator Bar */}
          <TouchableOpacity
            style={styles.gestureIndicator}
            activeOpacity={1}
            onPress={() => { }} // Empty onPress to ensure touch area
          >
            <View style={styles.indicatorBar} />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Location</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationOption}>
            <Ionicons name="location" size={20} color="#3898B3" />
            <Text style={styles.locationText}>{selectedLocation}</Text>
          </View>

          <TouchableOpacity style={styles.changeLocationButton}>
            <Text style={styles.changeLocationText}>Change Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  const CancellationPolicyModal = () => (
    <Modal visible={showCancellationPolicy} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Gesture Indicator Bar */}
          <TouchableOpacity
            style={styles.gestureIndicator}
            activeOpacity={1}
            onPress={() => { }} // Empty onPress to ensure touch area
          >
            <View style={styles.indicatorBar} />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancellation Policy</Text>
            <TouchableOpacity onPress={() => setShowCancellationPolicy(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.policyContent}>
            <Text style={styles.policyIntro}>
              At Only Click, we strive to provide seamless and professional service at all times. However, we understand that sometimes cancellations are necessary. Our cancellation policy is designed to be fair to both our valued customers and our service providers.
            </Text>

            <Text style={styles.sectionTitle}>1. Cancellation by Customer</Text>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Free Cancellation:</Text> You can cancel your service appointment free of charge up to 2 hours before the scheduled service time.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Late Cancellations:</Text> If you cancel within 2 hours of the scheduled appointment, a cancellation fee of 50% of the total service fee will be charged. This helps us cover the costs incurred by the service provider's time and travel.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>No-Show:</Text> If you fail to be present at the scheduled appointment time or do not inform us of your cancellation in advance, a full cancellation fee (100% of the service cost) will apply.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Emergency Situations:</Text> In case of an emergency or unforeseen event (e.g., hospitalization, urgent personal matters), please inform us as soon as possible. We will assess each case on an individual basis and make necessary accommodations.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>2. Cancellation by Only Click or Service Provider</Text>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Service Provider Unavailability:</Text> If a service provider is unable to attend to the scheduled task due to personal reasons, bad weather, or any other unforeseeable situation, Only Click will promptly inform you and offer an alternative time slot or a different provider, subject to availability.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.boldText}>Right to Cancel:</Text>
              <Text style={styles.policyText}> Only Click reserves the right to cancel or reschedule the service if the provider cannot reach the location due to unforeseen circumstances like traffic, roadblocks, etc., after prior communication with the customer.</Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Refunds:</Text> In case the service is canceled by us or the service provider, full refunds will be issued to the customer within 7 working days.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>3. How to Cancel</Text>
            <Text style={styles.policyText}>
              You can cancel your appointment via the Only Click app, or by calling our customer support team at <Text style={styles.contactText}>+91-9121377419</Text> or emailing <Text style={styles.contactText}>onlyclick.connect@gmail.com</Text>.
            </Text>
            <Text style={styles.policyText}>
              For cancellations made via customer support, please provide your booking details, including the service type, provider name, and scheduled time.
            </Text>

            <Text style={styles.sectionTitle}>4. Refunds</Text>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>Refunds for cancellations made before the 2-hour cutoff will be processed immediately.</Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>For late cancellations or no-shows, refunds will not be applicable, and the cancellation fee will be charged.</Text>
            </View>

            <Text style={styles.sectionTitle}>5. Special Cases</Text>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Bulk Bookings & B2B Services:</Text> For bulk bookings (gated communities, commercial spaces, etc.), cancellations must be made at least 48 hours prior to the scheduled service, failing which a 20% cancellation fee will be applied.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.policyText}>
                <Text style={styles.boldText}>Holiday/Peak Time Bookings:</Text> During high-demand periods (holidays, special events, etc.), a higher cancellation fee may be applicable due to increased demand and scheduling complexity.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>6. Customer Support</Text>
            <Text style={styles.policyText}>
              For any questions or concerns about the cancellation policy or if you require assistance with rescheduling, please contact our customer support team via the app or at <Text style={styles.contactText}>+91-9121377419</Text>.
            </Text>

            <Text style={styles.policyFooter}>
              By placing a booking, you agree to adhere to this cancellation policy. We appreciate your understanding and cooperation.
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setShowCancellationPolicy(false)}
          >
            <Text style={styles.confirmButtonText}>I Understand</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ConfirmModal visible={confirmModal.visible} title={confirmModal.title} message={confirmModal.message} buttons={confirmModal.buttons} onRequestClose={() => setConfirmModal({ visible: false })} />
      <StatusBar hidden={true} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCart}
            >
              <MaterialIcons name="clear-all" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Review your selected services</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Location Confirmation */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => setShowLocationModal(true)}
        >
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#3898B3" />
            <Text style={styles.locationTitle}>Service Location</Text>
          </View>
          <Text style={styles.locationAddress}>{selectedLocation}</Text>
          <Text style={styles.changeLocationLink}>Tap to change</Text>
        </TouchableOpacity>

        {/* Cart Categories */}
        {cartData.map((categoryData, index) =>
          renderCategorySection(categoryData, index)
        )}

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryAmount}>₹{subTotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryAmount}>₹{serviceCharge}</Text>
          </View>

          {/* Prebooking Discount Display */}
          {isCouponApplied && prebookingDiscount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.billLabelWithIcon}>
                <Text style={styles.summaryLabel}>Prebooking Discount ({prebookingDiscountPercent}%)</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>SAVE</Text>
                </View>
              </View>
              <Text style={[styles.summaryAmount, styles.discountAmount]}>-₹{prebookingDiscount}</Text>
            </View>
          )}

          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* Coupon Code Section */}
        <View style={styles.couponCard}>
          <Text style={styles.couponTitle}>Have a Coupon Code?</Text>

          {/* Promotional Message */}
          <View style={styles.promoContainer}>
            <View style={styles.promoIconContainer}>
              <Ionicons name="gift-outline" size={18} color="#FF6B35" />
            </View>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoText}>
                Apply coupon code <Text style={styles.promoCode}>PREBOOKING30</Text> to get
                <Text style={styles.promoDiscount}> 30% discount</Text> on payment
              </Text>
            </View>
          </View>

          {!isCouponApplied ? (
            <View>
              {!showCouponInput ? (
                <TouchableOpacity
                  style={styles.applyCouponButton}
                  onPress={() => setShowCouponInput(true)}
                >
                  <Ionicons name="pricetag-outline" size={16} color="#3898B3" />
                  <Text style={styles.applyCouponText}>Apply Coupon Code</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.couponInputContainer}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code (e.g., PREBOOKING30)"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyCoupon}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowCouponInput(false);
                      setCouponCode("");
                    }}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.couponAppliedContainer}>
              <View style={styles.couponAppliedRow}>
                <View style={styles.couponAppliedInfo}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.couponAppliedText}>PREBOOKING30 applied</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeCouponButton}
                  onPress={removeCoupon}
                >
                  <Text style={styles.removeCouponText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Cancellation Policy */}
        <TouchableOpacity
          style={styles.policyCard}
          onPress={() => setShowCancellationPolicy(true)}
        >
          <MaterialIcons name="policy" size={20} color="#3898B3" />
          <Text style={styles.policyTitle}>Cancellation Policy</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalAmount}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity style={styles.proceedButton} onPress={handlePayment}>
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>

      <LocationModal />
      <CancellationPolicyModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3898B3',
    paddingTop: 45,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    marginRight: 40, // Balance the clear button
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F4F8',
    opacity: 0.9,
  },
  clearButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  changeLocationLink: {
    fontSize: 14,
    color: '#3898B3',
    fontWeight: '500',
  },
  categorySection: {
    marginVertical: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3898B3',
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  callButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#E6F5F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  otpBox: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    minWidth: 80,
  },
  otpLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  otpCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3898B3',
  },
  itemsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemDuration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3898B3',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 15,
  },
  removeButton: {
    padding: 5,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3898B3',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  policyTitle: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  bottomTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  proceedButton: {
    backgroundColor: '#3898B3',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 15,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%', // Increased from 80%
    minHeight: '70%',
  },
  gestureIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 10,
  },
  indicatorBar: {
    width: 50,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  changeLocationButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  changeLocationText: {
    fontSize: 14,
    color: '#3898B3',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#3898B3',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  policyContent: {
    maxHeight: 400, // Increased from 200
    marginBottom: 20,
  },
  policyIntro: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3898B3',
    marginTop: 15,
    marginBottom: 10,
  },
  policyItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 5,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#3898B3',
    marginRight: 8,
    marginTop: 2,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  contactText: {
    color: '#3898B3',
    textDecorationLine: 'underline',
  },
  policyFooter: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Coupon Styles
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  applyCouponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3898B3',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FFFE',
  },
  applyCouponText: {
    color: '#3898B3',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  couponInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },
  applyButton: {
    backgroundColor: '#3898B3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
    marginLeft: 4,
  },
  couponAppliedContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  couponAppliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponAppliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponAppliedText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeCouponButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  removeCouponText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  billLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountAmount: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Promo message styles
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  promoIconContainer: {
    marginRight: 10,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  promoCode: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B35',
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  promoDiscount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
