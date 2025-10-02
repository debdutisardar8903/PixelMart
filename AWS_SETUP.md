# AWS S3 Setup for PixelMart

## Quick Setup Overview

1. **Create S3 Bucket** → Store product images and files
2. **Configure Bucket Permissions** → Allow public access for images
3. **Create IAM User** → Programmatic access for uploads
4. **Set Environment Variables** → Connect your app to AWS
5. **Test Upload** → Verify everything works

## Prerequisites

1. **AWS Account** (free tier available)
2. **S3 Bucket** (we'll create: `wallpaper-plus-storage` or your custom name)
3. **IAM User** with S3 permissions (we'll create this)

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pixelmart-ce8ff.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pixelmart-ce8ff
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pixelmart-ce8ff.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://pixelmart-ce8ff-default-rtdb.firebaseio.com

# AWS S3 Configuration (new)
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_aws_access_key_id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_S3_BUCKET_NAME=pixelmart-storage
```

## Step 1: Create S3 Bucket

### 1.1 Access S3 Console
1. **Login to AWS Console:** https://console.aws.amazon.com/
2. **Navigate to S3:** Search for "S3" in the services search bar
3. **Click on S3** to open the S3 console

### 1.2 Create New Bucket
1. **Click "Create bucket"** button
2. **Bucket Configuration:**
   - **Bucket name:** `wallpaper-plus-storage` (or choose your unique name)
   - **AWS Region:** `Asia Pacific (Mumbai) ap-south-1` (or your preferred region)
   - **Note:** Bucket names must be globally unique across all AWS accounts

### 1.3 Configure Bucket Settings

#### Object Ownership
- **Select:** "ACLs enabled"
- **Object Ownership:** "Bucket owner preferred"

#### Block Public Access Settings
- **Uncheck:** "Block all public access" 
- **This will uncheck all 4 sub-options:**
  - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
  - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)  
  - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
  - ❌ Block public access to buckets and objects granted through any public bucket or access point policies
- **Reason:** We need public access for product images
- **Check the acknowledgment box:** "I acknowledge that the current settings might result in this bucket and the objects within it becoming public"

#### Bucket Versioning
- **Select:** "Disable" (for cost optimization)

#### Default Encryption
- **Select:** "Server-side encryption with Amazon S3 managed keys (SSE-S3)"

#### Advanced Settings
- **Object Lock:** "Disable"

### 1.4 Create Bucket
1. **Review all settings**
2. **Click "Create bucket"**
3. **Wait for bucket creation confirmation**

### 1.5 Configure Bucket Permissions

#### First: Update Block Public Access Settings
1. **Go to your bucket** → **Permissions** tab
2. **Find "Block public access (bucket settings)"** → **Click "Edit"**
3. **Uncheck these settings:**
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ❌ **Block public access to buckets and objects granted through new public bucket or access point policies**
   - ❌ **Block public access to buckets and objects granted through any public bucket or access point policies**
4. **Click "Save changes"**
5. **Type "confirm"** when prompted
6. **Click "Confirm"**

#### Then: Set Bucket Policy
1. **Go to your bucket** → **Permissions** tab
2. **Scroll to "Bucket policy"** → **Click "Edit"**
3. **Add this policy** (for bucket named `pixelmart-storage`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pixelmart-storage/pixelmart/products/images/*"
    }
  ]
}
```

**⚠️ Important:** Replace `pixelmart-storage` with your exact bucket name if different.

#### Configure CORS
1. **Go to "Permissions" tab** → **Cross-origin resource sharing (CORS)**
2. **Click "Edit"** and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.com"
    ],
    "ExposeHeaders": ["ETag", "x-amz-meta-custom-header"]
  }
]
```

3. **Replace** `https://your-domain.com` with your actual domain
4. **Click "Save changes"**

## Step 2: AWS IAM User Setup

1. **Create IAM User:**
   - Go to AWS Console > IAM > Users
   - Click "Create User"
   - Name: `pixelmart-s3-user`
   - Select "Programmatic access"

