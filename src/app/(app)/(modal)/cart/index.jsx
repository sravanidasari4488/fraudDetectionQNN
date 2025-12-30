import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';

import Constants from 'expo-constants';
import CartPageBottomBar from '../../../../components/common/CartPageBottomBar';
import Text from "../../../../components/ui/Text.jsx";
import { useAppStates } from '../../../../context/AppStates';
import { useAuth } from '../../../../context/AuthProvider.jsx';


import AppHeader from '../../../../components/common/AppHeader';
import fetchCart from '../../../../data/getdata/getCart';
import { addOneInCart, removeAllFromCart, removeOneFromCart } from '../../../api/cart';
import confirmbookings from '../../../api/confirmbookings.js';
import { confirmRazorpayPayment, createRazorpayOrder } from '../../../api/razoroay.js';
import { getAvailableSlots } from '../../../api/availability.js';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
export default function Cart() {
  const router = useRouter();
  const {userData} = useAuth()

  const { selectedLocation, updateSelectedLocation, selectedMobileNumber, updateSelectedMobileNumber, selectedLocationObject, updateSelectedLocationObject } = useAppStates();

  // Helper function to format mobile number safely
  const formatMobileNumber = (number) => {
    if (!number || typeof number !== 'string' || number.length < 10) {
      return "Tap to set mobile number";
    }
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  };

  // Helper function to format location object for display
  const formatLocationDisplay = (locationObj) => {
    if (!locationObj || Object.keys(locationObj).length === 0) {
      return "Tap to set location";
    }

    // Extract and format location parts in proper order
    const parts = [];
    if (locationObj.houseNumber) parts.push(locationObj.houseNumber);
    if (locationObj.district) parts.push(locationObj.district);
    if (locationObj.city) parts.push(locationObj.city);
    if (locationObj.pincode) parts.push(locationObj.pincode);
    if (locationObj.additionalInfo) parts.push(locationObj.additionalInfo);

    return parts.length > 0 ? parts.join(', ') : "Tap to set location";
  };

  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showServiceFeeTooltip, setShowServiceFeeTooltip] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Online Payment');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateItem, setSelectedDateItem] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  // New pricing system state variables
  const [subTotal, setSubTotal] = useState(0);
  const [convenienceFee, setConvenienceFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalTMShare, setTotalTMShare] = useState(0);
  const [totalCompanyShare, setTotalCompanyShare] = useState(0);
  const [onlinePaymentDiscount, setOnlinePaymentDiscount] = useState(0);
  const [onlineDiscountPercent, setOnlineDiscountPercent] = useState(2);
  const [totalWithOnlineDiscount, setTotalWithOnlineDiscount] = useState(0);
  const [systemConfig, setSystemConfig] = useState({});
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  
  // Loading states
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // Coupon related state
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Minimal Custom Alert State
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'default', // 'success', 'error', 'default'
    title: '',
    message: '',
    buttons: []
  });

  const [mobileNumber, setMobileNumber] = useState("");
  const [location, setLocation] = useState({});

  const [paymentmethod, setPaymentmethod] = useState();

  // Minimal Alert Helper Functions
  const showCustomAlert = (title, message, buttons = [], type = 'default') => {
    setCustomAlert({ visible: true, type, title, message, buttons });
  };

  const hideCustomAlert = () => {
    setCustomAlert({ visible: false, type: 'default', title: '', message: '', buttons: [] });
  };


  // Gesture handling for modals
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
              toValue: screenHeight,
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
            setShowPaymentModal(false);
            setShowDateTimeModal(false);
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


  // Interactive kindness reminder
  const [hasClickedKindness, setHasClickedKindness] = useState(false);

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    if (showServiceFeeTooltip) {
      const timer = setTimeout(() => {

      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showServiceFeeTooltip]);

  const kindnessMessages = [
    "💧 Offer water to service providers",
    "☕ A cup of tea brightens their day",
    "🙏 Show gratitude for their service",
    "😊 A smile goes a long way",
    "🏠 Keep workspace clean for them"
  ];

  // Helper function to compare dates without time
  // This fixes the issue where selected dates weren't highlighting properly
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const [dates, setdates] = useState([])
  useEffect(() => {
    const generateDates = () => {
      const dates = [];
      
      // Check if current time is after 6 PM
      const now = new Date();
      const currentHour = now.getHours();
      const isAfter6PM = currentHour >= 18; // 18:00 = 6 PM in 24-hour format
      
      // Use prebooking date from backend or fall back to today
      let startDate;
      if (systemConfig.PREBOOKING_DATE) {
        const prebookingDate = new Date(systemConfig.PREBOOKING_DATE);
        const today = new Date();
        
        // Use the later of prebooking date or today
        startDate = prebookingDate > today ? prebookingDate : today;
      } else {
        startDate = new Date(); // Fallback to today if no prebooking date
      }
      
      // If it's after 6 PM today, start from tomorrow
      if (isAfter6PM && startDate.toDateString() === now.toDateString()) {
        startDate = new Date(now);
        startDate.setDate(now.getDate() + 1); // Move to tomorrow
      }
      
      // Generate 7 days starting from the determined start date
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrow = date.toDateString() === tomorrow.toDateString();
        
        dates.push({
          date: date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate().toString().padStart(2, '0'),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          isToday: isToday,
          isTomorrow: isTomorrow
        });
      }
      setdates(dates)
    };
    generateDates();
  }, [systemConfig.PREBOOKING_DATE]) // Regenerate dates when prebooking date changes

  const [timeSlots, setTimeSlots] = useState([]);

  // Fetch available time slots from server based on selected date, with polling for real-time updates
  useEffect(() => {
    let intervalId;
    const fetchSlots = async () => {
      try {
        if (!selectedDate) {
          setTimeSlots([]);
          return;
        }
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        const dateISO = `${y}-${m}-${d}`;
        const { data, error } = await getAvailableSlots(dateISO);
        if (!error && data?.data?.slots) {
          // Show all slots but mark unavailable ones visually (disabled state)
          setTimeSlots(data.data.slots);
        } else if (error) {
          console.warn('[Cart] Failed to fetch slots:', error);
          // Keep previous slots on error
        }
      } catch (err) {
        console.warn('[Cart] Error fetching slots:', err?.message || err);
        // Keep previous slots on error
      }
    };

    fetchSlots();
    // Poll every 60 seconds for real-time updates
    intervalId = setInterval(fetchSlots, 60000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedDate]);

  const handleKindnessClick = () => {
    setHasClickedKindness(!hasClickedKindness);
  };

  // Mock cart data grouped by category
  // const cartData = [
  //   {
  //     category: 'Plumbing',
  //     items: [
  //       {
  //         id: 1,
  //         name: 'Pipe Repair',
  //         price: 299,
  //         quantity: 1,
  //         duration: '1-2 hours'
  //       },
  //       {
  //         id: 2,
  //         name: 'Tap Installation',
  //         price: 150,
  //         quantity: 2,
  //         duration: '30 min each'
  //       }
  //     ]
  //   },
  //   {
  //     category: 'Electrical',
  //     provider: {
  //       name: 'PowerPro Electricians',
  //       rating: 4.9,
  //       phone: '+91 87654 32109'
  //     },
  //     items: [
  //       {
  //         id: 3,
  //         name: 'Switch Replacement',
  //         price: 199,
  //         quantity: 3,
  //         duration: '20 min each'
  //       }
  //     ]
  //   }
  // ];

  const [cartData, setCartData] = useState([])
  const [rawcart, setRawcart] = useState()

  // Function to fetch cart data from server
  const fetchCartData = async () => {
    // Use overlay loading for subsequent calls, initial loading for first call
    if (isInitialLoading) {
      // Keep isInitialLoading true until first load completes
    } else {
      setIsCartLoading(true);
    }
    
    
    try {
      const cartResponse = await fetchCart(isCouponApplied, isCouponApplied ? couponCode : null);
      
      if (cartResponse.error) {
        console.error("Error fetching cart:", cartResponse.error);
        return;
      }

      // Update state with new pricing system data
      setSubTotal(cartResponse.subTotal);
      setConvenienceFee(cartResponse.convenienceFee);
      setGrandTotal(cartResponse.grandTotal);
      setTotalTMShare(cartResponse.totalTMShare);
      setTotalCompanyShare(cartResponse.totalCompanyShare);
      setOnlinePaymentDiscount(cartResponse.onlinePaymentDiscount);
      setOnlineDiscountPercent(cartResponse.onlineDiscountPercent);
      setTotalWithOnlineDiscount(cartResponse.totalWithOnlineDiscount);
      setCouponDiscount(cartResponse.couponDiscount || 0);
      setCouponDiscountPercent(cartResponse.couponDiscountPercent || 0);
      setAvailableCoupons(cartResponse.availableCoupons || []);
      setSystemConfig(cartResponse.systemConfig || {});
      
      // Update cart display data and raw cart data
      setCartData(cartResponse.arr);
      setRawcart(cartResponse.rawCartData);
    } catch (error) {
      console.error("Error in fetchCartData:", error);
    } finally {
      setIsInitialLoading(false);
      setIsCartLoading(false);
    }

    // Only set mobile number from server if no mobile number is set in AppStates
    if (!selectedMobileNumber) {
      setMobileNumber(userData?.phone);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [])

  // Initial setup: set mobile number from AppStates if available
  useEffect(() => {
    if (selectedMobileNumber) {
      setMobileNumber(selectedMobileNumber);
    }
  }, []);

  // Refresh cart when coupon is applied or removed
  useEffect(() => {
    fetchCartData();
  }, [isCouponApplied]);

  // Listen for mobile number updates from AppStates context
  useEffect(() => {
    if (selectedMobileNumber) {
      setMobileNumber(selectedMobileNumber);
    }
  }, [selectedMobileNumber]);

  // Listen for location object updates from AppStates context
  useEffect(() => {
    if (selectedLocationObject && Object.keys(selectedLocationObject).length > 0) {
      setLocation(selectedLocationObject);
    }
  }, [selectedLocationObject]);



  // Add separate useEffect to log mobile number state changes
  useEffect(() => {
  }, [mobileNumber]);

  // Coupon application functions
  const applyCoupon = async () => {
    setCouponError(""); // Clear previous errors
    setIsApplyingCoupon(true);
    
    try {
      console.log('Applying coupon:', couponCode);
      console.log('Available coupons:', availableCoupons);
      
      // Check if the entered coupon code matches any available coupon
      const matchedCoupon = availableCoupons.find(
        coupon => coupon.code.toLowerCase() === couponCode.trim().toLowerCase()
      );
      
      console.log('Matched coupon:', matchedCoupon);
      
      if (matchedCoupon) {
        setIsCouponApplied(true);
        // fetchCartData will be called by useEffect automatically
        Toast.show({
          type: 'success',
          text1: 'Coupon Applied!',
          text2: `${matchedCoupon.discountPercent}% discount applied successfully`,
          position: 'bottom',
          bottomOffset: 100,
        });
      } else {
        setCouponError("Invalid coupon code. Please try again.");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    setIsCouponApplied(false);
    setCouponCode("");
    setCouponError("");
    // fetchCartData will be called by useEffect automatically
  };

  const calculateCategoryTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateGrandTotal = () => {
    return cartData.reduce((total, category) => total + calculateCategoryTotal(category.items), 0);
  };

  // New pricing system calculation functions
  /**
   * Get the amount user needs to pay online based on payment method
   */
  const getPayableAmount = () => {
    if (selectedPaymentMethod === 'Online Payment') {
      // For online payment: total amount minus online discount
      return totalWithOnlineDiscount;
    } else {
      // For pay on service: only company share (platform fees) paid online
      return totalCompanyShare;
    }
  };

  /**
   * Get the amount to be paid to service provider (only for pay on service)
   */
  const getServiceProviderAmount = () => {
    return totalTMShare;
  };

  /**
   * Calculate payment breakdown for display
   */
  const getPaymentBreakdown = () => {
    if (selectedPaymentMethod === 'Online Payment') {
      return {
        subtotal: subTotal,
        convenienceFee: convenienceFee,
        onlineDiscount: onlinePaymentDiscount,
        total: totalWithOnlineDiscount,
        showOnlineDiscount: true
      };
    } else {
      return {
        subtotal: subTotal,
        convenienceFee: convenienceFee,
        companyShare: totalCompanyShare,
        tmShare: totalTMShare,
        total: grandTotal,
        payOnlineNow: totalCompanyShare,
        payToProvider: totalTMShare,
        showOnlineDiscount: false
      };
    }
  };

  /**
   * Calculate TM and Company percentages for display
   */
  const getSharePercentages = () => {
    const total = totalTMShare + totalCompanyShare;
    if (total === 0) return { tmPercentage: 0, companyPercentage: 0 };
    
    return {
      tmPercentage: parseFloat(((totalTMShare / total) * 100).toFixed(1)),
      companyPercentage: parseFloat(((totalCompanyShare / total) * 100).toFixed(1))
    };
  };

  // Check if cart is empty or total is 0
  const isCartEmptyOrZero = () => {
    const totalItems = cartData.reduce((total, cat) => total + cat.items.length, 0);
    return totalItems === 0 || grandTotal === 0;
  };

  const handleQuantityChange = async (categoryIndex, itemIndex, change) => {
    const item = cartData[categoryIndex]?.items[itemIndex];
    if (!item) return;

    setUpdatingItemId(item.service_id);

    try {
      if (change > 0) {
        // Increase quantity
        const { data, error } = await addOneInCart(item.service_id);
        // Always refetch cart data to get updated quantities
        await fetchCartData();
        
        // Only show error if cart data didn't update properly
        if (error) {
          throw error;
        }
      } else if (change < 0) {
        // Decrease quantity
        const { data, error } = await removeOneFromCart(item.service_id);
        // Always refetch cart data to get updated quantities
        await fetchCartData();
        
        // Only show error if cart data didn't update properly
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Always refetch cart data even if there's an error
      await fetchCartData();
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update quantity. Please try again.',
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeletePress = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleRemoveItem = async (service_id) => {
    setDeletingItemId(service_id);
    try {
      const { data, error } = await removeAllFromCart(service_id);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to clear cart',
        });
      } else {
        // Refetch cart data from server instead of optimistic updates
        await fetchCartData();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Item removed from cart successfully',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item removed from cart successfully',
      });
    } finally {
      setDeletingItemId(null);
      // Close the modal after deletion completes
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleProceedNow = () => {
    // Prevent proceeding if cart is empty or total is 0
    if (isCartEmptyOrZero()) {
      Toast.show({
        type: 'error',
        text1: 'Cart Empty',
        text2: 'Please add items to your cart before proceeding.',
      });
      return;
    }

    // Check if location is selected
    if (!selectedLocationObject || Object.keys(selectedLocationObject).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Location Required',
        text2: 'Please select your location before proceeding.',
      });
      return;
    }

    // Check if mobile number is selected
    if (!selectedMobileNumber || selectedMobileNumber.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Mobile Number Required',
        text2: 'Please set your mobile number before proceeding.',
      });
      return;
    }

    setShowDateTimeModal(true);
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Toast.show({
        type: 'error',
        text1: 'Selection Required',
        text2: 'Please select both date and time slot to continue.',
      });
      return;
    }
    setShowDateTimeModal(false);
    setShowPaymentModal(true);
  };

  /**
   * Prepare cart data for backend with new pricing system
   * Sends clean data with calculated shares and discount amounts
   */
  const prepareCartDataForBackend = (cartItems, paymentMethod) => {
    
    return cartItems.map(item => {
      // Base fields for backend
      const backendItem = {
        id: item.id,
        title: item.title,
        category: item.category,
        sub_category: item.sub_category,
        service_id: item.service_id,
        count_in_cart: item.count_in_cart,
        duration: item.duration,
        original_price: item.original_price,
        service_price: item.service_price, // Price after prebooking discount
        convenience_fee: item.convenience_fee,
        total_price: item.total_price, // service_price + convenience_fee
        tm_share: item.tm_share,
        company_share: item.company_share,
        prebooking_discount_amount: item.prebooking_discount_amount,
        prebooking_discount_applied: item.prebooking_discount_applied,
        prebooking_discount_percent: item.prebooking_discount_percent
      };

      // Add payment-specific fields
      if (paymentMethod === 'Online Payment') {
        // For online payment: include online discount
        backendItem.online_discount_amount = item.online_discount_amount;
        backendItem.final_company_share = item.company_share - item.online_discount_amount;
      } else {
        // For pay on service: no online discount
        backendItem.online_discount_amount = 0;
        backendItem.final_company_share = item.company_share;
      }

      return backendItem;
    });
  };



  const createbookings = async (razorpay_oid) => {
    setIsConfirmingPayment(true);
    
    // Prepare clean cart data for backend with new pricing system
    const cleanCartItems = prepareCartDataForBackend(rawcart, selectedPaymentMethod);
    
    const bookingdata = {
      items: cleanCartItems,
      ph_no: mobileNumber,
      location:
        location.houseNumber +
        " " +
        location.district +
        " " +
        location.city +
        " " +
        location.pincode +
        " " +
        location.additionalInfo,
      dateitem: {
        dateNumber: selectedDateItem.dayNumber,
        day: selectedDateItem.dayNumber,
        month: selectedDateItem.month,
      },
      time: {
        label: selectedTimeSlot.label,
        time: selectedTimeSlot.time,
      },
      paymentmethod: selectedPaymentMethod,
      razorpay_oid: razorpay_oid,
      // Pricing summary for backend
      pricing_summary: {
        subtotal: subTotal,
        convenience_fee: convenienceFee,
        grand_total: grandTotal,
        total_tm_share: totalTMShare,
        total_company_share: totalCompanyShare,
        online_payment_discount: onlinePaymentDiscount,
        coupon_discount: couponDiscount,
        total_with_online_discount: totalWithOnlineDiscount,
        amount_paid_online: getPayableAmount(),
        amount_to_pay_provider: selectedPaymentMethod === 'Pay on Service' ? totalTMShare : 0
      },
      // Coupon information
      coupon_applied: isCouponApplied,
      coupon_code: isCouponApplied ? couponCode : null,
      coupon_discount_percent: isCouponApplied ? couponDiscountPercent : 0,
      // System configuration used
      system_config: {
        commission_percent: systemConfig.COMMISSION_PERCENT,
        online_discount_percent: systemConfig.ONLINE_PAYMENT_DISCOUNT_PERCENT,
        prebooking_discount_percent: systemConfig.PREBOOKING_DISCOUNT_PERCENT,
        convenience_fee_percent: systemConfig.CONVENIENCE_FEE_PERCENT
      }
    };
    
    
    try {
      const { data, error } = await confirmbookings(bookingdata);

      if (error) {
        setIsConfirmingPayment(false);
        showCustomAlert(
          'Sorry! Unable to book',
          'There was an error processing your booking. Please try again later.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/protected/(tabs)/Bookings');
              }
            }
          ],
          'error'
        );
      } else {
        // Show success message based on payment method
        const successTitle = selectedPaymentMethod === 'Online Payment' 
          ? 'Payment Successful' 
          : 'Platform Fees Paid Successfully';
        
        const successMessage = selectedPaymentMethod === 'Online Payment'
          ? 'Your booking has been confirmed successfully!'
          : `Platform fees paid online. Please pay ₹${totalTMShare.toFixed(2)} to the service provider when they arrive.`;

        showCustomAlert(
          successTitle,
          successMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                setIsConfirmingPayment(false);
                router.push('/protected/(tabs)/Bookings');
              }
            }
          ],
          'success'
        );
      }
    } catch (bookingError) {
      console.error("Booking error:", bookingError);
      setIsConfirmingPayment(false);
      showCustomAlert(
        'Booking Error',
        'There was an error creating your booking. Please contact support.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push('/protected/(tabs)/Bookings');
            }
          }
        ],
        'error'
      );
    } finally {
      setIsConfirmingPayment(false);
    }
  }




  // Payment handling with new pricing system
  const handlePayment = async () => {
    // Final validation check for location and mobile number
    if (!selectedLocationObject || Object.keys(selectedLocationObject).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Location Required',
        text2: 'Please select your location before proceeding with payment.',
      });
      return;
    }

    if (!selectedMobileNumber || selectedMobileNumber.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Mobile Number Required',
        text2: 'Please set your mobile number before proceeding with payment.',
      });
      return;
    }

    setIsPaymentLoading(true);

    // Get the amount to be paid online based on payment method
    const payableAmountRupees = getPayableAmount();
    const payableAmountPaise = Math.round(payableAmountRupees * 100); // Convert to paise for Razorpay


    
    if (selectedPaymentMethod === "Online Payment") {
      try {
        const { data, error } = await createRazorpayOrder(rawcart, payableAmountPaise);
        if (error) {
          throw new Error(error);
        }
        const order = data;

        let options = {
          description: "OnlyClick Service Booking - Full Payment",
          image: "https://avatars.githubusercontent.com/u/230859053?v=4",
          currency: "INR",
          key: Constants.expoConfig?.extra?.expoPublicRazorPayKeyId, 
          amount: order.amount,
          order_id: order.id,
          name: "OnlyClick",
          prefill: {
            contact: mobileNumber,
          },
          theme: { color: "#3399cc" },
        };

        await RazorpayCheckout.open(options)
          .then(async (data) => {
            const { data: confirmPaymentData, error: confirmPaymentError } = await confirmRazorpayPayment(data);
            if (confirmPaymentError) {
              throw new Error(confirmPaymentError)
            }
            if (confirmPaymentData.success) {
              setShowPaymentModal(false);
              setShowDateTimeModal(false);
              setShowCancellationPolicy(false);
              setShowServiceFeeTooltip(false);
              setShowDeleteModal(false);
              setIsPaymentLoading(false);

              // Create the booking
              await createbookings(data.razorpay_order_id);
            } else {
              setIsPaymentLoading(false);
              showCustomAlert('Payment Failed', 'Sorry! Something went wrong. If the amount was debited from your account, please contact us for assistance.', [
                { text: 'OK' }
              ], 'error');
            }
          })
          .catch((error) => {
            setIsPaymentLoading(false);
            showCustomAlert('Payment Failed', 'Sorry! Something went wrong. If the amount was debited from your account, please contact us for assistance.', [
              { text: 'OK' }
            ], 'error');
          });
      } catch (err) {
        console.error("Online payment error:", err);
        setIsPaymentLoading(false);
      }
    } else {
      // Pay on Service - Pay platform fees (company share) online first
      try {
        const { data, error } = await createRazorpayOrder(rawcart, payableAmountPaise);
        if (error) {
          throw new Error(error);
        }
        const order = data;

        let options = {
          description: "OnlyClick Platform Fees",
          image: "https://avatars.githubusercontent.com/u/230859053?v=4",
          currency: "INR",
          key: Constants.expoConfig?.extra?.expoPublicRazorPayKeyId, 
          amount: order.amount,
          order_id: order.id,
          name: "OnlyClick",
          prefill: {
            contact: mobileNumber,
          },
          theme: { color: "#3399cc" },
        };

        await RazorpayCheckout.open(options)
          .then(async (data) => {
            const { data: confirmPaymentData, error: confirmPaymentError } = await confirmRazorpayPayment(data);
            if (confirmPaymentError) {
              throw new Error(confirmPaymentError)
            }
            if (confirmPaymentData.success) {
              setShowPaymentModal(false);
              setShowDateTimeModal(false);
              setShowCancellationPolicy(false);
              setShowServiceFeeTooltip(false);
              setShowDeleteModal(false);
              setIsPaymentLoading(false);
              
              // Create the booking
              await createbookings(data.razorpay_order_id);
            } else {
              setIsPaymentLoading(false);
              showCustomAlert('Payment Failed', 'Sorry! Something went wrong. If the amount was debited from your account, please contact us for assistance.', [
                { text: 'OK' }
              ], 'error');
            }
          })
          .catch((error) => {
            setIsPaymentLoading(false);
            showCustomAlert('Payment Failed', 'Sorry! Something went wrong. If the amount was debited from your account, please contact us for assistance.', [
              { text: 'OK' }
            ], 'error');
          });
      } catch (err) {
        console.error("Pay on service error:", err);
        setIsPaymentLoading(false);
      }
    }
  };

  const handleClearCart = () => {
    showCustomAlert(
      'Clear Cart',
      'Are you sure you want to remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive', onPress: () => {
          }
        }
      ]
    );
  };

  const renderCartItem = (item, categoryIndex, itemIndex) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDuration}>{item.duration}</Text>
        <Text style={styles.itemPrice}>₹{Math.round(item.price)}</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, updatingItemId === item.service_id && styles.quantityButtonDisabled]}
            onPress={() => handleQuantityChange(categoryIndex, itemIndex, -1)}
            disabled={updatingItemId === item.service_id}
          >
            {updatingItemId === item.service_id ? (
              <ActivityIndicator size="small" color="#3898B3" />
            ) : (
              <Ionicons name="remove" size={16} color="#3898B3" />
            )}
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, updatingItemId === item.service_id && styles.quantityButtonDisabled]}
            onPress={() => handleQuantityChange(categoryIndex, itemIndex, 1)}
            disabled={updatingItemId === item.service_id}
          >
            {updatingItemId === item.service_id ? (
              <ActivityIndicator size="small" color="#3898B3" />
            ) : (
              <Ionicons name="add" size={16} color="#3898B3" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleDeletePress(item)}
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
        <Text style={styles.categoryTotal}>₹{Math.round(calculateCategoryTotal(categoryData.items))}</Text>
      </View>

      {/* Provider Info */}
      {/* <View style={styles.providerCard}>
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
      </View> */}

      {/* Items List */}
      <View style={styles.itemsList}>
        {categoryData.items.map((item, itemIndex) =>
          renderCartItem(item, categoryIndex, itemIndex)
        )}
      </View>
    </View>
  );

  const CancellationPolicyModal = () => (
    <Modal visible={showCancellationPolicy} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Gesture Indicator Bar */}
          <View style={styles.gestureIndicator}>
            <View style={styles.indicatorBar} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancellation Policy</Text>
            <TouchableOpacity onPress={() => setShowCancellationPolicy(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.policyContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              // Disable scroll when gesture is detected
              return false;
            }}
          >
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
                <Text style={styles.boldText}>Late Cancellations:</Text> If you cancel within 2 hours of the scheduled appointment, a cancellation fee of 50% of the total service fee will be charged. This helps us cover the costs incurred by the service provider&apos;s time and travel.
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

  const DateTimeModal = () => (
    <Modal visible={showDateTimeModal} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <Animated.View
          style={[styles.modalContent, styles.dateTimeModalContent, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Gesture Indicator Bar */}
          <View style={styles.gestureIndicator}>
            <View style={styles.indicatorBar} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date & Time</Text>
            <TouchableOpacity onPress={() => setShowDateTimeModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.dateTimeScrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              // Disable scroll when gesture is detected
              return false;
            }}
          >
            {/* Date Selection */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Choose Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScrollView}>
                {dates.map((dateItem, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCard,
                      isSameDate(selectedDate, dateItem.date) && styles.selectedDateCard
                    ]}
                    onPress={() => {
                      setSelectedDate(dateItem.date);
                      setSelectedDateItem(dateItem);
                      // Reset selected time slot when date changes since availability changes
                      setSelectedTimeSlot(null);
                    }}
                  >
                    <Text style={[
                      styles.dayName,
                      isSameDate(selectedDate, dateItem.date) && styles.selectedDateText
                    ]}>
                      {dateItem.dayName}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      isSameDate(selectedDate, dateItem.date) && styles.selectedDateText
                    ]}>
                      {dateItem.dayNumber}
                    </Text>
                    <Text style={[
                      styles.monthName,
                      isSameDate(selectedDate, dateItem.date) && styles.selectedDateText
                    ]}>
                      {dateItem.month}
                    </Text>
                    {dateItem.isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Today</Text>
                      </View>
                    )}
                    {dateItem.isTomorrow && (
                      <View style={styles.tomorrowBadge}>
                        <Text style={styles.tomorrowText}>Tomorrow</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time Slot Selection */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Choose Time Slot</Text>
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlotCard,
                      !slot.available && styles.unavailableSlot,
                      selectedTimeSlot?.id === slot.id && styles.selectedTimeSlot
                    ]}
                    onPress={() => slot.available && setSelectedTimeSlot(slot)}
                    disabled={!slot.available}
                  >
                    <Text style={[
                      styles.timeSlotTime,
                      !slot.available && styles.unavailableText,
                      selectedTimeSlot?.id === slot.id && styles.selectedTimeText
                    ]}>
                      {slot.time}
                    </Text>
                    
                    
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration Estimate */}
            <View style={styles.durationCard}>
              <View style={styles.durationContent}>
                <View style={styles.durationIconContainer}>
                  <Ionicons name="time-outline" size={24} color="#3898B3" />
                </View>
                <View style={styles.durationTextContainer}>
                  <Text style={styles.durationTitle}>Estimated Duration</Text>
                  <Text style={styles.durationTime}>~45 minutes</Text>
                  <Text style={styles.durationNote}>May vary based on service complexity</Text>
                </View>
              </View>
            </View>

            {/* Selection Summary */}
            {selectedDateItem && selectedTimeSlot && (
              <View style={styles.selectionSummary}>
                <View style={styles.selectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.summaryTitle}>Your Selection</Text>
                </View>

                <View style={styles.selectionCard}>
                  <View style={styles.selectionItem}>
                    <View style={styles.selectionIconContainer}>
                      <Ionicons name="calendar-outline" size={18} color="#3898B3" />
                    </View>
                    <View style={styles.selectionTextContainer}>
                      <Text style={styles.selectionLabel}>Date</Text>
                      <Text style={styles.selectionValue}>
                        {selectedDateItem.dayName}, {selectedDateItem.dayNumber} {selectedDateItem.month}
                        {selectedDateItem.isToday ? ' (Today)' : selectedDateItem.isTomorrow ? ' (Tomorrow)' : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.selectionDivider} />

                  <View style={styles.selectionItem}>
                    <View style={styles.selectionIconContainer}>
                      <Ionicons name="time-outline" size={18} color="#3898B3" />
                    </View>
                    <View style={styles.selectionTextContainer}>
                      <Text style={styles.selectionLabel}>Time</Text>
                      <Text style={styles.selectionValue}>
                        {selectedTimeSlot.time} • {selectedTimeSlot.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.dateTimeFooter}>
            <TouchableOpacity
              style={[
                styles.confirmDateTimeButton,
                (!selectedDate || !selectedTimeSlot) && styles.disabledButton
              ]}
              onPress={handleDateTimeConfirm}
              disabled={!selectedDate || !selectedTimeSlot}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.confirmDateTimeText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  const PaymentModal = () => (
    <Modal visible={showPaymentModal} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <Animated.View
          style={[styles.modalContent, styles.paymentModalContent, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Gesture Indicator Bar */}
          <View style={styles.gestureIndicator}>
            <View style={styles.indicatorBar} />
          </View>

          {/* Enhanced Header */}
          <View style={styles.paymentModalHeader}>
            <View style={styles.paymentHeaderLeft}>
              <View style={styles.paymentIconContainer}>
                <Ionicons name="card" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.paymentModalTitle}>Secure Payment</Text>
                <Text style={styles.paymentModalSubtitle}>Complete your booking</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.paymentScrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              // Disable scroll when gesture is detected
              return false;
            }}
          >
            {/* Bill Summary - Moved to Top */}
            {!isCartEmptyOrZero() && (
              <View style={styles.billSummaryCard}>
                <View style={styles.billRows}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Subtotal</Text>
                    <Text style={styles.billAmount}>₹{subTotal.toFixed(2)}</Text>
                  </View>

                  <View style={[styles.billRow, { position: 'relative' }]}>
                    <View style={styles.billLabelWithIcon}>
                      <Text style={styles.billLabel}>Convenience Fee + Platform Fee</Text>
                      <TouchableOpacity
                        onPress={() => setShowServiceFeeTooltip(!showServiceFeeTooltip)}
                        style={styles.infoIconButton}
                      >
                        <Ionicons name="information-circle-outline" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.billAmount}>₹{convenienceFee.toFixed(2)}</Text>

                    {/* Service Fee Tooltip */}
                    {showServiceFeeTooltip && (
                      <View style={styles.serviceFeeTooltip}>
                        <View style={styles.tooltipBubble}>
                          <Text style={styles.tooltipText}>
                            💡 Convenience & platform fees cover app maintenance, customer support, and quality assurance!
                          </Text>
                          <View style={styles.tooltipArrow} />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Coupon Discount Display */}
                  {isCouponApplied && couponDiscount > 0 && (
                    <View style={styles.billRow}>
                      <View style={styles.billLabelWithIcon}>
                        <Text style={styles.billLabel}>Coupon Discount ({couponDiscountPercent}%)</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>SAVE</Text>
                        </View>
                      </View>
                      <Text style={[styles.billAmount, styles.discountAmount]}>-₹{couponDiscount.toFixed(2)}</Text>
                    </View>
                  )}

                  {/* Online Payment Discount */}
                  {selectedPaymentMethod === 'Online Payment' && (
                    <View style={styles.billRow}>
                      <View style={styles.billLabelWithIcon}>
                        <Text style={styles.billLabel}>Online Payment Discount ({onlineDiscountPercent}%)</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>SAVE</Text>
                        </View>
                      </View>
                      <Text style={[styles.billAmount, styles.discountAmount]}>-₹{onlinePaymentDiscount.toFixed(2)}</Text>
                    </View>
                  )}

                  {/* Pay on Service Breakdown */}
                  {selectedPaymentMethod === 'Pay on Service' && (
                    <View style={styles.payOnServiceBreakdown}>
                      <View style={styles.breakdownHeader}>
                        <Ionicons name="information-circle" size={16} color="#3898B3" />
                        <Text style={styles.breakdownHeaderText}>Payment Breakdown</Text>
                      </View>
                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Pay Online Now ({Math.round(getSharePercentages().companyPercentage)}%)</Text>
                        <Text style={styles.billAmount}>₹{totalCompanyShare.toFixed(2)}</Text>
                      </View>
                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Pay to Service Provider ({Math.round(getSharePercentages().tmPercentage)}%)</Text>
                        <Text style={styles.billAmount}>₹{totalTMShare.toFixed(2)}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.billDivider} />

                  <View style={styles.billTotalRow}>
                    <View style={styles.billTotalTextContainer}>
                      <Text style={styles.billTotalLabel}>
                        {selectedPaymentMethod === 'Online Payment' ? 'Total Amount' : 'Pay Online Now'}
                      </Text>
                      <Text style={styles.billTotalSubtext}>
                        {selectedPaymentMethod === 'Online Payment' 
                          ? 'With online discount applied' 
                          : 'Platform fees paid online, service amount to provider'}
                      </Text>
                    </View>
                    <Text style={styles.billTotalAmount}>
                      ₹{getPayableAmount().toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Payment Methods - Moved to Middle */}
            <View style={styles.paymentMethodsSection}>
              <View style={styles.paymentMethodsHeader}>
                <Ionicons name="wallet" size={20} color="#3898B3" />
                <Text style={styles.paymentMethodsTitle}>Choose Payment Method</Text>
              </View>

              <View style={styles.paymentMethodsList}>
                {[
                  {
                    key: 'Online Payment',
                    icon: 'card',
                    label: 'Online Payment',
                    subtitle: 'Pay full amount online with discount'
                  },
                  {
                    key: 'Pay on Service',
                    icon: 'cash',
                    label: `Pay ${Math.round(getSharePercentages().tmPercentage)}% on Service`,
                    subtitle: 'Pay company share online + service amount to provider'
                  }
                ].map((method) => (
                  <View key={method.key} style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                      style={[
                        styles.paymentMethodCard,
                        selectedPaymentMethod === method.key && styles.selectedPaymentMethodCard
                      ]}
                      onPress={() => setSelectedPaymentMethod(method.key)}
                    >
                      <View style={styles.paymentMethodLeft}>
                        <View style={[
                          styles.paymentMethodIconContainer,
                          selectedPaymentMethod === method.key && styles.selectedPaymentMethodIcon
                        ]}>
                          <Ionicons
                            name={method.icon}
                            size={24}
                            color={selectedPaymentMethod === method.key ? '#3898B3' : '#666'}
                          />
                        </View>
                        <View style={styles.paymentMethodInfo}>
                          <Text style={[
                            styles.paymentMethodLabel,
                            selectedPaymentMethod === method.key && styles.selectedPaymentMethodLabel
                          ]}>
                            {method.label}
                          </Text>
                          <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
                        </View>
                      </View>
                      <View style={styles.paymentMethodRight}>
                        <View style={[
                          styles.paymentMethodRadio,
                          selectedPaymentMethod === method.key && styles.selectedPaymentMethodRadio
                        ]}>
                          {selectedPaymentMethod === method.key && (
                            <View style={styles.paymentMethodRadioInner} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Booking Summary Card - Moved to Bottom */}
            <View style={styles.bookingSummaryCard}>
              <View style={styles.bookingSummaryHeader}>
                <Ionicons name="calendar-outline" size={20} color="#3898B3" />
                <Text style={styles.bookingSummaryTitle}>Booking Details</Text>
              </View>

              {selectedDateItem && selectedTimeSlot && (
                <View style={styles.bookingDetailsRow}>
                  <View style={styles.bookingDetailItem}>
                    <Text style={styles.bookingDetailLabel}>Date & Time</Text>
                    <Text style={styles.bookingDetailValue}>
                      {selectedDateItem.dayName}, {selectedDateItem.dayNumber} {selectedDateItem.month} • {selectedTimeSlot.time}
                    </Text>
                  </View>
                  <View style={styles.bookingDetailItem}>
                    <Text style={styles.bookingDetailLabel}>Location</Text>
                    <Text style={styles.bookingDetailValue} numberOfLines={1}>
                      {formatLocationDisplay(location)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Services Overview - Moved to Bottom */}
            <View style={styles.servicesOverviewCard}>
              <View style={styles.servicesOverviewHeader}>
                <Ionicons name="construct" size={20} color="#3898B3" />
                <Text style={styles.servicesOverviewTitle}>Services ({cartData.reduce((total, cat) => total + cat.items.length, 0)})</Text>
                <Text style={styles.servicesOverviewTotal}>₹{subTotal.toFixed(2)}</Text>
              </View>

              {cartData.map((category, index) => (
                <View key={index} style={styles.serviceCategory}>
                  <View style={styles.serviceCategoryHeader}>
                    <View style={styles.categoryIconWrapper}>
                      <Ionicons
                        name={category.category === 'Plumbing' ? 'water' : 'flash'}
                        size={14}
                        color="#3898B3"
                      />
                    </View>
                    <Text style={styles.serviceCategoryName}>{category.category}</Text>
                    <Text style={styles.serviceCategoryPrice}>₹{calculateCategoryTotal(category.items).toFixed(2)}</Text>
                  </View>

                  {category.items.map((item, itemIndex) => (
                    <View key={item.id} style={styles.serviceItem}>
                      <View style={styles.serviceItemLeft}>
                        <Text style={styles.serviceItemName}>{item.name}</Text>
                        <Text style={styles.serviceItemQty}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={styles.serviceItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Enhanced Pay Button */}
          <View style={styles.enhancedPaymentFooter}>
            <View style={styles.paymentAmountSummary}>
              <Text style={styles.payAmountLabel}>
                {selectedPaymentMethod === 'Online Payment' ? 'Pay Now' : 'Pay Online Now'}
              </Text>
              <Text style={styles.payAmountValue}>
                ₹{getPayableAmount().toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.enhancedPayButton, isPaymentLoading && styles.disabledPayButton]}
              onPress={handlePayment}
              disabled={isPaymentLoading}
            >
              <View style={styles.payButtonContent}>
                {isPaymentLoading ? (
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons
                    name={selectedPaymentMethod === 'Online Payment' ? "card" : "checkmark-circle"}
                    size={22}
                    color="#fff"
                  />
                )}
                <Text style={styles.enhancedPayButtonText}>
                  {isPaymentLoading ? 'Processing...' : (selectedPaymentMethod === 'Online Payment' ? 'Pay Securely' : 'Pay Platform Fees')}
                </Text>
                {!isPaymentLoading && (
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  const DeleteConfirmationModal = () => (
    <Modal visible={showDeleteModal} transparent animationType="fade">
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContent}>
          <View style={styles.deleteModalHeader}>
            <View style={styles.deleteIconContainer}>

              <Ionicons name="trash-outline" size={32} color="#F44336" />

            </View>
            <Text style={styles.deleteModalTitle}>Remove Item</Text>
          </View>

          <Text style={styles.deleteModalMessage}>
            Are you sure you want to remove this item from your cart?
          </Text>

          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={styles.deleteCancelButton}
              onPress={() => {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }}
            >
              <Text style={styles.deleteCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteConfirmButton, deletingItemId === itemToDelete?.service_id && styles.deleteConfirmButtonDisabled]}
              onPress={() => {
                if (itemToDelete) {
                  handleRemoveItem(itemToDelete.service_id);
                }
              }}
              disabled={deletingItemId === itemToDelete?.service_id}
            >
              {deletingItemId === itemToDelete?.service_id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.deleteConfirmButtonText}>Remove Item</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Minimal Custom Alert Component
  const CustomAlert = () => {
    const getAlertStyle = () => {
      switch (customAlert.type) {
        case 'success':
          return {
            borderColor: '#4CAF50',
            iconName: 'checkmark-circle',
            iconColor: '#4CAF50'
          };
        case 'error':
          return {
            borderColor: '#F44336',
            iconName: 'close-circle',
            iconColor: '#F44336'
          };
        default:
          return {
            borderColor: '#E0E0E0',
            iconName: null,
            iconColor: null
          };
      }
    };

    const alertStyle = getAlertStyle();

    return (
      <Modal visible={customAlert.visible} transparent animationType="fade">
        <View style={styles.customAlertOverlay}>
          <View style={[
            styles.customAlertContainer,
            alertStyle.borderColor && { borderTopColor: alertStyle.borderColor }
          ]}>
            {alertStyle.iconName && (
              <View style={styles.customAlertIconContainer}>
                <Ionicons 
                  name={alertStyle.iconName} 
                  size={28} 
                  color={alertStyle.iconColor} 
                />
              </View>
            )}
            <Text style={styles.customAlertTitle}>{customAlert.title}</Text>
            {customAlert.message && (
              <Text style={styles.customAlertMessage}>{customAlert.message}</Text>
            )}
            <View style={styles.customAlertButtons}>
              {customAlert.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.customAlertButton,
                    button.style === 'destructive' && styles.customAlertButtonDestructive,
                    button.style === 'cancel' && styles.customAlertButtonCancel
                  ]}
                  onPress={() => {
                    hideCustomAlert();
                    button.onPress && button.onPress();
                  }}
                >
                  <Text style={[
                    styles.customAlertButtonText,
                    button.style === 'destructive' && styles.customAlertButtonTextDestructive,
                    button.style === 'cancel' && styles.customAlertButtonTextCancel
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.container}>
        <StatusBar hidden={true} />

        <AppHeader
          title="My Cart"
          showBack
          onBack={() => router.back()}
        />

        {/* Initial Loading Screen */}
        {isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3898B3" />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
        {/* Location Confirmation */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => {
            router.push('/(app)/(modal)/cart/location');
          }}
        >
          <View style={styles.locationHeader}>
            <Ionicons
              name={Object.keys(location).length > 0 ? "location" : "location-outline"}
              size={20}
              color={Object.keys(location).length > 0 ? "#3898B3" : "#999"}
            />
            <Text style={styles.locationTitle}>Service Location</Text>
            {Object.keys(location).length > 0 && (
              <Ionicons name="checkmark-circle" size={20} marginLeft="auto" color="#4CAF50" />
            )}
          </View>
          <Text style={[
            styles.locationAddress,
            Object.keys(location).length === 0 && styles.placeholderText
          ]}>
            {formatLocationDisplay(location)}
          </Text>
          <Text style={styles.changeLocationLink}>
            {Object.keys(location).length > 0 ? "Tap to change" : "Tap to set"}
          </Text>
        </TouchableOpacity>

        {/* Mobile Number Section */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => {
            router.push('/(app)/(modal)/cart/mobile-number');
          }}
        >
          <View style={styles.locationHeader}>
            <Ionicons
              name={mobileNumber ? "call" : "call-outline"}
              size={20}
              color="#3898B3"
            />
            <Text style={styles.locationTitle}>Mobile Number</Text>
            {mobileNumber && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#4CAF50"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </View>
          <Text style={mobileNumber ? styles.locationAddress : styles.placeholderText}>
            {formatMobileNumber(mobileNumber)}
          </Text>
          <Text style={styles.changeLocationLink}>
            Tap to change
          </Text>
        </TouchableOpacity>

        {/* Online Payment Discount Banner */}
        {!isCartEmptyOrZero() && (
          <View style={styles.onlineDiscountContainer}>
            <View style={styles.onlineDiscountIconContainer}>
              <Ionicons name="card" size={18} color="#4CAF50" />
            </View>
            <View style={styles.onlineDiscountTextContainer}>
              <Text style={styles.onlineDiscountText}>
                <Text>Save </Text><Text style={styles.onlineDiscountAmount}>₹{(onlinePaymentDiscount)} ({onlineDiscountPercent}%)</Text><Text> with </Text>
                <Text style={styles.onlineDiscountMethod}>online payment</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Coupon Code Section - Text input to apply available coupons from backend */}
        <View style={styles.couponSection}>
          {!isCouponApplied ? (
              <View style={styles.couponInputContainer}>
                <View style={styles.couponInputWrapper}>
                  <Ionicons name="pricetag-outline" size={20} color="#3898B3" style={styles.couponIcon} />
                  <TextInput
                    style={styles.couponTextInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#999"
                    value={couponCode}
                    onChangeText={(text) => {
                      setCouponCode(text.toUpperCase());
                      setCouponError("");
                    }}
                    autoCapitalize="characters"
                    maxLength={20}
                    editable={!isApplyingCoupon}
                  />
                  <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={applyCoupon}
                  >
                    {isApplyingCoupon ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.applyButtonText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {couponError ? (
                  <View style={styles.couponErrorContainer}>
                    <Ionicons name="close-circle" size={14} color="#F44336" />
                    <Text style={styles.couponErrorText}>{couponError}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.couponAppliedContainer}>
                <View style={styles.couponAppliedRow}>
                  <View style={styles.couponAppliedInfo}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <View style={styles.couponAppliedTextContainer}>
                      <Text style={styles.couponAppliedCode}>{couponCode}</Text>
                      <Text style={styles.couponAppliedDiscount}>
                        {couponDiscountPercent}% discount applied • You saved ₹{couponDiscount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeCouponButton}
                    onPress={removeCoupon}
                  >
                    <Ionicons name="close" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
        </View>

        {/* Promotional Message for Discount */}
        

        {/* Cart Categories */}
        {cartData.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="basket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyCartSubtitle}>Add some services to get started!</Text>
          </View>
        ) : (
          cartData.map((categoryData, index) =>
            renderCategorySection(categoryData, index)
          )
        )}

        {/* Payment Summary */}
        {!isCartEmptyOrZero() && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>

            {cartData.map((category, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{category.category}</Text>
                <Text style={styles.summaryAmount}>₹{calculateCategoryTotal(category.items).toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryAmount}>₹{subTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Convenience Fee + Platform Fee</Text>
              <Text style={styles.summaryAmount}>₹{convenienceFee.toFixed(2)}</Text>
            </View>

            {/* Show coupon discount if applied */}
            {isCouponApplied && couponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                  Coupon Discount ({couponDiscountPercent}%)
                </Text>
                <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>-₹{couponDiscount.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{grandTotal.toFixed(2)}</Text>
            </View>

          </View>
        )}

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
      )}

      {/* Fixed Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalAmount}>₹{grandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            isCartEmptyOrZero() && styles.proceedButtonDisabled
          ]}
          onPress={handleProceedNow}
          disabled={isCartEmptyOrZero()}
        >
          <Text style={[
            styles.proceedButtonText,
            isCartEmptyOrZero() && styles.proceedButtonTextDisabled
          ]}>
            Proceed Now
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={isCartEmptyOrZero() ? "#999" : "#fff"}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      <CancellationPolicyModal />
      <DateTimeModal />
      <PaymentModal />
      <DeleteConfirmationModal />
      <CustomAlert />
      
      {/* Cart Bottom Bar - shows when cart has items */}
      <CartPageBottomBar 
        cartItemCount={cartData.reduce((total, cat) => total + cat.items.length, 0)} 
        isVisible={cartData.length > 0 && !isCartEmptyOrZero()}
        onProceed={handleProceedNow}
      />

      {/* Overlay Loading for Cart */}
      {(isCartLoading && !isInitialLoading) && (
        <View style={styles.overlayLoading}>
          <View style={styles.overlayLoadingContent}>
            <ActivityIndicator size="large" color="#3898B3" />
            <Text style={styles.overlayLoadingText}>Updating cart...</Text>
          </View>
        </View>
      )}

      {/* Overlay Loading for Coupon */}
      {isApplyingCoupon && (
        <View style={styles.overlayLoading}>
          <View style={styles.overlayLoadingContent}>
            <ActivityIndicator size="large" color="#3898B3" />
            <Text style={styles.overlayLoadingText}>Applying coupon...</Text>
          </View>
        </View>
      )}

      {/* Overlay Loading for Payment Confirmation */}
      {isConfirmingPayment && (
        <View style={styles.overlayLoading}>
          <View style={styles.overlayLoadingContent}>
            <ActivityIndicator size="large" color="#3898B3" />
            <Text style={styles.overlayLoadingText}>Confirming payment...</Text>
          </View>
        </View>
      )}

      </View>
    </SafeAreaView>
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
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlayLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayLoadingContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  overlayLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  // headerSubtitle removed - AppHeader has no subheading
  clearButton: {
    padding: 5,
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
    marginTop: 0,
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
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  quantityButtonDisabled: {
    opacity: 0.5,
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
  removeButtonDisabled: {
    opacity: 0.5,
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
    marginBottom: 10,
    paddingHorizontal: 2,
    minHeight: 24,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    marginRight: 12,
  },
  summaryAmount: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
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
    marginLeft: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#3898B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  proceedButtonDisabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  proceedButtonTextDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  manualSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  countryCodePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3898B3',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  locationOptionDisabled: {
    opacity: 0.6,
  },
  locationOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  locationOptionSubtitle: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#3898B3',
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
    maxHeight: 200,
    marginBottom: 20,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  // Payment Modal Styles - Redesigned
  paymentModalContent: {
    maxHeight: '92%',
    height: '92%',
  },
  paymentScrollView: {
    flex: 1,
    marginBottom: 10,
  },

  // Enhanced Header
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 20,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3898B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  paymentModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Booking Summary Card
  bookingSummaryCard: {
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  bookingSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  bookingDetailsRow: {
    gap: 12,
  },
  bookingDetailItem: {
    marginBottom: 8,
  },
  bookingDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  bookingDetailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  // Services Overview Card
  servicesOverviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  servicesOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  servicesOverviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  servicesOverviewTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3898B3',
  },
  serviceCategory: {
    marginBottom: 12,
  },
  serviceCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  categoryIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  serviceCategoryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3898B3',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    marginBottom: 4,
  },
  serviceItemLeft: {
    flex: 1,
  },
  serviceItemName: {
    fontSize: 13,
    color: '#1A1A1A',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#3898B3',
  },

  // Bill Summary Card
  billSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  billRows: {
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  billLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  billAmount: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  billTotalTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  billTotalSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  billTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3898B3',
  },

  // Payment Methods Section
  paymentMethodsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  paymentMethodsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  selectedPaymentMethodCard: {
    borderColor: '#3898B3',
    backgroundColor: '#F8FCFF',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedPaymentMethodIcon: {
    backgroundColor: '#E3F2FD',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  selectedPaymentMethodLabel: {
    color: '#3898B3',
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  paymentMethodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPaymentMethodRadio: {
    borderColor: '#3898B3',
  },
  paymentMethodRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3898B3',
  },

  // Expanded Payment Options
  paymentOptionsExpanded: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  paymentOption: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
  },

  // UPI Options
  upiIdContainer: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  qrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  appContainer: {
    marginBottom: 12,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appOption: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3898B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  appIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 12,
    color: '#1A1A1A',
    textAlign: 'center',
  },

  // Card Options
  savedCardsContainer: {
    marginBottom: 12,
  },
  savedCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  savedCardText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  newCardContainer: {
    marginBottom: 12,
  },
  cardFields: {
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
  },

  // Bank Options
  bankListContainer: {
    marginBottom: 12,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: 60,
    alignItems: 'center',
  },
  bankIcon: {
    width: 40,
    height: 24,
    backgroundColor: '#3898B3',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankIconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Wallet Options
  walletListContainer: {
    marginBottom: 12,
  },
  walletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletOption: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  walletIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletName: {
    fontSize: 12,
    color: '#1A1A1A',
    textAlign: 'center',
  },

  // Cash Options
  cashNoteContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  cashNoteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cashNoteText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },

  // Enhanced Payment Footer
  enhancedPaymentFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  paymentAmountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  payAmountLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  payAmountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  enhancedPayButton: {
    backgroundColor: '#3898B3',
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#3898B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledPayButton: {
    backgroundColor: '#B0B0B0',
    elevation: 0,
    shadowOpacity: 0,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enhancedPayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Date Time Modal Styles
  dateTimeModalContent: {
    maxHeight: '90%',
    height: '90%',
  },
  dateTimeScrollView: {
    flex: 1,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 15,
  },
  datesScrollView: {
    flexDirection: 'row',
  },
  dateCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    paddingTop: 20,
    marginRight: 12,
    marginTop: 12,
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedDateCard: {
    backgroundColor: '#3898B3',
    borderColor: '#3898B3',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayBadge: {
    position: 'absolute',
    top: -10,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  todayText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  tomorrowBadge: {
    position: 'absolute',
    top: -10,
    right: -8,
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingHorizontal: 8, // Increased from 5 to 8 for more space
    paddingVertical: 2,
    zIndex: 1,
    minWidth: 70, // Added minimum width to ensure consistent badge size
  },
  tomorrowText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedTimeSlot: {
    backgroundColor: '#3898B3',
    borderColor: '#3898B3',
  },
  unavailableSlot: {
    backgroundColor: '#F0F0F0',
    borderColor: 'transparent',
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  timeSlotLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#fff',
  },
  unavailableText: {
    color: '#999',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unavailableBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  durationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  durationTextContainer: {
    flex: 1,
  },
  durationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 1,
  },
  durationNote: {
    fontSize: 11,
    color: '#888',
    lineHeight: 14,
  },
  selectionSummary: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F5E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 6,
  },
  selectionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 10,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectionTextContainer: {
    flex: 1,
  },
  selectionLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  selectionValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  selectionDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 6,
  },
  dateTimeFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 15,
  },
  confirmDateTimeButton: {
    backgroundColor: '#3898B3',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#3898B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmDateTimeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Service Fee Tooltip Styles
  infoIconButton: {
    padding: 4,
    marginLeft: 6,
  },
  serviceFeeTooltip: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tooltipBubble: {
    backgroundColor: '#FFF9C4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FFD54F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '100%',
    position: 'relative',
  },
  tooltipText: {
    fontSize: 13,
    color: '#F57F17',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFD54F',
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
    backgroundColor: '#3898B3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Cancellation Policy Modal Styles
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  // Location Modal Specific Styles
  locationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  locationModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 8,
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  locationCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationFormScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  locationFieldContainer: {
    marginBottom: 20,
  },
  locationFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationOptionalText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    height: 48,
  },
  locationInputIcon: {
    marginRight: 10,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  locationRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationHalfField: {
    flex: 1,
    marginRight: 8,
  },
  locationButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  locationCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  locationCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  locationSaveButton: {
    flex: 1,
    backgroundColor: '#3898B3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  locationSaveButtonDisabled: {
    backgroundColor: '#B3D9FF',
    opacity: 0.6,
  },
  locationSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  policyContent: {
    maxHeight: 400,
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
  // Delete Confirmation Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 300,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteConfirmButtonDisabled: {
    backgroundColor: '#FFCDD2',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  // Empty Cart Styles
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Minimal Custom Alert Styles
  customAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  customAlertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderTopWidth: 4,
    borderTopColor: '#E0E0E0',
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  customAlertIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  customAlertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  customAlertMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  customAlertButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  customAlertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3898B3',
    alignItems: 'center',
  },
  customAlertButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  customAlertButtonDestructive: {
    backgroundColor: '#ff4444',
  },
  customAlertButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  customAlertButtonTextCancel: {
    color: '#666',
  },
  customAlertButtonTextDestructive: {
    color: '#fff',
  },
  // Online Discount Banner Styles (matching promo message design)
  onlineDiscountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  onlineDiscountIconContainer: {
    marginRight: 10,
  },
  onlineDiscountTextContainer: {
    flex: 1,
  },
  onlineDiscountText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  onlineDiscountAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  onlineDiscountMethod: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  // Discount Badge Styles (keeping for payment modal)
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
  // Pay on Service Breakdown Styles
  payOnServiceBreakdown: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 4,
  },
  // Coupon Styles
  couponSection: {
    marginVertical: 8,
  },
  couponInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    height: 48,
  },
  couponIcon: {
    marginRight: 10,
  },
  couponTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
    height: '100%',
  },
  applyButton: {
    backgroundColor: '#3898B3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  couponErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  couponErrorText: {
    color: '#F44336',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  couponAppliedContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  couponAppliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  couponAppliedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  couponAppliedTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  couponAppliedCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  couponAppliedDiscount: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 18,
  },
  removeCouponButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Promo message styles
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
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