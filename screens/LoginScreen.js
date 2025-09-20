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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
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
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  loginCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#4a90e2',
    padding: 18,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4a90e2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  demoCredentials: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  demoTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  demoText: {
    color: '#666666',
    fontFamily: 'monospace',
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  navLinks: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  navLink: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '500',
  },
  directAccessButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#28a745',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  directAccessButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  directAccessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  directAccessTextDisabled: {
    color: '#666666',
  },
});
