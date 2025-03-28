import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Clipboard from "expo-clipboard";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ChatScreen from './src/screens/ChatScreen';
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import RegisterScreen from './src/screens/RegisterScreen';


const HomeScreen = ({ navigation }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function registerForPushNotifications() {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== "granted") {
            setErrorMsg("Không có quyền nhận thông báo!");
            return;
          }
        }
        const tokenData = await Notifications.getExpoPushTokenAsync();
        if (tokenData.data) {
          setExpoPushToken(tokenData.data);
        } else {
          setErrorMsg("Không lấy được token, thử lại sau!");
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy token:", error);
        setErrorMsg("Lỗi khi lấy token.");
      }
    }

    registerForPushNotifications();
  }, []);

  const copyToClipboard = async () => {
    if (expoPushToken) {
      await Clipboard.setStringAsync(expoPushToken);
      Alert.alert("Đã sao chép!", "Token đã được lưu vào clipboard.");
    } else {
      Alert.alert("Lỗi", "Token chưa được tạo, hãy thử lại sau.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Expo Push Token:</Text>
      <Text style={styles.token}>
        {expoPushToken ? expoPushToken : "Đang lấy token..."}
      </Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      <Button title="Copy Token" onPress={copyToClipboard} />
    </View>
  );
};

const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Hồ sơ cá nhân</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ Thêm RecipeDetailScreen vào MenuStack
const MenuStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{ headerShown: false }} // Ẩn header của MenuStack
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={{ title: "Recipe Detail" }}
      />
    </Stack.Navigator>
  );
};

// ✅ Tạo AuthStack cho Login và Register
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="LoginScreen" 
      component={LoginScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="RegisterScreen" 
      component={RegisterScreen}
      options={{ title: "Register" }}
    />
  </Stack.Navigator>
);


export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") iconName = "home";
            if (route.name === "Menu") iconName = "fast-food-outline";
            if (route.name === "Profile") iconName = "person";
            if (route.name === "Chat") iconName = "chatbubbles";
            if (route.name === "Auth") iconName = "log-in";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Menu" component={MenuStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen 
  name="Login" 
  component={AuthStack}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="log-in" size={size} color={color} />
    )
  }}
/>

      </Tab.Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  token: {
    marginTop: 10,
    fontSize: 14,
    color: "blue",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});
