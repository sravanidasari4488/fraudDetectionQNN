import { StyleSheet } from "react-native";
import useDimension from "../../hooks/useDimensions";

export default function HeaderStyle() {
  const { screenHeight, screenWidth } = useDimension();

  const styles = StyleSheet.create({
    header: {
      height: screenHeight * 0.18, // Increased from 0.20 to give more space
      width: screenWidth,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      paddingTop: screenHeight * 0.04, // Keep padding consistent
      backgroundColor: "white",
      borderBottomLeftRadius: 20, // Added rounded bottom corners
      borderBottomRightRadius: 20,
      overflow: 'hidden', // Ensure gradient respects border radius
    },
    rowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    locationWrap: {
      flex: 1,
      paddingRight: 12,
    },
    locationLabel: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 6,
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 13,
      flex: 1,
    },
    locationAndNotification: {
      flexDirection: "row",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth,
      justifyContent: "space-between",
      alignItems: "center",
    },
    iconGroup: {
      width: screenWidth * 0.18,
      alignItems: 'flex-end',
      paddingRight: 8,
    },
    iconButton: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.06)'
    },
    location: {
      flexDirection: "column",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth * 0.7,
      paddingLeft: 15,
      justifyContent: "center", // Added for better vertical alignment
    },
    notification: {
      justifyContent: "center",
      alignItems: "center",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth * 0.2,
      paddingLeft: 10,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    rowBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    searchWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      minHeight: 50,
      borderWidth: 1,
      borderColor: '#E6EEF0',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchText: {
      flex: 1,
      color: '#1A1A1A',
      fontSize: 15,
      paddingVertical: 0,
    },
    cartButton: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent'
    },
    cartButtonDisabled: {
      opacity: 0.6,
    },
    cartInner: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cartBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#F44336',
      borderRadius: 10,
      paddingHorizontal: 6,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center'
    },
    cartBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  return styles;
}