import { StyleSheet, View } from "react-native";
import Text from "../ui/Text"
import React from "react";
import TransactionInfoBox from "./TransactionInfoBox";

export default function TransactionCard({ data, key }) {
  return (
    <View style={{ backgroundColor: "white" }}>
      <View
        style={{
          paddingHorizontal: 10,
          height: 50,
          backgroundColor: "#b3b3b3",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text>{data.year}</Text>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{data.month}</Text>
        </View>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          Rs. {data.total}
        </Text>
      </View>
      <View>
        {data.entries.map((transaction, index) => (
          <TransactionInfoBox data={transaction} key={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
