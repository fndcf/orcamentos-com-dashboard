import { itemServicoRepository } from '../repositories/itemServicoRepository';
import { categoriaItemRepository } from '../repositories/categoriaItemRepository';
import { historicoValoresRepository } from '../repositories/historicoValoresRepository';
import { ItemServico } from '../models';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';

// Função auxiliar para verificar se os valores mudaram
function valoresMudaram(
  existente: ItemServico,
  novosValores: {
    valorUnitario?: number;
    valorMaoDeObraUnitario?: number;
    valorCusto?: number;
    valorMaoDeObraCusto?: number;
  }
): boolean {
  if (novosValores.valorUnitario !== undefined && novosValores.valorUnitario !== (existente.valorUnitario || 0)) {
    return true;
  }
  if (novosValores.valorMaoDeObraUnitario !== undefined && novosValores.valorMaoDeObraUnitario !== (existente.valorMaoDeObraUnitario || 0)) {
    return true;
  }
  if (novosValores.valorCusto !== undefined && novosValores.valorCusto !== (existente.valorCusto || 0)) {
    return true;
  }
  if (novosValores.valorMaoDeObraCusto !== undefined && novosValores.valorMaoDeObraCusto !== (existente.valorMaoDeObraCusto || 0)) {
    return true;
  }
  return false;
}

