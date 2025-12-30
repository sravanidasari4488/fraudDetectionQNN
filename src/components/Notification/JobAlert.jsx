import { ScrollView, StyleSheet, View } from "react-native";
import Text from "../ui/Text";
export default function JobAlert() {
  const notifications = [
    {
      date: "Today",
      customerName: "Plumbing Expert Pro",
      serviceName: "Pipe Repair Confirmed",
      location: "123 Main Street, Downtown",
      image: "https://picsum.photos/200/300",
    },
    {
      date: "Yesterday",
      customerName: "CleanHome Services",
      serviceName: "House Cleaning Completed",
      location: "456 Oak Avenue, Suburb",
      image: "https://picsum.photos/201/301",
    },
    {
      date: "2 days ago",
      customerName: "ElectricFix Solutions",
      serviceName: "Electrical Work Scheduled",
      location: "789 Pine Street, City Center",
      image: "https://picsum.photos/202/302",
    },
    {
      date: "3 days ago",
      customerName: "GreenThumb Gardening",
      serviceName: "Garden Maintenance Done",
      location: "321 Rose Lane, Garden District",
      image: "https://picsum.photos/203/303",
    },
    {
      date: "1 week ago",
      customerName: "QuickFix Handyman",
      serviceName: "Furniture Assembly Completed",
      location: "654 Maple Drive, Residential Area",
      image: "https://picsum.photos/204/304",
    },
    {
      date: "1 week ago",
      customerName: "AirCool HVAC Services",
      serviceName: "AC Repair Confirmed",
      location: "987 Cedar Boulevard, Business District",
      image: "https://picsum.photos/205/305",
    },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "30%",
            borderWidth: 1,
            height: 1,
            borderColor: "#b3b3b3",
          }}
        ></View>
        <Text style={{ color: "b3b3b3" }}>New Requests</Text>
        <View
          style={{
            width: "30%",
            borderWidth: 1,
            height: 1,
            borderColor: "#b3b3b3",
          }}
        ></View>
      </View> */}
      <View style={{ flex: 1, paddingHorizontal: 15, paddingTop: 20, alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
          No new booking updates
        </Text>
      </View>
      {/* 
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        {notifications.map((notification, index) => (
          <JobAlertBox key={index} notification={notification} />
        ))}
      </View>
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
