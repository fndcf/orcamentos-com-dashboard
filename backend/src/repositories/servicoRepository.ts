import { db } from '../config/firebase';
import { Servico } from '../models';

const COLLECTION = 'servicos';

export const servicoRepository = {
  async findAll(): Promise<Servico[]> {
    const snapshot = await db.collection(COLLECTION).orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Servico[];
  },

  async findAtivos(): Promise<Servico[]> {
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
    })) as Servico[];
  },

  async findById(id: string): Promise<Servico | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Servico;
  },

  async findByDescricao(descricao: string): Promise<Servico | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('descricao', '==', descricao)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Servico;
  },

  async create(data: Omit<Servico, 'id' | 'createdAt'>): Promise<Servico> {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as Servico;
  },

  async update(id: string, data: Partial<Servico>): Promise<Servico | null> {
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
    } as Servico;
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
