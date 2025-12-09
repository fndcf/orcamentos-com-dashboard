import { db } from '../config/firebase';
import { Notificacao } from '../models';

const COLLECTION = 'notificacoes';

export const notificacaoRepository = {
  async findAll(): Promise<Notificacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVencimento: doc.data().dataVencimento?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notificacao[];
  },

  async findById(id: string): Promise<Notificacao | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
      dataVencimento: doc.data()?.dataVencimento?.toDate(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as Notificacao;
  },

  async findByOrcamentoId(orcamentoId: string): Promise<Notificacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('orcamentoId', '==', orcamentoId)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVencimento: doc.data().dataVencimento?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notificacao[];
  },

  async findNaoLidas(): Promise<Notificacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVencimento: doc.data().dataVencimento?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notificacao[];
  },

  async findProximas(dias: number = 30): Promise<Notificacao[]> {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    const snapshot = await db
      .collection(COLLECTION)
      .where('dataVencimento', '>=', hoje)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVencimento: doc.data().dataVencimento?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notificacao[];
  },

  async findVencidas(): Promise<Notificacao[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const snapshot = await db
      .collection(COLLECTION)
      .where('dataVencimento', '<', hoje)
      .where('lida', '==', false)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVencimento: doc.data().dataVencimento?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notificacao[];
  },

  async create(data: Omit<Notificacao, 'id' | 'createdAt'>): Promise<Notificacao> {
    const now = new Date();
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: now,
    });

    return {
      id: docRef.id,
      ...data,
      createdAt: now,
    };
  },

  async createMany(notificacoes: Omit<Notificacao, 'id' | 'createdAt'>[]): Promise<Notificacao[]> {
    const batch = db.batch();
    const now = new Date();
    const results: Notificacao[] = [];

    for (const data of notificacoes) {
      const docRef = db.collection(COLLECTION).doc();
      batch.set(docRef, {
        ...data,
        createdAt: now,
      });
      results.push({
        id: docRef.id,
        ...data,
        createdAt: now,
      });
    }

    await batch.commit();
    return results;
  },

  async marcarComoLida(id: string): Promise<Notificacao | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    await docRef.update({ lida: true });

    const updated = await docRef.get();
    return {
      id: updated.id,
      ...updated.data(),
      dataVencimento: updated.data()?.dataVencimento?.toDate(),
      createdAt: updated.data()?.createdAt?.toDate(),
    } as Notificacao;
  },

  async marcarTodasComoLidas(): Promise<number> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { lida: true });
    });

    await batch.commit();
    return snapshot.size;
  },

  async delete(id: string): Promise<boolean> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  },

  async deleteByOrcamentoId(orcamentoId: string): Promise<number> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('orcamentoId', '==', orcamentoId)
      .get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  },

  // Verifica se já existe notificação para este orçamento/item/palavra-chave
  async exists(orcamentoId: string, itemDescricao: string, palavraChave: string): Promise<boolean> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('orcamentoId', '==', orcamentoId)
      .where('itemDescricao', '==', itemDescricao)
      .where('palavraChave', '==', palavraChave)
      .limit(1)
      .get();

    return !snapshot.empty;
  },
};
