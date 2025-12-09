import api from './api';
import { ConfiguracoesGerais } from '../types';

export const configuracoesGeraisService = {
  async buscar(): Promise<ConfiguracoesGerais> {
    const response = await api.get('/configuracoes-gerais');
    return response.data;
  },

  async atualizar(data: Partial<ConfiguracoesGerais>): Promise<ConfiguracoesGerais> {
    const response = await api.put('/configuracoes-gerais', data);
    return response.data;
  },
};
