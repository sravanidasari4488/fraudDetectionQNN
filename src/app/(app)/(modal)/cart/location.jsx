import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from "../../../../components/ui/Text.jsx";
import { useAppStates } from '../../../../context/AppStates';
import { useAuth } from '../../../../context/AuthProvider';
import {
  requestLocationPermission,
  fetchCurrentPosition,
  reverseGeocodeWithGoogle,
  fetchPlacePredictions,
  fetchPlaceDetails,
  buildLocationObject,
  geocodeAddressWithGoogle,
} from '../../../../services/locationService';
import { saveUserLocation } from '../../../../services/api/location.api.js';

const { width: screenWidth } = Dimensions.get("window");

export default function LocationScreen() {
  const router = useRouter();
  const {
    selectedLocation,
    updateSelectedLocation,
    selectedLocationObject,
    updateSelectedLocationObject,
    currentCoordinates,
  } = useAppStates();
  const { isLoggedIn } = useAuth();
  
  // Location form fields
  const [houseNumber, setHouseNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [pincode, setPincode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isFetchingCurrent, setIsFetchingCurrent] = useState(false);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationDetail, setLocationDetail] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Validation helper
  const isFormValid = () => {
    return houseNumber.trim() && city.trim() && pincode.trim();
  };

  // Field navigation refs
  const houseNumberRef = useRef(null);
  const roadRef = useRef(null);
  const districtRef = useRef(null);
  const cityRef = useRef(null);
  const additionalInfoRef = useRef(null);
  const pincodeRef = useRef(null);

  // Smooth field navigation
  const focusNextField = (nextRef) => {
    setTimeout(() => {
      nextRef.current?.focus();
    }, 100);
  };

  const prefillFromLocationObject = (locationObj) => {
    if (!locationObj) return;

    setHouseNumber(locationObj.houseNumber || "");
    setDistrict(locationObj.district || "");
    setCity(locationObj.city || "");
    setPincode(locationObj.pincode || "");
    setAdditionalInfo(locationObj.additionalInfo || "");
    if (locationObj.formattedAddress) {
      setSearchQuery(locationObj.formattedAddress);
    }
    setLocationDetail(locationObj);
  };

  useEffect(() => {
    if (selectedLocationObject && Object.keys(selectedLocationObject).length > 0) {
      prefillFromLocationObject(selectedLocationObject);
    } else if (selectedLocation) {
      setSearchQuery(selectedLocation);
    }
  }, [selectedLocationObject, selectedLocation]);

  useEffect(() => () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    setPredictions([]);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text || !text.trim()) {
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsFetchingPlaces(true);
        const results = await fetchPlacePredictions(text.trim(), {
          location: currentCoordinates || undefined,
        });
        setPredictions(results);
      } catch (error) {
        console.warn('[Location] Autocomplete error', error?.message || error);
      } finally {
        setIsFetchingPlaces(false);
      }
    }, 400);
  };

  const handlePredictionSelect = async (prediction) => {
    if (!prediction?.place_id) return;
    setSearchQuery(prediction.description);
    setPredictions([]);
    try {
      setIsFetchingPlaces(true);
      const details = await fetchPlaceDetails(prediction.place_id);
      const coords = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      const locationObj = buildLocationObject({
        formattedAddress: details.formatted_address,
        coords,
        addressComponents: details.address_components,
      });
      prefillFromLocationObject(locationObj);
    } catch (error) {
      console.warn('[Location] Failed to load place details', error?.message || error);
      Alert.alert('Location Error', 'Unable to fetch that address. Please try a different one.');
    } finally {
      setIsFetchingPlaces(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsFetchingCurrent(true);
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert('Location Permission Required', 'We need your permission to access current location. Please enable location access in settings.');
        return;
      }

      const position = await fetchCurrentPosition();
      const { latitude, longitude } = position.coords;
      const geocodeResult = await reverseGeocodeWithGoogle(latitude, longitude);
      const locationObj = buildLocationObject({
        formattedAddress: geocodeResult.formatted_address,
        coords: { latitude, longitude },
        addressComponents: geocodeResult.address_components,
      });

      prefillFromLocationObject(locationObj);
      await applyLocationSelection(locationObj, true);
    } catch (error) {
      console.warn('[Location] Use current location failed', error?.message || error);
      Alert.alert('Location Error', 'Unable to fetch current location. Please try again or enter address manually.');
    } finally {
      setIsFetchingCurrent(false);
    }
  };

  const buildFormattedAddress = () => {
    const parts = [
      houseNumber.trim(),
      district.trim(),
      city.trim(),
      pincode.trim(),
      additionalInfo.trim(),
    ].filter(Boolean);

    return parts.join(', ');
  };

  const applyLocationSelection = async (locationObj, closeModal = false) => {
    const formattedAddress = locationObj.formattedAddress || buildFormattedAddress();

    await updateSelectedLocation(formattedAddress);
    await updateSelectedLocationObject({
      ...locationObj,
      formattedAddress,
      houseNumber: (houseNumber || locationObj.houseNumber || '').trim(),
      district: (district || locationObj.district || '').trim(),
      city: (city || locationObj.city || '').trim(),
      pincode: (pincode || locationObj.pincode || '').trim(),
      additionalInfo: (additionalInfo || locationObj.additionalInfo || '').trim(),
    });

    if (isLoggedIn && locationObj.latitude && locationObj.longitude) {
      try {
        await saveUserLocation({
          latitude: locationObj.latitude,
          longitude: locationObj.longitude,
          formattedAddress,
        });
      } catch (error) {
        console.warn('[Location] Failed to persist selected location', error?.message || error);
      }
    }

    if (closeModal) {
      router.back();
    }
  };

  const handleManualLocationSave = () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill in all required fields (House Number, City, and Pincode)');
      return;
    }

    const formattedAddress = buildFormattedAddress();

    const persistLocation = async () => {
      setIsSavingLocation(true);
      try {
        let baseLocation = locationDetail;

        if (!baseLocation || !baseLocation.latitude || !baseLocation.longitude) {
          const geocode = await geocodeAddressWithGoogle(formattedAddress);
          baseLocation = buildLocationObject({
            formattedAddress: geocode.formatted_address,
            coords: {
              latitude: geocode.geometry.location.lat,
              longitude: geocode.geometry.location.lng,
            },
            addressComponents: geocode.address_components,
            additionalFields: { additionalInfo },
          });
          prefillFromLocationObject(baseLocation);
        }

        await applyLocationSelection(baseLocation, true);
      } catch (error) {
        console.warn('[Location] Manual save failed', error?.message || error);
        Alert.alert('Location Error', 'Unable to validate address with Google Maps. Please refine the address.');
      } finally {
        setIsSavingLocation(false);
      }
    };

    persistLocation();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
        >
          {isFetchingCurrent ? (
            <ActivityIndicator color="#3898B3" />
          ) : (
            <>
              <Ionicons name="navigate" size={20} color="#3898B3" />
              <Text style={styles.currentLocationText}>Use Current GPS Location</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.locationInputContainer}>
          <Text style={styles.inputLabel}>Search Address</Text>
          <View style={styles.autocompleteInputWrapper}>
            <Ionicons name="search" size={18} color="#666" style={styles.autocompleteIcon} />
            <TextInput
              style={styles.autocompleteInput}
              placeholder="Search for your address"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {isFetchingPlaces && <ActivityIndicator size="small" color="#3898B3" />}
          </View>
          {predictions.length > 0 && (
            <View style={styles.predictionsContainer}>
              {predictions.map((prediction) => (
                <TouchableOpacity
                  key={prediction.place_id}
                  style={styles.predictionItem}
                  onPress={() => handlePredictionSelect(prediction)}
                >
                  <Ionicons name="location-outline" size={18} color="#3898B3" style={{ marginRight: 12 }} />
                  <Text style={styles.predictionText}>{prediction.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Detailed Address Form */}
        <View style={styles.detailedForm}>
          <Text style={styles.formTitle}>Enter Detailed Address</Text>
          <Text style={styles.formSubtitle}>
            Fields marked with <Text style={styles.requiredAsterisk}>*</Text> are required
          </Text>
          
          {/* Show prefill indicator if form has existing data */}
          {(selectedLocationObject && Object.keys(selectedLocationObject).length > 0) && (
            <View style={styles.prefillIndicator}>
              <Ionicons name="information-circle" size={16} color="#3898B3" />
              <Text style={styles.prefillText}>Form prefilled with saved location data</Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>
              House Number <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              ref={houseNumberRef}
              style={[
                styles.textInput,
                !houseNumber.trim() && styles.invalidInput
              ]}
              value={houseNumber}
              onChangeText={setHouseNumber}
              placeholder="Enter house/flat number"
              onSubmitEditing={() => focusNextField(roadRef)}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Area/District</Text>
            <TextInput
              ref={districtRef}
              style={styles.textInput}
              value={district}
              onChangeText={setDistrict}
              placeholder="Enter area/district"
              onSubmitEditing={() => focusNextField(cityRef)}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>
              City <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              ref={cityRef}
              style={[
                styles.textInput,
                !city.trim() && styles.invalidInput
              ]}
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              onSubmitEditing={() => focusNextField(pincodeRef)}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>
              Pincode <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              ref={pincodeRef}
              style={[
                styles.textInput,
                !pincode.trim() && styles.invalidInput
              ]}
              value={pincode}
              onChangeText={setPincode}
              placeholder="Enter pincode"
              keyboardType="numeric"
              maxLength={6}
              onSubmitEditing={() => focusNextField(additionalInfoRef)}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Additional Info</Text>
            <TextInput
              ref={additionalInfoRef}
              style={[styles.textInput, styles.additionalInfoInput]}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder="Landmark, floor, etc."
              multiline
              numberOfLines={2}
              returnKeyType="done"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.confirmButton,
            (!isFormValid() || isSavingLocation) && styles.disabledButton
          ]}
          onPress={handleManualLocationSave}
          disabled={!isFormValid() || isSavingLocation}
        >
          <Text style={[
            styles.confirmButtonText,
            (!isFormValid() || isSavingLocation) && styles.disabledButtonText
          ]}>{isSavingLocation ? 'Saving...' : 'Confirm Location'}</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderColor: '#3898B3',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 20,
    gap: 10,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#3898B3',
    fontWeight: '500',
  },
  locationInputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  detailedForm: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  prefillIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3898B3',
  },
  prefillText: {
    fontSize: 14,
    color: '#3898B3',
    marginLeft: 8,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  invalidInput: {
    borderColor: '#FFB3B3',
    backgroundColor: '#FFF8F8',
  },
  additionalInfoInput: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  saveFormButton: {
    backgroundColor: '#3898B3',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveFormButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#3898B3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#f2f2f2',
  },
  autocompleteInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  autocompleteIcon: {
    marginRight: 8,
  },
  autocompleteInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  predictionsContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  predictionText: {
    flex: 1,
    color: '#333',
  },
});
