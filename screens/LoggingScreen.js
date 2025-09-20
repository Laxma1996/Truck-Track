import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveJob } from '../utils/storage';
import { jobService } from '../services/firebaseService';

export default function LoggingScreen({ navigation }) {
  const [activity, setActivity] = useState('');
  const [truckType, setTruckType] = useState('');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isTruckTypeModalVisible, setIsTruckTypeModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [savedJobData, setSavedJobData] = useState(null);

  useEffect(() => {
    checkAuthentication();
    // Clean up any incomplete jobs on screen load
    cleanupIncompleteJobs();
  }, []);

  const cleanupIncompleteJobs = async () => {
    try {
      const result = await jobService.cleanupIncompleteJobs();
      if (result.success && result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} incomplete jobs`);
      }
    } catch (error) {
      console.error('Error cleaning up incomplete jobs:', error);
    }
  };

  const activities = [
    'Activity One',
    'Activity Two', 
    'Activity Three',
    'Activity Four',
    'Activity Five',
    'Activity Six',
    'Activity Seven'
  ];

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

  const checkAuthentication = async () => {
    try {
      const isAuthenticated = await AsyncStorage.getItem('truckTrackerAuth');
      console.log('Authentication check - isAuthenticated:', isAuthenticated);
      
      if (isAuthenticated !== 'true') {
        console.log('User not authenticated, but not redirecting automatically');
        // Don't automatically redirect, let the user try to start a job first
      } else {
        console.log('User is authenticated');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout function called');
    
    try {
      // Clear all authentication data from AsyncStorage
      await AsyncStorage.multiRemove([
        'truckTrackerAuth',
        'truckTrackerUser',
        'truckTrackerUserId',
        'truckTrackerUserRole',
        'truckTrackerLoginTime'
      ]);
      
      console.log('Authentication data cleared successfully');
      
      // Reset form if success modal is visible
      if (isSuccessModalVisible) {
        resetForm();
      }
      
      // Navigate to Home screen and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error clearing authentication data:', error);
      // Still navigate to Home even if clearing fails
      navigation.navigate('Home');
    }
  };

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
    // Enhanced validation with better error messages
    if (!activity || activity.trim() === '') {
      Alert.alert('Validation Error', 'Please select an activity from the dropdown');
      return;
    }

    if (!truckType || truckType.trim() === '') {
      Alert.alert('Validation Error', 'Please select a truck type from the dropdown');
      return;
    }

    if (!weight || weight.trim() === '') {
      Alert.alert('Validation Error', 'Please enter the truck weight in kilograms');
      return;
    }

    // Validate weight is a number
    const weightNumber = parseFloat(weight);
    if (isNaN(weightNumber) || weightNumber <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid weight (must be a positive number)');
      return;
    }

    // Enhanced photo validation
    if (!photo) {
      Alert.alert('Validation Error', 'Please take a photo of the truck using the camera or select from gallery');
      return;
    }

    if (!photo.uri || photo.uri.trim() === '') {
      Alert.alert('Validation Error', 'Photo is invalid. Please take a new photo of the truck');
      return;
    }

    // Additional validation for photo URI format
    if (!photo.uri.startsWith('data:image/') && !photo.uri.startsWith('file://') && !photo.uri.startsWith('http')) {
      Alert.alert('Validation Error', 'Photo format is not supported. Please take a new photo');
      return;
    }

    console.log('All validations passed:', {
      activity,
      truckType,
      weight: weightNumber,
      photoUri: photo.uri ? 'Present' : 'Missing'
    });

    setIsLoading(true);

    try {
      // Get current user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('truckTrackerUserId');
      const username = await AsyncStorage.getItem('truckTrackerUser');
      
      console.log('StartJob - UserId:', userId);
      console.log('StartJob - Username:', username);
      
      if (!userId) {
        console.log('No userId found, redirecting to login');
        Alert.alert(
          'Authentication Required', 
          'Please login first to start a job. You will be redirected to the login page.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return;
      }

      // Final validation before saving
      if (!photo.uri || photo.uri.trim() === '') {
        Alert.alert('Validation Error', 'Cannot save job without a valid photo. Please take a photo first.');
        setIsLoading(false);
        return;
      }

      const jobData = {
        userId: userId,
        username: username,
        activity: activity.trim(),
        truckType: truckType.trim(),
        weight: weightNumber,
        photo: photo.uri, // Store as base64 data URL
        status: 'started',
        startTime: new Date().toISOString()
      };

      // Validate all required fields are present
      const requiredFields = ['userId', 'username', 'activity', 'truckType', 'weight', 'photo'];
      const missingFields = requiredFields.filter(field => !jobData[field] || jobData[field] === '');
      
      if (missingFields.length > 0) {
        Alert.alert('Validation Error', `Missing required fields: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Save job to Firebase
      console.log('Saving job data to Firebase:', jobData);
      const result = await jobService.saveJob(jobData);
      console.log('Firebase save result:', result);
      
      if (result.success) {
        // Also save locally as backup
        const localJob = await saveJob(jobData);
        
        // Store job data for success modal
        setSavedJobData({
          ...jobData,
          jobId: result.jobId,
          savedAt: new Date().toISOString()
        });
        
        console.log('Job saved successfully with base64 image');
        
        // Show success modal
        setIsSuccessModalVisible(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to save job data');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.alert('Error', 'Failed to save job data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showPhotoOptions = () => {
    setIsModalVisible(true);
  };

  const generatePDF = () => {
    if (!savedJobData) return;
    
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Truck Tracker - Job Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #4a90e2; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              color: #4a90e2; 
              margin-bottom: 10px;
            }
            .subtitle { 
              font-size: 16px; 
              color: #666; 
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              color: #1a1a1a; 
              margin-bottom: 15px;
              border-bottom: 1px solid #e1e5e9;
              padding-bottom: 5px;
            }
            .field { 
              margin-bottom: 10px; 
              display: flex;
            }
            .field-label { 
              font-weight: bold; 
              width: 120px; 
              color: #666;
            }
            .field-value { 
              flex: 1; 
              color: #1a1a1a;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #999;
              border-top: 1px solid #e1e5e9;
              padding-top: 20px;
            }
            .photo-section {
              margin-top: 20px;
              text-align: center;
            }
            .photo-placeholder {
              border: 2px dashed #4a90e2;
              padding: 20px;
              border-radius: 8px;
              background-color: #f8f9ff;
              color: #4a90e2;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TRUCK TRACKER</div>
            <div class="subtitle">Job Report</div>
          </div>
          
          <div class="section">
            <div class="section-title">Job Information</div>
            <div class="field">
              <div class="field-label">Job ID:</div>
              <div class="field-value">${savedJobData.jobId}</div>
            </div>
            <div class="field">
              <div class="field-label">Date:</div>
              <div class="field-value">${new Date(savedJobData.savedAt).toLocaleDateString()}</div>
            </div>
            <div class="field">
              <div class="field-label">Time:</div>
              <div class="field-value">${new Date(savedJobData.savedAt).toLocaleTimeString()}</div>
            </div>
            <div class="field">
              <div class="field-label">User:</div>
              <div class="field-value">${savedJobData.username}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Job Details</div>
            <div class="field">
              <div class="field-label">Activity:</div>
              <div class="field-value">${savedJobData.activity}</div>
            </div>
            <div class="field">
              <div class="field-label">Truck Type:</div>
              <div class="field-value">${savedJobData.truckType}</div>
            </div>
            <div class="field">
              <div class="field-label">Weight:</div>
              <div class="field-value">${savedJobData.weight} kg</div>
            </div>
            <div class="field">
              <div class="field-label">Status:</div>
              <div class="field-value">${savedJobData.status}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Truck Photo</div>
            <div class="photo-section">
              ${savedJobData.photo ? 
                `<img src="${savedJobData.photo}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Truck Photo" />` : 
                `<div class="photo-placeholder">No photo available</div>`
              }
            </div>
          </div>
          
          <div class="footer">
            Generated by Truck Tracker System<br>
            ${new Date().toLocaleString()}
          </div>
        </body>
        </html>
      `;
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Show success message
        Alert.alert(
          'PDF Ready',
          'The job report has been opened in a new window. Use your browser\'s print function to save as PDF.',
          [
            { text: 'OK' }
          ]
        );
      };
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'PDF Generation Error',
        'Failed to generate PDF. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const resetForm = () => {
    setActivity('');
    setTruckType('');
    setWeight('');
    setPhoto(null);
    setIsSuccessModalVisible(false);
    setSavedJobData(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Truck Logging System</Text>
        <Text style={styles.subtitle}>Record truck details, weight, and photos for job tracking</Text>
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => {
            console.log('Navigating to Dashboard');
            navigation.navigate('Dashboard');
          }}
        >
          <Text style={styles.navButtonText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, styles.logoutButton]} 
          onPress={() => {
            console.log('Logout button pressed - starting logout');
            console.log('About to call handleLogout function');
            handleLogout();
            console.log('handleLogout function call completed');
          }}
        >
          <Text style={styles.navButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centeredContainer}>
        <Card style={styles.truckForm}>
          <Card.Content>
            <Title style={styles.formTitle}>New Job Logging</Title>
          
          {/* Activities Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Activity *</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setIsActivityModalVisible(true)}
            >
              <Text style={[styles.dropdownText, !activity && styles.placeholder]}>
                {activity || 'Select activity...'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Truck Type Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Truck Type *</Text>
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
                <Text style={styles.photoButtonText}>Take/Select Photo</Text>
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
              {isLoading ? 'Starting Job...' : 'Start Job'}
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>

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
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setIsModalVisible(false);
              selectFromGallery();
            }}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
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

      {/* Activities Selection Modal */}
      <Modal
        visible={isActivityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsActivityModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsActivityModalVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>Select Activity</Text>
            
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {activities.map((activityItem, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.dropdownItem,
                    activity === activityItem && styles.dropdownItemSelected
                  ]} 
                  onPress={() => {
                    setActivity(activityItem);
                    setIsActivityModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    activity === activityItem && styles.dropdownItemTextSelected
                  ]}>{activityItem}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Truck Type Selection Modal */}
      <Modal
        visible={isTruckTypeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTruckTypeModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsTruckTypeModalVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>Select Truck Type</Text>
            
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {truckTypes.map((type, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.dropdownItem,
                    truckType === type && styles.dropdownItemSelected
                  ]} 
                  onPress={() => {
                    setTruckType(type);
                    setIsTruckTypeModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    truckType === type && styles.dropdownItemTextSelected
                  ]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successTitle}>✅ Job Saved Successfully!</Text>
            
            {savedJobData && (
              <View style={styles.jobDetails}>
                <Text style={styles.jobDetailTitle}>Job Details:</Text>
                <Text style={styles.jobDetailText}>Job ID: {savedJobData.jobId}</Text>
                <Text style={styles.jobDetailText}>Activity: {savedJobData.activity}</Text>
                <Text style={styles.jobDetailText}>Truck Type: {savedJobData.truckType}</Text>
                <Text style={styles.jobDetailText}>Weight: {savedJobData.weight} kg</Text>
                <Text style={styles.jobDetailText}>Status: {savedJobData.status}</Text>
                <Text style={styles.jobDetailText}>Saved: {new Date(savedJobData.savedAt).toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.successButtons}>
              <TouchableOpacity 
                style={[styles.successButton, styles.pdfButton]} 
                onPress={generatePDF}
              >
                <Text style={styles.successButtonText}>📄 Download PDF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.successButton, styles.continueButton]} 
                onPress={resetForm}
              >
                <Text style={styles.successButtonText}>🔄 Start New Job</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.successButton, styles.logoutButton]} 
                onPress={handleLogout}
              >
                <Text style={styles.successButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>
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
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
    width: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  truckForm: {
    width: 600,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
    padding: 40,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 600,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    width: 600,
    gap: 12,
  },
  navButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formTitle: {
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 40,
    fontSize: 24,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 35,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 25,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 65,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
    fontWeight: '400',
  },
  placeholder: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 10,
    padding: 20,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 65,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  photoButton: {
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    minHeight: 80,
  },
  photoButtonText: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '500',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 250,
    height: 180,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  changePhotoButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    elevation: 1,
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#28a745',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  modalButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '400',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dc3545',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxWidth: 500,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#28a745',
    marginBottom: 20,
    textAlign: 'center',
  },
  jobDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  jobDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  jobDetailText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 22,
  },
  successButtons: {
    width: '100%',
    gap: 12,
  },
  successButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pdfButton: {
    backgroundColor: '#4a90e2',
  },
  continueButton: {
    backgroundColor: '#28a745',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // New Dropdown Modal Styles
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
    alignSelf: 'center',
    marginTop: '15%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  dropdownItemTextSelected: {
    color: '#4a90e2',
    fontWeight: '500',
  },
});

