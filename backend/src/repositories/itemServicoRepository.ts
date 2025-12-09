import { db } from '../config/firebase';
import { ItemServico } from '../models';

const COLLECTION = 'itensServico';

export const itemServicoRepository = {
  async findAll(): Promise<ItemServico[]> {
    const snapshot = await db.collection(COLLECTION).orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];
  },

  async findByCategoria(categoriaId: string): Promise<ItemServico[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('categoriaId', '==', categoriaId)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];
  },

  async findAtivosByCategoria(categoriaId: string): Promise<ItemServico[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('categoriaId', '==', categoriaId)
      .where('ativo', '==', true)
      .orderBy('ordem', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ItemServico[];
  },

  async findById(id: string): Promise<ItemServico | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as ItemServico;
  },

  async findByDescricaoInCategoria(descricao: string, categoriaId: string): Promise<ItemServico | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('categoriaId', '==', categoriaId)
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
    } as ItemServico;
  },

  async create(data: Omit<ItemServico, 'id' | 'createdAt'>): Promise<ItemServico> {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as ItemServico;
  },

  async update(id: string, data: Partial<ItemServico>): Promise<ItemServico | null> {
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
    } as ItemServico;
  },

  async delete(id: string): Promise<boolean> {
    await db.collection(COLLECTION).doc(id).delete();
    return true;
  },

  async getNextOrdem(categoriaId: string): Promise<number> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('categoriaId', '==', categoriaId)
      .orderBy('ordem', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return 1;
    return (snapshot.docs[0].data().ordem || 0) + 1;
  },

  async deleteByCategoria(categoriaId: string): Promise<number> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('categoriaId', '==', categoriaId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return snapshot.size;
  },
};
