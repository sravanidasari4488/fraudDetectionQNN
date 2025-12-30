import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const AppStatesContext = createContext();

export const AppStatesProvider = ({ children }) => {
  const [isAppOpenedFirstTime, setIsAppOpenedFirstTime] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Tap to set location");
  const [selectedLocationObject, setSelectedLocationObject] = useState({});
  const [selectedMobileNumber, setSelectedMobileNumber] = useState("");
  const [currentAddress, setCurrentAddress] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);

  useEffect(() => {
    const getAppFirstOpenState = async () => {
      const appFirstOpenState = await AsyncStorage.getItem("appFirstOpenState");
      setIsAppOpenedFirstTime(appFirstOpenState === null);
    };
    getAppFirstOpenState();
  }, []);

  useEffect(() => {
    const getProfileCompletedState = async () => {
      const profileCompletedState = await AsyncStorage.getItem("profileCompleted");
      setIsProfileCompleted(profileCompletedState === "true");
    };
    getProfileCompletedState();
  }, []);

  useEffect(() => {
    const getSelectedLocation = async () => {
      const savedLocation = await AsyncStorage.getItem("selectedLocation");
      if (savedLocation) {
        setSelectedLocation(savedLocation);
      }
    };
    getSelectedLocation();
  }, []);

  useEffect(() => {
    const getSelectedMobileNumber = async () => {
      const savedMobileNumber = await AsyncStorage.getItem("selectedMobileNumber");
      if (savedMobileNumber) {
        setSelectedMobileNumber(savedMobileNumber);
      }
    };
    getSelectedMobileNumber();
  }, []);

  useEffect(() => {
    const getSelectedLocationObject = async () => {
      const savedLocationObject = await AsyncStorage.getItem("selectedLocationObject");
      if (savedLocationObject) {
        setSelectedLocationObject(JSON.parse(savedLocationObject));
      }
    };
    getSelectedLocationObject();
  }, []);

  useEffect(() => {
    const loadCurrentLocation = async () => {
      const savedCoords = await AsyncStorage.getItem('currentCoordinates');
      const savedAddress = await AsyncStorage.getItem('currentAddress');
      if (savedCoords) {
        try {
          setCurrentCoordinates(JSON.parse(savedCoords));
        } catch (_) {
          setCurrentCoordinates(null);
        }
      }
      if (savedAddress) {
        setCurrentAddress(savedAddress);
      }
    };
    loadCurrentLocation();
  }, []);

  useEffect(() => {
    if (isAppOpenedFirstTime === false) {
      const setAppFirstOpenState = async () => {
        await AsyncStorage.setItem("appFirstOpenState", "false");
      };
      setAppFirstOpenState();
    }
  }, [isAppOpenedFirstTime]);

  const markProfileCompleted = async () => {
    await AsyncStorage.setItem("profileCompleted", "true");
    setIsProfileCompleted(true);
  };

  const markAppOpened = async () => {
    await AsyncStorage.setItem("appFirstOpenState", "false");
    setIsAppOpenedFirstTime(false);
  };

  const updateSelectedLocation = async (location) => {
    setSelectedLocation(location);
    await AsyncStorage.setItem("selectedLocation", location);
  };

  const updateSelectedLocationObject = async (locationObj) => {
    setSelectedLocationObject(locationObj);
    await AsyncStorage.setItem("selectedLocationObject", JSON.stringify(locationObj));
  };

  const updateCurrentLocation = async ({ address, coordinates }) => {
    if (address) {
      setCurrentAddress(address);
      await AsyncStorage.setItem('currentAddress', address);
    }
    if (coordinates) {
      setCurrentCoordinates(coordinates);
      await AsyncStorage.setItem('currentCoordinates', JSON.stringify(coordinates));
    }
  };

  const clearCurrentLocation = async () => {
    setCurrentAddress(null);
    setCurrentCoordinates(null);
    await AsyncStorage.multiRemove(['currentAddress', 'currentCoordinates']);
  };

  const updateSelectedMobileNumber = async (mobileNumber) => {
    setSelectedMobileNumber(mobileNumber);
    await AsyncStorage.setItem("selectedMobileNumber", mobileNumber);
  };

  // Reset all app states to defaults for logout (keeps appOpenedFirstTime)
  const resetAppStatesForLogout = () => {
    setIsProfileCompleted(null);
    setSelectedLocation("Tap to set location");
    setSelectedLocationObject({});
    setSelectedMobileNumber("");
    // Note: We don't reset isAppOpenedFirstTime as requested
  };

  return (
    <AppStatesContext.Provider
      value={{ 
        isAppOpenedFirstTime, 
        setIsAppOpenedFirstTime,
        isProfileCompleted,
        setIsProfileCompleted,
        markProfileCompleted,
        markAppOpened,
        selectedLocation,
        setSelectedLocation,
        updateSelectedLocation,
        selectedLocationObject,
        setSelectedLocationObject,
        updateSelectedLocationObject,
        selectedMobileNumber,
        setSelectedMobileNumber,
        updateSelectedMobileNumber,
        currentAddress,
        currentCoordinates,
        updateCurrentLocation,
        clearCurrentLocation,
        resetAppStatesForLogout
      }}
    >
      {children}
    </AppStatesContext.Provider>
  );
};

export const useAppStates = () => useContext(AppStatesContext);
