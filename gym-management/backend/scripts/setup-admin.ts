import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin with the service account from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

/**
 * Sets admin role for a specific user by email
 */
async function setAdminByEmail(email: string): Promise<void> {
  try {
    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    // Update user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set(
      { isAdmin: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    
    console.log(`✅ Success! ${email} has been granted admin privileges.`);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: ts-node setup-admin.ts user@example.com');
  process.exit(1);
}

// Run the function
setAdminByEmail(email);
