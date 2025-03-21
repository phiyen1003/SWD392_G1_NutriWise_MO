import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import MealCard from "../components/MealCard";
import FilterBar from "../components/FilterBar";

export default function MenuScreen() {
  const [meals, setMeals] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      console.log(`Fetching recipes from page ${page}...`);
      const response = await fetch(
        `https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Recipe/all-recipes?PageNumber=${page}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setMeals((prevMeals) => [...prevMeals, ...data]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeals = meals.filter((meal) => {
    return (
      (selectedFilter === "All" || meal.categoryName === selectedFilter) &&
      meal.name.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm món ăn..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.recipeId.toString()}
        renderItem={({ item }) => (
          <MealCard meal={item} />
        )}
        numColumns={1}
        onEndReached={fetchRecipes}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#000" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: "#f4f4f4" 
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});
