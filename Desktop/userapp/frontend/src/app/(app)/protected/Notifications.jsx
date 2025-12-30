import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import AppHeader from "../../../components/common/AppHeader";
import SinglePageSwitch from "../../../components/common/SinglePageSwitch";
import JobAlert from "../../../components/Notification/JobAlert";
import PlatformUpdate from "../../../components/Notification/PlatformUpdate";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
export default function Notifications() {

  const navigation = useNavigation();

  // Optional: If you want to hide the default header provided by the navigator
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppHeader title="Notifications" showBack={true} onBack={() => navigation.goBack()}/>
      <SinglePageSwitch
        leftText={"Booking Updates"}
        rightText={"App Updates"}
        leftElement={<JobAlert />}
        rightElement={<PlatformUpdate />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: screenHeight * 0.00,
  },
});
