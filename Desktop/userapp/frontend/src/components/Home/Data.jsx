import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import Text from "../ui/Text";

import getbookings from "../../data/getdata/getbookings";
import gettestimonials from "../../data/getdata/gettestimonials";

import { allCategories, categoryImages, getpopularServices } from "../../data/servicesData";

export default function Data() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [allServicesLoading, setAllServicesLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await allCategories();
        setCategories(fetchedCategories);
      } catch (error) {
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);
  const [testimonials, settestimonials] = useState([])




  // const [popularServices, setPopularServices] = useState([]);
  // useEffect(() => {
  //   const fetchPopularService = async () => {
  //     const { arr, error } = await getpopularServices();
  //     if (error) {
  //       return;
  //     }

  //     setPopularServices(arr); // set the state with formatted array
  //   };

  //   fetchPopularService();
  // }, []);

  const [bookings, setbookings] = useState([]);

  useEffect(() => {
      const getbookingsdata = async () => {
        const { arr, error } = await getbookings(); // ✅ use arr, not data
        if (error) {
          return;
        }
        setbookings(arr); // ✅ directly set array
      };
  
      getbookingsdata();
    }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { arr, error } = await gettestimonials();
      if (error) {
        return;
      }

      settestimonials(arr); // set the state with formatted array
    };

    fetchTestimonials();
  }, []);

  const handleSeeAll = () => {
    if(loading) return; // Prevent multiple navigations
    setLoading(true);
    router.push('/(app)/protected/(tabs)/Services');
    setTimeout(() => setLoading(false), 1000); // Simulate loading for 1 second
  };

  const handleAllServices = () => {
    if (allServicesLoading) return;
    setAllServicesLoading(true);
    router.push('/(app)/protected/(tabs)/Services');
    setTimeout(() => setAllServicesLoading(false), 1000); // Simulate loading for 1 second
  };

  // Handler for each category button
  const handleCategory = (categoryId) => {
    if (categoryLoading !== null) return;
    setCategoryLoading(categoryId);
    router.push(`/(app)/protected/(tabs)/Services?selectedCategory=${categoryId}`);
    setTimeout(() => setCategoryLoading(null), 1000); // Simulate loading for 1 second
  };

  const renderCategoryItem = ({ item }) => {
    const getCategoryImage = (categoryId) => {
      return categoryImages[categoryId] || categoryImages['all'];
    };

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => {
          if (categoryLoading === null) {
            handleCategory(item.id);
          }
        }}
        disabled={categoryLoading !== null}
      >
        <View style={[styles.categoryIcon]}>
          <Image
            source={getCategoryImage(item.id)}
            style={{ width: 94, height: 94 }}
            resizeMode="contain"
          />
        </View>
        {/* <Text style={styles.categoryText}>{item.name}</Text> */}
      </TouchableOpacity>
    );
  };

  // const renderPopularServiceItem = ({ item }) => (
  //   <TouchableOpacity style={styles.serviceCard} onPress={() => {}}>
  //     <View style={styles.serviceImageContainer}>
  //       <Image src={item.image} style={styles.serviceImage} />
  //       {item.discount && (
  //         <View style={styles.discountBadge}>
  //           <Text style={styles.discountText}>{`${item.discount}% off`}</Text>
  //         </View>
  //       )}
  //     </View>
  //     <View style={styles.serviceInfo}>
  //       <Text style={styles.serviceTitle}>{item.title}</Text>
  //       <View style={styles.ratingContainer}>
  //         <Ionicons name="star" size={16} color="#FFD700" />
  //         <Text style={styles.ratingText}>{item.rating}</Text>
  //       </View>
  //       <Text
  //         style={styles.servicePrice}
  //       >{`₹${item.price}`}</Text>
  //     </View>
  //   </TouchableOpacity>
  // );

  const renderTestimonialItem = ({ item }) => (
    <View style={styles.testimonialCard}>
      <View style={styles.testimonialHeader}>
        <Image src={item.avatar} style={styles.avatar} />
        <View style={styles.testimonialInfo}>
          <Text style={styles.testimonialName}>{item.name}</Text>
          <View style={styles.starsContainer}>
    
          </View>
        </View>
      </View>
      <Text style={styles.testimonialComment}>{item.comment}</Text>
    </View>
  );

  const renderBookAgainItem = ({ item }) => (
    <TouchableOpacity style={styles.bookAgainCard} onPress={() => { }}>
      <Image source={require("../../../assets/images/mcbReplacement.jpg")} style={styles.bookAgainImage} />
      <View style={styles.bookAgainInfo}>
        <Text style={styles.bookAgainTitle}>{item.service_name}</Text>
        <Text style={styles.bookAgainDate}>Booked on: {item.date}</Text>
        <Text style={styles.bookAgainProvider}>Provider: {item.provider}</Text>
        <Text style={styles.bookAgainPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>

        {categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        )}
        
        <TouchableOpacity 
          style={styles.seeMoreContainer} 

          onPress={() => {
            handleAllServices();
          }}
        >
          <Text style={styles.seeMoreText}>All Services</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Services Section
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <TouchableOpacity onPress={() => {
            handleSeeAll();
          }}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={popularServices}
          renderItem={renderPopularServiceItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        />
      </View> */}

      {/* Customer Testimonials Section */}
      {testimonials.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Testimonials</Text>
          <FlatList
            data={testimonials}
            renderItem={renderTestimonialItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal                              // Enable horizontal scrolling
            showsHorizontalScrollIndicator={false}  // Hide scroll indicator
            contentContainerStyle={styles.testimonialsContainer}  // Add container style
          />
        </View>
      )}

      {/* Recent Bookings Section */}
      {bookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <FlatList
            data={bookings.slice(-2)}
            renderItem={renderBookAgainItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={{ marginBottom: 140 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 15,
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 170,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },

  // Categories Styles
  categoriesContainer: {
    gap: 16,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 0,
  },
  categoryIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 4,

  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  seeMoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3898B3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E6F5F8',
    borderRadius: 20,
    overflow: 'hidden',
  },

  // Popular Services Styles
  servicesContainer: {
    paddingRight: 10,
  },
  serviceCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },

  // Testimonials Styles
  testimonialsContainer: {
    paddingRight: 10,  // Add padding for last item
  },
  testimonialCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,           // Add right margin for spacing between cards
    width: 280,                // Fixed width for horizontal scrolling
    minHeight: 120,            // Minimum height to prevent layout issues
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  testimonialComment: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    flexShrink: 1,             // Allow text to wrap properly
  },

  // Book Again Styles
  bookAgainCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookAgainImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  bookAgainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookAgainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bookAgainDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  bookAgainProvider: {
    fontSize: 13,
    color: '#3898B3',
    fontWeight: '500',
    marginBottom: 2,
  },
  bookAgainPrice: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
});