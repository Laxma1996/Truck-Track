import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs'
};

// User authentication service
export const authService = {
  // Validate user credentials against Firebase
  async validateUser(username, password) {
    try {
      console.log('Validating user:', username);
      console.log('Firebase config projectId:', db.app.options.projectId);
      
      // Query users collection for matching username
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      console.log('Query executed, found documents:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('No user found with username:', username);
        return { success: false, message: 'Invalid username or password' };
      }
      
      // Get the first matching user document
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('User data retrieved:', { username: userData.username, hasPassword: !!userData.password });
      
      // Check if password matches
      if (userData.password === password) {
        console.log('User validated successfully:', username);
        return { 
          success: true, 
          user: {
            id: userDoc.id,
            username: userData.username,
            role: userData.role || 'user',
            createdAt: userData.createdAt
          }
        };
      } else {
        console.log('Invalid password for user:', username);
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Error validating user:', error);
      console.error('Error details:', error.code, error.message);
      return { success: false, message: `Authentication failed: ${error.message}` };
    }
  },

  // Create a new user (for admin purposes)
  async createUser(userData) {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const docRef = await addDoc(usersRef, {
        ...userData,
        createdAt: new Date().toISOString()
      });
      
      console.log('User created with ID:', docRef.id);
      return { success: true, userId: docRef.id };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Failed to create user' };
    }
  }
};

