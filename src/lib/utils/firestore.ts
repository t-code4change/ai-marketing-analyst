import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function getWebsite(websiteId: string) {
  const doc = await adminDb.collection('websites').doc(websiteId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function getUserWebsites(userId: string) {
  const snapshot = await adminDb
    .collection('websites')
    .where('userId', '==', userId)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getConnections(websiteId: string) {
  const snapshot = await adminDb
    .collection('connections')
    .where('websiteId', '==', websiteId)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveConnection(websiteId: string, type: string, data: Record<string, unknown>) {
  const existing = await adminDb
    .collection('connections')
    .where('websiteId', '==', websiteId)
    .where('type', '==', type)
    .get();

  if (!existing.empty) {
    await existing.docs[0].ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    return existing.docs[0].id;
  }

  const ref = await adminDb.collection('connections').add({
    websiteId,
    type,
    ...data,
    connected: true,
    connectedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getLatestAnalytics(websiteId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const snapshot = await adminDb
    .collection('analytics_data')
    .where('websiteId', '==', websiteId)
    .where('date', '>=', startDate.toISOString().split('T')[0])
    .orderBy('date', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getLatestAdsData(websiteId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const snapshot = await adminDb
    .collection('ads_data')
    .where('websiteId', '==', websiteId)
    .where('date', '>=', startDate.toISOString().split('T')[0])
    .orderBy('date', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getLatestSearchConsoleData(websiteId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const snapshot = await adminDb
    .collection('search_console_data')
    .where('websiteId', '==', websiteId)
    .where('date', '>=', startDate.toISOString().split('T')[0])
    .orderBy('date', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getLatestAIReport(websiteId: string) {
  const snapshot = await adminDb
    .collection('ai_reports')
    .where('websiteId', '==', websiteId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}
