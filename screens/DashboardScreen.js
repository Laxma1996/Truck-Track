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
  getGridItemStyle
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
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const userId = await AsyncStorage.getItem('truckTrackerUserId');
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        navigation.navigate('Home');
        return;
      }

      // Simulate pagination - in real app, you'd pass page to your API
      const result = await jobService.getUserJobs(userId);
      if (result.success) {
        const jobsPerPage = 10;
        const startIndex = (pageNum - 1) * jobsPerPage;
        const endIndex = startIndex + jobsPerPage;
        const paginatedJobs = result.jobs.slice(startIndex, endIndex);
        
        if (isRefresh || pageNum === 1) {
          setAllJobs(result.jobs);
          setJobs(result.jobs); // Set jobs to all jobs for consistency
        } else {
          setAllJobs(prev => [...prev, ...paginatedJobs]);
          setJobs(prev => [...prev, ...paginatedJobs]);
        }
        
        setHasMoreJobs(endIndex < result.jobs.length);
        setPage(pageNum);
      } else {
        Alert.alert('Error', 'Failed to load jobs');
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = async () => {
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
    minHeight: '100vh',
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    height: '100%',
  },
  scrollContentContainer: {
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },
  jobsListContainer: {
    paddingBottom: spacing['6xl'],
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.base,
    flexGrow: 1,
    // Force scrolling in case CSS overrides don't work
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto',
      flexBasis: 'auto',
      minHeight: 0,
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    paddingTop: responsiveDimensions.isMobile ? spacing['2xl'] : spacing['3xl'],
    paddingBottom: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  headerContent: {
    maxWidth: containerWidths.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: responsiveDimensions.isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: responsiveDimensions.isMobile ? 'stretch' : 'center',
    gap: responsiveDimensions.isMobile ? spacing.base : 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
  },
  navButtons: {
    flexDirection: responsiveDimensions.isMobile ? 'column' : 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    paddingVertical: buttonDimensions.paddingVertical,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    minHeight: buttonDimensions.height,
    minWidth: responsiveDimensions.isMobile ? '100%' : 120,
    ...shadows.base,
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
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.base,
    borderRadius: borderRadius.lg,
    ...shadows.base,
    alignSelf: 'center',
    width: '100%',
    maxWidth: containerWidths.maxWidth,
    marginBottom: spacing.lg,
  },
  filtersTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  filtersRow: {
    flexDirection: responsiveDimensions.isMobile ? 'column' : 'row',
    gap: spacing.base,
    alignItems: responsiveDimensions.isMobile ? 'stretch' : 'center',
  },
  searchContainer: {
    flex: responsiveDimensions.isMobile ? 0 : 2,
    marginBottom: responsiveDimensions.isMobile ? spacing.base : 0,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: inputDimensions.paddingVertical,
    paddingHorizontal: inputDimensions.paddingHorizontal,
    fontSize: inputDimensions.fontSize,
    backgroundColor: colors.background.primary,
    minHeight: inputDimensions.height,
  },
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: inputDimensions.paddingVertical,
    paddingHorizontal: inputDimensions.paddingHorizontal,
    backgroundColor: colors.background.primary,
    minHeight: inputDimensions.height,
    flex: responsiveDimensions.isMobile ? 0 : 1,
    minWidth: responsiveDimensions.isMobile ? '100%' : 200,
  },
  statusFilterText: {
    fontSize: inputDimensions.fontSize,
    color: colors.text.primary,
  },
  dropdownArrow: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  jobsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
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
      maxHeight: 'calc(100vh - 200px)',
      flexBasis: 'auto',
      minHeight: 0,
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
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  emptyState: {
    backgroundColor: colors.background.primary,
    padding: spacing['4xl'],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.base,
    width: '100%',
    maxWidth: cardDimensions.maxWidth,
  },
  emptyStateText: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: responsiveDimensions.isMobile ? 22 : 26,
  },
  jobsGrid: {
    ...getGridStyle(3),
    width: '100%',
    maxWidth: containerWidths.maxWidth,
  },
  jobCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: cardDimensions.padding,
    marginBottom: spacing['2xl'],
    marginHorizontal: spacing.sm,
    ...shadows.base,
    flex: 1,
    minHeight: cardDimensions.minHeight,
    borderWidth: 1,
    borderColor: colors.border.light,
    transition: 'all 0.2s ease-in-out',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobId: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  statusText: {
    color: colors.text.inverse,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  jobDetails: {
    marginBottom: spacing.sm,
  },
  jobActivity: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  jobTruckType: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  jobWeight: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  jobDate: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  photoIndicator: {
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.sm,
  },
  photoText: {
    fontSize: fontSizes.sm,
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
    borderRadius: borderRadius.lg,
    padding: modalDimensions.padding,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  statusOption: {
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  statusOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  statusOptionText: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
  },
  statusOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSizes.lg,
    color: colors.danger,
    fontWeight: '600',
  },
  // Job Details Modal Styles
  jobDetailsModal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    maxHeight: '95vh',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: modalDimensions.padding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: fontSizes['2xl'],
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: modalDimensions.padding,
    maxHeight: 'calc(95vh - 120px)',
    overflowY: 'auto',
  },
  modalContentContainer: {
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },
  jobDetailCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  jobDetailId: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  jobDetailStatus: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  jobDetailActivity: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  jobDetailTruckType: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  jobDetailWeight: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  jobDetailDate: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  jobDetailUser: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  photoSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  photoSectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  jobPhoto: {
    width: '100%',
    height: responsiveDimensions.isMobile ? 200 : 250,
    borderRadius: borderRadius.base,
    resizeMode: 'contain',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  noPhotoContainer: {
    width: '100%',
    height: responsiveDimensions.isMobile ? 200 : 250,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: fontSizes.lg,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  photoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  photoDebugText: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    textAlign: 'center',
    wordBreak: 'break-all',
  },
  loadingMoreContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    marginTop: spacing.sm,
  },
  loadingMoreText: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  endOfListContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    marginTop: spacing.sm,
  },
  endOfListText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  // Job Action Buttons
  jobActions: {
    flexDirection: responsiveDimensions.isMobile ? 'column' : 'row',
    justifyContent: 'space-evenly',
    marginTop: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    minHeight: 60,
  },
  actionButton: {
    flex: responsiveDimensions.isMobile ? 0 : 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: buttonDimensions.height + 10,
    ...shadows.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    borderRadius: borderRadius.lg,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    maxHeight: '90vh',
    ...shadows.xl,
    overflow: 'hidden',
  },
  editFormScrollView: {
    flex: 1,
    maxHeight: 'calc(90vh - 120px)',
  },
  editFormContainer: {
    padding: modalDimensions.padding,
    paddingBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    padding: inputDimensions.paddingVertical,
    paddingHorizontal: inputDimensions.paddingHorizontal,
    fontSize: inputDimensions.fontSize,
    backgroundColor: colors.background.primary,
    minHeight: inputDimensions.height,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: modalDimensions.padding,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    paddingVertical: buttonDimensions.paddingVertical,
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    minHeight: buttonDimensions.height,
  },
  editButtonText: {
    fontSize: buttonDimensions.fontSize,
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
    marginBottom: spacing.sm,
  },
  photoThumbnail: {
    width: responsiveDimensions.isMobile ? 60 : 80,
    height: responsiveDimensions.isMobile ? 60 : 80,
    borderRadius: borderRadius.base,
    marginBottom: spacing.xs,
    resizeMode: 'contain',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  photoText: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
  },
  photoNote: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  photoButtons: {
    flexDirection: responsiveDimensions.isMobile ? 'column' : 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  photoButton: {
    flex: responsiveDimensions.isMobile ? 0 : 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minHeight: buttonDimensions.height * 0.8,
    maxWidth: responsiveDimensions.isMobile ? '100%' : '50%',
  },
  photoButtonText: {
    fontSize: fontSizes.xs,
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
    borderRadius: borderRadius.base,
    padding: inputDimensions.paddingVertical,
    paddingHorizontal: inputDimensions.paddingHorizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    minHeight: inputDimensions.height,
  },
  dropdownButtonText: {
    fontSize: inputDimensions.fontSize,
    color: colors.text.primary,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    marginLeft: spacing.sm,
  },
});