export const itemServicoService = {
  async listar(): Promise<ItemServico[]> {
    return itemServicoRepository.findAll();
  },

  async listarPorCategoria(categoriaId: string): Promise<ItemServico[]> {
    if (!categoriaId) {
      throw new ValidationError('ID da categoria é obrigatório');
    }

    const categoria = await categoriaItemRepository.findById(categoriaId);
    if (!categoria) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return itemServicoRepository.findByCategoria(categoriaId);
  },

  async listarAtivosPorCategoria(categoriaId: string): Promise<ItemServico[]> {
    if (!categoriaId) {
      throw new ValidationError('ID da categoria é obrigatório');
    }

    return itemServicoRepository.findAtivosByCategoria(categoriaId);
  },

  async listarAtivosPorCategoriaPaginado(
    categoriaId: string,
    limit: number = 10,
    cursor?: string,
    search?: string
  ): Promise<{ itens: ItemServico[]; nextCursor?: string; hasMore: boolean; total: number }> {
    if (!categoriaId) {
      throw new ValidationError('ID da categoria é obrigatório');
    }

    return itemServicoRepository.findAtivosByCategoriaPaginado(categoriaId, limit, cursor, search);
  },

  async listarPorCategoriaPaginado(
    categoriaId: string,
    limit: number = 10,
    cursor?: string,
    search?: string
  ): Promise<{ itens: ItemServico[]; nextCursor?: string; hasMore: boolean; total: number }> {
    if (!categoriaId) {
      throw new ValidationError('ID da categoria é obrigatório');
    }

    const categoria = await categoriaItemRepository.findById(categoriaId);
    if (!categoria) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return itemServicoRepository.findByCategoriaPaginado(categoriaId, limit, cursor, search);
  },

  async buscarPorId(id: string): Promise<ItemServico> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const item = await itemServicoRepository.findById(id);
    if (!item) {
      throw new NotFoundError('Item de serviço não encontrado');
    }

    return item;
  },

  async criar(data: {
    categoriaId: string;
    descricao: string;
    unidade: string;
    ativo?: boolean;
    valorUnitario?: number;
    valorMaoDeObraUnitario?: number;
    valorCusto?: number;
    valorMaoDeObraCusto?: number;
  }): Promise<ItemServico> {
    if (!data.categoriaId) {
      throw new ValidationError('ID da categoria é obrigatório');
    }

    if (!data.descricao || data.descricao.trim().length < 5) {
      throw new ValidationError('Descrição deve ter pelo menos 5 caracteres');
    }

    if (!data.unidade || data.unidade.trim().length < 1) {
      throw new ValidationError('Unidade é obrigatória');
    }

    const categoria = await categoriaItemRepository.findById(data.categoriaId);
    if (!categoria) {
      throw new NotFoundError('Categoria não encontrada');
    }

    // Verificar se já existe um item com a mesma descrição nesta categoria
    const existente = await itemServicoRepository.findByDescricaoInCategoria(data.descricao.trim(), data.categoriaId);
    if (existente) {
      throw new AppError('Já existe um item com esta descrição nesta categoria', 409);
    }

    const ordem = await itemServicoRepository.getNextOrdem(data.categoriaId);

    // Montar objeto apenas com campos definidos (Firestore não aceita undefined)
    const itemData: Omit<ItemServico, 'id' | 'createdAt'> = {
      categoriaId: data.categoriaId,
      descricao: data.descricao.trim(),
      unidade: data.unidade.trim().toUpperCase(),
      ativo: data.ativo !== undefined ? data.ativo : true,
      ordem,
    };

    // Adicionar valores apenas se definidos
    if (data.valorUnitario !== undefined) itemData.valorUnitario = data.valorUnitario;
    if (data.valorMaoDeObraUnitario !== undefined) itemData.valorMaoDeObraUnitario = data.valorMaoDeObraUnitario;
    if (data.valorCusto !== undefined) itemData.valorCusto = data.valorCusto;
    if (data.valorMaoDeObraCusto !== undefined) itemData.valorMaoDeObraCusto = data.valorMaoDeObraCusto;

    const created = await itemServicoRepository.create(itemData);

    // Salvar primeiro registro de histórico se houver valores definidos
    const temValores =
      data.valorUnitario !== undefined ||
      data.valorMaoDeObraUnitario !== undefined ||
      data.valorCusto !== undefined ||
      data.valorMaoDeObraCusto !== undefined;

    if (temValores && created.id) {
      await historicoValoresRepository.salvarHistoricoItem({
        itemServicoId: created.id,
        descricao: created.descricao,
        dataVigencia: new Date(),
        valorUnitario: data.valorUnitario || 0,
        valorMaoDeObraUnitario: data.valorMaoDeObraUnitario || 0,
        valorCusto: data.valorCusto || 0,
        valorMaoDeObraCusto: data.valorMaoDeObraCusto || 0,
      });
    }

    return created;
  },

  async atualizar(
    id: string,
    data: {
      descricao?: string;
      unidade?: string;
      ativo?: boolean;
      ordem?: number;
      valorUnitario?: number;
      valorMaoDeObraUnitario?: number;
      valorCusto?: number;
      valorMaoDeObraCusto?: number;
    }
  ): Promise<ItemServico> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await itemServicoRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Item de serviço não encontrado');
    }

    if (data.descricao !== undefined && data.descricao.trim().length < 5) {
      throw new ValidationError('Descrição deve ter pelo menos 5 caracteres');
    }

    if (data.unidade !== undefined && data.unidade.trim().length < 1) {
      throw new ValidationError('Unidade é obrigatória');
    }

    // Verificar se a nova descrição já existe em outro item da mesma categoria
    if (data.descricao !== undefined) {
      const duplicado = await itemServicoRepository.findByDescricaoInCategoria(data.descricao.trim(), existente.categoriaId);
      if (duplicado && duplicado.id !== id) {
        throw new AppError('Já existe um item com esta descrição nesta categoria', 409);
      }
    }

    const updateData: Partial<ItemServico> = {};
    if (data.descricao !== undefined) updateData.descricao = data.descricao.trim();
    if (data.unidade !== undefined) updateData.unidade = data.unidade.trim().toUpperCase();
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.ordem !== undefined) updateData.ordem = data.ordem;
    if (data.valorUnitario !== undefined) updateData.valorUnitario = data.valorUnitario;
    if (data.valorMaoDeObraUnitario !== undefined) updateData.valorMaoDeObraUnitario = data.valorMaoDeObraUnitario;
    if (data.valorCusto !== undefined) updateData.valorCusto = data.valorCusto;
    if (data.valorMaoDeObraCusto !== undefined) updateData.valorMaoDeObraCusto = data.valorMaoDeObraCusto;

    // Verificar se os valores mudaram para salvar histórico
    const deveSalvarHistorico = valoresMudaram(existente, data);

    const updated = await itemServicoRepository.update(id, updateData);
    if (!updated) {
      throw new Error('Erro ao atualizar item de serviço');
    }

    // Salvar histórico se os valores mudaram
    if (deveSalvarHistorico) {
      await historicoValoresRepository.salvarHistoricoItem({
        itemServicoId: id,
        descricao: updated.descricao,
        dataVigencia: new Date(),
        valorUnitario: updated.valorUnitario || 0,
        valorMaoDeObraUnitario: updated.valorMaoDeObraUnitario || 0,
        valorCusto: updated.valorCusto || 0,
        valorMaoDeObraCusto: updated.valorMaoDeObraCusto || 0,
      });
    }

    return updated;
  },

  async excluir(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const existente = await itemServicoRepository.findById(id);
    if (!existente) {
      throw new NotFoundError('Item de serviço não encontrado');
    }

    await itemServicoRepository.delete(id);
  },

  async toggleAtivo(id: string): Promise<ItemServico> {
    const existente = await this.buscarPorId(id);
    return this.atualizar(id, { ativo: !existente.ativo });
  },
};
