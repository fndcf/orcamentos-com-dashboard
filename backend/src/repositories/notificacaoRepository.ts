import { db } from '../config/firebase';
import { Notificacao, PaginatedResponse } from '../models';

const COLLECTION = 'notificacoes';

// Helper para mapear documento do Firestore para Notificacao
const mapDocToNotificacao = (doc: FirebaseFirestore.DocumentSnapshot): Notificacao => ({
  id: doc.id,
  ...doc.data(),
  dataVencimento: doc.data()?.dataVencimento?.toDate(),
  orcamentoDataEmissao: doc.data()?.orcamentoDataEmissao?.toDate?.() || doc.data()?.orcamentoDataEmissao,
  createdAt: doc.data()?.createdAt?.toDate(),
} as Notificacao);

// Helper para codificar/decodificar cursor
const encodeCursor = (id: string): string => Buffer.from(id).toString('base64');
const decodeCursor = (cursor: string): string => Buffer.from(cursor, 'base64').toString();

export const notificacaoRepository = {
  async findAll(): Promise<Notificacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  },

  async findById(id: string): Promise<Notificacao | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return mapDocToNotificacao(doc);
  },

  async findByOrcamentoId(orcamentoId: string): Promise<Notificacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('orcamentoId', '==', orcamentoId)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  },

  async findNaoLidas(): Promise<Notificacao[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
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

    return snapshot.docs.map(mapDocToNotificacao);
  },

  async findVencidas(): Promise<Notificacao[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Busca todas as notificações vencidas, independente se foram lidas ou não
    const snapshot = await db
      .collection(COLLECTION)
      .where('dataVencimento', '<', hoje)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
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
    return mapDocToNotificacao(updated);
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

  // Busca notificações ativas (não lidas E que já venceram ou vão vencer em até X dias)
  async findAtivas(diasAntecedencia: number = 60): Promise<Notificacao[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date();
    limite.setDate(limite.getDate() + diasAntecedencia);

    // Buscar não lidas que vencem até o limite
    const snapshot = await db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc')
      .get();

    return snapshot.docs.map(mapDocToNotificacao);
  },

  // ========== MÉTODOS PAGINADOS ==========

  async findAllPaginated(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    let query = db
      .collection(COLLECTION)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await db.collection(COLLECTION).doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await db.collection(COLLECTION).count().get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  },

  async findNaoLidasPaginated(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    let query = db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await db.collection(COLLECTION).doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  },

  async findVencidasPaginated(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let query = db
      .collection(COLLECTION)
      .where('dataVencimento', '<', hoje)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await db.collection(COLLECTION).doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await db
      .collection(COLLECTION)
      .where('dataVencimento', '<', hoje)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  },

  async findAtivasPaginated(diasAntecedencia: number = 60, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const limite = new Date();
    limite.setDate(limite.getDate() + diasAntecedencia);

    let query = db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await db.collection(COLLECTION).doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await db
      .collection(COLLECTION)
      .where('lida', '==', false)
      .where('dataVencimento', '<=', limite)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  },

  async findProximasPaginated(dias: number = 30, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    let query = db
      .collection(COLLECTION)
      .where('dataVencimento', '>=', hoje)
      .where('dataVencimento', '<=', limite)
      .orderBy('dataVencimento', 'asc');

    if (cursor) {
      const cursorDoc = await db.collection(COLLECTION).doc(decodeCursor(cursor)).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const hasMore = snapshot.docs.length > pageSize;
    const items = snapshot.docs.slice(0, pageSize).map(mapDocToNotificacao);

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].id!)
      : undefined;

    const countSnapshot = await db
      .collection(COLLECTION)
      .where('dataVencimento', '>=', hoje)
      .where('dataVencimento', '<=', limite)
      .count()
      .get();

    return {
      items,
      total: countSnapshot.data().count,
      hasMore,
      cursor: nextCursor,
    };
  },
};