// Job management service
export const jobService = {
  // Save a new job to Firebase
  async saveJob(jobData) {
    try {
      console.log('🔥 jobService.saveJob called with:', {
        userId: jobData.userId,
        username: jobData.username,
        activity: jobData.activity,
        truckType: jobData.truckType,
        weight: jobData.weight,
        photoLength: jobData.photo ? jobData.photo.length : 0,
        photoPreview: jobData.photo ? jobData.photo.substring(0, 50) + '...' : 'null'
      });
      
      // Validate required fields before saving
      const requiredFields = ['userId', 'username', 'activity', 'truckType', 'weight', 'photo'];
      const missingFields = requiredFields.filter(field => !jobData[field] || jobData[field] === '');
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        return { 
          success: false, 
          message: `Cannot save job: Missing required fields (${missingFields.join(', ')})` 
        };
      }
      
      console.log('✅ All required fields present');

      // Additional validation for specific fields
      if (typeof jobData.weight !== 'number' || jobData.weight <= 0) {
        return { 
          success: false, 
          message: 'Cannot save job: Weight must be a positive number' 
        };
      }

      // More flexible photo validation - accept various formats
      const isValidPhotoFormat = jobData.photo.startsWith('data:image/') || 
                                jobData.photo.startsWith('file://') || 
                                jobData.photo.startsWith('http') ||
                                jobData.photo.startsWith('blob:') ||
                                (typeof jobData.photo === 'string' && jobData.photo.length > 0);

      if (!isValidPhotoFormat) {
        console.error('Invalid photo format:', jobData.photo ? jobData.photo.substring(0, 50) + '...' : 'null');
        return { 
          success: false, 
          message: 'Cannot save job: Invalid photo format' 
        };
      }

      console.log('🔥 Firebase db object:', db);
      console.log('📁 Collection name:', COLLECTIONS.JOBS);
      
      const jobsRef = collection(db, COLLECTIONS.JOBS);
      console.log('📂 Collection reference created:', jobsRef);
      
      const jobDocument = {
        ...jobData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      console.log('📄 Document to save:', {
        userId: jobDocument.userId,
        username: jobDocument.username,
        activity: jobDocument.activity,
        truckType: jobDocument.truckType,
        weight: jobDocument.weight,
        photoLength: jobDocument.photo ? jobDocument.photo.length : 0,
        status: jobDocument.status,
        createdAt: jobDocument.createdAt
      });
      
      const docRef = await addDoc(jobsRef, jobDocument);
      
      console.log('✅ Job saved with ID:', docRef.id);
      return { success: true, jobId: docRef.id };
    } catch (error) {
      console.error('💥 Error saving job:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return { success: false, message: `Failed to save job: ${error.message}` };
    }
  },

  // Get all jobs for a user
  async getUserJobs(userId) {
    try {
      console.log('🔍 getUserJobs called with userId:', userId);
      
      const jobsRef = collection(db, COLLECTIONS.JOBS);
      console.log('📁 Jobs collection reference:', jobsRef);
      
      const q = query(jobsRef, where('userId', '==', userId));
      console.log('🔎 Query created:', q);
      
      const querySnapshot = await getDocs(q);
      console.log('📊 Query executed, found documents:', querySnapshot.size);
      
      const jobs = [];
      querySnapshot.forEach((doc) => {
        const jobData = {
          id: doc.id,
          ...doc.data()
        };
        console.log('📄 Job document:', {
          id: jobData.id,
          userId: jobData.userId,
          activity: jobData.activity,
          truckType: jobData.truckType,
          weight: jobData.weight,
          status: jobData.status,
          createdAt: jobData.createdAt
        });
        jobs.push(jobData);
      });
      
      console.log('✅ Total jobs found:', jobs.length);
      return { success: true, jobs };
    } catch (error) {
      console.error('💥 Error fetching user jobs:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return { success: false, message: 'Failed to fetch jobs' };
    }
  },


  // Update job status
  async updateJobStatus(jobId, status) {
    try {
      console.log('updateJobStatus called with:', jobId, status);
      const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
      console.log('Job reference created:', jobRef);
      
      const updateData = {
        status: status,
        updatedAt: new Date().toISOString()
      };
      
      // Add endDateTime for finished or deleted jobs
      if (status === 'finished' || status === 'deleted') {
        updateData.endDateTime = new Date().toISOString();
      }
      
      console.log('Update data:', updateData);
      await updateDoc(jobRef, updateData);
      console.log('Document updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Error updating job status:', error);
      console.error('Error details:', error.code, error.message);
      return { success: false, message: `Failed to update job status: ${error.message}` };
    }
  },

  // Update job details
  async updateJob(jobId, jobData) {
    try {
      const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
      await updateDoc(jobRef, {
        ...jobData,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating job:', error);
      return { success: false, message: 'Failed to update job' };
    }
  },

  // Clean up incomplete jobs (jobs without photos)
  async cleanupIncompleteJobs() {
    try {
      console.log('Cleaning up incomplete jobs...');
      const jobsRef = collection(db, COLLECTIONS.JOBS);
      const q = query(jobsRef, where('photo', '==', ''));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        console.log('Deleting incomplete job:', doc.id);
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} incomplete jobs`);
      return { success: true, deletedCount: deletePromises.length };
    } catch (error) {
      console.error('Error cleaning up incomplete jobs:', error);
      return { success: false, message: error.message };
    }
  },

};

// Database initialization service
export const dbService = {
  // Initialize database with default admin user
  async initializeDatabase() {
    try {
      console.log('Initializing database...');
      
      // Check if admin user already exists
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('username', '==', 'admin'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create default admin user
        const adminUser = {
          username: 'admin',
          password: 'password',
          role: 'admin',
          email: 'admin@trucktracker.com'
        };
        
        const result = await authService.createUser(adminUser);
        if (result.success) {
          console.log('Default admin user created successfully');
        } else {
          console.error('Failed to create admin user:', result.message);
        }
      } else {
        console.log('Admin user already exists');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  },

  // Get all documents from a collection
  async getCollection(collectionName) {
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data };
    } catch (error) {
      console.error(`Error getting ${collectionName} collection:`, error);
      return { success: false, message: error.message };
    }
  },

  // Delete a document
  async deleteDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      return { success: false, message: error.message };
    }
  },

  // Update a document
  async updateDocument(collectionName, docId, data) {
    try {
      console.log('Updating document:', collectionName, docId, data);
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log('Document updated successfully');
      return { success: true };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      return { success: false, message: error.message };
    }
  }
};
