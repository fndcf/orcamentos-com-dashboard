import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente do .env.local em desenvolvimento
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

if (!getApps().length) {
  // Em produção (Cloud Functions), as credenciais são injetadas automaticamente
  // Em desenvolvimento local, usar variáveis de ambiente
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Desenvolvimento local com Application Default Credentials (gcloud auth application-default login).
    // O projectId explícito faz o Admin SDK enviar o quota project exigido pela API do Auth.
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  } else {
    // Em Cloud Functions, inicializa sem credenciais explícitas
    initializeApp();
  }
}

export const db = getFirestore();
export const auth = getAuth();
export { FieldValue };
