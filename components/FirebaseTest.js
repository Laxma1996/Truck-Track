import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authService, dbService } from '../services/firebaseService';

export default function FirebaseTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [testResult, setTestResult] = useState('');

  const testFirebaseConnection = async () => {
    try {
      setTestResult('Testing Firebase connection...');
      
      // Test database initialization
      await dbService.initializeDatabase();
      setTestResult('Database initialized successfully');
      
      // Test user validation
      const result = await authService.validateUser('admin', 'password');
      
      if (result.success) {
        setTestResult('Firebase connection successful! Admin user validated.');
        setIsConnected(true);
      } else {
        setTestResult('Firebase connected but admin user validation failed: ' + result.message);
        setIsConnected(false);
      }
    } catch (error) {
      setTestResult('Firebase connection failed: ' + error.message);
      setIsConnected(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, isConnected ? styles.successButton : styles.testButton]}
        onPress={testFirebaseConnection}
      >
        <Text style={styles.buttonText}>
          {isConnected ? 'Firebase Connected ✓' : 'Test Firebase Connection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.resultText}>{testResult}</Text>
      
      <Text style={styles.instructions}>
        Make sure to update your Firebase configuration in config/firebase.js before testing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#4a90e2',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  instructions: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

