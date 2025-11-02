# Firebase Realtime Database Setup

## Database Rules Configuration

To set up the Firebase Realtime Database rules for user authentication and data storage:

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pixelmart-ce8ff`
3. Navigate to **Realtime Database** in the left sidebar

### 2. Configure Database Rules
1. Click on the **Rules** tab
2. Replace the existing rules with the content from `database.rules.json`
3. Click **Publish** to apply the rules

### 3. Database Structure
The database will store user data in the following structure:

```
users/
  {userId}/
    uid: "user-unique-id"
    email: "user@example.com"
    displayName: "User Name"
    photoURL: "https://..." (optional)
    emailVerified: true/false
    createdAt: timestamp
    lastLoginAt: timestamp
```

### 4. Security Rules Explanation

- **Read Access**: Users can only read their own data (`$uid === auth.uid`)
- **Write Access**: Users can only write to their own data (`$uid === auth.uid`)
- **Data Validation**: 
  - Required fields: `uid`, `email`, `displayName`
  - `uid` must match the authenticated user's ID
  - `email` and `displayName` must be non-empty strings
  - `createdAt` can only be set once (on creation)
  - `lastLoginAt` must be the current server timestamp
  - No additional fields are allowed

### 5. Testing the Setup

After implementing the rules:

1. **Register a new user** - Check that user data is created in the database
2. **Login with existing user** - Verify that `lastLoginAt` is updated
3. **Check security** - Ensure users cannot access other users' data

### 6. Database URL
Your database URL is: `https://pixelmart-ce8ff-default-rtdb.firebaseio.com`

### 7. Monitoring
You can monitor database usage and security in the Firebase Console under:
- **Realtime Database > Data** (to view stored data)
- **Realtime Database > Usage** (to monitor read/write operations)
- **Authentication > Users** (to see registered users)

## Implementation Details

The AuthContext has been updated to:
- Save user data to Realtime Database on login
- Create user records on registration
- Update login timestamps
- Handle both new and existing users
- Provide error handling for database operations

## Troubleshooting

If you encounter issues:
1. Check Firebase Console for error messages
2. Verify database rules are published
3. Ensure user is authenticated before database operations
4. Check browser console for detailed error logs
