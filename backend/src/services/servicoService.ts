import { servicoRepository } from '../repositories/servicoRepository';
import { Servico } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export const servicoService = {
  async listar(): Promise<Servico[]> {
    return servicoRepository.findAll();
  },

  async listarAtivos(): Promise<Servico[]> {
    return servicoRepository.findAtivos();
  },

  async buscarPorId(id: string): Promise<Servico> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const servico = await servicoRepository.findById(id);
    if (!servico) {
      throw new NotFoundError('Serviço não encontrado');
    }

    return servico;
  },

  async criar(data: { descricao: string; ativo?: boolean }): Promise<Servico> {
    if (!data.descricao || data.descricao.trim().length < 10) {
      throw new ValidationError('Descrição deve ter pelo menos 10 caracteres');
    }

    // Verificar se já existe um serviço com a mesma descrição
    const existente = await servicoRepository.findByDescricao(data.descricao.trim());
    if (existente) {
      throw new AppError('Já existe um serviço com esta descrição', 409);
    }

    const ordem = await servicoRepository.getNextOrdem();

    return servicoRepository.create({
      descricao: data.descricao.trim(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    });
  },

  async atualizar(
    id: string,
    data: { descricao?: string; ativo?: boolean; ordem?: number }
  ): Promise<Servico> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await servicoRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Serviço não encontrado');
    }

    if (data.descricao !== undefined && data.descricao.trim().length < 10) {
      throw new ValidationError('Descrição deve ter pelo menos 10 caracteres');
    }

    // Verificar se a nova descrição já existe em outro registro
    if (data.descricao !== undefined) {
      const duplicado = await servicoRepository.findByDescricao(data.descricao.trim());
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe um serviço com esta descrição', 409);
      }
    }

    const updateData: Partial<Servico> = {};
    if (data.descricao !== undefined) updateData.descricao = data.descricao.trim();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;

    const updated = await servicoRepository.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar serviço');
    }

    return updated;
  },

  async excluir(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await servicoRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Serviço não encontrado');
    }

    await servicoRepository.delete(id);
  },

  async toggleAtivo(id: string): Promise<Servico> {
    const existente = await this.buscarPorId(id);
    return this.atualizar(id, { ativo: !existente.ativo });
  },
};
