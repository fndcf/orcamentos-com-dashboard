import { categoriaItemRepository } from '../repositories/categoriaItemRepository';
import { CategoriaItem } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

export const categoriaItemService = {
  async listar(): Promise<CategoriaItem[]> {
    return categoriaItemRepository.findAll();
  },

  async listarAtivas(): Promise<CategoriaItem[]> {
    return categoriaItemRepository.findAtivas();
  },

  async buscarPorId(id: string): Promise<CategoriaItem> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const categoria = await categoriaItemRepository.findById(id);
    if (!categoria) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return categoria;
  },

  async criar(data: { nome: string; ativo?: boolean }): Promise<CategoriaItem> {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existente = await categoriaItemRepository.findByNome(data.nome.trim());
    if (existente) {
      throw new AppError('Já existe uma categoria com este nome', 409);
    }

    const ordem = await categoriaItemRepository.getNextOrdem();

    return categoriaItemRepository.create({
      nome: data.nome.trim(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    });
  },

  async atualizar(
    id: string,
    data: { nome?: string; ativo?: boolean; ordem?: number }
  ): Promise<CategoriaItem> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await categoriaItemRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (data.nome !== undefined && data.nome.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    // Verificar se o novo nome já existe em outra categoria
    if (data.nome !== undefined) {
      const duplicado = await categoriaItemRepository.findByNome(data.nome.trim());
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe uma categoria com este nome', 409);
      }
    }

    const updateData: Partial<CategoriaItem> = {};
    if (data.nome !== undefined) updateData.nome = data.nome.trim();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;

    const updated = await categoriaItemRepository.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar categoria');
    }

    return updated;
  },

  async excluir(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await categoriaItemRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Categoria não encontrada');
    }

    await categoriaItemRepository.delete(id);
  },

  async toggleAtivo(id: string): Promise<CategoriaItem> {
    const existente = await this.buscarPorId(id);
    return this.atualizar(id, { ativo: !existente.ativo });
  },
};
