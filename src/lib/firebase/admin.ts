import admin from 'firebase-admin';

if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n').trim()
    : rawKey.trim();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim(),
      privateKey,
    }),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
