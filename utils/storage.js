// Data storage utility for truck logging
// This can be easily replaced with database integration later

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'truckJobs';

export const saveJob = async (jobData) => {
  try {
    const existingJobs = await getJobs();
    const newJob = {
      id: Date.now(),
      ...jobData,
      timestamp: new Date().toISOString(),
    };
    
    const updatedJobs = [...existingJobs, newJob];
    
    // Use AsyncStorage for React Native
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
    
    return newJob;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const getJobs = async () => {
  try {
    const jobs = await AsyncStorage.getItem(STORAGE_KEY);
    return jobs ? JSON.parse(jobs) : [];
  } catch (error) {
    console.error('Error getting jobs:', error);
    return [];
  }
};

export const getJobById = async (id) => {
  const jobs = await getJobs();
  return jobs.find(job => job.id === id);
};

export const updateJob = async (id, updates) => {
  try {
    const jobs = await getJobs();
    const jobIndex = jobs.findIndex(job => job.id === id);
    
    if (jobIndex !== -1) {
      jobs[jobIndex] = { ...jobs[jobIndex], ...updates };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      
      return jobs[jobIndex];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJob = async (id) => {
  try {
    const jobs = await getJobs();
    const filteredJobs = jobs.filter(job => job.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredJobs));
    
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
};

export const exportToExcel = async () => {
  const jobs = await getJobs();
  
  if (jobs.length === 0) {
    return null;
  }
  
  // Convert to CSV format (can be opened in Excel)
  const headers = ['ID', 'Truck Type', 'Weight (kg)', 'Status', 'Timestamp'];
  const csvContent = [
    headers.join(','),
    ...jobs.map(job => [
      job.id,
      job.truckType,
      job.weight,
      job.status,
      job.timestamp
    ].join(','))
  ].join('\n');
  
  return csvContent;
};

// Future database integration functions
export const connectToDatabase = async () => {
  // This function will be implemented when adding database support
  console.log('Database connection not implemented yet');
};

export const syncWithDatabase = async () => {
  // This function will sync local data with remote database
  console.log('Database sync not implemented yet');
};
