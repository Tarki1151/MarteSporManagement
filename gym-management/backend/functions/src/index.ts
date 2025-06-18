import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Interface for the user data
export interface UserData {
  email: string;
  isAdmin: boolean;
  // Add other user fields as needed
}

/**
 * Callable function to set admin role for a user
 * Can only be called by an admin user
 */
export const setAdminRole = functions.https.onCall(
  async (data: { uid: string; isAdmin: boolean }, context) => {
    // Check if the request is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required.'
      );
    }

    // Check if the requesting user is an admin
    const callerUid = context.auth.uid;
    const caller = await admin.auth().getUser(callerUid);
    
    if (!caller.customClaims?.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can assign admin roles.'
      );
    }

    try {
      // Set the admin custom claim on the target user
      await admin.auth().setCustomUserClaims(data.uid, {
        ...(await admin.auth().getUser(data.uid)).customClaims,
        admin: data.isAdmin,
      });

      // Update the user's document in Firestore if it exists
      const userRef = admin.firestore().collection('users').doc(data.uid);
      await userRef.set(
        { isAdmin: data.isAdmin, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

      return { success: true, message: `User ${data.uid} admin status set to ${data.isAdmin}` };
    } catch (error) {
      console.error('Error setting admin role:', error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while setting the admin role.'
      );
    }
  }
);

/**
 * Triggered when a new user is created
 * Initializes default user data in Firestore
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userData: UserData = {
    email: user.email || '',
    isAdmin: false, // Default to non-admin
  };

  // Set the user document in Firestore
  return admin.firestore().collection('users').doc(user.uid).set({
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
