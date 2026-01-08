import { db } from '../config/firebase';
import { Orcamento, OrcamentoStatus, PaginatedResponse } from '../models';
import { COLLECTIONS, CONTADORES } from '../utils/constants';
import { NotFoundError } from '../utils/errors';

const collection = db.collection(COLLECTIONS.ORCAMENTOS);

// Helper para mapear documento do Firestore para Orcamento
function mapDocToOrcamento(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): Orcamento {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dataEmissao: data?.dataEmissao?.toDate(),
    dataValidade: data?.dataValidade?.toDate(),
    dataAceite: data?.dataAceite?.toDate(),
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Orcamento;
}

export const orcamentoRepository = {
  async findAll(): Promise<Orcamento[]> {
    try {
      const snapshot = await collection.orderBy('numero', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
    } catch {
      // Fallback sem ordenação
      const snapshot = await collection.get();
      const orcamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
      return orcamentos.sort((a, b) => (b.numero || 0) - (a.numero || 0));
    }
  },

  async findById(id: string): Promise<Orcamento> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    return {
      id: doc.id,
      ...doc.data(),
      dataEmissao: doc.data()?.dataEmissao?.toDate(),
      dataValidade: doc.data()?.dataValidade?.toDate(),
      dataAceite: doc.data()?.dataAceite?.toDate(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Orcamento;
  },

  async findByClienteId(clienteId: string): Promise<Orcamento[]> {
    try {
      const snapshot = await collection
        .where('clienteId', '==', clienteId)
        .orderBy('numero', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
    } catch {
      // Fallback: buscar sem ordenação e filtrar/ordenar manualmente
      const snapshot = await collection.where('clienteId', '==', clienteId).get();
      const orcamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
      return orcamentos.sort((a, b) => (b.numero || 0) - (a.numero || 0));
    }
  },

  async findByPeriodo(dataInicio: Date, dataFim: Date): Promise<Orcamento[]> {
    try {
      // Buscar orçamentos com dataEmissao >= dataInicio E dataEmissao <= dataFim
      const snapshot = await collection
        .where('dataEmissao', '>=', dataInicio)
        .where('dataEmissao', '<=', dataFim)
        .orderBy('dataEmissao', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
    } catch {
      // Fallback: buscar todos e filtrar manualmente
      const snapshot = await collection.get();
      const orcamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];

      return orcamentos
        .filter(orc => {
          const emissao = orc.dataEmissao instanceof Date ? orc.dataEmissao : new Date(orc.dataEmissao as string);
          return emissao >= dataInicio && emissao <= dataFim;
        })
        .sort((a, b) => {
          const dateA = a.dataEmissao instanceof Date ? a.dataEmissao : new Date(a.dataEmissao as string);
          const dateB = b.dataEmissao instanceof Date ? b.dataEmissao : new Date(b.dataEmissao as string);
          return dateB.getTime() - dateA.getTime();
        });
    }
  },

  async findByStatus(status: OrcamentoStatus): Promise<Orcamento[]> {
    try {
      const snapshot = await collection
        .where('status', '==', status)
        .orderBy('numero', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
    } catch {
      // Fallback: buscar sem ordenação e ordenar manualmente
      const snapshot = await collection.where('status', '==', status).get();
      const orcamentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataEmissao: doc.data().dataEmissao?.toDate(),
        dataValidade: doc.data().dataValidade?.toDate(),
        dataAceite: doc.data().dataAceite?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Orcamento[];
      return orcamentos.sort((a, b) => (b.numero || 0) - (a.numero || 0));
    }
  },

  async getNextNumero(): Promise<number> {
    const contadorRef = db.collection(COLLECTIONS.CONTADORES).doc(CONTADORES.ORCAMENTOS);

    return db.runTransaction(async (transaction) => {
      const contadorDoc = await transaction.get(contadorRef);

      let proximoNumero: number;

      if (!contadorDoc.exists) {
        // Primeira execução: buscar o maior número existente nos orçamentos
        // para inicializar o contador corretamente
        const snapshot = await collection.orderBy('numero', 'desc').limit(1).get();
        const maiorNumeroExistente = snapshot.empty ? 0 : (snapshot.docs[0].data().numero || 0);
        proximoNumero = maiorNumeroExistente + 1;

        // Criar o documento contador
        transaction.set(contadorRef, { ultimoNumero: proximoNumero });
      } else {
        // Incrementar atomicamente
        const ultimoNumero = contadorDoc.data()?.ultimoNumero || 0;
        proximoNumero = ultimoNumero + 1;

        transaction.update(contadorRef, { ultimoNumero: proximoNumero });
      }

      return proximoNumero;
    });
  },

  async create(data: Omit<Orcamento, 'id' | 'createdAt'>): Promise<Orcamento> {
    const orcamentoData = {
      ...data,
      createdAt: new Date(),
    };

    const docRef = await collection.add(orcamentoData);

    return {
      id: docRef.id,
      ...orcamentoData,
    } as Orcamento;
  },

  async update(id: string, data: Partial<Orcamento>): Promise<Orcamento> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await collection.doc(id).update(updateData);

    return this.findById(id);
  },

  async updateStatus(id: string, status: OrcamentoStatus, dataAceite?: Date): Promise<Orcamento> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (dataAceite) {
      updateData.dataAceite = dataAceite;
    }

    await collection.doc(id).update(updateData);

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    await collection.doc(id).delete();
  },

  async getEstatisticas(): Promise<{
    total: number;
    abertos: number;
    aceitos: number;
    recusados: number;
    expirados: number;
    valorTotalAceitos: number;
  }> {
    // Usar count aggregations em paralelo para melhor performance
    const [totalCount, abertosCount, aceitosCount, recusadosCount, expiradosCount] = await Promise.all([
      collection.count().get(),
      collection.where('status', '==', 'aberto').count().get(),
      collection.where('status', '==', 'aceito').count().get(),
      collection.where('status', '==', 'recusado').count().get(),
      collection.where('status', '==', 'expirado').count().get(),
    ]);

    // Para valorTotalAceitos, precisamos usar sum aggregation ou buscar os aceitos
    // O Firestore suporta sum aggregation a partir da versão mais recente
    const aceitosSnapshot = await collection
      .where('status', '==', 'aceito')
      .select('valorTotal')
      .get();

    let valorTotalAceitos = 0;
    aceitosSnapshot.docs.forEach(doc => {
      valorTotalAceitos += doc.data().valorTotal || 0;
    });

    return {
      total: totalCount.data().count,
      abertos: abertosCount.data().count,
      aceitos: aceitosCount.data().count,
      recusados: recusadosCount.data().count,
      expirados: expiradosCount.data().count,
      valorTotalAceitos,
    };
  },

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: OrcamentoStatus;
      clienteId?: string;
      busca?: string;
    }
  ): Promise<PaginatedResponse<Orcamento>> {
    // Se houver busca por texto, filtrar em memória (Firestore não suporta substring search)
    if (filters?.busca) {
      let query: FirebaseFirestore.Query = collection;
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.clienteId) {
        query = query.where('clienteId', '==', filters.clienteId);
      }
      query = query.orderBy('numero', 'desc');

      const snapshot = await query.get();
      let allDocs = snapshot.docs;

      const buscaLower = filters.busca.toLowerCase();
      allDocs = allDocs.filter(doc => {
        const data = doc.data();
        const clienteNome = (data.clienteNome || '').toLowerCase();
        const numero = (data.numero || '').toString();
        return clienteNome.includes(buscaLower) || numero.includes(buscaLower);
      });

      const total = allDocs.length;
      const offset = (page - 1) * limit;
      const paginatedDocs = allDocs.slice(offset, offset + limit);
      const items = paginatedDocs.map(mapDocToOrcamento);
      const hasMore = offset + limit < total;

      return { items, total, hasMore };
    }

    // Paginação otimizada com Firestore (sem busca de texto)
    const offset = (page - 1) * limit;

    // Construir query base com filtros
    let baseQuery: FirebaseFirestore.Query = collection;
    if (filters?.status) {
      baseQuery = baseQuery.where('status', '==', filters.status);
    }
    if (filters?.clienteId) {
      baseQuery = baseQuery.where('clienteId', '==', filters.clienteId);
    }
    baseQuery = baseQuery.orderBy('numero', 'desc');

    // Buscar total e dados em paralelo
    const [totalCount, dataSnapshot] = await Promise.all([
      this.count(filters),
      offset > 0
        ? baseQuery.limit(offset + limit).get()
        : baseQuery.limit(limit).get()
    ]);

    // Se offset > 0, pegar apenas os docs após o offset
    const docs = offset > 0
      ? dataSnapshot.docs.slice(offset)
      : dataSnapshot.docs;

    const items = docs.map(mapDocToOrcamento);
    const hasMore = offset + items.length < totalCount;

    return {
      items,
      total: totalCount,
      hasMore,
    };
  },

  async count(filters?: { status?: OrcamentoStatus; clienteId?: string }): Promise<number> {
    let query: FirebaseFirestore.Query = collection;

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters?.clienteId) {
      query = query.where('clienteId', '==', filters.clienteId);
    }

    // Usar count aggregation do Firestore (mais eficiente que buscar todos os docs)
    const countSnapshot = await query.count().get();
    return countSnapshot.data().count;
  },

  async getHistoricoCliente(clienteId: string, limitItems: number = 5): Promise<{
    orcamentos: Orcamento[];
    resumo: {
      total: number;
      aceitos: number;
      valorTotalAceitos: number;
    };
  }> {
    // Buscar os últimos N orçamentos do cliente com paginação real
    const [orcamentosSnapshot, totalCount, aceitosSnapshot] = await Promise.all([
      // Últimos N orçamentos ordenados por número
      collection
        .where('clienteId', '==', clienteId)
        .orderBy('numero', 'desc')
        .limit(limitItems)
        .get(),
      // Total de orçamentos do cliente
      collection.where('clienteId', '==', clienteId).count().get(),
      // Orçamentos aceitos para calcular valor total
      collection
        .where('clienteId', '==', clienteId)
        .where('status', '==', 'aceito')
        .select('valorTotal')
        .get(),
    ]);

    const orcamentos = orcamentosSnapshot.docs.map(mapDocToOrcamento);

    let valorTotalAceitos = 0;
    aceitosSnapshot.docs.forEach(doc => {
      valorTotalAceitos += doc.data().valorTotal || 0;
    });

    return {
      orcamentos,
      resumo: {
        total: totalCount.data().count,
        aceitos: aceitosSnapshot.size,
        valorTotalAceitos,
      },
    };
  },
};
