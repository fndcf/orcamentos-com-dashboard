import { palavraChaveRepository } from '../repositories/palavraChaveRepository';
import { PalavraChave } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export const palavraChaveService = {
  async listar(): Promise<PalavraChave[]> {
    return palavraChaveRepository.findAll();
  },

  async listarAtivas(): Promise<PalavraChave[]> {
    return palavraChaveRepository.findAtivas();
  },

  async buscarPorId(id: string): Promise<PalavraChave> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const palavraChave = await palavraChaveRepository.findById(id);
    if (!palavraChave) {
      throw new NotFoundError('Palavra-chave não encontrada');
    }

    return palavraChave;
  },

  async criar(data: { palavra: string; prazoDias: number; ativo?: boolean }): Promise<PalavraChave> {
    // Validações
    if (!data.palavra || data.palavra.trim().length < 2) {
      throw new ValidationError('Palavra-chave deve ter pelo menos 2 caracteres');
    }

    if (!data.prazoDias || data.prazoDias < 1) {
      throw new ValidationError('Prazo deve ser de pelo menos 1 dia');
    }

    if (data.prazoDias > 3650) {
      throw new ValidationError('Prazo não pode ser maior que 10 anos (3650 dias)');
    }

    // Verificar duplicidade
    const existente = await palavraChaveRepository.findByPalavra(data.palavra.trim());
    if (existente) {
      throw new AppError('Já existe uma palavra-chave com este termo', 409);
    }

    return palavraChaveRepository.create({
      palavra: data.palavra.trim(),
      prazoDias: data.prazoDias,
      ativo: data.ativo !== undefined ? data.ativo : true,
    });
  },

  async atualizar(
    id: string,
    data: { palavra?: string; prazoDias?: number; ativo?: boolean }
  ): Promise<PalavraChave> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    // Verificar se existe
    const existente = await palavraChaveRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Palavra-chave não encontrada');
    }

    // Validações
    if (data.palavra !== undefined) {
      if (data.palavra.trim().length < 2) {
        throw new ValidationError('Palavra-chave deve ter pelo menos 2 caracteres');
      }

      // Verificar duplicidade se estiver alterando a palavra
      if (data.palavra.toLowerCase() !== existente.palavra.toLowerCase()) {
        const duplicada = await palavraChaveRepository.findByPalavra(data.palavra.trim());
        if (duplicada) {
          throw new AppError('Já existe uma palavra-chave com este termo', 409);
        }
      }
    }

    if (data.prazoDias !== undefined) {
      if (data.prazoDias < 1) {
        throw new ValidationError('Prazo deve ser de pelo menos 1 dia');
      }
      if (data.prazoDias > 3650) {
        throw new ValidationError('Prazo não pode ser maior que 10 anos (3650 dias)');
      }
    }

    const updated = await palavraChaveRepository.update(id, {
      ...(data.palavra !== undefined && { palavra: data.palavra.trim() }),
      ...(data.prazoDias !== undefined && { prazoDias: data.prazoDias }),
      ...(data.ativo !== undefined && { ativo: data.ativo }),
    });

    if (!updated) {
      throw new AppError('Erro ao atualizar palavra-chave', 500);
    }

    return updated;
  },

  async excluir(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await palavraChaveRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Palavra-chave não encontrada');
    }

    const deleted = await palavraChaveRepository.delete(id);
    if (!deleted) {
      throw new AppError('Erro ao excluir palavra-chave', 500);
    }
  },

  async toggleAtivo(id: string): Promise<PalavraChave> {
    const existente = await this.buscarPorId(id);
    return this.atualizar(id, { ativo: !existente.ativo });
  },
};
