import { Alert, ScrollView, StyleSheet } from "react-native";
import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import Contact from "../../../../../components/Contact/Contact";
import Data from "../../../../../components/Home/Data";
import Header from "../../../../../components/Home/Header";
import Info from "../../../../../components/Home/Info";
import { useAppStates } from "../../../../../context/AppStates";
import { useAuth } from "../../../../../context/AuthProvider";
import {
  requestLocationPermission,
  fetchCurrentPosition,
  reverseGeocodeWithGoogle,
  buildLocationObject,
} from "../../../../../services/locationService";
import { saveUserLocation } from "../../../../../services/api/location.api.js";

export default function HomeScreen() {
  const { updateCurrentLocation, updateSelectedLocation, updateSelectedLocationObject } = useAppStates();
  const { isLoggedIn } = useAuth();
  const locationRequestRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const captureLocation = async () => {
        if (!isLoggedIn || locationRequestRef.current) return;

        locationRequestRef.current = true;
        try {
          const granted = await requestLocationPermission();
          if (!granted) {
            if (!active) return;
            Alert.alert(
              "Location Required",
              "We need your location to show nearby services. Please enable location access in settings.",
            );
            return;
          }

          const position = await fetchCurrentPosition();
          if (!active) return;

          const { latitude, longitude } = position.coords;
          const geocodeResult = await reverseGeocodeWithGoogle(latitude, longitude);
          if (!active) return;

          const locationObj = buildLocationObject({
            formattedAddress: geocodeResult.formatted_address,
            coords: { latitude, longitude },
            addressComponents: geocodeResult.address_components,
          });

          await updateCurrentLocation({
            address: locationObj.formattedAddress,
            coordinates: { latitude, longitude },
          });

          // Update default selection for booking flows
          updateSelectedLocation(locationObj.formattedAddress || "");
          updateSelectedLocationObject(locationObj);

          try {
            await saveUserLocation({
              latitude,
              longitude,
              formattedAddress: locationObj.formattedAddress,
            });
          } catch (apiError) {
            console.warn('[Home] Failed to persist user location', apiError?.message || apiError);
          }
        } catch (error) {
          console.warn('[Home] Location capture failed', error?.message || error);
        } finally {
          locationRequestRef.current = false;
        }
      };

      captureLocation();

      return () => {
        active = false;
      };
    }, [isLoggedIn, updateCurrentLocation, updateSelectedLocation, updateSelectedLocationObject])
  );

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
        <Header />
        <Info />
        <Data />
      </ScrollView>
      <Contact />
    </>
  );
}

const styles = StyleSheet.create({});
