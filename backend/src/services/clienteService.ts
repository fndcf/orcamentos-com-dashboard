import { Cliente, PaginatedResponse } from '../models';
import { clienteRepository } from '../repositories/clienteRepository';
import { ValidationError } from '../utils/errors';

export const clienteService = {
  async listar(): Promise<Cliente[]> {
    return clienteRepository.findAll();
  },

  async listarPaginado(
    page: number = 1,
    limit: number = 10,
    filters?: {
      busca?: string;
    }
  ): Promise<PaginatedResponse<Cliente>> {
    return clienteRepository.findPaginated(page, limit, filters);
  },

  async buscarPorId(id: string): Promise<Cliente> {
    return clienteRepository.findById(id);
  },

  async buscarPorDocumento(documento: string): Promise<Cliente | null> {
    return clienteRepository.findByDocumento(documento);
  },

  async pesquisar(termo: string): Promise<Cliente[]> {
    if (!termo || termo.length < 2) {
      return [];
    }
    return clienteRepository.search(termo);
  },

  async criar(data: Omit<Cliente, 'id' | 'createdAt'>): Promise<Cliente> {
    // Validações
    if (!data.razaoSocial || data.razaoSocial.trim().length < 3) {
      throw new ValidationError('Nome/Razão social deve ter pelo menos 3 caracteres');
    }

    const docLimpo = data.cnpj?.replace(/\D/g, '') || '';

    // Se documento foi informado, validar
    if (docLimpo) {
      // Validar CPF (11 dígitos) ou CNPJ (14 dígitos)
      if (docLimpo.length !== 11 && docLimpo.length !== 14) {
        throw new ValidationError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }

      // Verificar se já existe cliente com este documento
      const existente = await clienteRepository.findByDocumento(docLimpo);
      if (existente) {
        throw new ValidationError('Já existe um cliente cadastrado com este CPF/CNPJ');
      }
    } else if (data.tipoPessoa === 'juridica') {
      // CNPJ é obrigatório para pessoa jurídica
      throw new ValidationError('CNPJ é obrigatório para pessoa jurídica');
    }

    return clienteRepository.create(data);
  },

  async atualizar(id: string, data: Partial<Cliente>): Promise<Cliente> {
    if (data.razaoSocial && data.razaoSocial.trim().length < 3) {
      throw new ValidationError('Nome/Razão social deve ter pelo menos 3 caracteres');
    }

    if (data.cnpj) {
      const docLimpo = data.cnpj.replace(/\D/g, '');

      // Se documento foi informado, validar formato
      if (docLimpo && docLimpo.length !== 11 && docLimpo.length !== 14) {
        throw new ValidationError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }

      // Verificar se já existe outro cliente com este documento
      if (docLimpo) {
        const existente = await clienteRepository.findByDocumento(docLimpo);
        if (existente && existente.id !== id) {
          throw new ValidationError('Já existe outro cliente cadastrado com este CPF/CNPJ');
        }
      }
    }

    // Se está mudando para pessoa jurídica, CNPJ é obrigatório
    if (data.tipoPessoa === 'juridica') {
      const docLimpo = data.cnpj?.replace(/\D/g, '') || '';
      if (!docLimpo || docLimpo.length !== 14) {
        throw new ValidationError('CNPJ é obrigatório para pessoa jurídica');
      }
    }

    return clienteRepository.update(id, data);
  },

  async excluir(id: string): Promise<void> {
    return clienteRepository.delete(id);
  },
};
