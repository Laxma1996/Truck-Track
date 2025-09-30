import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
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
  colors, 
  shadows, 
  borderRadius,
  scrollConfig,
  getResponsiveValue,
  getResponsivePixels,
  getResponsivePercentage,
  getResponsiveLayout,
  getResponsiveTextStyles,
  getResponsiveShadows,
  getDeviceType
} from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkSessionStatus();
    // Initialize database with default admin user
    dbService.initializeDatabase();
  }, []);

  // Refresh session status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkSessionStatus();
    }, [])
  );

  const checkSessionStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('truckTrackerAuth');
      const loginTime = await AsyncStorage.getItem('truckTrackerLoginTime');
      
      if (authStatus === 'true' && loginTime) {
        // Check if session is still valid (24 hours)
        const sessionTime = new Date(loginTime).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - sessionTime) / (1000 * 60 * 60);
        
        console.log('Session check - Hours since login:', hoursDiff);
        
        if (hoursDiff < 24) {
          setIsSessionActive(true);
          console.log('Session is active');
        } else {
          // Session expired, clear it
          console.log('Session expired, clearing data');
          await AsyncStorage.multiRemove([
            'truckTrackerAuth',
            'truckTrackerUser',
            'truckTrackerLoginTime'
          ]);
          setIsSessionActive(false);
        }
      } else {
        console.log('No valid session found');
        setIsSessionActive(false);
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      setIsSessionActive(false);
    }
  };

  const togglePasswordVisibility = () => {
    console.log('🔐 Password toggle clicked! Current state:', showPassword);
    setShowPassword(!showPassword);
    console.log('🔐 New state:', !showPassword);
  };

  const handleLogin = async () => {
    console.log('Login attempt:', { username, password });
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Validate credentials against Firebase
      const result = await authService.validateUser(username, password);
      
      if (result.success) {
        // Store authentication data in AsyncStorage
        await AsyncStorage.multiSet([
          ['truckTrackerAuth', 'true'],
          ['truckTrackerUser', result.user.username],
          ['truckTrackerUserId', result.user.id],
          ['truckTrackerUserRole', result.user.role],
          ['truckTrackerLoginTime', new Date().toISOString()]
        ]);
        
        console.log('Login successful, navigating to Logging screen');
        setIsSessionActive(true);
        navigation.navigate('Logging');
      } else {
        console.log('Login failed:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContainer}
      {...scrollConfig}
    >
      <View style={styles.centeredContainer}>
        <Card style={styles.loginCard}>
          <Card.Content>
            <View style={styles.header}>
              <Title style={styles.title}>Truck Tracker</Title>
              <Paragraph style={styles.subtitle}>
                Please login to access the truck logging system
              </Paragraph>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.simpleToggleButton}
                onPress={togglePasswordVisibility}
              >
                <Text style={styles.simpleToggleText}>
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Login to Truck Tracker'}
                </Text>
              </TouchableOpacity>

              <View style={styles.demoCredentials}>
                <Text style={styles.demoTitle}>Demo Credentials</Text>
                <Text style={styles.demoText}>Username: admin</Text>
                <Text style={styles.demoText}>Password: password</Text>
              </View>
            </View>

            <View style={styles.navLinks}>
              <TouchableOpacity 
                style={[styles.directAccessButton, !isSessionActive && styles.directAccessButtonDisabled]}
                onPress={() => {
                  if (isSessionActive) {
                    navigation.navigate('Logging');
                  } else {
                    Alert.alert(
                      'Session Expired',
                      'Your session has expired. Please login again to access the truck logging system.',
                      [
                        { 
                          text: 'OK', 
                          onPress: () => {
                            // Keep user on login screen to enter credentials
                          }
                        }
                      ]
                    );
                  }
                }}
                disabled={!isSessionActive}
              >
                <Text style={[styles.directAccessText, !isSessionActive && styles.directAccessTextDisabled]}>
                  Direct Access {isSessionActive ? '(Active)' : '(Inactive)'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </View>
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
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsivePixels(12, 16, 20),
    paddingTop: getResponsivePixels(40, 60, 80),
    paddingBottom: getResponsivePixels(40, 60, 80),
  },
  loginCard: {
    width: '100%',
    maxWidth: getResponsiveValue('95%', 400, 500),
    borderRadius: getResponsivePixels(8, 12, 16),
    backgroundColor: colors.background.primary,
    ...getResponsiveShadows().heavy,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    alignItems: 'center',
    marginBottom: getResponsivePixels(16, 20, 24),
    paddingTop: getResponsivePixels(12, 16, 20),
  },
  title: {
    fontSize: getResponsiveValue(20, 24, 28),
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(4, 6, 8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getResponsiveValue(14, 16, 18),
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 22, 24),
    maxWidth: getResponsiveValue('100%', '90%', '85%'),
  },
  form: {
    padding: getResponsivePixels(12, 16, 20),
  },
  label: {
    fontSize: getResponsiveValue(12, 14, 16),
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(4, 6, 8),
    marginTop: getResponsivePixels(12, 16, 20),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: getResponsivePixels(4, 6, 8),
    padding: getResponsivePixels(8, 12, 16),
    paddingHorizontal: getResponsivePixels(12, 16, 20),
    fontSize: getResponsiveValue(14, 16, 18),
    backgroundColor: colors.background.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: getResponsivePixels(4, 6, 8),
    backgroundColor: colors.background.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  passwordInput: {
    flex: 1,
    padding: getResponsivePixels(8, 12, 16),
    paddingHorizontal: getResponsivePixels(12, 16, 20),
    fontSize: getResponsiveValue(14, 16, 18),
    borderWidth: 0,
  },
  eyeButton: {
    padding: getResponsivePixels(8, 12, 16),
    paddingHorizontal: getResponsivePixels(12, 16, 20),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: getResponsivePixels(40, 44, 48),
    minHeight: getResponsivePixels(40, 44, 48),
    backgroundColor: colors.background.secondary,
    borderRadius: getResponsivePixels(4, 6, 8),
    marginRight: getResponsivePixels(4, 6, 8),
  },
  eyeIcon: {
    fontSize: getResponsiveValue(10, 11, 12),
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(4, 6, 8),
    alignItems: 'center',
    marginTop: getResponsivePixels(12, 16, 20),
    ...getResponsiveShadows().medium,
  },
  loginButtonDisabled: {
    backgroundColor: colors.gray[400],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  loginButtonText: {
    color: colors.text.inverse,
    fontSize: getResponsiveValue(14, 16, 18),
    fontWeight: '500',
  },
  demoCredentials: {
    backgroundColor: colors.primaryLight + '20',
    padding: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(6, 8, 10),
    marginTop: getResponsivePixels(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  demoTitle: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: getResponsivePixels(8, 12, 16),
    fontSize: getResponsiveValue(12, 14, 16),
    textAlign: 'center',
  },
  demoText: {
    color: colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: getResponsivePixels(4, 6, 8),
    padding: getResponsivePixels(4, 6, 8),
    backgroundColor: colors.background.primary,
    borderRadius: getResponsivePixels(4, 6, 8),
    borderWidth: 1,
    borderColor: colors.border.medium,
    fontSize: getResponsiveValue(10, 12, 14),
  },
  navLinks: {
    alignItems: 'center',
    marginTop: getResponsivePixels(12, 16, 20),
    paddingTop: getResponsivePixels(12, 16, 20),
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  navLink: {
    color: colors.primary,
    fontSize: getResponsiveValue(16, 18, 20),
    fontWeight: '500',
  },
  directAccessButton: {
    backgroundColor: colors.success,
    padding: getResponsivePixels(8, 12, 16),
    paddingHorizontal: getResponsivePixels(12, 16, 20),
    borderRadius: getResponsivePixels(4, 6, 8),
    alignItems: 'center',
    marginTop: getResponsivePixels(4, 6, 8),
    ...getResponsiveShadows().medium,
  },
  directAccessButtonDisabled: {
    backgroundColor: colors.gray[400],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  directAccessText: {
    color: colors.text.inverse,
    fontSize: getResponsiveValue(12, 14, 16),
    fontWeight: '500',
  },
  directAccessTextDisabled: {
    color: colors.text.secondary,
  },
  simpleToggleButton: {
    backgroundColor: colors.primary,
    padding: getResponsivePixels(8, 12, 16),
    borderRadius: getResponsivePixels(4, 6, 8),
    alignItems: 'center',
    marginTop: getResponsivePixels(4, 6, 8),
    marginBottom: getResponsivePixels(8, 12, 16),
  },
  simpleToggleText: {
    color: colors.text.inverse,
    fontSize: getResponsiveValue(12, 14, 16),
    fontWeight: '600',
  },
});
