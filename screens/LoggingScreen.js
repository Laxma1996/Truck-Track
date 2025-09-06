import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Card, Title, Paragraph, Button, Picker } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { saveJob } from '../utils/storage';

export default function LoggingScreen({ navigation }) {
  const [truckType, setTruckType] = useState('');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const truckTypes = [
    'Flatbed Truck',
    'Box Truck',
    'Refrigerated Truck',
    'Tanker Truck',
    'Dump Truck',
    'Crane Truck',
    'Tow Truck',
    'Other'
  ];

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
        Alert.alert('Success', 'Photo captured successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
    }
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
        Alert.alert('Success', 'Photo selected successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo: ' + error.message);
    }
  };

  const startJob = async () => {
    if (!truckType) {
      Alert.alert('Error', 'Please select a truck type');
      return;
    }

    if (!weight.trim()) {
      Alert.alert('Error', 'Please enter the truck weight');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Please take a photo of the truck');
      return;
    }

    setIsLoading(true);

    // Simulate data processing
    setTimeout(() => {
      const jobData = {
        truckType,
        weight: parseFloat(weight),
        photo: photo.uri,
        status: 'started'
      };

      try {
        // Save job using storage utility
        const savedJob = saveJob(jobData);
        
        setIsLoading(false);
        
        Alert.alert(
          'Job Started!', 
          `Truck Type: ${truckType}\nWeight: ${weight} kg\nPhoto: Captured\nJob ID: ${savedJob.id}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTruckType('');
                setWeight('');
                setPhoto(null);
              }
            }
          ]
        );
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to save job data: ' + error.message);
      }
    }, 1500);
  };

  const showPhotoOptions = () => {
    setIsModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚛 Truck Logging</Text>
        <Text style={styles.subtitle}>Record truck details and start job</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Truck Information</Title>
          
          {/* Truck Type Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Truck Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={truckType}
                onValueChange={setTruckType}
                style={styles.picker}
              >
                <Picker.Item label="Select truck type..." value="" />
                {truckTypes.map((type, index) => (
                  <Picker.Item key={index} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter truck weight in kg"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          {/* Photo Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Truck Photo *</Text>
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={showPhotoOptions}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoButton} onPress={showPhotoOptions}>
                <Text style={styles.photoButtonText}>📸 Take/Select Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Start Job Button */}
          <TouchableOpacity
            style={[styles.startButton, isLoading && styles.startButtonDisabled]}
            onPress={startJob}
            disabled={isLoading}
          >
            <Text style={styles.startButtonText}>
              {isLoading ? 'Starting Job...' : '🚀 Start Job'}
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Photo Options Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Photo Source</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setIsModalVisible(false);
              takePhoto();
            }}>
              <Text style={styles.modalButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setIsModalVisible(false);
              selectFromGallery();
            }}>
              <Text style={styles.modalButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  photoButton: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  photoButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  changePhotoButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  modalButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
