# Firebase Setup Guide for Truck Tracker

## Prerequisites
- Firebase account (https://firebase.google.com/)
- Node.js and npm installed
- React Native development environment set up

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `truck-tracker` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname (e.g., "Truck Tracker Web")
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

1. Open `config/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Set up Firestore Security Rules

1. Go to "Firestore Database" > "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - allow read/write for authenticated users
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Jobs collection - allow read/write for authenticated users
    match /jobs/{jobId} {
      allow read, write: if request.auth != null;
    }
    
    // For development, you can use more permissive rules:
    // allow read, write: if true;
  }
}
```

## Step 6: Initialize Database with Admin User

The app will automatically create an admin user when first launched:

- **Username**: `admin`
- **Password**: `password`
- **Role**: `admin`

## Step 7: Test the Application

1. Start your React Native app: `npm start`
2. Navigate to the Login screen
3. Use the credentials:
   - Username: `admin`
   - Password: `password`
4. Verify that login works and jobs are saved to Firebase

## Database Structure

### Users Collection (`users`)
```javascript
{
  username: "admin",
  password: "password",
  role: "admin",
  email: "admin@trucktracker.com",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Jobs Collection (`jobs`)
```javascript
{
  userId: "user-document-id",
  username: "admin",
  activity: "Activity One",
  truckType: "Flatbed Truck",
  weight: 1500,
  photo: "file://path/to/photo.jpg",
  status: "started",
  startTime: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Common Issues:

1. **Firebase connection error**: Check your configuration values
2. **Permission denied**: Verify Firestore security rules
3. **Network error**: Ensure internet connection and Firebase project is active
4. **Module not found**: Run `npm install` to ensure all dependencies are installed

### Debug Steps:

1. Check browser console for Firebase errors
2. Verify Firebase project is active and billing is enabled (if using production rules)
3. Test Firestore rules in Firebase Console
4. Check network tab for failed requests

## Production Considerations

1. **Security Rules**: Implement proper authentication-based rules
2. **Data Validation**: Add server-side validation
3. **Error Handling**: Implement comprehensive error handling
4. **Monitoring**: Set up Firebase monitoring and alerts
5. **Backup**: Configure automated backups

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Review React Native console output
3. Verify all configuration steps were completed
4. Test with a simple Firestore read/write operation

