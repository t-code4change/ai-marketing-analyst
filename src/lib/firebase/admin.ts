import admin from 'firebase-admin';

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Decode base64 service account JSON (most reliable for Vercel)
    const sa = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    );
    credential = admin.credential.cert(sa);
  } else {
    // Fallback: individual env vars
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    const privateKey = rawKey.includes('\\n')
      ? rawKey.replace(/\\n/g, '\n').trim()
      : rawKey.trim();
    credential = admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim(),
      privateKey,
    });
  }

  admin.initializeApp({ credential });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
