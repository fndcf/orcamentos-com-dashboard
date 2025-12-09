import { db } from '../config/firebase';
import { CategoriaItem } from '../models';

const COLLECTION = 'categoriasItem';

export const categoriaItemRepository = {
  async findAll(): Promise<CategoriaItem[]> {
    const snapshot = await db.collection(COLLECTION).orderBy('ordem', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as CategoriaItem[];
  },

  async findAtivas(): Promise<CategoriaItem[]> {
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
    })) as CategoriaItem[];
  },

  async findById(id: string): Promise<CategoriaItem | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as CategoriaItem;
  },

  async findByNome(nome: string): Promise<CategoriaItem | null> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('nome', '==', nome)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as CategoriaItem;
  },

  async create(data: Omit<CategoriaItem, 'id' | 'createdAt'>): Promise<CategoriaItem> {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as CategoriaItem;
  },

  async update(id: string, data: Partial<CategoriaItem>): Promise<CategoriaItem | null> {
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
    } as CategoriaItem;
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
