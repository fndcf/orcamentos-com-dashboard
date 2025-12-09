import { db } from '../config/firebase';
import { Limitacao } from '../models';

const COLLECTION = 'limitacoes';

export const limitacaoRepository = {
  async findAll(): Promise<Limitacao[]> {
    const snapshot = await db.collection(COLLECTION).orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Limitacao[];
  },

  async findAtivas(): Promise<Limitacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('ativo', '==', true)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Limitacao[];
  },

  async findById(id: string): Promise<Limitacao | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Limitacao;
  },

  async findByTexto(texto: string): Promise<Limitacao | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('texto', '==', texto)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Limitacao;
  },

  async findByIds(ids: string[]): Promise<Limitacao[]> {
    if (ids.length === 0) return [];
    const limitacoes: Limitacao[] = [];
    for (const id of ids) {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (doc.exists) {
        limitacoes.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()?.createdAt?.toDate(),
          updatedAt: doc.data()?.updatedAt?.toDate(),
        } as Limitacao);
      }
    }
    return limitacoes;
  },

  async create(data: Omit<Limitacao, 'id' | 'createdAt'>): Promise<Limitacao> {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as Limitacao;
  },

  async update(id: string, data: Partial<Limitacao>): Promise<Limitacao | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Limitacao;
  },

  async delete(id: string): Promise<boolean> {
    await db.collection(COLLECTION).doc(id).delete();
    return true;
  },

  async getNextOrdem(): Promise<number> {
    const snapshot = await db.collection(COLLECTION).orderBy('ordem', 'desc').limit(1).get();
    if (snapshot.empty) return 1;
    return (snapshot.docs[0].data().ordem || 0) + 1;
  },
};
