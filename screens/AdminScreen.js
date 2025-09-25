import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, dbService } from '../services/firebaseService';
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

export default function AdminScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState('');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Remove tabs - show everything in one view
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] = useState(false);
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    fullName: '',
    phone: '',
  });

  const userRoles = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
  ];

  useEffect(() => {
    checkAuthentication();
    loadData();
  }, []);

  const checkAuthentication = async () => {
    try {
      const username = await AsyncStorage.getItem('truckTrackerUser');
      const userRole = await AsyncStorage.getItem('truckTrackerUserRole');
      
      if (username && userRole === 'admin') {
        setCurrentUser(username);
      } else {
        Alert.alert('Access Denied', 'You do not have admin privileges');
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigation.navigate('Home');
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadUsers(),
        loadJobs(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await dbService.getCollection('users');
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const result = await dbService.getCollection('jobs');
      if (result.success) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.email || !newUser.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const result = await authService.createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        fullName: newUser.fullName,
        phone: newUser.phone,
      });

      if (result.success) {
        Alert.alert('Success', 'User created successfully');
        setIsCreateUserModalVisible(false);
        setNewUser({
          username: '',
          email: '',
          password: '',
          role: 'user',
          fullName: '',
          phone: '',
        });
        loadUsers();
      } else {
        Alert.alert('Error', result.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role,
      fullName: user.fullName || '',
      phone: user.phone || '',
    });
    setIsEditUserModalVisible(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmModalVisible(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      console.log('Deleting user:', userToDelete.id);
      const result = await dbService.deleteDocument('users', userToDelete.id);
      console.log('Delete result:', result);
      
      if (result.success) {
        Alert.alert('Success', 'User deleted successfully');
        loadUsers();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setIsDeleteConfirmModalVisible(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteConfirmModalVisible(false);
    setUserToDelete(null);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Prepare update data (exclude password if empty)
      const updateData = {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
        phone: newUser.phone,
      };
      
      // Only include password if it's provided
      if (newUser.password.trim()) {
        updateData.password = newUser.password;
      }
      
      console.log('Updating user:', selectedUser.id, updateData);
      const result = await dbService.updateDocument('users', selectedUser.id, updateData);
      console.log('Update result:', result);
      
      if (result.success) {
        Alert.alert('Success', 'User updated successfully');
        setIsEditUserModalVisible(false);
        setSelectedUser(null);
        setNewUser({
          username: '',
          email: '',
          password: '',
          role: 'user',
          fullName: '',
          phone: '',
        });
        loadUsers();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    }
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
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout properly');
    }
  };

  // Statistics calculations
  const getJobStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const finishedJobs = jobs.filter(job => job.status === 'finished').length;
    const deletedJobs = jobs.filter(job => job.status === 'deleted').length;
    
    const jobsByUser = jobs.reduce((acc, job) => {
      acc[job.username] = (acc[job.username] || 0) + 1;
      return acc;
    }, {});

    const jobsByActivity = jobs.reduce((acc, job) => {
      acc[job.activity] = (acc[job.activity] || 0) + 1;
      return acc;
    }, {});

    const jobsByTruckType = jobs.reduce((acc, job) => {
      acc[job.truckType] = (acc[job.truckType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalJobs,
      activeJobs,
      finishedJobs,
      deletedJobs,
      jobsByUser,
      jobsByActivity,
      jobsByTruckType,
    };
  };

  const stats = getJobStats();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Admin Panel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Welcome back, {currentUser}</Text>
          </View>
          
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={[styles.navButton, styles.primaryButton]} 
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.navButtonText}>← Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.logoutButton]} 
              onPress={handleLogout}
            >
              <Text style={styles.navButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* KPI Cards Row */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, styles.revenueCard]}>
          <Text style={styles.kpiLabel}>Total Jobs</Text>
          <Text style={styles.kpiValue}>{stats.totalJobs}</Text>
          <View style={styles.kpiTrend}>
            <Text style={styles.trendIcon}>↗</Text>
            <Text style={styles.trendText}>+12%</Text>
          </View>
        </View>
        
        <View style={[styles.kpiCard, styles.activeCard]}>
          <Text style={styles.kpiLabel}>Active Jobs</Text>
          <Text style={styles.kpiValue}>{stats.activeJobs}</Text>
          <View style={styles.kpiTrend}>
            <Text style={styles.trendIcon}>↗</Text>
            <Text style={styles.trendText}>+8%</Text>
          </View>
        </View>
        
        <View style={[styles.kpiCard, styles.completedCard]}>
          <Text style={styles.kpiLabel}>Completed</Text>
          <Text style={styles.kpiValue}>{stats.finishedJobs}</Text>
          <View style={styles.kpiTrend}>
            <Text style={styles.trendIcon}>↗</Text>
            <Text style={styles.trendText}>+15%</Text>
          </View>
        </View>
        
        <View style={[styles.kpiCard, styles.usersCard]}>
          <Text style={styles.kpiLabel}>Total Users</Text>
          <Text style={styles.kpiValue}>{users.length}</Text>
          <View style={styles.kpiTrend}>
            <Text style={styles.trendIcon}>↗</Text>
            <Text style={styles.trendText}>+5%</Text>
          </View>
        </View>
        
        <View style={[styles.kpiCard, styles.efficiencyCard]}>
          <Text style={styles.kpiLabel}>Efficiency</Text>
          <Text style={styles.kpiValue}>85%</Text>
          <View style={styles.kpiTrend}>
            <Text style={styles.trendIcon}>↗</Text>
            <Text style={styles.trendText}>+3%</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        {...scrollConfig}
      >
        {/* Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          {/* Row 1: Fleet Status & Job Distribution */}
          <View style={styles.dashboardRow}>
            <View style={[styles.dashboardCard, styles.fleetStatusCard]}>
              <Text style={styles.cardTitle}>Fleet Status</Text>
              <View style={styles.fleetContent}>
                <View style={styles.donutChart}>
                  <View style={styles.donutChartInner}>
                    <Text style={styles.donutPercentage}>85%</Text>
                    <Text style={styles.donutLabel}>Efficiency</Text>
                  </View>
                </View>
                <View style={styles.fleetMetrics}>
                  <View style={styles.fleetMetric}>
                    <Text style={styles.fleetMetricLabel}>Total Fleet</Text>
                    <Text style={styles.fleetMetricValue}>{users.length * 2}</Text>
                  </View>
                  <View style={styles.fleetMetric}>
                    <Text style={styles.fleetMetricLabel}>Active</Text>
                    <Text style={styles.fleetMetricValue}>{stats.activeJobs}</Text>
                  </View>
                  <View style={styles.fleetMetric}>
                    <Text style={styles.fleetMetricLabel}>In Maintenance</Text>
                    <Text style={styles.fleetMetricValue}>{Math.max(1, Math.floor(users.length * 0.1))}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.dashboardCard, styles.jobDistributionCard]}>
              <Text style={styles.cardTitle}>Job Status Distribution</Text>
              <View style={styles.pieChart}>
                <View style={styles.pieSegment}>
                  <View style={[styles.pieColor, { backgroundColor: '#28a745' }]} />
                  <Text style={styles.pieLabel}>Active: {stats.activeJobs}</Text>
                </View>
                <View style={styles.pieSegment}>
                  <View style={[styles.pieColor, { backgroundColor: '#17a2b8' }]} />
                  <Text style={styles.pieLabel}>Completed: {stats.finishedJobs}</Text>
                </View>
                <View style={styles.pieSegment}>
                  <View style={[styles.pieColor, { backgroundColor: '#dc3545' }]} />
                  <Text style={styles.pieLabel}>Deleted: {stats.deletedJobs}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.dashboardCard, styles.performanceCard]}>
              <Text style={styles.cardTitle}>Performance Metrics</Text>
              <View style={styles.performanceMetrics}>
                <View style={styles.performanceMetric}>
                  <Text style={styles.performanceLabel}>Avg Job Time</Text>
                  <Text style={styles.performanceValue}>2.5 H</Text>
                </View>
                <View style={styles.performanceMetric}>
                  <Text style={styles.performanceLabel}>Success Rate</Text>
                  <Text style={styles.performanceValue}>92%</Text>
                </View>
                <View style={styles.performanceMetric}>
                  <Text style={styles.performanceLabel}>User Activity</Text>
                  <Text style={styles.performanceValue}>High</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Row 2: User Management & Recent Activity */}
          <View style={styles.dashboardRow}>
            <View style={[styles.dashboardCard, styles.userManagementCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>User Management</Text>
                <TouchableOpacity 
                  style={styles.addUserButton}
                  onPress={() => setIsCreateUserModalVisible(true)}
                >
                  <Text style={styles.addUserButtonText}>+ Add User</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.userManagementList}>
                {users.slice(0, 5).map((user) => (
                  <View key={user.id} style={styles.userManagementItem}>
                    <View style={styles.userManagementInfo}>
                      <Text style={styles.userManagementName}>{user.username}</Text>
                      <Text style={styles.userManagementEmail}>{user.email}</Text>
                      <Text style={styles.userManagementRole}>{user.role}</Text>
                    </View>
                    <View style={styles.userManagementActions}>
                      <TouchableOpacity 
                        style={[styles.userActionButton, styles.editUserButton]}
                        onPress={() => handleEditUser(user)}
                      >
                        <Text style={styles.userActionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.userActionButton, styles.deleteUserButton]}
                        onPress={() => handleDeleteUser(user)}
                      >
                        <Text style={styles.userActionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.dashboardCard, styles.recentActivityCard]}>
              <Text style={styles.cardTitle}>Recent Job Activity</Text>
              <View style={styles.activityList}>
                {jobs.slice(0, 8).map((job) => (
                  <View key={job.id} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityJobId}>#{job.id.slice(-8)}</Text>
                      <Text style={styles.activityDescription}>{job.activity}</Text>
                      <Text style={styles.activityUser}>{job.username}</Text>
                    </View>
                    <View style={styles.activityStatus}>
                      <View style={[styles.activityStatusDot, { backgroundColor: getStatusColor(job.status) }]} />
                      <Text style={styles.activityStatusText}>{job.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.dashboardCard, styles.topUsersCard]}>
              <Text style={styles.cardTitle}>Top Users by Activity</Text>
              <View style={styles.topUsersList}>
                {Object.entries(stats.jobsByUser)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([user, count], index) => (
                    <View key={user} style={styles.topUserItem}>
                      <View style={styles.topUserRank}>
                        <Text style={styles.topUserRankNumber}>{index + 1}</Text>
                      </View>
                      <View style={styles.topUserInfo}>
                        <Text style={styles.topUserName}>{user}</Text>
                        <Text style={styles.topUserCount}>{count} jobs</Text>
                      </View>
                      <View style={styles.topUserBar}>
                        <View style={[styles.topUserBarFill, { width: `${(count / Math.max(...Object.values(stats.jobsByUser))) * 100}%` }]} />
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create User Modal */}
      <Modal
        visible={isCreateUserModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createUserModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New User</Text>
              <TouchableOpacity onPress={() => setIsCreateUserModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.createUserModalScrollView} contentContainerStyle={styles.createUserModalContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username *"
                value={newUser.username}
                onChangeText={(text) => setNewUser({...newUser, username: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({...newUser, email: text})}
                keyboardType="email-address"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password *"
                value={newUser.password}
                onChangeText={(text) => setNewUser({...newUser, password: text})}
                secureTextEntry
              />
              
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={newUser.fullName}
                onChangeText={(text) => setNewUser({...newUser, fullName: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={newUser.phone}
                onChangeText={(text) => setNewUser({...newUser, phone: text})}
                keyboardType="phone-pad"
              />
              
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>Role:</Text>
                {userRoles.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      newUser.role === role.value && styles.roleOptionSelected
                    ]}
                    onPress={() => setNewUser({...newUser, role: role.value})}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === role.value && styles.roleOptionTextSelected
                    ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.createUserModalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCreateUserModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateUser}
              >
                <Text style={styles.modalButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={isEditUserModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createUserModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setIsEditUserModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.createUserModalScrollView} contentContainerStyle={styles.createUserModalContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username *"
                value={newUser.username}
                onChangeText={(text) => setNewUser({...newUser, username: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({...newUser, email: text})}
                keyboardType="email-address"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password (leave blank to keep current)"
                value={newUser.password}
                onChangeText={(text) => setNewUser({...newUser, password: text})}
                secureTextEntry
              />
              
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={newUser.fullName}
                onChangeText={(text) => setNewUser({...newUser, fullName: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={newUser.phone}
                onChangeText={(text) => setNewUser({...newUser, phone: text})}
                keyboardType="phone-pad"
              />
              
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>Role:</Text>
                {userRoles.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      newUser.role === role.value && styles.roleOptionSelected
                    ]}
                    onPress={() => setNewUser({...newUser, role: role.value})}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === role.value && styles.roleOptionTextSelected
                    ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.createUserModalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditUserModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleUpdateUser}
              >
                <Text style={styles.modalButtonText}>Update User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelDeleteUser}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirmModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete User</Text>
            </View>
            
            <View style={styles.deleteConfirmContent}>
              <Text style={styles.deleteConfirmText}>
                Are you sure you want to delete user "{userToDelete?.username}"?
              </Text>
              <Text style={styles.deleteWarningText}>
                This action cannot be undone.
              </Text>
            </View>
            
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDeleteUser}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={confirmDeleteUser}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#28a745';
    case 'finished': return '#17a2b8';
    case 'deleted': return '#dc3545';
    case 'started': return '#4a90e2';
    default: return '#6c757d';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + '20',
    ...getResponsiveShadows().heavy,
  },
  headerContent: {
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    justifyContent: 'space-between',
    alignItems: getResponsiveValue('stretch', 'center', 'center'),
    gap: getResponsivePixels(16, 20, 0),
    maxWidth: containerWidths.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveValue(24, 28, 32),
    fontWeight: '800',
    color: colors.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: colors.text.secondary,
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
  logoutButton: {
    backgroundColor: colors.danger,
  },
  navButtonText: {
    color: colors.text.inverse,
    fontSize: getResponsiveValue(12, 14, 16),
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...getResponsiveShadows().light,
    paddingVertical: getResponsivePixels(12, 16, 20),
    paddingHorizontal: getResponsivePixels(8, 12, 16),
    gap: getResponsivePixels(8, 12, 16),
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(6, 8, 10),
    alignItems: 'center',
    ...getResponsiveShadows().light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  usersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6f42c1',
  },
  efficiencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  kpiLabel: {
    fontSize: getResponsiveValue(10, 12, 14),
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: getResponsivePixels(4, 6, 8),
  },
  kpiValue: {
    fontSize: getResponsiveValue(20, 24, 28),
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(4, 6, 8),
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendIcon: {
    fontSize: getResponsiveValue(12, 14, 16),
    color: '#28a745',
    fontWeight: '600',
  },
  trendText: {
    fontSize: getResponsiveValue(10, 12, 14),
    color: '#28a745',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: getResponsivePixels(16, 20, 24),
    maxWidth: containerWidths.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  dashboardGrid: {
    gap: getResponsivePixels(16, 20, 24),
  },
  dashboardRow: {
    flexDirection: getResponsiveValue('column', 'row', 'row'),
    gap: getResponsivePixels(16, 20, 24),
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: getResponsivePixels(16, 20, 24),
    borderRadius: getResponsivePixels(8, 12, 16),
    ...getResponsiveShadows().heavy,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardTitle: {
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(12, 16, 20),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsivePixels(12, 16, 20),
  },
  dashboardContent: {
    gap: spacing.lg,
  },
  statsGrid: {
    ...getGridStyle(4),
  },
  statCard: {
    ...getGridItemStyle(4),
    backgroundColor: colors.background.primary,
    padding: cardDimensions.padding,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  statIcon: {
    fontSize: fontSizes['2xl'],
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: fontSizes['4xl'],
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  sectionCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chartCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  // Fleet Status Card
  fleetStatusCard: {
  },
  fleetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#28a745',
  },
  donutChartInner: {
    alignItems: 'center',
  },
  donutPercentage: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
  },
  donutLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  fleetMetrics: {
    flex: 1,
    gap: spacing.sm,
  },
  fleetMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fleetMetricLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  fleetMetricValue: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  // Job Distribution Card
  jobDistributionCard: {
  },
  pieChart: {
    gap: spacing.sm,
  },
  pieSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.primary,
  },
  // Performance Card
  performanceCard: {
  },
  performanceMetrics: {
    gap: spacing.base,
  },
  performanceMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  performanceLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  performanceValue: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  jobInfo: {
    flex: 1,
  },
  jobId: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.primary,
  },
  jobActivity: {
    fontSize: fontSizes.sm,
    color: colors.text.primary,
    marginTop: 2,
  },
  jobUser: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  jobStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  jobStatusText: {
    color: colors.text.inverse,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  usersContent: {
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  addButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.base,
  },
  userList: {
    gap: spacing.sm,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  jobList: {
    gap: spacing.sm,
  },
  moreText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  // User Management Card
  userManagementCard: {
  },
  addUserButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  addUserButtonText: {
    color: colors.text.inverse,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  userManagementList: {
    gap: spacing.sm,
  },
  userManagementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  userManagementInfo: {
    flex: 1,
  },
  userManagementName: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  userManagementEmail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userManagementRole: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  userManagementActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  userActionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  editUserButton: {
    backgroundColor: '#ffc107',
  },
  deleteUserButton: {
    backgroundColor: '#dc3545',
  },
  userActionButtonText: {
    color: colors.text.inverse,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  // Recent Activity Card
  recentActivityCard: {
  },
  activityList: {
    gap: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activityInfo: {
    flex: 1,
  },
  activityJobId: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  activityUser: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activityStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityStatusText: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  // Top Users Card
  topUsersCard: {
  },
  topUsersList: {
    gap: spacing.sm,
  },
  topUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  topUserRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topUserRankNumber: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  topUserInfo: {
    flex: 1,
  },
  topUserName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  topUserCount: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
  },
  topUserBar: {
    width: 60,
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topUserBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  userRole: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userFullName: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    minWidth: 40,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  analyticsContent: {
    gap: spacing.lg,
  },
  chartContainer: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.base,
  },
  statusChart: {
    gap: spacing.sm,
  },
  statusBar: {
    height: 30,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  statusBarLabel: {
    position: 'absolute',
    left: spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  chartTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'end',
    height: responsiveDimensions.isMobile ? 150 : 200,
    gap: spacing.sm,
  },
  chartBar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  chartBarText: {
    color: colors.text.inverse,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  userStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  userStatBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  userStatBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  userStatName: {
    fontSize: fontSizes.sm,
    color: colors.text.primary,
  },
  userStatCount: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  activityStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityStatName: {
    fontSize: fontSizes.sm,
    color: colors.text.primary,
  },
  activityStatCount: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
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
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  createUserModal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  createUserModalScrollView: {
    flex: 1,
  },
  createUserModalContainer: {
    padding: modalDimensions.padding,
    paddingBottom: spacing.lg,
  },
  createUserModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: modalDimensions.padding,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: modalDimensions.padding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: fontSizes['2xl'],
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: modalDimensions.padding,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: inputDimensions.paddingVertical,
    paddingHorizontal: inputDimensions.paddingHorizontal,
    fontSize: inputDimensions.fontSize,
    marginBottom: spacing.base,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  roleSelector: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  roleOption: {
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  roleOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  roleOptionText: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
  },
  roleOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: buttonDimensions.paddingVertical,
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    ...shadows.base,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cancelButton: {
    backgroundColor: colors.gray[500],
  },
  createButton: {
    backgroundColor: colors.success,
  },
  modalButtonText: {
    color: colors.text.inverse,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '600',
  },
  deleteConfirmModal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    width: modalDimensions.width,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  deleteConfirmContent: {
    padding: modalDimensions.padding,
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  deleteWarningText: {
    fontSize: fontSizes.base,
    color: colors.danger,
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: modalDimensions.padding,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  deleteConfirmButton: {
    backgroundColor: colors.danger,
  },
});

