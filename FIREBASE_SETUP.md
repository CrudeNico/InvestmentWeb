# Firebase Setup Guide

This guide will walk you through setting up Firebase for your Investment Tracker application.

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter a project name (e.g., "investment-tracker")
   - Choose whether to enable Google Analytics (recommended)
   - Click "Create project"

3. **Wait for Project Creation**
   - Firebase will set up your project
   - Click "Continue" when ready

## Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the Firebase console, click "Authentication" in the left sidebar
   - Click "Get started"

2. **Enable Email/Password Authentication**
   - Click on the "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable" to turn it on
   - Click "Save"

3. **Add Admin User (Optional)**
   - Go to the "Users" tab
   - Click "Add user"
   - Enter admin email and password
   - This will be your admin account

## Step 3: Set Up Firestore Database

1. **Create Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" for development
   - Click "Next"

3. **Choose Location**
   - Select a location close to your users
   - Click "Done"

4. **Set Up Security Rules**
   - Go to the "Rules" tab
   - Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users (admin or otherwise) to read/write all investment data
    match /investmentData/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write all investor data
    match /investors/{investorId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write all chat data
    match /chatConversations/{conversationId} {
      allow read, write: if request.auth != null;
    }
    
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 4: Get Your Firebase Configuration

1. **Go to Project Settings**
   - Click the gear icon next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the web icon (</>)
   - Enter an app nickname (e.g., "Investment Tracker Web")
   - Click "Register app"

3. **Copy Configuration**
   - Firebase will show you the configuration object
   - Copy the `firebaseConfig` object
   - It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Update Your Application

1. **Update Firebase Config**
   - Open `src/firebase/config.js`
   - Replace the placeholder values with your actual Firebase configuration

2. **Test the Connection**
   - Start your development server: `npm run dev`
   - Try logging in with the admin credentials
   - Check the browser console for any errors

## Step 6: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to migrate to Firebase:

1. **Open Browser Console**
   - Press F12 to open developer tools
   - Go to the Console tab

2. **Run Migration**
   ```javascript
   // Import the migration service
   import { migrationServices } from './src/firebase/services.js'
   
   // Run the migration
   migrationServices.migrateFromLocalStorage()
   ```

## Step 7: Production Deployment

When you're ready to deploy to production:

1. **Update Security Rules**
   - Go to Firestore Database > Rules
   - Update rules to be more restrictive for production
   - Consider implementing user-specific access controls

2. **Set Up Custom Domain (Optional)**
   - In Authentication > Settings
   - Add your custom domain to authorized domains

3. **Monitor Usage**
   - Check the Firebase console regularly
   - Monitor usage to stay within free tier limits

## Firebase Free Tier Limits

- **Firestore**: 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Authentication**: 10,000 users
- **Hosting**: 10GB storage, 360MB/day transfer

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're only initializing Firebase once
   - Check that config.js is only imported once

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Make sure users are authenticated

3. **"Network request failed"**
   - Check your internet connection
   - Verify Firebase project is active
   - Check if you're in the correct region

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

## Next Steps

After setting up Firebase:

1. **Test all features** - Make sure everything works with the database
2. **Set up monitoring** - Enable Firebase Analytics
3. **Plan for scaling** - Consider when you might need to upgrade from free tier
4. **Backup strategy** - Set up regular data exports
5. **Security audit** - Review and tighten security rules

Your investment tracker is now ready for production with a real-time, scalable database!
