import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';
import AppHeader from '../../../../../components/common/AppHeader';
import CartAddedBottomBar from '../../../../../components/common/CartAddedBottomBar';
import PressableScale from '../../../../../components/common/PressableScale';
import Text from "../../../../../components/ui/Text";
import { useModal } from '../../../../../context/ModalProvider';
import fetchCart from '../../../../../data/getdata/getCart';
import { allCategories, allServices, categoryImages } from "../../../../../data/servicesData";
import { addToCart } from '../../../../api/cart';


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function ServicesPage() {
  const router = useRouter();
  const { selectedCategory: categoryParam, searchQuery: urlSearchQuery } = useLocalSearchParams();
  const { setIsCartAddedBottomBarVisible, setCartItemCount, isCartAddedBottomBarVisible, cartItemCount } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true); 
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [cartNavigationLoading, setCartNavigationLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Gesture handling for modal
  const modalY = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && gestureState.y0 < 100;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
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
            setShowServiceModal(false);
            setSelectedService(null);
            modalY.setValue(0);
            modalOpacity.setValue(1);
          });
        } else {
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

  // Function to handle cart navigation with loading state
  const handleCartNavigation = async () => {
    if (cartNavigationLoading) return; // Prevent multiple clicks
    
    setCartNavigationLoading(true);
    try {
      await router.push("/(modal)/cart");
    } catch (error) {
    } finally {
      // Reset loading state after a short delay to prevent rapid clicking
      setTimeout(() => {
        setCartNavigationLoading(false);
      }, 1000);
    }
  };

  const ITEM_CARD_HEIGHT = 170 + 16; // card height + marginBottom

  // Function to fetch and update cart count
  const updateCartCount = async () => {
    try {
      const { arr } = await fetchCart();
      const totalItems = arr.reduce((total, category) => 
        total + category.items.reduce((catTotal, item) => catTotal + item.quantity, 0), 0
      );
      setCartItems(Array(totalItems).fill({})); // Create array with length equal to total items
      
      // Update global cart count for permanent bottom bar
      setCartItemCount(totalItems);
      
      // Show/hide bottom bar based on cart items
      if (totalItems > 0) {
        setIsCartAddedBottomBarVisible(true);
      } else {
        setIsCartAddedBottomBarVisible(false);
      }
    } catch (error) {
      setCartItems([]);
      setCartItemCount(0);
      setIsCartAddedBottomBarVisible(false);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await allServices();
        setServices(data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchServices();

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const cats = await allCategories();
        setCategories([
          {
            id: "all",
            name: "All",
            icon: "apps",
            count: 0,
            color: "#3898B3",
          },
          ...(Array.isArray(cats) ? cats : []),
        ]);
      } catch (error) {
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();

    // Fetch initial cart count to show bottom bar if items exist
    updateCartCount();
  }, []);

  // Update cart count every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      updateCartCount();
    }, [])
  );

  // Filter categories to show only those with services available
  const categoriesWithCounts = (categories || []).map((cat) => ({
    ...cat,
    count:
      cat.id === "all"
        ? (services || []).length
        : (services || []).filter((s) => {
          // Try multiple matching strategies
          return s.category === cat.id ||
            s.category === cat.name ||
            s.category?.toLowerCase() === cat.id?.toLowerCase() ||
            s.category?.toLowerCase().replace(/\s+/g, "_") === cat.id?.toLowerCase();
        }).length,
  }));
  const filteredCategories = categoriesWithCounts.filter(
    (category) => category.count > 0
  );

  // Handle category selection from navigation params
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const category = categories.find((cat) => cat.id === categoryParam);
      if (category) setSelectedCategory(category.name);
    }
  }, [categoryParam, categories]);

  // Handle search query from navigation params
  useEffect(() => {
    setSearchQuery(urlSearchQuery || "");
  }, [urlSearchQuery]);


  // Filter and sort services based on search and category
  const filteredServices = (services || [])
    .filter((service) => {
      const matchesSearch =
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.sub_category?.toLowerCase().includes(searchQuery.toLowerCase());

      let categoryMatches = false;
      if (selectedCategory === "All") {
        categoryMatches = true;
      } else {
        // Find the category object to get its id
        const categoryObj = categories.find(
          (cat) => cat.name === selectedCategory
        );
        if (categoryObj) {
          categoryMatches =
            service.category === categoryObj.id ||
            service.category.toLowerCase().replace(/\s+/g, "_") ===
            categoryObj.id;
        }
      }

      return matchesSearch && categoryMatches;
    })
    .sort((a, b) => {
      // Sort by price in ascending order (lowest price first)
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      return priceA - priceB;
    });

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.name);
    // Scroll to top when category changes
    if (category.name !== selectedCategory) {
      // Optional: Add scroll to top functionality here if needed
    }
  };

  // const addToCart = (service) => {
  //   // Check if item already exists in cart
  //   const existingItem = cartItems.find(
  //     (item) => item.serviceId === service.serviceId
  //   );

  //   if (existingItem) {
  //     // Update quantity if item exists
  //     setCartItems(
  //       cartItems.map((item) =>
  //         item.serviceId === service.serviceId
  //           ? { ...item, quantity: item.quantity + 1 }
  //           : item
  //       )
  //     );
  //   } else {
  //     // Add new item to cart
  //     setCartItems([...cartItems, { ...service, quantity: 1 }]);
  //   }

  // };

  const addToCartClickHandle = async (service) => {
    setOverlayLoading(true);
    const cartPayload = { ...service };
    delete cartPayload.image_url;
    delete cartPayload.description;
    delete cartPayload.created_at;
    delete cartPayload.ratings;
    delete cartPayload.service_fee_percent
    delete cartPayload.total_tax
    const { error } = await addToCart(cartPayload)

    // Show success feedback (you can customize this)
    setOverlayLoading(false) 
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Couldn\'t add to cart',
      });
    }
    else {
      // Show success toast notification
      Toast.show({
        type: 'success',
        text1: 'Added to Cart!',
        text2: `${service.title} has been added to your cart`,
        position: 'bottom',
        bottomOffset: 100,
      });
      
      // Show bottom bar notification
      setIsCartAddedBottomBarVisible(true);
      
      // Update cart count after successful addition
      await updateCartCount();
    }
  }


  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.name && styles.selectedCategoryCard,
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={[styles.categoryIconContainer]}>
        <Image
          source={getCategoryImage(item.id)}
          style={{ width: 84, height: 84 }}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.categoryCount}>{item.count} services</Text>
    </TouchableOpacity>
  );

  // Function to handle service detail view
  const handleServicePress = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  // Memoized service card for performance
  const ServiceCard = React.memo(function ServiceCard({ item }) {
    return (
      <PressableScale
        style={styles.serviceCard}
        onPress={() => handleServicePress(item)}
      >
        <View style={styles.cardContentHorizontal}>
          <View style={styles.serviceDetailsLeft}>
            <View>
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.serviceCategory}>{item.sub_category}</Text>
            </View>

            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.bottomRow}>
              <View style={styles.priceRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>₹{item.price}</Text>
                  {item.originalPrice && (
                    <Text style={styles.originalPrice}>
                      ₹{item.originalPrice}
                    </Text>
                  )}
                </View>

                  {item.ratings && (
                <View style={styles.ratingInline}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingTextSmall}>
                    {item.ratings || ""}
                  </Text>
                </View>)
                  }
              </View>

              <View style={styles.controlsRight}>
                <PressableScale
                  style={styles.addToCartButton}
                  onPress={() => addToCartClickHandle(item)}
                >
                  <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                </PressableScale>
              </View>
            </View>
          </View>

          <View style={styles.serviceImageContainer}>
            <Image
              source={
                item.image_url ? { uri: item.image_url } :
                  item.image ? item.image : {
                    uri: "https://res.cloudinary.com/dsjcgs6nu/image/upload/v1751596604/ChatGPT_Image_Jul_3_2025_10_18_12_PM_xqu38i.png",
                  }
              }
              style={styles.serviceImage}
              resizeMode="cover"
            />
          </View>
          
        </View>
      </PressableScale>
    );
  });

  ServiceCard.displayName = "ServiceCard";

  const getCategoryImage = (categoryId) => {
    return categoryImages[categoryId] || categoryImages.all;
  };



  const renderItem = ({ item }) => <ServiceCard item={item} />;

  // Service Detail Modal Component
  const ServiceDetailModal = () => {
    if (!selectedService) return null;

    return (
      <Modal visible={showServiceModal} transparent animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <Animated.View 
            style={[styles.modalContent, { transform: [{ translateY: modalY }] }]}
            {...panResponder.panHandlers}
          >
            {/* Gesture Indicator Bar */}
            <TouchableOpacity 
              style={styles.gestureIndicator}
              activeOpacity={1}
              onPress={() => {}}
            >
              <View style={styles.indicatorBar} />
            </TouchableOpacity>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Service Details</Text>
              <TouchableOpacity onPress={() => {
                setShowServiceModal(false);
                setSelectedService(null);
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Service Image */}
              <View style={styles.modalImageContainer}>
                <Image
                  source={
                    selectedService.image_url 
                      ? { uri: selectedService.image_url } 
                      : selectedService.image 
                        ? selectedService.image 
                        : {
                            uri: "https://res.cloudinary.com/dfdryre0n/image/upload/v1759349542/ljihy20jybbtrxmpbk9r.png",
                          }
                  }
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              </View>

              {/* Service Title & Category */}
              <View style={styles.modalInfoSection}>
                <Text style={styles.modalServiceTitle}>{selectedService.title}</Text>
                
                <View style={styles.modalCategoryRow}>
                  <View style={styles.modalCategoryBadge}>
                    <Ionicons name="file-tray-outline" size={14} color="#3898B3" />
                    <Text style={styles.modalCategoryText}>{selectedService.category}</Text>
                  </View>
                  {selectedService.sub_category && (
                    <View style={styles.modalSubCategoryBadge}>
                      <Text style={styles.modalSubCategoryText}>{selectedService.sub_category}</Text>
                    </View>
                  )}
                </View>

                {/* Price & Rating Row */}
                <View style={styles.modalPriceRatingRow}>
                  <View style={styles.modalPriceContainer}>
                    <Text style={styles.modalPrice}>₹{selectedService.price}</Text>
                    {selectedService.originalPrice && (
                      <Text style={styles.modalOriginalPrice}>₹{selectedService.originalPrice}</Text>
                    )}
                  </View>
                  {selectedService.ratings && (
                    <View style={styles.modalRatingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.modalRatingText}>{selectedService.ratings}</Text>
                    </View>
                  )}
                </View>

                {/* Duration */}
                {selectedService.duration && (
                  <View style={styles.modalDurationRow}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.modalDurationText}>{selectedService.duration}</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {selectedService.description && (
                <View style={styles.modalDescriptionSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalDescription}>{selectedService.description}</Text>
                </View>
              )}

              {/* Add some bottom padding */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={styles.modalBottomSection}>
              <View style={styles.modalPriceBottomContainer}>
                <Text style={styles.modalBottomPriceLabel}>Total Price</Text>
                <Text style={styles.modalBottomPrice}>₹{selectedService.price}</Text>
              </View>
              <PressableScale
                style={styles.modalAddToCartButton}
                onPress={() => {
                  setShowServiceModal(false);
                  setSelectedService(null);
                  addToCartClickHandle(selectedService);
                }}
              >
                <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.modalAddToCartText}>Add to Cart</Text>
              </PressableScale>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Header */}
      <AppHeader
        title="Services"
        showBack
        onBack={() => router.back()}
        rightElement={
          <PressableScale
            style={[styles.cartButton, cartNavigationLoading && styles.cartButtonDisabled]}
            onPress={handleCartNavigation}
            disabled={cartNavigationLoading}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart" size={24} color="#fff" />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </View>
          </PressableScale>
        }
      />

      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderItem} // each service card
        keyExtractor={(item, index) => `service-${item.service_id}-${index}`}
        getItemLayout={(data, index) => ({
          length: ITEM_CARD_HEIGHT,
          offset: ITEM_CARD_HEIGHT * index,
          index,
        })}
        ListHeaderComponent={
          <View>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <FlatList
                data={filteredCategories}
                renderItem={renderCategoryCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              />
            </View>

            {/* Services Section Header */}
            <View style={styles.servicesSection}>
              <View style={styles.servicesSectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "All"
                    ? "All Services"
                    : `${selectedCategory} Services`}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3898B3" />
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#DDD" />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with different keywords
              </Text>
            </View>
          )
        }
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews={false}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      />
      {/* Overlay Spinner */}
          {overlayLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

      {/* Cart Added Bottom Bar - Only visible on Services page */}
      <CartAddedBottomBar 
        isVisible={isCartAddedBottomBarVisible}
        onClose={() => setIsCartAddedBottomBarVisible(false)}
        cartItemCount={cartItemCount}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal />
    </View>
  );
}

ServicesPage.displayName = 'ServicesPage';

export default ServicesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3898B3',
    paddingTop: screenHeight * 0.06, // Adjusted padding dynamically
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
  },
  cartButton: {
    padding: 5,
    marginLeft: 10,
  },
  cartButtonDisabled: {
    opacity: 0.6,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // headerSubtitle removed - AppHeader has no subheading
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // spacing adjusted to sit closer under AppHeader
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10,
    fontFamily: 'Poppins_400Regular',
  },
  categoriesSection: {
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryCard: {
    borderColor: '#3898B3',
    backgroundColor: '#F0F8FF',
  },
  categoryIconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedCategoryName: {
    color: '#3898B3',
  },
  categoryCount: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  servicesSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  servicesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3898B3',
    fontWeight: '600',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  serviceRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    height: 170,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 0,
  },
  cardContentHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 140,
  },
  serviceDetailsLeft: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 16,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  serviceBadge: {
    // removed
  },
  badgeText: {
    // removed
  },
  serviceImageContainer: {
    position: 'relative',
    width: 120,
    height: 165,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  imageOverlay: {
    // removed
  },
  favoriteButton: {
    // removed
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  controlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  ratingTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 6,
  },
  metricsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  addToCartButton: {
    backgroundColor: '#3898B3',
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 22,
  },
  serviceCategory: {
    fontSize: 11,
    color: '#3898B3',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  featureText: {
    fontSize: 9,
    color: '#3898B3',
    fontWeight: '500',
  },
  serviceMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 40,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 6,
  },
  reviewsText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  addToCartButton: {
    backgroundColor: '#3898B3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 0,
    marginTop: -8,
    zIndex: 10,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // fills the entire screen
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // ensure it’s on top
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  gestureIndicator: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalScrollView: {
    maxHeight: screenHeight * 0.65,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#F5F5F5',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalServiceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 32,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  modalCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F5F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modalCategoryText: {
    fontSize: 13,
    color: '#3898B3',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalSubCategoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalSubCategoryText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  modalPriceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3898B3',
  },
  modalOriginalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  modalRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDurationText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  modalDescriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  modalBottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalPriceBottomContainer: {
    flex: 1,
  },
  modalBottomPriceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  modalBottomPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3898B3',
  },
  modalAddToCartButton: {
    backgroundColor: '#3898B3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  modalAddToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
