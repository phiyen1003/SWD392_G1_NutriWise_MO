import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import axios from "axios";
import { Platform } from 'react-native';


const LoginScreen = () => {
  const [loading, setLoading] = useState(false);

  const API_URL = "https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Account/google-mobile";
  
  const redirectUri = 'https://auth.expo.dev/@quocbaochauu/nutriwise';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '1078747354235-etlrt3jrcu5p1m91dhad7gdia94oj670.apps.googleusercontent.com',
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  // Log để kiểm tra redirect URI
  console.log('🚀 Redirect URI:', redirectUri);

  useEffect(() => {
    console.log('🔎 Response:', response);
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      console.log('🔑 Received idToken:', idToken);
      if (idToken) {
        loginWithGoogle(idToken);
      } else {
        console.error('❌ No idToken received');
        Alert.alert('Login Failed', 'No idToken received from Google');
      }
    }
  }, [response]);
  

  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}`, { idToken });
      console.log('📥 Server response:', res.data);
  
      if (res.data.isRegistered) {
        Alert.alert('Login Success', `Welcome back ${res.data.givenName}!`);
        // ✅ Lưu thông tin người dùng vào state hoặc Redux để sử dụng trong app
        setUser(res.data);
      } else {
        Alert.alert(
          'Complete Registration',
          `Hi ${res.data.givenName}, please complete your profile.`
        );
        // 👉 Điều hướng người dùng tới trang hoàn thành hồ sơ
      }
    } catch (error) {
      console.error('🔥 Login Error:', error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleLogin = async () => {
    try {
      console.log('🚀 Sending request with redirectUri:', redirectUri);
      await promptAsync();
    } catch (error) {
      console.error('🚨 Google Login Error:', error);
      Alert.alert('Error', 'Failed to login');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <TouchableOpacity
        style={[styles.googleButton, loading && styles.disabledButton]}
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.googleButtonText}>Đăng Nhập với Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  googleButton: {
    width: "90%",
    height: 50,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
});

export default LoginScreen;
