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
import { 
  responsiveDimensions, 
  fontSizes, 
  spacing, 
  containerWidths, 
  cardDimensions, 
  buttonDimensions, 
  inputDimensions,
  modalDimensions,
  colors, 
  shadows, 
  borderRadius,
  scrollConfig,
  getResponsiveValue,
  getResponsivePixels,
  getResponsiveShadows
} from '../utils/responsive';

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

  // Debug photo state changes
  useEffect(() => {
    console.log('🔄 Photo state changed:', {
      hasPhoto: !!photo,
      hasUri: photo ? !!photo.uri : false,
      hasBase64: photo ? !!photo.base64 : false,
      uriPreview: photo && photo.uri ? photo.uri.substring(0, 50) + '...' : 'null'
    });
  }, [photo]);

  // Debug dropdown modal state changes
  useEffect(() => {
    console.log('📋 Activity modal state changed:', isActivityModalVisible);
  }, [isActivityModalVisible]);

  useEffect(() => {
    console.log('🚛 Truck type modal state changed:', isTruckTypeModalVisible);
  }, [isTruckTypeModalVisible]);

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

  // Universal photo processing function with compression
  const processPhotoAsset = async (photoAsset, source) => {
    try {
      console.log(`📸 Processing ${source} photo:`, {
        uri: photoAsset.uri,
        hasBase64: !!photoAsset.base64,
        width: photoAsset.width,
        height: photoAsset.height,
        type: photoAsset.type,
        fileName: photoAsset.fileName
      });

      // Check if photo is too large and needs compression
      const isLargePhoto = photoAsset.width > 2000 || photoAsset.height > 2000;
      console.log('📏 Photo size check:', {
        width: photoAsset.width,
        height: photoAsset.height,
        isLargePhoto,
        estimatedSize: photoAsset.base64 ? Math.round(photoAsset.base64.length / 1024) + 'KB' : 'Unknown'
      });

      // Create a standardized photo object
      const processedPhoto = {
        uri: photoAsset.uri,
        base64: photoAsset.base64 || null,
        width: photoAsset.width,
        height: photoAsset.height,
        type: photoAsset.type || 'image/jpeg',
        fileName: photoAsset.fileName || `photo_${Date.now()}.jpg`,
        source: source, // 'camera' or 'gallery'
        isLargePhoto: isLargePhoto
      };

      // If no base64 is provided, we'll use the URI as is
      // The app will handle both base64 and URI formats
      if (!processedPhoto.base64) {
        console.log('⚠️ No base64 data provided, using URI directly');
        console.log('URI format:', processedPhoto.uri.substring(0, 50) + '...');
      } else if (isLargePhoto) {
        console.log('⚠️ Large photo detected - may cause issues with Firebase storage');
        console.log('Base64 size:', Math.round(photoAsset.base64.length / 1024) + 'KB');
      }

      console.log('✅ Photo processed successfully:', {
        hasUri: !!processedPhoto.uri,
        hasBase64: !!processedPhoto.base64,
        source: processedPhoto.source,
        isLargePhoto: processedPhoto.isLargePhoto
      });

      return processedPhoto;
    } catch (error) {
      console.error('❌ Error processing photo:', error);
      throw error;
    }
  };

  const takePhoto = async () => {
    try {
      console.log('📷 Starting camera capture...');
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      // Optimized options for better compatibility with compression
      const pickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6, // Reduced quality for smaller file size
        base64: true, // Request base64 for better compatibility
        exif: false, // Disable EXIF to avoid issues
      };
      
      console.log('📷 Launching camera with options:', pickerOptions);
      
      const result = await ImagePicker.launchCameraAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoAsset = result.assets[0];
        const processedPhoto = await processPhotoAsset(photoAsset, 'camera');
        setPhoto(processedPhoto);
        console.log('✅ Camera photo captured and processed successfully');
        Alert.alert('Success', 'Photo captured successfully!');
      } else {
        console.log('📷 Camera capture cancelled by user');
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
    }
  };

  const selectFromGallery = async () => {
    try {
      console.log('🖼️ Starting gallery selection...');
      console.log('🔍 ImagePicker available methods:', Object.keys(ImagePicker));
      
      // Check current permission status first
      const currentStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('📋 Current gallery permission status:', currentStatus);
      
      let permissionResult;
      if (currentStatus.status !== 'granted') {
        console.log('🔐 Requesting gallery permissions...');
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('🔐 Permission request result:', permissionResult);
      } else {
        permissionResult = currentStatus;
      }
      
      if (permissionResult.status !== 'granted') {
        console.log('❌ Gallery permission denied');
        Alert.alert(
          'Permission Required', 
          'Gallery permission is needed to select photos. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              // On web, we can't open settings, so just show a message
              if (typeof window !== 'undefined') {
                Alert.alert('Info', 'Please enable camera/gallery permissions in your browser settings');
              }
            }}
          ]
        );
        return;
      }

      console.log('✅ Gallery permission granted');

      // Very basic options for maximum compatibility with compression
      const pickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6, // Reduced quality for smaller file size
      };
      
      console.log('🖼️ Using basic picker options:', pickerOptions);
      
      console.log('🖼️ Launching gallery with options:', pickerOptions);
      
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      } catch (pickerError) {
        console.error('❌ Gallery picker launch error:', pickerError);
        // Try with minimal options as fallback
        console.log('🔄 Trying gallery with minimal options...');
        const minimalOptions = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        };
        result = await ImagePicker.launchImageLibraryAsync(minimalOptions);
      }
      
      console.log('🖼️ Gallery picker result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets,
        assetsLength: result.assets ? result.assets.length : 0,
        error: result.error
      });

      if (result.error) {
        console.error('❌ Gallery picker error:', result.error);
        Alert.alert('Error', `Gallery error: ${result.error}`);
        return;
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoAsset = result.assets[0];
        console.log('📸 Gallery photo asset:', {
          uri: photoAsset.uri,
          hasBase64: !!photoAsset.base64,
          width: photoAsset.width,
          height: photoAsset.height,
          type: photoAsset.type,
          fileName: photoAsset.fileName
        });
        
        const processedPhoto = await processPhotoAsset(photoAsset, 'gallery');
        setPhoto(processedPhoto);
        console.log('✅ Gallery photo selected and processed successfully');
        Alert.alert('Success', 'Photo selected successfully!');
      } else {
        console.log('🖼️ Gallery selection cancelled by user');
      }
    } catch (error) {
      console.error('❌ Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo: ' + error.message);
    }
  };

  const startJob = async () => {
    console.log('🚀 START JOB CLICKED - Starting validation...');
    console.log('Form data:', { activity, truckType, weight, photo: photo ? 'Present' : 'Missing' });
    
    // Enhanced validation with better error messages
    if (!activity || activity.trim() === '') {
      console.log('❌ Validation failed: No activity selected');
      Alert.alert('Validation Error', 'Please select an activity from the dropdown');
      return;
    }

    if (!truckType || truckType.trim() === '') {
      console.log('❌ Validation failed: No truck type selected');
      Alert.alert('Validation Error', 'Please select a truck type from the dropdown');
      return;
    }

    if (!weight || weight.trim() === '') {
      console.log('❌ Validation failed: No weight entered');
      Alert.alert('Validation Error', 'Please enter the truck weight in kilograms');
      return;
    }

    // Validate weight is a number
    const weightNumber = parseFloat(weight);
    if (isNaN(weightNumber) || weightNumber <= 0) {
      console.log('❌ Validation failed: Invalid weight:', weight);
      Alert.alert('Validation Error', 'Please enter a valid weight (must be a positive number)');
      return;
    }
    
    console.log('✅ Basic validations passed');

    // Enhanced photo validation
    if (!photo) {
      console.log('❌ Validation failed: No photo taken');
      Alert.alert('Validation Error', 'Please take a photo of the truck using the camera or select from gallery');
      return;
    }

    console.log('📸 Photo validation - photo object:', {
      hasPhoto: !!photo,
      hasUri: !!photo.uri,
      hasBase64: !!photo.base64,
      source: photo.source || 'unknown',
      type: photo.type || 'unknown',
      uriType: photo.uri ? typeof photo.uri : 'undefined',
      uriLength: photo.uri ? photo.uri.length : 0,
      uriPreview: photo.uri ? photo.uri.substring(0, 100) + '...' : 'null'
    });

    if (!photo || !photo.uri || photo.uri.trim() === '') {
      console.log('❌ Validation failed: Photo or photo URI is missing');
      Alert.alert('Validation Error', 'Photo is required. Please take a photo or select one from gallery');
      return;
    }

    // Enhanced photo validation - accept all common formats
    const isValidPhotoFormat = photo.uri.startsWith('data:image/') || 
                              photo.uri.startsWith('file://') || 
                              photo.uri.startsWith('http') ||
                              photo.uri.startsWith('blob:') ||
                              photo.uri.startsWith('content://') || // Android content URI
                              photo.uri.startsWith('ph://') || // iOS photo library
                              photo.base64; // Accept if base64 is available

    if (!isValidPhotoFormat) {
      console.log('❌ Validation failed: Invalid photo format:', photo.uri);
      Alert.alert('Validation Error', `Photo format not supported: ${photo.uri.substring(0, 50)}... Please try taking a new photo`);
      return;
    }
    
    console.log('✅ Photo validation passed - format accepted');

    console.log('✅ All validations passed:', {
      activity,
      truckType,
      weight: weightNumber,
      photoUri: photo.uri ? 'Present' : 'Missing'
    });

    console.log('🔄 Setting loading state to true...');
    setIsLoading(true);

    try {
      // Get current user ID from AsyncStorage
      console.log('🔍 Getting user data from AsyncStorage...');
      const userId = await AsyncStorage.getItem('truckTrackerUserId');
      const username = await AsyncStorage.getItem('truckTrackerUser');
      
      console.log('👤 User data:', { userId, username });
      
      if (!userId) {
        console.log('❌ No userId found, redirecting to login');
        setIsLoading(false);
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
      
      console.log('✅ User authentication verified');

      // Final validation before saving
      if (!photo || !photo.uri || photo.uri.trim() === '') {
        Alert.alert('Validation Error', 'Cannot save job without a valid photo. Please take a photo first.');
        setIsLoading(false);
        return;
      }

      // Enhanced photo data preparation - handle all formats consistently
      let photoData = photo.uri;
      
      if (photo.base64) {
        // Check if base64 data is too large for Firebase
        const base64SizeKB = Math.round(photo.base64.length / 1024);
        console.log('📏 Base64 photo size:', base64SizeKB + 'KB');
        
        if (base64SizeKB > 10000) { // 10MB limit
          console.log('⚠️ Photo too large for Firebase storage, using URI instead');
          photoData = photo.uri;
        } else {
          // If base64 is available and not too large, create a proper data URL
          const imageType = photo.type || 'image/jpeg';
          photoData = `data:${imageType};base64,${photo.base64}`;
          console.log('📸 Using base64 data for photo');
        }
      } else {
        // Use URI directly - it should work for most cases
        photoData = photo.uri;
        console.log('📸 Using URI directly for photo:', photo.uri.substring(0, 50) + '...');
      }

      console.log('Photo data prepared:', {
        source: photo.source || 'unknown',
        originalUri: photo.uri,
        hasBase64: !!photo.base64,
        type: photo.type || 'unknown',
        isLargePhoto: photo.isLargePhoto || false,
        finalPhotoData: photoData ? photoData.substring(0, 50) + '...' : 'null',
        dataLength: photoData ? photoData.length : 0,
        dataLengthKB: photoData ? Math.round(photoData.length / 1024) + 'KB' : '0KB'
      });

      const jobData = {
        userId: userId,
        username: username,
        activity: activity.trim(),
        truckType: truckType.trim(),
        weight: weightNumber,
        photo: photoData, // Store as base64 data URL or URI
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
      console.log('💾 Saving job data to Firebase...');
      console.log('Job data being saved:', {
        userId: jobData.userId,
        username: jobData.username,
        activity: jobData.activity,
        truckType: jobData.truckType,
        weight: jobData.weight,
        photoLength: jobData.photo ? jobData.photo.length : 0,
        photoSizeKB: jobData.photo ? Math.round(jobData.photo.length / 1024) + 'KB' : '0KB',
        photoPreview: jobData.photo ? jobData.photo.substring(0, 50) + '...' : 'null'
      });
      
      let result;
      try {
        result = await jobService.saveJob(jobData);
        console.log('🔥 Firebase save result:', result);
        
        if (!result.success) {
          console.error('❌ Firebase save failed:', result.error);
          Alert.alert('Save Error', `Failed to save job: ${result.error || 'Unknown error'}`);
          setIsLoading(false);
          return;
        }
      } catch (firebaseError) {
        console.error('❌ Firebase save error:', firebaseError);
        Alert.alert('Save Error', `Failed to save job: ${firebaseError.message || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }
      
      if (result.success) {
        console.log('✅ Job saved successfully to Firebase!');
        
        // Also save locally as backup
        console.log('💾 Saving job locally as backup...');
        const localJob = await saveJob(jobData);
        console.log('✅ Local backup saved:', localJob);
        
        // Store job data for success modal
        setSavedJobData({
          ...jobData,
          jobId: result.jobId,
          savedAt: new Date().toISOString()
        });
        
        console.log('🎉 Job saved successfully with photo data');
        
        // Show success modal
        console.log('📱 Showing success modal...');
        setIsSuccessModalVisible(true);
      } else {
        console.log('❌ Firebase save failed:', result.message);
        Alert.alert('Error', result.message || 'Failed to save job data');
      }
    } catch (error) {
      console.error('💥 Error saving job:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('Error', 'Failed to save job data: ' + error.message);
    } finally {
      console.log('🔄 Setting loading state to false...');
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
                `<img src="${savedJobData.photo}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Truck Photo" />` : 
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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContainer}
      {...scrollConfig}
    >
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
              onPress={() => {
                console.log('📋 Activity dropdown pressed - opening modal');
                setIsActivityModalVisible(true);
              }}
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
              onPress={() => {
                console.log('🚛 Truck type dropdown pressed - opening modal');
                setIsTruckTypeModalVisible(true);
              }}
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
                {console.log('🖼️ Rendering photo:', {
                  hasPhoto: !!photo,
                  hasUri: !!photo.uri,
                  hasBase64: !!photo.base64,
                  uriPreview: photo.uri ? photo.uri.substring(0, 50) + '...' : 'null'
                })}
                <Image 
                  source={{ 
                    uri: photo.base64 ? `data:${photo.type || 'image/jpeg'};base64,${photo.base64}` : photo.uri 
                  }} 
                  style={[styles.photo, { 
                    minWidth: 200, 
                    minHeight: 150,
                    maxWidth: 300,
                    maxHeight: 200
                  }]}
                  onError={(error) => console.error('❌ Image load error:', error)}
                  onLoad={() => console.log('✅ Image loaded successfully')}
                  onLoadStart={() => console.log('🔄 Image loading started')}
                  onLoadEnd={() => console.log('🏁 Image loading ended')}
                />
                <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                  Photo loaded: {photo.width}x{photo.height}
                </Text>
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
              console.log('🖼️ Gallery button pressed - closing modal and calling selectFromGallery');
              setIsModalVisible(false);
              // Add a small delay to ensure modal closes before opening gallery
              setTimeout(() => {
                console.log('🖼️ Calling selectFromGallery after modal close');
                selectFromGallery();
              }, 100);
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
        onRequestClose={() => {
          console.log('📋 Activity modal closed via onRequestClose');
          setIsActivityModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              console.log('📋 Activity modal overlay pressed - closing modal');
              setIsActivityModalVisible(false);
            }}
          />
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
                    console.log('📋 Activity selected:', activityItem);
                    setActivity(activityItem);
                    setIsActivityModalVisible(false);
                    console.log('📋 Activity modal closed after selection');
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
        </View>
      </Modal>

      {/* Truck Type Selection Modal */}
      <Modal
        visible={isTruckTypeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('🚛 Truck type modal closed via onRequestClose');
          setIsTruckTypeModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              console.log('🚛 Truck type modal overlay pressed - closing modal');
              setIsTruckTypeModalVisible(false);
            }}
          />
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
                    console.log('🚛 Truck type selected:', type);
                    setTruckType(type);
                    setIsTruckTypeModalVisible(false);
                    console.log('🚛 Truck type modal closed after selection');
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
        </View>
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
                style={[styles.successButton, styles.dashboardButton]} 
                onPress={() => {
                  setIsSuccessModalVisible(false);
                  navigation.navigate('Dashboard');
                }}
              >
                <Text style={styles.successButtonText}>📊 Go to Dashboard</Text>
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
    backgroundColor: colors.background.secondary,
  },
  scrollContainer: {
    ...scrollConfig.contentContainerStyle,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: responsiveDimensions.isMobile ? spacing['2xl'] : spacing['3xl'],
    paddingBottom: spacing.base,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
    maxWidth: containerWidths.maxWidth,
    width: '100%',
  },
  truckForm: {
    width: responsiveDimensions.isMobile ? '95%' : cardDimensions.width,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    margin: spacing.base,
    ...shadows.lg,
    maxWidth: cardDimensions.maxWidth,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  navButtons: {
    flexDirection: responsiveDimensions.isMobile ? 'column' : 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: responsiveDimensions.isMobile ? '95%' : cardDimensions.width,
    gap: spacing.sm,
    maxWidth: cardDimensions.maxWidth,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    paddingVertical: buttonDimensions.paddingVertical,
    borderRadius: borderRadius.sm,
    marginHorizontal: responsiveDimensions.isMobile ? 0 : spacing.sm,
    ...shadows.base,
    flex: responsiveDimensions.isMobile ? 0 : 1,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  navButtonText: {
    color: colors.text.inverse,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: responsiveDimensions.isMobile ? 22 : 26,
    maxWidth: responsiveDimensions.isMobile ? '100%' : '80%',
  },
  formTitle: {
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.base,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.base,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.primary,
    paddingHorizontal: inputDimensions.paddingHorizontal,
    paddingVertical: inputDimensions.paddingVertical,
    ...shadows.sm,
  },
  dropdownText: {
    fontSize: inputDimensions.fontSize,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '400',
  },
  placeholder: {
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  dropdownArrow: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: spacing.sm,
    paddingHorizontal: spacing.base,
    fontSize: fontSizes.base,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  photoButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.base,
    padding: spacing.base,
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '10',
    ...shadows.sm,
  },
  photoButtonText: {
    color: colors.primary,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '500',
  },
  photoContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photo: {
    width: responsiveDimensions.isMobile ? 200 : 250,
    height: responsiveDimensions.isMobile ? 150 : 180,
    borderRadius: borderRadius.base,
    marginBottom: spacing.base,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    resizeMode: 'cover',
    ...shadows.base,
  },
  changePhotoButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    paddingVertical: buttonDimensions.paddingVertical,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  changePhotoText: {
    color: colors.text.inverse,
    fontWeight: '500',
    fontSize: buttonDimensions.fontSize,
  },
  startButton: {
    backgroundColor: colors.success,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    marginTop: spacing.base,
    ...shadows.lg,
  },
  startButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  startButtonText: {
    color: colors.text.inverse,
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: modalDimensions.padding,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    alignItems: 'center',
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    marginBottom: spacing.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginBottom: spacing.sm,
    width: '100%',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalButtonText: {
    color: colors.text.primary,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '400',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.danger,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '500',
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: modalDimensions.padding,
    width: '95%',
    maxWidth: modalDimensions.maxWidth,
    alignItems: 'center',
    ...shadows.xl,
  },
  successTitle: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  jobDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  jobDetailTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  jobDetailText: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: responsiveDimensions.isMobile ? 22 : 26,
  },
  successButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  successButton: {
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    ...shadows.base,
  },
  pdfButton: {
    backgroundColor: colors.primary,
  },
  dashboardButton: {
    backgroundColor: colors.secondary,
  },
  continueButton: {
    backgroundColor: colors.success,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  successButtonText: {
    color: colors.text.inverse,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '600',
  },
  // New Dropdown Modal Styles
  dropdownModal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: modalDimensions.padding,
    width: '85%',
    maxWidth: modalDimensions.maxWidth,
    alignSelf: 'center',
    marginTop: '15%',
    ...shadows.xl,
  },
  dropdownTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  dropdownList: {
  },
  dropdownItem: {
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  dropdownItemText: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    fontWeight: '400',
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
});

