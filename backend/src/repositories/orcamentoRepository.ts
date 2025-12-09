import { db } from '../config/firebase';
import { Orcamento, OrcamentoStatus } from '../models';
import { COLLECTIONS } from '../utils/constants';
import { NotFoundError } from '../utils/errors';

const collection = db.collection(COLLECTIONS.ORCAMENTOS);

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
    try {
      const snapshot = await collection.orderBy('numero', 'desc').limit(1).get();

      if (snapshot.empty) {
        return 1;
      }

      return (snapshot.docs[0].data().numero || 0) + 1;
    } catch {
      // Se der erro na query (ex: índice não existe), buscar todos e calcular
      const allDocs = await collection.get();
      if (allDocs.empty) {
        return 1;
      }

      let maxNumero = 0;
      allDocs.docs.forEach(doc => {
        const numero = doc.data().numero || 0;
        if (numero > maxNumero) {
          maxNumero = numero;
        }
      });

      return maxNumero + 1;
    }
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
};
