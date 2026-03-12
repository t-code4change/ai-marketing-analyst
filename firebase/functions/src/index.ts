import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as https from 'https';

admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled sync — runs every 6 hours
 * Fetches all active websites and triggers a sync for each
 */
export const scheduledSync = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    functions.logger.info('Starting scheduled sync for all websites');

    try {
      // Get all websites
      const websitesSnapshot = await db.collection('websites').get();
      
      if (websitesSnapshot.empty) {
        functions.logger.info('No websites found, skipping sync');
        return null;
      }

      const websiteIds = websitesSnapshot.docs.map(doc => doc.id);
      functions.logger.info(`Found ${websiteIds.length} websites to sync`);

      // Sync each website
      const syncPromises = websiteIds.map(async (websiteId) => {
        try {
          await triggerSync(websiteId);
          functions.logger.info(`Synced website: ${websiteId}`);
        } catch (error) {
          functions.logger.error(`Failed to sync website ${websiteId}:`, error);
        }
      });

      await Promise.allSettled(syncPromises);
      functions.logger.info('Scheduled sync completed');
    } catch (error) {
      functions.logger.error('Scheduled sync failed:', error);
    }

    return null;
  });

async function triggerSync(websiteId: string): Promise<void> {
  // Check if website has active connections
  const connectionsSnapshot = await db
    .collection('connections')
    .where('websiteId', '==', websiteId)
    .where('connected', '==', true)
    .get();

  if (connectionsSnapshot.empty) {
    functions.logger.info(`No active connections for website ${websiteId}, skipping`);
    return;
  }

  // Update last attempted sync
  await db.collection('websites').doc(websiteId).update({
    lastSyncAttempt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // In production: call the Next.js sync API endpoint
  // For now, log the sync attempt
  functions.logger.info(`Sync triggered for website: ${websiteId}`);
}

/**
 * Cleanup old analytics data older than 90 days
 */
export const cleanupOldData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    functions.logger.info('Starting old data cleanup');

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const collections = ['analytics_data', 'ads_data', 'search_console_data'];

    for (const collection of collections) {
      try {
        const snapshot = await db
          .collection(collection)
          .where('date', '<', cutoffStr)
          .limit(500)
          .get();

        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          functions.logger.info(`Deleted ${snapshot.size} old records from ${collection}`);
        }
      } catch (error) {
        functions.logger.error(`Cleanup failed for ${collection}:`, error);
      }
    }

    return null;
  });

/**
 * HTTP trigger for manual sync (called from Next.js API with cron secret)
 */
export const manualSync = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== functions.config().app?.cron_secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { websiteId } = req.body;
  if (!websiteId) {
    res.status(400).json({ error: 'websiteId required' });
    return;
  }

  try {
    await triggerSync(websiteId);
    res.json({ success: true, websiteId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
