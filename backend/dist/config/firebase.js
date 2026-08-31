"use strict";
// Configurazione Firebase Admin SDK per Backend SocialFlow
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessaging = exports.isFCMReady = exports.getFirebaseAdmin = void 0;
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
Object.defineProperty(exports, "getMessaging", { enumerable: true, get: function () { return messaging_1.getMessaging; } });
let firebaseAdminApp = null;
let isFirebaseConfigured = false;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseAdminApp = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
        });
        isFirebaseConfigured = true;
        console.log('🔥 Firebase Admin SDK Inizializzato da variabile d\'ambiente');
    }
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        firebaseAdminApp = (0, app_1.initializeApp)({
            credential: (0, app_1.applicationDefault)(),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        isFirebaseConfigured = true;
        console.log('🔥 Firebase Admin SDK Inizializzato da GOOGLE_APPLICATION_CREDENTIALS');
    }
    else {
        console.log('ℹ️ Firebase Service Account non configurato. Le notifiche FCM utilizzeranno il fallback locale.');
    }
}
catch (err) {
    console.warn('Avviso inizializzazione Firebase Admin:', err);
}
const getFirebaseAdmin = () => firebaseAdminApp;
exports.getFirebaseAdmin = getFirebaseAdmin;
const isFCMReady = () => isFirebaseConfigured && firebaseAdminApp !== null;
exports.isFCMReady = isFCMReady;
exports.default = firebaseAdminApp;
