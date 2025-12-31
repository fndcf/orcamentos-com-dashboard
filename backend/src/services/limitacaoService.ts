import { limitacaoRepository } from '../repositories/limitacaoRepository';
import { Limitacao } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export const limitacaoService = {
  async listar(): Promise<Limitacao[]> {
    return limitacaoRepository.findAll();
  },

  async listarAtivas(): Promise<Limitacao[]> {
    return limitacaoRepository.findAtivas();
  },

  async buscarPorId(id: string): Promise<Limitacao> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const limitacao = await limitacaoRepository.findById(id);
    if (!limitacao) {
      throw new NotFoundError('Limitação não encontrada');
    }

    return limitacao;
  },

  async buscarPorIds(ids: string[]): Promise<Limitacao[]> {
    return limitacaoRepository.findByIds(ids);
  },

  async criar(data: { texto: string; ativo?: boolean }): Promise<Limitacao> {
    if (!data.texto || data.texto.trim().length < 20) {
      throw new ValidationError('Texto deve ter pelo menos 20 caracteres');
    }

    if (data.texto.length > 1000) {
      throw new ValidationError('Texto deve ter no máximo 1000 caracteres');
    }

    // Verificar se já existe uma limitação com o mesmo texto
    const existente = await limitacaoRepository.findByTexto(data.texto.trim());
    if (existente) {
      throw new AppError('Já existe uma limitação com este texto', 409);
    }

    const ordem = await limitacaoRepository.getNextOrdem();

    return limitacaoRepository.create({
      texto: data.texto.trim(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    });
  },

  async atualizar(
    id: string,
    data: { texto?: string; ativo?: boolean; ordem?: number }
  ): Promise<Limitacao> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await limitacaoRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Limitação não encontrada');
    }

    if (data.texto !== undefined && data.texto.trim().length < 20) {
      throw new ValidationError('Texto deve ter pelo menos 20 caracteres');
    }

    if (data.texto !== undefined && data.texto.length > 1000) {
      throw new ValidationError('Texto deve ter no máximo 1000 caracteres');
    }

    // Verificar se o novo texto já existe em outra limitação
    if (data.texto !== undefined) {
      const duplicado = await limitacaoRepository.findByTexto(data.texto.trim());
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe uma limitação com este texto', 409);
      }
    }

    const updateData: Partial<Limitacao> = {};
    if (data.texto !== undefined) updateData.texto = data.texto.trim();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;

    const updated = await limitacaoRepository.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar limitação');
    }

    return updated;
  },

  async excluir(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await limitacaoRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Limitação não encontrada');
    }

    await limitacaoRepository.delete(id);
  },

  async toggleAtivo(id: string): Promise<Limitacao> {
    const existente = await this.buscarPorId(id);
    return this.atualizar(id, { ativo: !existente.ativo });
  },
};
