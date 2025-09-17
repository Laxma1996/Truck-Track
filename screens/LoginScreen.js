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

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    checkSessionStatus();
  }, []);

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

    // Simulate login process
    setTimeout(async () => {
      setIsLoading(false);
      
      // Simple authentication (in real app, this would be server-side)
      if (username === 'admin' && password === 'password') {
        try {
          // Store authentication data in AsyncStorage
          await AsyncStorage.multiSet([
            ['truckTrackerAuth', 'true'],
            ['truckTrackerUser', username],
            ['truckTrackerLoginTime', new Date().toISOString()]
          ]);
          
          console.log('Login successful, navigating to Logging screen');
          setIsSessionActive(true);
          navigation.navigate('Logging');
        } catch (error) {
          console.error('Error storing auth data:', error);
          Alert.alert('Error', 'Failed to save login data');
        }
      } else {
        console.log('Login failed: invalid credentials');
        Alert.alert('Error', 'Invalid username or password');
      }
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.centeredContainer}>
        <Card style={styles.loginCard}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.logo}>🚛</Text>
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
                  {isLoading ? 'Logging in...' : '🔐 Login to Truck Tracker'}
                </Text>
              </TouchableOpacity>

              <View style={styles.demoCredentials}>
                <Text style={styles.demoTitle}>🔑 Demo Credentials</Text>
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
                  🚛 Direct Access {isSessionActive ? '(Active)' : '(Inactive)'}
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
    backgroundColor: '#667eea',
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
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoCredentials: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 15,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  demoTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  demoText: {
    color: '#34495e',
    fontFamily: 'monospace',
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d5dbdb',
  },
  navLinks: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  navLink: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  directAccessButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#27ae60',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
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
    fontWeight: '600',
  },
  directAccessTextDisabled: {
    color: '#7f8c8d',
  },
});
