import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Carousel from 'react-native-reanimated-carousel';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get("window");

export default function MealCard({ meal }) {
  const [images, setImages] = useState([]);
  const navigation = useNavigation(); // ✅ Sử dụng useNavigation

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          "https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/RecipeImage/all-recipe-images"
        );
        const data = await response.json();

        const filteredImages = data
          .filter((img) => img.recipeId === meal.recipeId && img.imageUrl)
          .map((img) => img.imageUrl);

        setImages(filteredImages);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };

    fetchImages();
  }, [meal.recipeId]);

  // ✅ Xử lý khi bấm vào món ăn
  const handleOpenRecipe = () => {
    navigation.navigate("RecipeDetail", { recipeId: meal.recipeId });
  };  
  

  return (
    <TouchableOpacity onPress={handleOpenRecipe}>
      <View style={styles.card}>
        {images.length > 0 ? (
          <Carousel
            width={width * 0.95}
            height={250}
            data={images}
            autoPlay={true}
            autoPlayInterval={3000}
            pagingEnabled={true}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={styles.image} 
                resizeMode="contain"
              />
            )}
          />
        ) : (
          <Image 
            source={{ uri: meal.imageUrl }} 
            style={styles.image} 
            resizeMode="contain"
          />
        )}

        <Text style={styles.title}>{meal.name}</Text>
        <Text style={styles.category}>{meal.categoryName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.95,
    alignSelf: 'center',
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginLeft: -20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: 'center',
  },
  category: {
    fontSize: 16,
    color: "#777",
    textAlign: 'center',
    marginTop: 4,
  },
});
