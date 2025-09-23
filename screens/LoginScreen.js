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
  scrollConfig 
} from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

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
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

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
    padding: spacing.base,
    paddingTop: responsiveDimensions.isMobile ? 40 : 60,
    paddingBottom: responsiveDimensions.isMobile ? 40 : 60,
  },
  loginCard: {
    width: '100%',
    maxWidth: responsiveDimensions.isMobile ? '95%' : 400,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.base,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: responsiveDimensions.isMobile ? 20 : 22,
    maxWidth: responsiveDimensions.isMobile ? '100%' : '90%',
  },
  form: {
    padding: spacing.base,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.base,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.base,
    fontSize: fontSizes.base,
    backgroundColor: colors.background.primary,
    marginBottom: spacing.sm,
    minHeight: 40,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.base,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.base,
    ...shadows.base,
    minHeight: 44,
  },
  loginButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: colors.text.inverse,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '500',
  },
  demoCredentials: {
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginTop: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  demoTitle: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  demoText: {
    color: colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    fontSize: fontSizes.xs,
  },
  navLinks: {
    alignItems: 'center',
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  navLink: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '500',
  },
  directAccessButton: {
    backgroundColor: colors.success,
    padding: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.base,
    minHeight: 36,
  },
  directAccessButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0.1,
  },
  directAccessText: {
    color: colors.text.inverse,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  directAccessTextDisabled: {
    color: colors.text.secondary,
  },
});
