import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente do .env.local em desenvolvimento
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

if (!admin.apps.length) {
  // Em produção (Cloud Functions), as credenciais são injetadas automaticamente
  // Em desenvolvimento local, usar variáveis de ambiente
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
    });
  } else {
    // Em Cloud Functions, inicializa sem credenciais explícitas
    admin.initializeApp();
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
