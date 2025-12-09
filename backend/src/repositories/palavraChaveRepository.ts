import { db } from '../config/firebase';
import { PalavraChave } from '../models';

const COLLECTION = 'palavrasChave';

export const palavraChaveRepository = {
  async findAll(): Promise<PalavraChave[]> {
    const snapshot = await db.collection(COLLECTION).orderBy('palavra').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PalavraChave[];
  },

  async findById(id: string): Promise<PalavraChave | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as PalavraChave;
  },

  async findByPalavra(palavra: string): Promise<PalavraChave | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('palavra', '==', palavra.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PalavraChave;
  },

  async findAtivas(): Promise<PalavraChave[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('ativo', '==', true)
      .orderBy('palavra')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PalavraChave[];
  },

  async create(data: Omit<PalavraChave, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalavraChave> {
    const now = new Date();
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      palavra: data.palavra.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: docRef.id,
      ...data,
      palavra: data.palavra.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: string, data: Partial<Omit<PalavraChave, 'id' | 'createdAt'>>): Promise<PalavraChave | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.palavra) {
      updateData.palavra = data.palavra.toLowerCase();
    }

    await docRef.update(updateData);

    const updated = await docRef.get();
    return {
      id: updated.id,
      ...updated.data(),
      createdAt: updated.data()?.createdAt?.toDate(),
      updatedAt: updated.data()?.updatedAt?.toDate(),
    } as PalavraChave;
  },

  async delete(id: string): Promise<boolean> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  },
};
