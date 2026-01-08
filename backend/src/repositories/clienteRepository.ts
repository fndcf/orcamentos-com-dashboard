import { db } from '../config/firebase';
import { Cliente, PaginatedResponse } from '../models';
import { COLLECTIONS } from '../utils/constants';
import { NotFoundError } from '../utils/errors';

const collection = db.collection(COLLECTIONS.CLIENTES);

// Helper para mapear documento do Firestore para Cliente
function mapDocToCliente(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): Cliente {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  } as Cliente;
}

export const clienteRepository = {
  async findAll(): Promise<Cliente[]> {
    const snapshot = await collection.orderBy('razaoSocial').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Cliente[];
  },

  async findById(id: string): Promise<Cliente> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as Cliente;
  },

  async findByDocumento(documento: string): Promise<Cliente | null> {
    const docLimpo = documento.replace(/\D/g, '');
    const snapshot = await collection.where('cnpj', '==', docLimpo).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Cliente;
  },

  async search(termo: string): Promise<Cliente[]> {
    // Busca por razão social (case insensitive usando range query)
    const termoUpper = termo.toUpperCase();
    const snapshot = await collection
      .orderBy('razaoSocialUpper')
      .startAt(termoUpper)
      .endAt(termoUpper + '\uf8ff')
      .limit(10)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Cliente[];
  },

  async create(data: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> {
    const cleanCnpj = data.cnpj?.replace(/\D/g, '') || '';

    const clienteData = {
      ...data,
      cnpj: cleanCnpj,
      razaoSocialUpper: data.razaoSocial.toUpperCase(),
      createdAt: new Date(),
    };

    const docRef = await collection.add(clienteData);

    return {
      id: docRef.id,
      ...clienteData,
    } as Cliente;
  },

  async update(id: string, data: Partial<Cliente>): Promise<Cliente> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.cnpj) {
      updateData.cnpj = data.cnpj.replace(/\D/g, '');
    }

    if (data.razaoSocial) {
      updateData.razaoSocialUpper = data.razaoSocial.toUpperCase();
    }

    await collection.doc(id).update(updateData);

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError('Cliente não encontrado');
    }

    await collection.doc(id).delete();
  },

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      busca?: string;
    }
  ): Promise<PaginatedResponse<Cliente>> {
    // Buscar todos os documentos
    const snapshot = await collection.get();
    let allDocs = snapshot.docs;

    // Se houver busca por texto, filtrar manualmente
    if (filters?.busca) {
      const buscaLower = filters.busca.toLowerCase();
      allDocs = allDocs.filter(doc => {
        const data = doc.data();
        const razaoSocial = (data.razaoSocial || '').toLowerCase();
        const nomeFantasia = (data.nomeFantasia || '').toLowerCase();
        const cnpj = (data.cnpj || '').replace(/\D/g, '');
        const buscaLimpa = buscaLower.replace(/\D/g, '');

        return razaoSocial.includes(buscaLower) ||
               nomeFantasia.includes(buscaLower) ||
               (buscaLimpa && cnpj.includes(buscaLimpa));
      });
    }

    const total = allDocs.length;

    // Ordenar por razão social
    allDocs.sort((a, b) => {
      const razaoA = (a.data().razaoSocial || '').toLowerCase();
      const razaoB = (b.data().razaoSocial || '').toLowerCase();
      return razaoA.localeCompare(razaoB);
    });

    // Aplicar paginação
    const offset = (page - 1) * limit;
    const paginatedDocs = allDocs.slice(offset, offset + limit);

    const items = paginatedDocs.map(mapDocToCliente);
    const hasMore = offset + limit < total;

    return {
      items,
      total,
      hasMore,
    };
  },

  async count(): Promise<number> {
    const snapshot = await collection.get();
    return snapshot.size;
  },
};
