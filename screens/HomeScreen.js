import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
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
  scrollConfig 
} from '../utils/responsive';

export default function HomeScreen({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    // Initialize database
    dbService.initializeDatabase();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkAuthStatus();
    }, [])
  );

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('truckTrackerAuth');
      const user = await AsyncStorage.getItem('truckTrackerUser');
      
      if (authStatus === 'true' && user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser('');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentUser('');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.validateUser(username, password);
      
      if (result.success) {
        await AsyncStorage.multiSet([
          ['truckTrackerAuth', 'true'],
          ['truckTrackerUser', result.user.username],
          ['truckTrackerUserId', result.user.id],
          ['truckTrackerUserRole', result.user.role],
          ['truckTrackerLoginTime', new Date().toISOString()]
        ]);
        
        setIsAuthenticated(true);
        setCurrentUser(result.user.username);
        setIsLoginModalVisible(false);
        setUsername('');
        setPassword('');
        
        // Navigate to Dashboard
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
      
      setIsAuthenticated(false);
      setCurrentUser('');
      
      // Force re-render to show unauthenticated state
      setTimeout(() => {
        checkAuthStatus();
      }, 100);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout properly');
    }
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        {...scrollConfig}
      >
        {/* Header */}
            <View style={styles.header}>
          <Text style={styles.title}>Truck Tracker</Text>
          <Text style={styles.subtitle}>
            Professional truck tracking and job management system
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Welcome Message */}
          {isAuthenticated ? (
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome back, {currentUser}!</Text>
              <Text style={styles.welcomeText}>
                You're logged in and ready to manage your truck jobs.
              </Text>
            </View>
          ) : (
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome to Truck Tracker</Text>
              <Text style={styles.welcomeText}>
                Professional truck tracking and job management system. 
                Login to access your dashboard and start managing jobs.
              </Text>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Key Features</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Job Dashboard</Text>
                <Text style={styles.featureDescription}>
                  View and manage all your truck jobs in one place
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📝</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Job Logging</Text>
                <Text style={styles.featureDescription}>
                  Create detailed job logs with photos and tracking
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📄</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>PDF Reports</Text>
                <Text style={styles.featureDescription}>
                  Generate professional PDF reports for each job
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔍</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Search & Filter</Text>
                <Text style={styles.featureDescription}>
                  Find jobs quickly with advanced search and filters
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isAuthenticated ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryButton]} 
                  onPress={() => navigation.navigate('Dashboard')}
                >
                  <Text style={styles.actionButtonText}>Go to Dashboard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.logoutButton]} 
                  onPress={handleLogout}
                >
                  <Text style={styles.actionButtonText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryButton]} 
                  onPress={() => setIsLoginModalVisible(true)}
                >
                  <Text style={styles.actionButtonText}>Login</Text>
                </TouchableOpacity>
                
              </>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with React Native and Expo
          </Text>
          <Text style={styles.footerSubtext}>
            Professional Truck Tracking Solution
          </Text>
        </View>
      </ScrollView>

      {/* Login Modal */}
      <Modal
        visible={isLoginModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loginModal}>
            <Text style={styles.modalTitle}>Login to Dashboard</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
                </View>

            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>Username: admin</Text>
              <Text style={styles.demoText}>Password: password</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]} 
                onPress={() => {
                  setIsLoginModalVisible(false);
                  setUsername('');
                  setPassword('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.loginModalButton]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginModalButtonText}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
            </View>
      </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContainer: {
    ...scrollConfig.contentContainerStyle,
  },
  header: {
    alignItems: 'center',
    padding: spacing['4xl'],
    paddingTop: responsiveDimensions.isMobile ? 60 : 80,
    paddingBottom: spacing['3xl'],
    backgroundColor: colors.background.primary,
    ...shadows.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: fontSizes['5xl'],
    fontWeight: '700',
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    maxWidth: containerWidths.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: cardDimensions.padding,
    marginBottom: spacing.lg,
    ...shadows.base,
    width: '100%',
    maxWidth: cardDimensions.maxWidth,
  },
  welcomeTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    lineHeight: responsiveDimensions.isMobile ? 22 : 26,
  },
  featuresCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: cardDimensions.padding,
    marginBottom: spacing.lg,
    ...shadows.base,
    width: '100%',
    maxWidth: cardDimensions.maxWidth,
  },
  featuresTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    fontSize: fontSizes['2xl'],
    marginRight: spacing.base,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    lineHeight: responsiveDimensions.isMobile ? 20 : 24,
  },
  actionButtons: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
    maxWidth: cardDimensions.maxWidth,
  },
  actionButton: {
    padding: buttonDimensions.paddingVertical,
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    minHeight: buttonDimensions.height,
    ...shadows.base,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  footerText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loginModal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: modalDimensions.padding,
    width: modalDimensions.width,
    maxWidth: modalDimensions.maxWidth,
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
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
  demoCredentials: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.base,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  demoTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  demoText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    padding: buttonDimensions.paddingVertical,
    paddingHorizontal: buttonDimensions.paddingHorizontal,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    minHeight: buttonDimensions.height,
  },
  cancelModalButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loginModalButton: {
    backgroundColor: colors.primary,
  },
  cancelModalButtonText: {
    color: colors.text.secondary,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '500',
  },
  loginModalButtonText: {
    color: colors.text.inverse,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '600',
  },
});