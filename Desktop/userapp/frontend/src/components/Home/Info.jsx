import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import supabase from "../../data/supabaseClient";
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";
import useDimension from "../../hooks/useDimensions";
import Carousel from "../common/Carousel";
import Text from "../ui/Text";

export default function Info() {
  const { user } = useAuth();
  const { screenHeight, screenWidth } = useDimension();
  const [carouselData, setcarouselData] = useState([])


  useEffect(() => {
    const getcarouselData = async () => {
      const { data, error } = await supabase
        .schema('onlyclick')
        .from('userapp_banners')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        return;
      }

      
      const transformedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle ,
        image: { uri: item.image  }
      })) || [];
      
      setcarouselData(transformedData);
    }
    getcarouselData()
  }, [])


  // Sample carousel data - you can replace with your actual data
  // const carouselData = [
  //   {
  //     id: 1,
  //     subtitle: "First carousel item description",
  //     image: require('../../../assets/images/carousal1.png'), // Replace with your actual image
  //   },
  //   {
  //     id: 2,
  //     subtitle: "Second carousel item description",
  //     image: require('../../../assets/images/carousal2.png'), // Replace with your actual image
  //   },
  //   {
  //     id: 3,
  //     subtitle: "Third carousel item description",
  //     image: require('../../../assets/images/carousal3.png'), // Replace with your actual image
  //   },
  // ];
  const styles = StyleSheet.create({
    container: {
      height: screenHeight * 0.35,
      top: 10,
      width: "100%",
      paddingHorizontal: 12,
    },
    carouselContainer: {
      marginTop: 15,
      overflow: 'hidden',
      height: screenHeight * 0.22,
      width: '100%',
      alignSelf: 'center',
      borderRadius: 20,
      borderWidth: 4,
      borderColor: '#ffffffff',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      backgroundColor: '#fff',
    },
  });
  const { name, service, userId, profileImage, reviews, ratings } =
    useCurrentUserDetails();

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: '500' }}>Hello, {user?.name}</Text>

      <View style={styles.carouselContainer}>
        <Carousel
          data={carouselData}
          autoPlay={true}
          interval={3000}
          showIndicators={true}
          imageMode={'cover'}
          showCaptions={false}
        />
      </View>
    </View>
  );
}
