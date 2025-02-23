import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Clipboard from "expo-clipboard";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Màn hình Home (Hiển thị Expo Push Token)
const HomeScreen = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function registerForPushNotifications() {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        console.log("🔍 Quyền thông báo:", status);
        
        if (status !== "granted") {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          console.log("🔄 Yêu cầu quyền mới:", newStatus);
          if (newStatus !== "granted") {
            setErrorMsg("Không có quyền nhận thông báo!");
            return;
          }
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        console.log("✅ Expo Push Token:", tokenData);

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

// Màn hình Profile
const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Hồ sơ cá nhân</Text>
  </View>
);

// Màn hình Settings
const SettingsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Cài đặt</Text>
  </View>
);

// Khai báo Tab Navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Profile") {
              iconName = "person";
            } else if (route.name === "Settings") {
              iconName = "settings";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
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
