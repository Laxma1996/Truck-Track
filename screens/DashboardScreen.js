import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  getGridStyle,
  getGridItemStyle,
  getResponsiveValue,
  getResponsivePixels,
  getResponsivePercentage,
  getResponsiveLayout,
  getResponsiveTextStyles,
  getResponsiveShadows,
  getDeviceType
} from '../utils/responsive';

export default function DashboardScreen({ navigation }) {
  // FORCE RELOAD - VERSION 2.0 - CACHE BUSTER
  console.log('🔥🔥🔥 DASHBOARD SCREEN LOADED - VERSION 2.0 - CACHE BUSTER 🔥🔥🔥');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isJobDetailsModalVisible, setIsJobDetailsModalVisible] = useState(false);
  const [isJobEditModalVisible, setIsJobEditModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentUser, setCurrentUser] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [page, setPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    activity: '',
    truckType: '',
    weight: '',
    photo: '',
  });
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isTruckTypeModalVisible, setIsTruckTypeModalVisible] = useState(false);

  const statusOptions = [
    { label: 'All Jobs', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Finished', value: 'finished' },
    { label: 'Deleted', value: 'deleted' },
  ];

  const activityOptions = [
    'Activity One',
    'Activity Two', 
    'Activity Three',
    'Activity Four',
    'Activity Five',
    'Activity Six',
    'Activity Seven',
    'Activity Eight',
    'Activity Nine',
    'Activity Ten'
  ];

  const truckTypeOptions = [
    'Refrigerated Truck',
    'Dry Van Truck',
    'Flatbed Truck',
    'Tanker Truck',
    'Box Truck',
    'Car Carrier',
    'Livestock Truck',
    'Garbage Truck',
    'Crane Truck',
    'Tow Truck'
  ];

  useEffect(() => {
    checkAuthentication();
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [allJobs, searchQuery, statusFilter]);

  const checkAuthentication = async () => {
    try {
      const username = await AsyncStorage.getItem('truckTrackerUser');
      const role = await AsyncStorage.getItem('truckTrackerUserRole');
      if (username) {
        setCurrentUser(username);
        setUserRole(role || 'user');
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigation.navigate('Home');
    }
  };

  const loadJobs = async (pageNum = 1, isRefresh = false) => {
    try {
      console.log('🔄 Loading jobs - page:', pageNum, 'isRefresh:', isRefresh);
      
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const userId = await AsyncStorage.getItem('truckTrackerUserId');
      console.log('👤 User ID from storage:', userId);
      
      if (!userId) {
        console.log('❌ No user ID found');
        Alert.alert('Error', 'User not authenticated');
        navigation.navigate('Home');
        return;
      }

      const result = await jobService.getUserJobs(userId);
      
      
      if (result.success) {
        
        const jobsPerPage = 10;
        const startIndex = (pageNum - 1) * jobsPerPage;
        const endIndex = startIndex + jobsPerPage;
        const paginatedJobs = result.jobs.slice(startIndex, endIndex);
        
        if (isRefresh || pageNum === 1) {
          setAllJobs(result.jobs);
          setJobs(result.jobs); // Set jobs to all jobs for consistency
          console.log('🔄 Set all jobs and jobs state to:', result.jobs.length, 'items');
        } else {
          setAllJobs(prev => [...prev, ...paginatedJobs]);
          setJobs(prev => [...prev, ...paginatedJobs]);
          console.log('➕ Added paginated jobs to existing jobs');
        }
        
        setHasMoreJobs(endIndex < result.jobs.length);
        setPage(pageNum);
      } else {
        console.log('❌ Failed to load jobs:', result.message);
        Alert.alert('Error', 'Failed to load jobs');
      }
    } catch (error) {
      console.error('💥 Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await loadJobs(1, true);
    setRefreshing(false);
  };


  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreJobs) {
      loadMoreJobs();
    }
  };

  const loadMoreJobs = async () => {
    if (!isLoadingMore && hasMoreJobs) {
      await loadJobs(page + 1);
    }
  };

  const filterJobs = () => {
    let filtered = [...allJobs];

    // Filter by search query (Job ID)
    if (searchQuery.trim()) {
      filtered = filtered.filter(job => 
        job.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'truckTrackerAuth',
        'truckTrackerUser',
        'truckTrackerUserId',
        'truckTrackerUserRole',
        'truckTrackerLoginTime'
      ]);
      
      // Navigate to Home and reset to top
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout properly');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'finished': return '#17a2b8';
      case 'deleted': return '#dc3545';
      case 'started': return '#4a90e2';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'finished': return 'Finished';
      case 'deleted': return 'Deleted';
      case 'started': return 'Started';
      default: return status;
    }
  };

  const handleJobCardPress = (job) => {
    setSelectedJob(job);
    setIsJobDetailsModalVisible(true);
  };

  const closeJobDetailsModal = () => {
    setIsJobDetailsModalVisible(false);
    setSelectedJob(null);
  };

  const handleDeleteJob = async (job) => {
    console.log('🚀🚀🚀 NEW VERSION LOADED - DELETE JOB FUNCTION CALLED - UPDATED AT:', new Date().toISOString(), '🚀🚀🚀');
    console.log('Delete job clicked for:', job.id, job.status);
    console.log('Current job data:', job);
    console.log('About to show Alert.alert...');
    
    // For now, let's skip the Alert and go directly to the delete action for testing
    console.log('Skipping Alert for testing - proceeding directly to delete');
    try {
      console.log('Attempting to delete job:', job.id);
      console.log('Calling jobService.updateJobStatus with:', job.id, 'deleted');
      console.log('About to call Firebase service...');
      // Update job status to deleted
      const result = await jobService.updateJobStatus(job.id, 'deleted');
      console.log('Delete result:', result);
      console.log('Result success:', result.success);
      console.log('Result message:', result.message);
      if (result.success) {
        // Update local state immediately
        const endDateTime = new Date().toISOString();
        const updatedJobs = allJobs.map(j => 
          j.id === job.id 
            ? { ...j, status: 'deleted', endDateTime: endDateTime, updatedAt: endDateTime }
            : j
        );
        setAllJobs(updatedJobs);
        setJobs(updatedJobs);
        console.log('Job status updated to deleted in local state');
        Alert.alert('Success', 'Job deleted successfully');
      } else {
        console.log('Delete failed:', result.message);
        Alert.alert('Error', 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      Alert.alert('Error', 'Failed to delete job');
    }
  };

  const handleFinishJob = async (job) => {
    console.log('🎯🎯🎯 NEW VERSION LOADED - FINISH JOB FUNCTION CALLED - UPDATED AT:', new Date().toISOString(), '🎯🎯🎯');
    console.log('Finish job clicked for:', job.id, job.status);
    console.log('Current job data:', job);
    console.log('About to show Alert.alert...');
    
    // For now, let's skip the Alert and go directly to the finish action for testing
    console.log('Skipping Alert for testing - proceeding directly to finish');
    try {
      console.log('Attempting to finish job:', job.id);
      console.log('Calling jobService.updateJobStatus with:', job.id, 'finished');
      console.log('About to call Firebase service...');
      const result = await jobService.updateJobStatus(job.id, 'finished');
      console.log('Finish result:', result);
      console.log('Result success:', result.success);
      console.log('Result message:', result.message);
      if (result.success) {
        // Update local state immediately
        const endDateTime = new Date().toISOString();
        const updatedJobs = allJobs.map(j => 
          j.id === job.id 
            ? { ...j, status: 'finished', endDateTime: endDateTime, updatedAt: endDateTime }
            : j
        );
        setAllJobs(updatedJobs);
        setJobs(updatedJobs);
        console.log('Job status updated to finished in local state');
        Alert.alert('Success', 'Job marked as finished');
      } else {
        console.log('Finish failed:', result.message);
        Alert.alert('Error', 'Failed to finish job');
      }
    } catch (error) {
      console.error('Error finishing job:', error);
      Alert.alert('Error', 'Failed to finish job');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditForm({
      activity: job.activity,
      truckType: job.truckType,
      weight: job.weight.toString(),
      photo: job.photo,
    });
    setIsJobEditModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setEditForm({...editForm, photo: result.assets[0].uri});
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setEditForm({...editForm, photo: result.assets[0].uri});
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      const updatedJob = {
        ...editingJob,
        activity: editForm.activity,
        truckType: editForm.truckType,
        weight: parseFloat(editForm.weight),
        photo: editForm.photo,
        updatedAt: new Date().toISOString()
      };

      const result = await jobService.updateJob(editingJob.id, updatedJob);
      if (result.success) {
        // Update local state immediately
        const updatedJobs = allJobs.map(j => 
          j.id === editingJob.id 
            ? { ...j, ...updatedJob }
            : j
        );
        setAllJobs(updatedJobs);
        setJobs(updatedJobs);
        Alert.alert('Success', 'Job updated successfully');
        setIsJobEditModalVisible(false);
        setEditingJob(null);
      } else {
        Alert.alert('Error', 'Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      Alert.alert('Error', 'Failed to update job');
    }
  };

  // Render individual job item for FlatList
  const renderJobItem = ({ item: job }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => handleJobCardPress(job)}
      activeOpacity={0.7}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobId}>#{job.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <Text style={styles.jobActivity}>{job.activity}</Text>
        <Text style={styles.jobTruckType}>{job.truckType}</Text>
        <Text style={styles.jobWeight}>{job.weight} kg</Text>
        <Text style={styles.jobDate}>{formatDate(job.createdAt)}</Text>
      </View>
      
      {job.photo && (
        <View style={styles.photoIndicator}>
          <Text style={styles.photoText}>📷 Photo Available</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.jobActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={(e) => {
            e.stopPropagation();
            console.log('Edit button pressed for job:', job.id);
            handleEditJob(job);
          }}
        >
          <Text style={[styles.actionButtonText, { fontSize: fontSizes.base, fontWeight: '800' }]}>✏️ EDIT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.finishButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleFinishJob(job);
          }}
        >
          <Text style={styles.actionButtonText}>✅ Finish</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteJob(job);
          }}
        >
          <Text style={styles.actionButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery || statusFilter !== 'all' 
          ? 'No jobs match your filters' 
          : 'No jobs found. Start by creating your first job!'
        }
      </Text>
    </View>
  );

  // Render footer with loading indicator
  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingMoreText}>Loading more jobs...</Text>
        </View>
      );
    }
    
    if (!hasMoreJobs && filteredJobs.length > 0) {
      return (
        <View style={styles.endOfListContainer}>
          <Text style={styles.endOfListText}>You've reached the end of the list</Text>
        </View>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Job Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {currentUser}</Text>
          </View>
          
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={[styles.navButton, styles.primaryButton]} 
              onPress={() => navigation.navigate('Logging')}
            >
              <Text style={styles.navButtonText}>Start New Job</Text>
            </TouchableOpacity>
            
            {userRole === 'admin' && (
              <TouchableOpacity 
                style={[styles.navButton, styles.adminButton]} 
                onPress={() => navigation.navigate('Admin')}
              >
                <Text style={styles.navButtonText}>⚙️ Admin</Text>
              </TouchableOpacity>
            )}
            
            
            <TouchableOpacity 
              style={[styles.navButton, styles.logoutButton]} 
              onPress={handleLogout}
            >
              <Text style={styles.navButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filters</Text>
        
        {/* Filters Row - Side by Side */}
        <View style={styles.filtersRow}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Job ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Status Filter */}
          <TouchableOpacity 
            style={styles.statusFilter}
            onPress={() => setIsStatusModalVisible(true)}
          >
            <Text style={styles.statusFilterText}>
              {statusOptions.find(opt => opt.value === statusFilter)?.label || 'All Jobs'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Jobs List - This should take remaining space */}
      <View style={styles.jobsContainer}>
        <Text style={styles.jobsTitle}>
          Jobs ({filteredJobs.length})
        </Text>
        
        <View style={styles.flatListWrapper}>
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id}
            renderItem={renderJobItem}
            numColumns={responsiveDimensions.isMobile ? 1 : (responsiveDimensions.isTablet ? 2 : 3)}
            key={responsiveDimensions.isMobile ? 1 : (responsiveDimensions.isTablet ? 2 : 3)} // Force re-render when columns change
            contentContainerStyle={styles.jobsListContainer}
            style={styles.flatListStyle}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={true}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
            {...scrollConfig}
          />
        </View>
      </View>

      {/* Status Filter Modal */}
      {isStatusModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  statusFilter === option.value && styles.statusOptionSelected
                ]}
                onPress={() => {
                  setStatusFilter(option.value);
                  setIsStatusModalVisible(false);
                }}
              >
                <Text style={[
                  styles.statusOptionText,
                  statusFilter === option.value && styles.statusOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsStatusModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Job Edit Modal */}
      <Modal
        visible={isJobEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsJobEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Job</Text>
              <TouchableOpacity onPress={() => setIsJobEditModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editFormScrollView} contentContainerStyle={styles.editFormContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Activity</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setIsActivityModalVisible(true)}
                >
                  <Text style={styles.dropdownButtonText}>{editForm.activity || 'Select Activity'}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Truck Type</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setIsTruckTypeModalVisible(true)}
                >
                  <Text style={styles.dropdownButtonText}>{editForm.truckType || 'Select Truck Type'}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.weight}
                  onChangeText={(text) => setEditForm({...editForm, weight: text})}
                  placeholder="Enter weight"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Photo</Text>
                {editForm.photo && (
                  <View style={styles.photoPreview}>
                    {Platform.OS === 'web' ? (
                      <img 
                        src={editForm.photo} 
                        style={{
                          width: responsiveDimensions.isMobile ? 60 : 80,
                          height: responsiveDimensions.isMobile ? 60 : 80,
                          borderRadius: 8,
                          objectFit: 'contain',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                        }}
                        alt="Current Photo"
                        onError={(e) => {
                          console.log('Edit modal image load error');
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => console.log('Edit modal image loaded successfully')}
                      />
                    ) : (
                      <Image source={{ uri: editForm.photo }} style={styles.photoThumbnail} />
                    )}
                    <Text style={styles.photoText}>Current photo</Text>
                  </View>
                )}
                
                <View style={styles.photoButtons}>
                  <TouchableOpacity 
                    style={[styles.photoButton, styles.galleryButton]}
                    onPress={pickImage}
                  >
                    <Text style={styles.photoButtonText}>📷 Choose from Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.photoButton, styles.cameraButton]}
                    onPress={takePhoto}
                  >
                    <Text style={styles.photoButtonText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelEditButton]}
                onPress={() => setIsJobEditModalVisible(false)}
              >
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, styles.saveEditButton]}
                onPress={handleUpdateJob}
              >
                <Text style={styles.editButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Activity Selection Modal */}
      <Modal
        visible={isActivityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsActivityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <Text style={styles.modalTitle}>Select Activity</Text>
            
            {activityOptions.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.statusOption,
                  editForm.activity === activity && styles.statusOptionSelected
                ]}
                onPress={() => {
                  setEditForm({...editForm, activity: activity});
                  setIsActivityModalVisible(false);
                }}
              >
                <Text style={[
                  styles.statusOptionText,
                  editForm.activity === activity && styles.statusOptionTextSelected
                ]}>
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsActivityModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Truck Type Selection Modal */}
      <Modal
        visible={isTruckTypeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTruckTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <Text style={styles.modalTitle}>Select Truck Type</Text>
            
            {truckTypeOptions.map((truckType) => (
              <TouchableOpacity
                key={truckType}
                style={[
                  styles.statusOption,
                  editForm.truckType === truckType && styles.statusOptionSelected
                ]}
                onPress={() => {
                  setEditForm({...editForm, truckType: truckType});
                  setIsTruckTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.statusOptionText,
                  editForm.truckType === truckType && styles.statusOptionTextSelected
                ]}>
                  {truckType}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsTruckTypeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Job Details Modal */}
      <Modal
        visible={isJobDetailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeJobDetailsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.jobDetailsModal}>
            {selectedJob && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Job Details</Text>
                  <TouchableOpacity onPress={closeJobDetailsModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.modalContent}
                  contentContainerStyle={styles.modalContentContainer}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.jobDetailCard}>
                    <Text style={styles.jobDetailId}>Job ID: #{selectedJob.id.slice(-8)}</Text>
                    <Text style={styles.jobDetailStatus}>Status: {getStatusText(selectedJob.status)}</Text>
                    <Text style={styles.jobDetailActivity}>Activity: {selectedJob.activity}</Text>
                    <Text style={styles.jobDetailTruckType}>Truck Type: {selectedJob.truckType}</Text>
                    <Text style={styles.jobDetailWeight}>Weight: {selectedJob.weight} kg</Text>
                    <Text style={styles.jobDetailDate}>Created: {formatDate(selectedJob.createdAt)}</Text>
                    {selectedJob.username && (
                      <Text style={styles.jobDetailUser}>User: {selectedJob.username}</Text>
                    )}
                  </View>
                  
                  <View style={styles.photoSection}>
                    <Text style={styles.photoSectionTitle}>Truck Photo</Text>
                    {selectedJob.photo ? (
                      <View style={styles.photoContainer}>
                        {Platform.OS === 'web' ? (
                          <img 
                            src={selectedJob.photo} 
                            style={{
                              width: '100%',
                              height: responsiveDimensions.isMobile ? 200 : 250,
                              borderRadius: 8,
                              objectFit: 'contain',
                              backgroundColor: '#f8f9fa',
                              border: '2px solid #dee2e6',
                            }}
                            alt="Truck Photo"
                            onError={(e) => {
                              console.log('Web image load error');
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => console.log('Web image loaded successfully')}
                          />
                        ) : (
                          <Image 
                            source={{ uri: selectedJob.photo }} 
                            style={styles.jobPhoto}
                            onError={(error) => {
                              console.log('Image load error:', error);
                              console.log('Failed to load image URL:', selectedJob.photo.substring(0, 100) + '...');
                            }}
                            onLoad={() => console.log('Image loaded successfully')}
                          />
                        )}
                      </View>
                    ) : (
                      <View style={styles.noPhotoContainer}>
                        <Text style={styles.noPhotoText}>No photo available</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    height: '100vh',
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    height: '100%',
  },
  scrollContentContainer: {
    paddingBottom: getResponsivePixels(48, 64, 80),
    flexGrow: 1,
  },
  jobsListContainer: {
    paddingBottom: getResponsivePixels(64, 80, 96),
    paddingHorizontal: getResponsivePixels(8, 12, 16),
    paddingTop: getResponsivePixels(12, 16, 20),
    flexGrow: 1,
    // Force scrolling in case CSS overrides don't work
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      flexBasis: 'auto',
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    padding: getResponsivePixels(16, 20, 24),
    paddingTop: getResponsivePixels(32, 40, 48),
    paddingBottom: getResponsivePixels(24, 32, 40),
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...getResponsiveShadows().light,
  },
  headerContent: {
    maxWidth: containerWidths.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    justifyContent: 'space-between',
    alignItems: getResponsiveValue('stretch', 'center', 'center'),
    gap: getResponsivePixels(16, 20, 0),
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveValue(24, 28, 32),
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
    lineHeight: getResponsiveValue(30, 35, 40),
  },
  subtitle: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    lineHeight: getResponsiveValue(22, 25, 28),
  },
  navButtons: {
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    gap: getResponsivePixels(8, 12, 16),
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: getResponsivePixels(16, 20, 24),
    paddingVertical: getResponsivePixels(12, 14, 16),
    borderRadius: getResponsivePixels(6, 8, 10),
    alignItems: 'center',
    minWidth: getResponsiveValue('100%', 120, 140),
    ...getResponsiveShadows().medium,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  adminButton: {
    backgroundColor: colors.secondary,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  navButtonText: {
    color: colors.text.inverse,
    fontSize: getResponsiveValue(12, 14, 16),
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: colors.background.primary,
    padding: getResponsivePixels(16, 20, 24),
    marginHorizontal: getResponsivePixels(16, 20, 24),
    marginVertical: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(8, 12, 16),
    ...getResponsiveShadows().medium,
    alignSelf: 'center',
    width: '100%',
    maxWidth: containerWidths.maxWidth,
    marginBottom: getResponsivePixels(16, 20, 24),
  },
  filtersTitle: {
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(12, 16, 20),
  },
  filtersRow: {
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    gap: getResponsivePixels(12, 16, 20),
    alignItems: getResponsiveValue('stretch', 'center', 'center'),
  },
  searchContainer: {
    flex: getResponsiveValue(0, 2, 2),
    marginBottom: getResponsivePixels(16, 0, 0),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: getResponsivePixels(6, 8, 10),
    padding: getResponsivePixels(12, 14, 16),
    paddingHorizontal: getResponsivePixels(16, 18, 20),
    fontSize: getResponsiveValue(14, 16, 18),
    backgroundColor: colors.background.primary,
  },
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: getResponsivePixels(6, 8, 10),
    padding: getResponsivePixels(12, 14, 16),
    paddingHorizontal: getResponsivePixels(16, 18, 20),
    backgroundColor: colors.background.primary,
    flex: getResponsiveValue(0, 1, 1),
    minWidth: getResponsiveValue('100%', 200, 240),
  },
  statusFilterText: {
    fontSize: getResponsiveValue(14, 16, 18),
    color: colors.text.primary,
  },
  dropdownArrow: {
    fontSize: getResponsiveValue(12, 14, 16),
    color: colors.text.muted,
  },
  jobsContainer: {
    flex: 1,
    paddingHorizontal: getResponsivePixels(16, 20, 24),
    paddingTop: getResponsivePixels(12, 16, 20),
    paddingBottom: getResponsivePixels(16, 20, 24),
    alignItems: 'center',
    maxWidth: containerWidths.maxWidth,
    width: '100%',
    alignSelf: 'center',
    height: '100%',
  },
  flatListWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    // Additional deployment-safe scrolling
    ...(Platform.OS === 'web' && {
      flexBasis: 'auto',
    }),
  },
  flatListStyle: {
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  jobsTitle: {
    fontSize: getResponsiveValue(20, 24, 28),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(12, 16, 20),
  },
  emptyState: {
    backgroundColor: colors.background.primary,
    padding: getResponsivePixels(48, 64, 80),
    borderRadius: getResponsivePixels(8, 12, 16),
    alignItems: 'center',
    ...getResponsiveShadows().medium,
    width: '100%',
    maxWidth: cardDimensions.maxWidth,
  },
  emptyStateText: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: getResponsiveValue(22, 25, 28),
  },
  jobsGrid: {
    ...getGridStyle(3),
    width: '100%',
    maxWidth: containerWidths.maxWidth,
  },
  jobCard: {
    backgroundColor: colors.background.primary,
    borderRadius: getResponsivePixels(8, 12, 16),
    padding: getResponsivePixels(16, 20, 24),
    marginBottom: getResponsivePixels(24, 32, 40),
    marginHorizontal: getResponsivePixels(4, 8, 12),
    ...getResponsiveShadows().medium,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    transition: 'all 0.2s ease-in-out',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobId: {
    fontSize: getResponsiveValue(16, 18, 20),
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: getResponsivePixels(8, 12, 16),
    paddingVertical: getResponsivePixels(4, 6, 8),
    borderRadius: getResponsivePixels(12, 16, 20),
    ...getResponsiveShadows().light,
  },
  statusText: {
    color: colors.text.inverse,
    fontSize: getResponsiveValue(10, 12, 14),
    fontWeight: '600',
  },
  jobDetails: {
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobActivity: {
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(4, 6, 8),
  },
  jobTruckType: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    marginBottom: getResponsivePixels(4, 6, 8),
  },
  jobWeight: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    marginBottom: getResponsivePixels(4, 6, 8),
  },
  jobDate: {
    fontSize: getResponsiveValue(12, 14, 16),
    color: colors.text.muted,
  },
  photoIndicator: {
    backgroundColor: colors.primaryLight + '20',
    padding: getResponsivePixels(8, 12, 16),
    borderRadius: getResponsivePixels(4, 6, 8),
    alignItems: 'center',
    marginBottom: getResponsivePixels(8, 12, 16),
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...getResponsiveShadows().light,
  },
  photoText: {
    fontSize: getResponsiveValue(12, 14, 16),
    color: colors.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModal: {
    backgroundColor: colors.background.primary,
    borderRadius: getResponsivePixels(8, 12, 16),
    padding: getResponsivePixels(20, 24, 32),
    width: getResponsiveValue('95%', '85%', '70%'),
    maxWidth: getResponsiveValue(400, 600, 800),
    ...getResponsiveShadows().heavy,
  },
  modalTitle: {
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(12, 16, 20),
    textAlign: 'center',
  },
  statusOption: {
    padding: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(6, 8, 10),
    marginBottom: getResponsivePixels(8, 12, 16),
    backgroundColor: colors.background.secondary,
  },
  statusOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  statusOptionText: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.primary,
  },
  statusOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: getResponsivePixels(12, 16, 20),
    padding: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(6, 8, 10),
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.danger,
    fontWeight: '600',
  },
  // Job Details Modal Styles
  jobDetailsModal: {
    backgroundColor: colors.background.primary,
    borderRadius: getResponsivePixels(8, 12, 16),
    width: getResponsiveValue('95%', '85%', '70%'),
    maxWidth: getResponsiveValue(400, 600, 800),
    ...getResponsiveShadows().heavy,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsivePixels(20, 24, 32),
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: getResponsivePixels(8, 12, 16),
  },
  closeButtonText: {
    fontSize: getResponsiveValue(20, 24, 28),
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: getResponsivePixels(20, 24, 32),
    overflowY: 'auto',
  },
  modalContentContainer: {
    paddingBottom: getResponsivePixels(48, 64, 80),
    flexGrow: 1,
  },
  jobDetailCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: getResponsivePixels(6, 8, 10),
    padding: getResponsivePixels(16, 20, 24),
    marginBottom: getResponsivePixels(16, 20, 24),
  },
  jobDetailId: {
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobDetailStatus: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.primary,
    fontWeight: '600',
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobDetailActivity: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobDetailTruckType: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobDetailWeight: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobDetailDate: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobDetailUser: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  photoSection: {
    marginTop: getResponsivePixels(16, 20, 24),
    marginBottom: getResponsivePixels(16, 20, 24),
  },
  photoSectionTitle: {
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  jobPhoto: {
    width: '100%',
    height: getResponsiveValue(200, 250, 300),
    borderRadius: getResponsivePixels(6, 8, 10),
    resizeMode: 'contain',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  noPhotoContainer: {
    width: '100%',
    height: getResponsiveValue(200, 250, 300),
    borderRadius: getResponsivePixels(6, 8, 10),
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  photoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  photoDebugText: {
    fontSize: getResponsiveValue(10, 12, 14),
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: getResponsivePixels(4, 6, 8),
    textAlign: 'center',
    wordBreak: 'break-all',
  },
  loadingMoreContainer: {
    padding: getResponsivePixels(16, 20, 24),
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: getResponsivePixels(6, 8, 10),
    marginTop: getResponsivePixels(8, 12, 16),
  },
  loadingMoreText: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  endOfListContainer: {
    padding: getResponsivePixels(16, 20, 24),
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: getResponsivePixels(6, 8, 10),
    marginTop: getResponsivePixels(8, 12, 16),
  },
  endOfListText: {
    fontSize: getResponsiveValue(12, 14, 16),
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  // Job Action Buttons
  jobActions: {
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    justifyContent: 'space-evenly',
    marginTop: getResponsivePixels(16, 20, 24),
    gap: getResponsivePixels(8, 12, 16),
    paddingTop: getResponsivePixels(12, 16, 20),
    paddingBottom: getResponsivePixels(12, 16, 20),
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flex: getResponsiveValue(0, 1, 1),
    paddingVertical: getResponsivePixels(12, 16, 20),
    paddingHorizontal: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(4, 6, 8),
    alignItems: 'center',
    justifyContent: 'center',
    ...getResponsiveShadows().light,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: getResponsiveValue(80, 100, 120),
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: getResponsiveValue(12, 14, 16),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  editButton: {
    backgroundColor: '#ff6b35',
    borderColor: '#e55a2b',
    borderWidth: 2,
  },
  finishButton: {
    backgroundColor: '#28a745',
    borderColor: '#1e7e34',
    borderWidth: 2,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderColor: '#c82333',
    borderWidth: 2,
  },
  // Edit Modal Styles
  editModal: {
    backgroundColor: colors.background.primary,
    borderRadius: getResponsivePixels(8, 12, 16),
    width: getResponsiveValue('95%', '85%', '70%'),
    maxWidth: getResponsiveValue(400, 600, 800),
    ...getResponsiveShadows().heavy,
    overflow: 'hidden',
  },
  editFormScrollView: {
    flex: 1,
  },
  editFormContainer: {
    padding: getResponsivePixels(20, 24, 32),
    paddingBottom: getResponsivePixels(16, 20, 24),
  },
  inputContainer: {
    marginBottom: getResponsivePixels(12, 16, 20),
  },
  inputLabel: {
    fontSize: getResponsiveValue(16, 18, 20),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: getResponsivePixels(6, 8, 10),
    padding: getResponsivePixels(12, 14, 16),
    paddingHorizontal: getResponsivePixels(16, 18, 20),
    fontSize: getResponsiveValue(14, 16, 18),
    backgroundColor: colors.background.primary,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: getResponsivePixels(20, 24, 32),
    paddingTop: getResponsivePixels(12, 16, 20),
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    gap: getResponsivePixels(8, 12, 16),
  },
  editButton: {
    flex: 1,
    paddingVertical: getResponsivePixels(12, 14, 16),
    paddingHorizontal: getResponsivePixels(16, 20, 24),
    borderRadius: getResponsivePixels(6, 8, 10),
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: getResponsiveValue(14, 16, 18),
    fontWeight: '600',
    color: colors.text.inverse,
  },
  cancelEditButton: {
    backgroundColor: colors.gray[500],
  },
  saveEditButton: {
    backgroundColor: colors.success,
  },
  // Photo preview styles
  photoPreview: {
    alignItems: 'center',
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  photoThumbnail: {
    width: getResponsiveValue(60, 80, 100),
    height: getResponsiveValue(60, 80, 100),
    borderRadius: getResponsivePixels(6, 8, 10),
    marginBottom: getResponsivePixels(4, 6, 8),
    resizeMode: 'contain',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  photoText: {
    fontSize: getResponsiveValue(10, 12, 14),
    color: colors.text.secondary,
  },
  photoNote: {
    fontSize: getResponsiveValue(10, 12, 14),
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  photoButtons: {
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    gap: getResponsivePixels(8, 12, 16),
    marginTop: getResponsivePixels(8, 12, 16),
    width: '100%',
  },
  photoButton: {
    flex: getResponsiveValue(0, 1, 1),
    paddingVertical: getResponsivePixels(8, 12, 16),
    paddingHorizontal: getResponsivePixels(8, 12, 16),
    borderRadius: getResponsivePixels(4, 6, 8),
    alignItems: 'center',
    maxWidth: getResponsiveValue('100%', '50%', '50%'),
  },
  photoButtonText: {
    fontSize: getResponsiveValue(10, 12, 14),
    fontWeight: '600',
    color: colors.text.inverse,
  },
  galleryButton: {
    backgroundColor: colors.gray[500],
  },
  cameraButton: {
    backgroundColor: colors.info,
  },
  // Dropdown styles
  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: getResponsivePixels(6, 8, 10),
    padding: getResponsivePixels(12, 14, 16),
    paddingHorizontal: getResponsivePixels(16, 18, 20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  dropdownButtonText: {
    fontSize: getResponsiveValue(14, 16, 18),
    color: colors.text.primary,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: getResponsiveValue(12, 14, 16),
    color: colors.text.muted,
    marginLeft: getResponsivePixels(8, 12, 16),
  },
});
