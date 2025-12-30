import { Image, StyleSheet, View } from "react-native";
import useDimension from "../../hooks/useDimensions";
import Text from "../ui/Text";
export default function TransactionInfoBox({ data }) {
  const { screenWidth } = useDimension();
  return (
    <View
      style={{
        width: screenWidth,
        height: 70,
        padding: 10,
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 55,
          height: 55,
          backgroundColor: "#e6e6e6",
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <Image source={{ uri: data.image }} style={{ flex: 1 }} />
      </View>
      <View
        style={{
          width: "55%",
          left: 20,
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>{data.name}</Text>
        <Text style={{ fontWeight: "bold", fontSize: 12.5, color: "#3ea2bb" }}>
          {data.service}
        </Text>
        <Text style={{ fontSize: 11, color: "#b3b3b3" }}>{data.date}</Text>
      </View>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 16,
          color: data.type === "credit" ? "green" : "red",
        }}
      >
        {data.type === "credit"
          ? "+ Rs. " + data.amount
          : "- Rs. " + data.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
