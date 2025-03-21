import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get("window");

export default function RecipeDetailScreen({ route }) {
  const { recipeId } = route.params;
  const id = recipeId;

  const navigation = useNavigation();

  const [recipe, setRecipe] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRecipeDetail();
      fetchRecipeImages();
    } else {
      setError("Invalid recipe ID");
    }
  }, [id]);

  const fetchRecipeDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Recipe/recipe-by-id/${id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error("Failed to fetch recipe detail:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeImages = async () => {
    try {
      const response = await fetch(
        `https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/RecipeImage/recipe-images-by-recipe-id/${id}`
      );
      const data = await response.json();

      const imageUrls = data.map((img) => img.imageUrl);
      setImages(imageUrls);
    } catch (error) {
      console.error("Failed to fetch recipe images:", error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    recipe && (
      <View style={styles.container}>

        <Text style={styles.title}>{recipe.name}</Text>

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
            source={{
              uri: recipe.imageUrl || "https://via.placeholder.com/300",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{recipe.description || "N/A"}</Text>

        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value}>{recipe.categoryName || "N/A"}</Text>

        <Text style={styles.label}>Cooking Time:</Text>
        <Text style={styles.value}>{recipe.cookingTime ? `${recipe.cookingTime} minutes` : "N/A"}</Text>

        <Text style={styles.label}>Servings:</Text>
        <Text style={styles.value}>{recipe.servings ? `${recipe.servings} servings` : "N/A"}</Text>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  backButton: {
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: 'center',
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
