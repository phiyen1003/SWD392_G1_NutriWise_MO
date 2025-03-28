import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebaseConfig';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const API_URL = 'https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Account';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '1012104829453-9kcpnqp3ag27uqd0o3nd8211i8da5m1q.apps.googleusercontent.com',
    iosClientId: '1012104829453-arv7qiitueu2u2jekub0vphbig69gdbq.apps.googleusercontent.com',
    redirectUri: 'com.googleusercontent.apps.1012104829453-arv7qiitueu2u2jekub0vphbig69gdbq:/oauthredirect',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      console.log('🔑 Received idToken:', id_token);
      if (id_token) {
        signInWithGoogle(id_token);
      }
    }
  }, [response]);

  const signInWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      console.log('✅ Firebase login success:', user);

      let token = await user.getIdToken();
      console.log('📌 Firebase IdToken:', token);

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      if (decodedToken.exp < now) {
        console.log('🔄 Token hết hạn, làm mới token...');
        token = await user.getIdToken(true);
        console.log('📌 New Firebase IdToken:', token);
      }

      const res = await axios.post(
        `${API_URL}/firebase-login`,
        { idToken: token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 Server response:', res.data);

      const { fullName, userId } = res.data;

      await AsyncStorage.setItem('userId', String(userId));
      console.log('✅ userId saved to AsyncStorage:', userId);

      Alert.alert('Login Success', `Welcome ${fullName}!`);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('🔥 Login Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await auth.currentUser.getIdToken();

              await axios.post(
                `${API_URL}/sign-out`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              // 🔥 Đăng xuất khỏi Firebase
              await signOut(auth);
              console.log('✅ Firebase logout success');

              // 🔥 Xóa userId khỏi AsyncStorage
              await AsyncStorage.removeItem('userId');
              console.log('✅ userId removed from AsyncStorage');

              Alert.alert('Logout Success', 'You have been logged out');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('🔥 Logout Error:', error.response?.data || error.message);
              Alert.alert('Error', error.response?.data?.message || 'Failed to logout');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🚀 Sending login request...');
      await promptAsync();
    } catch (error) {
      console.error('🚨 Google Login Error:', error);
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      {/* Nút đăng nhập */}
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

      {/* Nút đăng xuất */}
      <TouchableOpacity
        style={[styles.logoutButton, loading && styles.disabledButton]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  googleButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
});

export default LoginScreen;
