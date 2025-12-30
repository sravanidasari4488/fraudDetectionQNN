import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from 'react';
import { TouchableOpacity, View, Linking } from 'react-native';
import Text from "../ui/Text"

const Contact = () => {

  
  const handleWhatsApp = () => {
    const phone = '919121377419';
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url);
  };

  return (
    <View style={{
      position: 'absolute', 
      bottom: 65, 
      right: 15, 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 999
    }}>
      <TouchableOpacity 
        style={{
          backgroundColor: "#159b77", 
          borderRadius: 25, 
          width: 50, 
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        onPress={handleWhatsApp}
      >
        <FontAwesome5 name="headset" size={24} color="white" />
      </TouchableOpacity>
      <Text style={{
        color: 'black', 
        fontSize: 12, 
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Need help?
      </Text>
    </View>
  );
};

export default Contact;
