import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Refresh auth status when screen comes into focus
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
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleLogging = () => {
    if (isAuthenticated) {
      navigation.navigate('Logging');
    } else {
      Alert.alert(
        'Login Required',
        'Please login first to access the truck logging system.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    }
  };


  const features = [
    '🔐 Secure Login System',
    '🚛 8 Different Truck Types',
    '⚖️ Weight Recording & Validation',
    '📸 Photo Capture & Gallery',
    '💾 Local Data Storage',
    '🆔 Unique Job Tracking',
    '📱 Cross-Platform Support',
    '🎨 Modern UI Design'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.centeredContainer}>
        <Card style={styles.landingCard}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.logo}>🚛</Text>
              <Title style={styles.title}>Truck Tracker</Title>
              <Paragraph style={styles.subtitle}>
                {isAuthenticated 
                  ? `Welcome back, ${currentUser}! Continue with your truck logging tasks.`
                  : 'A modern React Native mobile application for truck logging and tracking, built with Expo. Track different truck types, record weights, capture photos, and manage job data efficiently.'
                }
              </Paragraph>
            </View>

            {isAuthenticated && (
              <View style={styles.welcomeMessage}>
                <Text style={styles.welcomeTitle}>🎉 Welcome Back!</Text>
                <Text style={styles.welcomeText}>
                  You're already logged in. Click "Continue Logging" to access your truck logging dashboard.
                </Text>
              </View>
            )}

            <View style={styles.features}>
              <Text style={styles.featuresTitle}>✨ Features</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.navButtons}>
              <TouchableOpacity
                style={[styles.navButton, styles.primaryButton]}
                onPress={handleLogin}
              >
                <Text style={styles.navButtonText}>🔐 Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, styles.secondaryButton]}
                onPress={handleLogging}
              >
                <Text style={styles.navButtonText}>🚛 Start Logging</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Built with ❤️ using React Native and Expo</Text>
              <Text style={styles.footerText}>Live Demo: https://laxma1996.github.io/Truck-Track/</Text>
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
  landingCard: {
    width: '100%',
    maxWidth: 600,
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
    marginBottom: 30,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  welcomeMessage: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 20,
  },
  features: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
    fontSize: 20,
    fontWeight: '700',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#5a6c7d',
    marginLeft: 10,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 15,
    paddingHorizontal: 10,
  },
  navButton: {
    paddingHorizontal: 25,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 140,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: '#27ae60',
    shadowColor: '#27ae60',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
});
