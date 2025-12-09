import { db } from '../config/firebase';
import { ConfiguracoesGerais } from '../models';

const COLLECTION = 'configuracoes';
const DOC_ID = 'gerais';

// Valores padrão para as configurações
const defaultConfiguracoes: ConfiguracoesGerais = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: '',
  cnpjEmpresa: '',
  enderecoEmpresa: '',
  telefoneEmpresa: '',
  emailEmpresa: '',
  logoUrl: '',
};

export const configuracoesGeraisRepository = {
  async get(): Promise<ConfiguracoesGerais> {
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!doc.exists) {
      // Se não existir, cria com valores padrão
      await db.collection(COLLECTION).doc(DOC_ID).set(defaultConfiguracoes);
      return defaultConfiguracoes;
    }
    return doc.data() as ConfiguracoesGerais;
  },

  async update(data: Partial<ConfiguracoesGerais>): Promise<ConfiguracoesGerais> {
    const docRef = db.collection(COLLECTION).doc(DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Se não existir, cria com os dados fornecidos + valores padrão
      const newData = { ...defaultConfiguracoes, ...data };
      await docRef.set(newData);
      return newData;
    }

    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as ConfiguracoesGerais;
  },
};
