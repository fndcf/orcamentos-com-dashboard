import { db } from '../config/firebase';
import { Cliente } from '../models';
import { COLLECTIONS } from '../utils/constants';
import { NotFoundError } from '../utils/errors';

const collection = db.collection(COLLECTIONS.CLIENTES);

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
};
