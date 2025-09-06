// Data storage utility for truck logging
// This can be easily replaced with database integration later

const STORAGE_KEY = 'truckJobs';

export const saveJob = (jobData) => {
  try {
    const existingJobs = getJobs();
    const newJob = {
      id: Date.now(),
      ...jobData,
      timestamp: new Date().toISOString(),
    };
    
    const updatedJobs = [...existingJobs, newJob];
    
    // In React Native, use AsyncStorage instead of localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
    }
    
    return newJob;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const getJobs = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const jobs = localStorage.getItem(STORAGE_KEY);
      return jobs ? JSON.parse(jobs) : [];
    }
    return [];
  } catch (error) {
    console.error('Error getting jobs:', error);
    return [];
  }
};

export const getJobById = (id) => {
  const jobs = getJobs();
  return jobs.find(job => job.id === id);
};

export const updateJob = (id, updates) => {
  try {
    const jobs = getJobs();
    const jobIndex = jobs.findIndex(job => job.id === id);
    
    if (jobIndex !== -1) {
      jobs[jobIndex] = { ...jobs[jobIndex], ...updates };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      }
      
      return jobs[jobIndex];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJob = (id) => {
  try {
    const jobs = getJobs();
    const filteredJobs = jobs.filter(job => job.id !== id);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredJobs));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
};

export const exportToExcel = () => {
  const jobs = getJobs();
  
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
