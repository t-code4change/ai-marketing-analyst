import { OAuth2Client } from 'google-auth-library';
import { adminDb } from '@/lib/firebase/admin';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getValidGoogleTokens(connectionId: string) {
  const doc = await adminDb.collection('connections').doc(connectionId).get();
  if (!doc.exists) throw new Error('Connection not found');
  
  const data = doc.data()!;
  const now = Date.now();
  
  // Refresh if expiring within 5 minutes
  if (data.expiresAt && data.expiresAt - now < 5 * 60 * 1000) {
    oauth2Client.setCredentials({
      refresh_token: data.refreshToken,
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    await doc.ref.update({
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date,
    });
    
    return credentials.access_token!;
  }
  
  return data.accessToken as string;
}

export async function getGoogleConnection(websiteId: string, type: string) {
  const snapshot = await adminDb
    .collection('connections')
    .where('websiteId', '==', websiteId)
    .where('type', '==', type)
    .where('connected', '==', true)
    .get();
    
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}
