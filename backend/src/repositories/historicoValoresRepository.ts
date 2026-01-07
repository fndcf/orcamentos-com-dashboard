import { db } from '../config/firebase';
import { HistoricoValorItem, HistoricoConfiguracao } from '../models';

const COLLECTION_ITENS = 'historicoValoresItens';
const COLLECTION_CONFIGURACOES = 'historicoConfiguracoes';

export const historicoValoresRepository = {
  // ==================== HISTÓRICO DE ITENS ====================

  async salvarHistoricoItem(
    data: Omit<HistoricoValorItem, 'id' | 'createdAt'>
  ): Promise<HistoricoValorItem> {
    const docRef = await db.collection(COLLECTION_ITENS).add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data()?.dataVigencia?.toDate(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as HistoricoValorItem;
  },

  async buscarHistoricoItensPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<HistoricoValorItem[]> {
    // Busca todos os históricos onde a dataVigencia é <= dataFim
    // (históricos que podem estar vigentes no período)
    const snapshot = await db
      .collection(COLLECTION_ITENS)
      .where('dataVigencia', '<=', dataFim)
      .orderBy('dataVigencia', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as HistoricoValorItem[];
  },

  async buscarUltimoHistoricoItem(itemServicoId: string): Promise<HistoricoValorItem | null> {
    const snapshot = await db
      .collection(COLLECTION_ITENS)
      .where('itemServicoId', '==', itemServicoId)
      .orderBy('dataVigencia', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    } as HistoricoValorItem;
  },

  // ==================== HISTÓRICO DE CONFIGURAÇÕES ====================

  async salvarHistoricoConfiguracao(
    data: Omit<HistoricoConfiguracao, 'id' | 'createdAt'>
  ): Promise<HistoricoConfiguracao> {
    const docRef = await db.collection(COLLECTION_CONFIGURACOES).add({
      ...data,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data()?.dataVigencia?.toDate(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as HistoricoConfiguracao;
  },

  async buscarHistoricoConfiguracoesPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<HistoricoConfiguracao[]> {
    // Busca todos os históricos onde a dataVigencia é <= dataFim
    const snapshot = await db
      .collection(COLLECTION_CONFIGURACOES)
      .where('dataVigencia', '<=', dataFim)
      .orderBy('dataVigencia', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as HistoricoConfiguracao[];
  },

  async buscarUltimaHistoricoConfiguracao(): Promise<HistoricoConfiguracao | null> {
    const snapshot = await db
      .collection(COLLECTION_CONFIGURACOES)
      .orderBy('dataVigencia', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      dataVigencia: doc.data().dataVigencia?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    } as HistoricoConfiguracao;
  },
};