2. **Create IAM Policy:**
   - **Go to:** AWS Console > IAM > Policies
   - **Click:** "Create policy"
   - **Select:** JSON tab
   - **Paste this policy** (for bucket named `pixelmart-storage`):
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:PutObjectAcl"
         ],
         "Resource": "arn:aws:s3:::pixelmart-storage/*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket"
         ],
         "Resource": "arn:aws:s3:::pixelmart-storage"
       }
     ]
   }
   ```
   
   - **Policy name:** `PixelMartS3Policy`
   - **Click:** "Create policy"

3. **Create IAM User:**
   - **Go to:** AWS Console > IAM > Users
   - **Click:** "Create user"
   - **User name:** `pixelmart-s3-user`
   - **Select:** "Provide user access to the AWS Management Console" (optional)
   - **Click:** "Next"

4. **Attach Policy to User:**
   - **Select:** "Attach policies directly"
   - **Search for:** `PixelMartS3Policy`
   - **Check the policy** and click "Next"
   - **Click:** "Create user"

5. **Create Access Keys:**
   - **Go to the user** you just created
   - **Click:** "Security credentials" tab
   - **Scroll to:** "Access keys" section
   - **Click:** "Create access key"
   - **Select:** "Application running outside AWS"
   - **Click:** "Next" → "Create access key"

6. **Save Access Keys:**
   - **Copy the Access Key ID and Secret Access Key**
   - **⚠️ Important:** Download the CSV file or copy keys immediately (you won't see the secret key again)
   - **Add them to your `.env.local` file**

## S3 Bucket Configuration

### Folder Structure
The application will create the following folder structure in your S3 bucket:

```
wallpaper-plus-storage/
├── pixelmart/
│   └── products/
│       ├── images/          # Product images (public)
│       ├── files/           # Product download files (private)
│       └── thumbnails/      # Generated thumbnails (future)
```

### Bucket Permissions
1. **CORS Configuration:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

2. **Public Access Settings:**
   - Block public access: OFF (for product images)
   - Product files remain private and will be accessed via signed URLs

## File Upload Features

### Image Upload
- **Supported formats:** JPG, PNG, GIF, WebP
- **Max size:** 5MB
- **Storage:** Public read access for display
- **Folder:** `pixelmart/products/images/`

### Product File Upload
- **Supported formats:** ZIP, RAR, 7Z, PDF, DOC, Images, Audio, Video, Code files
- **Max size:** 100MB
- **Storage:** Private access (download after purchase)
- **Folder:** `pixelmart/products/files/`

## Security Notes

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use different AWS credentials for production

2. **S3 Security:**
   - Product images are public for display
   - Product files are private and require authentication
   - Use signed URLs for secure downloads (future feature)

3. **File Validation:**
   - Client-side and server-side file type validation
   - File size limits enforced
   - Unique filenames using UUID

## Usage in Admin Dashboard

1. **Login as Admin:**
   - Email: `admin.743245da@gmail.com`
   - Password: `Admin@743245da`

2. **Add Product:**
   - Upload product image (drag & drop or click)
   - Upload product file (the actual downloadable content)
   - Fill in product details
   - Save to Firebase with S3 URLs

3. **File Management:**
   - Images and files are automatically uploaded to S3
   - URLs are stored in Firebase Realtime Database
   - Files can be replaced or removed

## Troubleshooting

### Common Issues:

1. **Bucket Policy Error - "Public policies are blocked":**
   - **Problem:** Block Public Access settings prevent public policies
   - **Error:** `public policies are blocked by the BlockPublicPolicy block public access setting`
   - **Solution:** 
     1. Go to your bucket → Permissions tab
     2. Find "Block public access (bucket settings)" → Click "Edit"
     3. **Uncheck all 4 options** (especially the policy-related ones)
     4. Click "Save changes" → Type "confirm" → Click "Confirm"
     5. **Wait 1-2 minutes** for settings to propagate
     6. **Then** try adding the bucket policy again

2. **Bucket Policy Error - "Invalid Resource":**
   - **Problem:** ARN in policy doesn't match your actual bucket name
   - **Solution:** Ensure bucket name in policy matches exactly
   - **For bucket `pixelmart-storage`:** Use `arn:aws:s3:::pixelmart-storage/*`
   - **Check:** Go to S3 console and verify your exact bucket name
   - **Fix:** Update all ARNs in the policy to match your bucket name

2. **Bucket Name Already Exists:**
   - S3 bucket names are globally unique
   - Try: `pixelmart-yourname-2024` or `your-company-pixelmart`
   - Use lowercase letters, numbers, and hyphens only

2. **CORS Errors:**
   - Check S3 bucket CORS configuration
   - Ensure your domain is in AllowedOrigins
   - Make sure CORS is saved properly

3. **Access Denied:**
   - Verify IAM user permissions
   - Check AWS credentials in environment variables
   - Ensure bucket policy allows your actions

4. **File Upload Fails:**
   - Check file size limits (5MB images, 100MB files)
   - Verify file type is supported
   - Check network connectivity
   - Verify AWS credentials are correct

5. **Images Not Loading:**
   - Check bucket policy allows public read for images folder
   - Verify CORS configuration
   - Check if image URLs are correct

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test AWS credentials with AWS CLI
4. Check S3 bucket permissions and CORS

## Production Deployment

1. **Environment Variables:**
   - Set production AWS credentials
   - Update CORS origins to production domain
   - Use production Firebase configuration

2. **Security:**
   - Rotate AWS access keys regularly
   - Monitor S3 usage and costs
   - Implement file cleanup for deleted products

## Cost Optimization

1. **S3 Storage Classes:**
   - Use Standard for frequently accessed images
   - Consider IA for older product files

2. **Lifecycle Policies:**
   - Archive old files after 90 days
   - Delete incomplete multipart uploads

3. **Monitoring:**
   - Set up CloudWatch alerts for unusual usage
   - Monitor monthly S3 costs
