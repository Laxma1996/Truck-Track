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
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { saveJob } from '../utils/storage';

export default function LoggingScreen({ navigation }) {
  const [truckType, setTruckType] = useState('');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTruckTypeModalVisible, setIsTruckTypeModalVisible] = useState(false);
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
    setTimeout(async () => {
      const jobData = {
        truckType,
        weight: parseFloat(weight),
        photo: photo.uri,
        status: 'started'
      };

      try {
        // Save job using storage utility
        const savedJob = await saveJob(jobData);
        
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
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setIsTruckTypeModalVisible(true)}
            >
              <Text style={[styles.dropdownText, !truckType && styles.placeholder]}>
                {truckType || 'Select truck type...'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
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

      {/* Truck Type Selection Modal */}
      <Modal
        visible={isTruckTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTruckTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Truck Type</Text>
            
            {truckTypes.map((type, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.modalButton} 
                onPress={() => {
                  setTruckType(type);
                  setIsTruckTypeModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>{type}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setIsTruckTypeModalVisible(false)}
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
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: 18,
    color: '#ecf0f1',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    margin: 20,
    elevation: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 25,
    color: '#2c3e50',
    fontSize: 24,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoButton: {
    borderWidth: 3,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  photoButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 250,
    height: 180,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  changePhotoButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#27ae60',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#27ae60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
