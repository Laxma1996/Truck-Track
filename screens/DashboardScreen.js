import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jobService } from '../services/firebaseService';

export default function DashboardScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isJobDetailsModalVisible, setIsJobDetailsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentUser, setCurrentUser] = useState('');

  const statusOptions = [
    { label: 'All Jobs', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Started', value: 'started' },
  ];

  useEffect(() => {
    checkAuthentication();
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, statusFilter]);

  const checkAuthentication = async () => {
    try {
      const username = await AsyncStorage.getItem('truckTrackerUser');
      if (username) {
        setCurrentUser(username);
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigation.navigate('Home');
    }
  };

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('truckTrackerUserId');
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        navigation.navigate('Home');
        return;
      }

      const result = await jobService.getUserJobs(userId);
      if (result.success) {
        setJobs(result.jobs);
      } else {
        Alert.alert('Error', 'Failed to load jobs');
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const filterJobs = () => {
    let filtered = [...jobs];

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
      case 'started': return '#4a90e2';
      case 'inactive': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'started': return 'Started';
      case 'inactive': return 'Inactive';
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Job Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {currentUser}</Text>
        
        <View style={styles.navButtons}>
          <TouchableOpacity 
            style={[styles.navButton, styles.primaryButton]} 
            onPress={() => navigation.navigate('Logging')}
          >
            <Text style={styles.navButtonText}>Start New Job</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Text style={styles.navButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filters</Text>
        
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

      {/* Jobs Grid */}
      <View style={styles.jobsContainer}>
        <Text style={styles.jobsTitle}>
          Jobs ({filteredJobs.length})
        </Text>
        
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery || statusFilter !== 'all' 
                ? 'No jobs match your filters' 
                : 'No jobs found. Start by creating your first job!'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.jobsGrid}>
            {filteredJobs.map((job) => (
              <TouchableOpacity 
                key={job.id} 
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
              </TouchableOpacity>
            ))}
          </View>
        )}
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
                
                <ScrollView style={styles.modalContent}>
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
                  
                  {selectedJob.photo && (
                    <View style={styles.photoSection}>
                      <Text style={styles.photoSectionTitle}>Truck Photo</Text>
                      <Image source={{ uri: selectedJob.photo }} style={styles.jobPhoto} />
                    </View>
                  )}
                </ScrollView>
              </>
            )}
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 20,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 40,
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  statusFilterText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  jobsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  jobsGrid: {
    gap: 16,
    width: '100%',
    maxWidth: 600,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  jobDetails: {
    marginBottom: 12,
  },
  jobActivity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  jobTruckType: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  jobWeight: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  photoIndicator: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  photoText: {
    fontSize: 14,
    color: '#4a90e2',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  statusOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  statusOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
  },
  // Job Details Modal Styles
  jobDetailsModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  jobDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  jobDetailId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  jobDetailStatus: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginBottom: 8,
  },
  jobDetailActivity: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  jobDetailTruckType: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  jobDetailWeight: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  jobDetailDate: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  jobDetailUser: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  photoSection: {
    marginTop: 20,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  jobPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});
