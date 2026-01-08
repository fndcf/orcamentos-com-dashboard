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
    _dataInicio: Date,
    _dataFim: Date
  ): Promise<HistoricoValorItem[]> {
    // Buscar TODOS os históricos ordenados por dataVigencia desc
    // Isso é necessário porque para calcular o valor vigente de um orçamento
    // emitido em uma data específica, precisamos do último registro com dataVigencia <= dataEmissao
    // O registro vigente pode ter sido criado ANTES do período selecionado
    // ou mesmo DEPOIS (se não existia registro anterior à data do orçamento)
    // Os parâmetros são mantidos para compatibilidade da API
    const snapshot = await db
      .collection(COLLECTION_ITENS)
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
    _dataInicio: Date,
    _dataFim: Date
  ): Promise<HistoricoConfiguracao[]> {
    // Buscar TODOS os históricos de configurações ordenados por dataVigencia desc
    // Mesma lógica dos itens: precisamos de todos os registros para encontrar
    // o valor vigente na data de emissão de cada orçamento
    // Os parâmetros são mantidos para compatibilidade da API
    const snapshot = await db
      .collection(COLLECTION_CONFIGURACOES)
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
