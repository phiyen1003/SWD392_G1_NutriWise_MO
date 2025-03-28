import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { email, password, isRegistered } = route.params || {};

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    allergenId: '',
    healthGoalId: '',
    bmi: '',
    bloodPressure: '',
    cholesterol: '',
    email: email || '',
    password: password || '',
    username: '',
  });

  useEffect(() => {
    if (email) {
      setFormData((prevData) => ({
        ...prevData,
        email,
      }));
    }
    if (password) {
      setFormData((prevData) => ({
        ...prevData,
        password,
      }));
    }
  }, [email, password]);

  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleRegister = async () => {
    try {
      const formattedDateOfBirth = new Date(formData.dateOfBirth).toISOString();
  
      // ✅ Chỉ lấy những trường cần thiết cho API update-profile
      const data = {
        fullName: formData.fullName,
        gender: formData.gender,
        dateOfBirth: formattedDateOfBirth,
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        bmi: Number(formData.bmi) || 0,
        allergenId: Number(formData.allergenId) || 0,
        healthGoalId: Number(formData.healthGoalId) || 0,
        bloodPressure: formData.bloodPressure,
        cholesterol: formData.cholesterol,
      };
  
      console.log('🚀 Sending data:', data);
  
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        Alert.alert('Error', 'Invalid email format');
        return;
      }
  
      if (isRegistered) {
        // ✅ Nếu đã đăng ký (login Google), gọi API cập nhật hồ sơ
        console.log('🔄 Updating profile...');
        const response = await axios.put(
          'https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Account/update-profile',
          data
        );
        console.log('✅ Profile Updated:', response.data);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        // ✅ Nếu chưa đăng ký, gọi API đăng ký (vẫn gửi email + password)
        console.log('🚀 Registering new user...');
        const response = await axios.post(
          'https://swd392nutriwisewebapp-acgge4e8a2cubkh8.centralus-01.azurewebsites.net/api/Account/register',
          formData
        );
        console.log('✅ Register Success:', response.data);
        Alert.alert('Success', 'Registration successful');
      }
  
      navigation.replace('HomeScreen');
    } catch (error) {
      console.error('🔥 Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to process');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
  {/* Nút Back */}
  <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={styles.backButton}>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>


  <Text style={styles.title}>Đăng Ký</Text>

  {Object.keys(formData).map((key) => (
    <View key={key} style={styles.inputContainer}>
      <Text style={styles.label}>{key}</Text>
      <TextInput
        style={[
          styles.input,
          (key === 'email' || key === 'password') && styles.disabledInput,
        ]}
        placeholder={`Enter ${key}`}
        value={formData[key]}
        onChangeText={(value) => handleInputChange(key, value)}
        keyboardType={
          ['height', 'weight', 'bmi', 'allergenId', 'healthGoalId'].includes(key)
            ? 'numeric'
            : 'default'
        }
        editable={key !== 'email' && key !== 'password'}
      />
    </View>
  ))}

  <TouchableOpacity style={styles.button} onPress={handleRegister}>
    <Text style={styles.buttonText}>
      {isRegistered ? 'Cập Nhật Thông Tin' : 'Đăng Ký'}
    </Text>
  </TouchableOpacity>
</ScrollView>

  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#e0e0e0', // ✅ Làm mờ để thể hiện không thể chỉnh sửa
    color: '#999',
  },
  button: {
    backgroundColor: '#34D399',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
