// ============================================================================
// Hardware Source: src/services/userStore.js
// Version: 1.0.0
// Why: Manage user persistence via Firebase Firestore for broadcasting
// Env / Identity: Database Layer
// ============================================================================

const admin = require('firebase-admin');
const config = require('../config/env');

let db = null;

const init = () => {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
        db = admin.firestore();
        console.log('[UserStore] Firestore Initialized 🔥');
    } catch (error) {
        console.error('[UserStore] Failed to init Firestore:', error.message);
        console.warn('⚠️  Ensure GOOGLE_APPLICATION_CREDENTIALS is set or Cloud Run Service Account has "Firebase Admin" role.');
    }
};

/**
 * Saves or updates a user in Firestore
 * @param {Object} ctx - Telegraf Context
 */
const saveUser = async (ctx) => {
    if (!db) return; // Fail silently if DB not connected

    const user = ctx.from;
    if (!user || !user.id) return;

    const userRef = db.collection('users').doc(user.id.toString());

    try {
        await userRef.set({
            id: user.id,
            firstName: user.first_name || '',
            username: user.username || '',
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
            language: user.language_code || 'en'
        }, { merge: true });
        // merge: true ensure we don't overwrite existing data like 'createdAt' if we added it
    } catch (error) {
        // Don't spam logs for every write failure (e.g. permission issues)
        if (Math.random() < 0.01) {
            console.error('[UserStore] Save Error:', error.message);
        }
    }
};

/**
 * Streams all users for broadcasting
 * @param {Function} callback - Function to call for each batch of users
 */
const forEachUser = async (callback) => {
    if (!db) return;

    const snapshot = await db.collection('users').get();
    if (snapshot.empty) return;

    // Process in chunks if needed, but for "Lite" version, simple iteration is fine
    // Firestore SDK handles pagination internally usually, but here we get all docs.
    // WARNING: Large datasets (10k+) might need explicit pagination/streaming.

    const docs = snapshot.docs;
    for (const doc of docs) {
        await callback(doc.data());
    }
};

module.exports = {
    init,
    saveUser,
    forEachUser
};
