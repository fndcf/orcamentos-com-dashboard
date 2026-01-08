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
    const snapshot = await collection.get();

    const stats = {
      total: 0,
      abertos: 0,
      aceitos: 0,
      recusados: 0,
      expirados: 0,
      valorTotalAceitos: 0,
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.total++;

      switch (data.status) {
        case 'aberto':
          stats.abertos++;
          break;
        case 'aceito':
          stats.aceitos++;
          stats.valorTotalAceitos += data.valorTotal || 0;
          break;
        case 'recusado':
          stats.recusados++;
          break;
        case 'expirado':
          stats.expirados++;
          break;
      }
    });

    return stats;
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
    try {
      // Primeiro, contar o total de documentos com os filtros aplicados
      let countQuery: FirebaseFirestore.Query = collection;

      if (filters?.status) {
        countQuery = countQuery.where('status', '==', filters.status);
      }
      if (filters?.clienteId) {
        countQuery = countQuery.where('clienteId', '==', filters.clienteId);
      }

      const countSnapshot = await countQuery.get();
      let totalDocs = countSnapshot.docs;

      // Se houver busca por texto, filtrar manualmente
      if (filters?.busca) {
        const buscaLower = filters.busca.toLowerCase();
        totalDocs = totalDocs.filter(doc => {
          const data = doc.data();
          const clienteNome = (data.clienteNome || '').toLowerCase();
          const numero = (data.numero || '').toString();
          return clienteNome.includes(buscaLower) || numero.includes(buscaLower);
        });
      }

      const total = totalDocs.length;

      // Ordenar por número decrescente
      totalDocs.sort((a, b) => (b.data().numero || 0) - (a.data().numero || 0));

      // Aplicar paginação
      const offset = (page - 1) * limit;
      const paginatedDocs = totalDocs.slice(offset, offset + limit);

      const items = paginatedDocs.map(mapDocToOrcamento);
      const hasMore = offset + limit < total;

      return {
        items,
        total,
        hasMore,
      };
    } catch (error) {
      // Fallback: buscar todos e paginar manualmente
      const snapshot = await collection.get();
      let allDocs = snapshot.docs;

      // Aplicar filtros
      if (filters?.status) {
        allDocs = allDocs.filter(doc => doc.data().status === filters.status);
      }
      if (filters?.clienteId) {
        allDocs = allDocs.filter(doc => doc.data().clienteId === filters.clienteId);
      }
      if (filters?.busca) {
        const buscaLower = filters.busca.toLowerCase();
        allDocs = allDocs.filter(doc => {
          const data = doc.data();
          const clienteNome = (data.clienteNome || '').toLowerCase();
          const numero = (data.numero || '').toString();
          return clienteNome.includes(buscaLower) || numero.includes(buscaLower);
        });
      }

      const total = allDocs.length;

      // Ordenar por número decrescente
      allDocs.sort((a, b) => (b.data().numero || 0) - (a.data().numero || 0));

      // Aplicar paginação
      const offset = (page - 1) * limit;
      const paginatedDocs = allDocs.slice(offset, offset + limit);

      const items = paginatedDocs.map(mapDocToOrcamento);
      const hasMore = offset + limit < total;

      return {
        items,
        total,
        hasMore,
      };
    }
  },

  async count(filters?: { status?: OrcamentoStatus; clienteId?: string }): Promise<number> {
    let query: FirebaseFirestore.Query = collection;

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters?.clienteId) {
      query = query.where('clienteId', '==', filters.clienteId);
    }

    const snapshot = await query.get();
    return snapshot.size;
  },

  async getHistoricoCliente(clienteId: string, limit: number = 5): Promise<{
    orcamentos: Orcamento[];
    resumo: {
      total: number;
      aceitos: number;
      valorTotalAceitos: number;
    };
  }> {
    try {
      // Buscar todos os orçamentos do cliente para calcular resumo
      const snapshot = await collection
        .where('clienteId', '==', clienteId)
        .get();

      // Calcular resumo com todos os documentos
      let total = 0;
      let aceitos = 0;
      let valorTotalAceitos = 0;

      const allDocs = snapshot.docs.map(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'aceito') {
          aceitos++;
          valorTotalAceitos += data.valorTotal || 0;
        }
        return { doc, numero: data.numero || 0 };
      });

      // Ordenar por número decrescente e pegar apenas os últimos N
      allDocs.sort((a, b) => b.numero - a.numero);
      const limitedDocs = allDocs.slice(0, limit);

      const orcamentos = limitedDocs.map(({ doc }) => mapDocToOrcamento(doc));

      return {
        orcamentos,
        resumo: {
          total,
          aceitos,
          valorTotalAceitos,
        },
      };
    } catch {
      // Fallback
      const snapshot = await collection.where('clienteId', '==', clienteId).get();

      let total = 0;
      let aceitos = 0;
      let valorTotalAceitos = 0;

      const allDocs = snapshot.docs.map(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'aceito') {
          aceitos++;
          valorTotalAceitos += data.valorTotal || 0;
        }
        return { doc, numero: data.numero || 0 };
      });

      allDocs.sort((a, b) => b.numero - a.numero);
      const limitedDocs = allDocs.slice(0, limit);

      const orcamentos = limitedDocs.map(({ doc }) => mapDocToOrcamento(doc));

      return {
        orcamentos,
        resumo: {
          total,
          aceitos,
          valorTotalAceitos,
        },
      };
    }
  },
};
