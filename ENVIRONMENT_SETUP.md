# Environment Variables Setup

Add these environment variables to your `.env.local` file:

## Firebase Admin SDK
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
```

**Important Notes for Firebase Private Key:**
- Keep the entire private key in quotes
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Use `\n` for newlines within the key
- Example format:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## AWS S3 Configuration
```env
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key
NEXT_PUBLIC_S3_BUCKET_NAME=pixelmart-storage
```

## How to Get Firebase Admin Credentials:

1. Go to Firebase Console → Project Settings
2. Click on "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract the values:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the quotes and newlines)
   - Database URL from your Realtime Database settings

## AWS S3 Setup:

1. Create an IAM user with S3 permissions
2. Generate access keys
3. Set up your S3 bucket with proper permissions
4. Update the environment variables accordingly

## Important Notes:

- Keep the FIREBASE_PRIVATE_KEY in quotes with proper newline characters
- Make sure your S3 bucket allows the IAM user to read objects
- The database URL should match your Firebase Realtime Database URL
