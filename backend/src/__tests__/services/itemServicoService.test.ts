import { itemServicoService } from '../../services/itemServicoService';
import { itemServicoRepository } from '../../repositories/itemServicoRepository';
import { categoriaItemRepository } from '../../repositories/categoriaItemRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { ItemServico, CategoriaItem } from '../../models';

// Mock dos repositories
jest.mock('../../repositories/itemServicoRepository');
jest.mock('../../repositories/categoriaItemRepository');
jest.mock('../../repositories/historicoValoresRepository', () => ({
  historicoValoresRepository: {
    salvarHistoricoItem: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('itemServicoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategoria: CategoriaItem = {
    id: 'cat1',
    nome: 'Bomba de Incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  const mockItemServico: ItemServico = {
    id: '1',
    categoriaId: 'cat1',
    descricao: 'Fornecimento e instalação de bomba centrífuga',
    unidade: 'UN',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de itens de serviço', async () => {
      const itens = [mockItemServico, { ...mockItemServico, id: '2', descricao: 'Outro item de serviço' }];
      (itemServicoRepository.findAll as jest.Mock).mockResolvedValue(itens);

      const resultado = await itemServicoService.listar();

      expect(itemServicoRepository.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(itens);
    });
  });

  describe('listarPorCategoria', () => {
    it('deve retornar itens de uma categoria específica', async () => {
      const itens = [mockItemServico];
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByCategoria as jest.Mock).mockResolvedValue(itens);

      const resultado = await itemServicoService.listarPorCategoria('cat1');

      expect(categoriaItemRepository.findById).toHaveBeenCalledWith('cat1');
      expect(itemServicoRepository.findByCategoria).toHaveBeenCalledWith('cat1');
      expect(resultado).toEqual(itens);
    });

    it('deve lançar ValidationError quando categoriaId não for fornecido', async () => {
      await expect(itemServicoService.listarPorCategoria('')).rejects.toThrow(ValidationError);
      await expect(itemServicoService.listarPorCategoria('')).rejects.toThrow('ID da categoria é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.listarPorCategoria('inexistente')).rejects.toThrow(NotFoundError);
      await expect(itemServicoService.listarPorCategoria('inexistente')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('listarAtivosPorCategoria', () => {
    it('deve retornar apenas itens ativos de uma categoria', async () => {
      const itensAtivos = [mockItemServico];
      (itemServicoRepository.findAtivosByCategoria as jest.Mock).mockResolvedValue(itensAtivos);

      const resultado = await itemServicoService.listarAtivosPorCategoria('cat1');

      expect(itemServicoRepository.findAtivosByCategoria).toHaveBeenCalledWith('cat1');
      expect(resultado).toEqual(itensAtivos);
    });

    it('deve lançar ValidationError quando categoriaId não for fornecido', async () => {
      await expect(itemServicoService.listarAtivosPorCategoria('')).rejects.toThrow(ValidationError);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar item por ID', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);

      const resultado = await itemServicoService.buscarPorId('1');

      expect(itemServicoRepository.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockItemServico);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(itemServicoService.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(itemServicoService.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando item não existir', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(itemServicoService.buscarPorId('inexistente')).rejects.toThrow('Item de serviço não encontrado');
    });
  });

  describe('criar', () => {
    it('deve criar item de serviço com sucesso', async () => {
      const dados = { categoriaId: 'cat1', descricao: 'Fornecimento e instalação de bomba centrífuga', unidade: 'un' };
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(null);
      (itemServicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (itemServicoRepository.create as jest.Mock).mockResolvedValue(mockItemServico);

      const resultado = await itemServicoService.criar(dados);

      expect(categoriaItemRepository.findById).toHaveBeenCalledWith('cat1');
      expect(itemServicoRepository.findByDescricaoInCategoria).toHaveBeenCalledWith(dados.descricao, 'cat1');
      expect(itemServicoRepository.create).toHaveBeenCalledWith({
        categoriaId: 'cat1',
        descricao: dados.descricao,
        unidade: 'UN',
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockItemServico);
    });

    it('deve criar item inativo quando especificado', async () => {
      const dados = { categoriaId: 'cat1', descricao: 'Fornecimento e instalação', unidade: 'UN', ativo: false };
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(null);
      (itemServicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (itemServicoRepository.create as jest.Mock).mockResolvedValue({ ...mockItemServico, ativo: false });

      await itemServicoService.criar(dados);

      expect(itemServicoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ativo: false })
      );
    });

    it('deve lançar ValidationError quando categoriaId não for fornecido', async () => {
      await expect(
        itemServicoService.criar({ categoriaId: '', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow(ValidationError);
      await expect(
        itemServicoService.criar({ categoriaId: '', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow('ID da categoria é obrigatório');
    });

    it('deve lançar ValidationError quando descrição for muito curta', async () => {
      await expect(
        itemServicoService.criar({ categoriaId: 'cat1', descricao: 'ABC', unidade: 'UN' })
      ).rejects.toThrow(ValidationError);
      await expect(
        itemServicoService.criar({ categoriaId: 'cat1', descricao: 'ABC', unidade: 'UN' })
      ).rejects.toThrow('Descrição deve ter pelo menos 5 caracteres');
    });

    it('deve lançar ValidationError quando unidade for vazia', async () => {
      await expect(
        itemServicoService.criar({ categoriaId: 'cat1', descricao: 'Descrição válida', unidade: '' })
      ).rejects.toThrow(ValidationError);
      await expect(
        itemServicoService.criar({ categoriaId: 'cat1', descricao: 'Descrição válida', unidade: '' })
      ).rejects.toThrow('Unidade é obrigatória');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        itemServicoService.criar({ categoriaId: 'inexistente', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow(NotFoundError);
      await expect(
        itemServicoService.criar({ categoriaId: 'inexistente', descricao: 'Descrição válida', unidade: 'UN' })
      ).rejects.toThrow('Categoria não encontrada');
    });

    it('deve lançar AppError quando descrição já existir na categoria', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(mockItemServico);

      await expect(
        itemServicoService.criar({ categoriaId: 'cat1', descricao: 'Fornecimento e instalação de bomba centrífuga', unidade: 'UN' })
      ).rejects.toThrow(AppError);
      await expect(
        itemServicoService.criar({ categoriaId: 'cat1', descricao: 'Fornecimento e instalação de bomba centrífuga', unidade: 'UN' })
      ).rejects.toThrow('Já existe um item com esta descrição nesta categoria');
    });

    it('deve converter unidade para maiúsculas', async () => {
      const dados = { categoriaId: 'cat1', descricao: 'Descrição de teste válida', unidade: 'un' };
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(null);
      (itemServicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (itemServicoRepository.create as jest.Mock).mockResolvedValue(mockItemServico);

      await itemServicoService.criar(dados);

      expect(itemServicoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ unidade: 'UN' })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar item com sucesso', async () => {
      const dados = { descricao: 'Descrição atualizada do item' };
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(null);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue({ ...mockItemServico, ...dados });

      const resultado = await itemServicoService.atualizar('1', dados);

      expect(itemServicoRepository.findById).toHaveBeenCalledWith('1');
      expect(itemServicoRepository.update).toHaveBeenCalledWith('1', { descricao: dados.descricao });
      expect(resultado.descricao).toBe(dados.descricao);
    });

    it('deve atualizar apenas a unidade', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue({ ...mockItemServico, unidade: 'M2' });

      await itemServicoService.atualizar('1', { unidade: 'm2' });

      expect(itemServicoRepository.update).toHaveBeenCalledWith('1', { unidade: 'M2' });
    });

    it('deve atualizar apenas o status ativo', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue({ ...mockItemServico, ativo: false });

      await itemServicoService.atualizar('1', { ativo: false });

      expect(itemServicoRepository.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(itemServicoService.atualizar('', { descricao: 'Teste válido' })).rejects.toThrow(ValidationError);
      await expect(itemServicoService.atualizar('', { descricao: 'Teste válido' })).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando item não existir', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.atualizar('inexistente', { descricao: 'Teste válido' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('deve lançar ValidationError quando nova descrição for muito curta', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);

      await expect(itemServicoService.atualizar('1', { descricao: 'ABC' })).rejects.toThrow(ValidationError);
      await expect(itemServicoService.atualizar('1', { descricao: 'ABC' })).rejects.toThrow(
        'Descrição deve ter pelo menos 5 caracteres'
      );
    });

    it('deve lançar ValidationError quando nova unidade for vazia', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);

      await expect(itemServicoService.atualizar('1', { unidade: '' })).rejects.toThrow(ValidationError);
      await expect(itemServicoService.atualizar('1', { unidade: '' })).rejects.toThrow('Unidade é obrigatória');
    });

    it('deve lançar AppError quando nova descrição já existir em outro item da categoria', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue({
        ...mockItemServico,
        id: '2',
        descricao: 'Outro item existente',
      });

      await expect(itemServicoService.atualizar('1', { descricao: 'Outro item existente' })).rejects.toThrow(AppError);
      await expect(itemServicoService.atualizar('1', { descricao: 'Outro item existente' })).rejects.toThrow(
        'Já existe um item com esta descrição nesta categoria'
      );
    });

    it('deve permitir atualizar mantendo a mesma descrição', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue(mockItemServico);

      await itemServicoService.atualizar('1', { descricao: mockItemServico.descricao });

      expect(itemServicoRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.atualizar('1', { ativo: false })).rejects.toThrow(
        'Erro ao atualizar item de serviço'
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir item com sucesso', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.delete as jest.Mock).mockResolvedValue(true);

      await expect(itemServicoService.excluir('1')).resolves.not.toThrow();

      expect(itemServicoRepository.findById).toHaveBeenCalledWith('1');
      expect(itemServicoRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(itemServicoService.excluir('')).rejects.toThrow(ValidationError);
      await expect(itemServicoService.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando item não existir', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(itemServicoService.excluir('inexistente')).rejects.toThrow('Item de serviço não encontrado');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(mockItemServico);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue({ ...mockItemServico, ativo: false });

      const resultado = await itemServicoService.toggleAtivo('1');

      expect(itemServicoRepository.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue({ ...mockItemServico, ativo: false });
      (itemServicoRepository.update as jest.Mock).mockResolvedValue({ ...mockItemServico, ativo: true });

      const resultado = await itemServicoService.toggleAtivo('1');

      expect(itemServicoRepository.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando item não existir', async () => {
      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });

  describe('listarAtivosPorCategoriaPaginado', () => {
    it('deve retornar itens ativos paginados de uma categoria', async () => {
      const mockResult = {
        itens: [mockItemServico],
        nextCursor: 'cursor123',
        hasMore: true,
        total: 10,
      };
      (itemServicoRepository.findAtivosByCategoriaPaginado as jest.Mock).mockResolvedValue(mockResult);

      const resultado = await itemServicoService.listarAtivosPorCategoriaPaginado('cat1', 10, undefined, undefined);

      expect(itemServicoRepository.findAtivosByCategoriaPaginado).toHaveBeenCalledWith('cat1', 10, undefined, undefined);
      expect(resultado).toEqual(mockResult);
    });

    it('deve lançar erro quando categoriaId não for fornecido', async () => {
      await expect(itemServicoService.listarAtivosPorCategoriaPaginado('', 10)).rejects.toThrow(ValidationError);
    });
  });

  describe('listarPorCategoriaPaginado', () => {
    it('deve retornar itens paginados de uma categoria', async () => {
      const mockResult = {
        itens: [mockItemServico],
        nextCursor: 'cursor123',
        hasMore: true,
        total: 10,
      };
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByCategoriaPaginado as jest.Mock).mockResolvedValue(mockResult);

      const resultado = await itemServicoService.listarPorCategoriaPaginado('cat1', 10, undefined, 'busca');

      expect(categoriaItemRepository.findById).toHaveBeenCalledWith('cat1');
      expect(itemServicoRepository.findByCategoriaPaginado).toHaveBeenCalledWith('cat1', 10, undefined, 'busca');
      expect(resultado).toEqual(mockResult);
    });

    it('deve lançar erro quando categoriaId não for fornecido', async () => {
      await expect(itemServicoService.listarPorCategoriaPaginado('', 10)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemServicoService.listarPorCategoriaPaginado('cat-inexistente', 10)).rejects.toThrow(NotFoundError);
    });
  });

  describe('criar com histórico', () => {
    it('deve salvar histórico ao criar item com valores', async () => {
      const { historicoValoresRepository } = require('../../repositories/historicoValoresRepository');
      const novoItem = {
        categoriaId: 'cat1',
        descricao: 'Novo item com valores',
        unidade: 'UN',
        valorUnitario: 100,
        valorMaoDeObraUnitario: 50,
        valorCusto: 80,
        valorMaoDeObraCusto: 40,
      };
      const itemCriado = { ...mockItemServico, ...novoItem };

      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (itemServicoRepository.findByDescricaoInCategoria as jest.Mock).mockResolvedValue(null);
      (itemServicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (itemServicoRepository.create as jest.Mock).mockResolvedValue(itemCriado);

      await itemServicoService.criar(novoItem);

      expect(historicoValoresRepository.salvarHistoricoItem).toHaveBeenCalledWith(
        expect.objectContaining({
          itemServicoId: itemCriado.id,
          descricao: itemCriado.descricao,
          valorUnitario: 100,
          valorMaoDeObraUnitario: 50,
          valorCusto: 80,
          valorMaoDeObraCusto: 40,
        })
      );
    });
  });

  describe('atualizar com histórico', () => {
    it('deve salvar histórico ao atualizar valores', async () => {
      const { historicoValoresRepository } = require('../../repositories/historicoValoresRepository');
      const itemExistente = {
        ...mockItemServico,
        valorUnitario: 100,
        valorMaoDeObraUnitario: 50,
      };
      const itemAtualizado = {
        ...itemExistente,
        valorUnitario: 150,
        valorMaoDeObraUnitario: 75,
      };

      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(itemExistente);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue(itemAtualizado);

      await itemServicoService.atualizar('1', { valorUnitario: 150, valorMaoDeObraUnitario: 75 });

      expect(historicoValoresRepository.salvarHistoricoItem).toHaveBeenCalledWith(
        expect.objectContaining({
          itemServicoId: '1',
          valorUnitario: 150,
          valorMaoDeObraUnitario: 75,
        })
      );
    });

    it('deve salvar histórico ao atualizar valorCusto', async () => {
      const { historicoValoresRepository } = require('../../repositories/historicoValoresRepository');
      const itemExistente = {
        ...mockItemServico,
        valorCusto: 80,
      };
      const itemAtualizado = {
        ...itemExistente,
        valorCusto: 100,
      };

      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(itemExistente);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue(itemAtualizado);

      await itemServicoService.atualizar('1', { valorCusto: 100 });

      expect(historicoValoresRepository.salvarHistoricoItem).toHaveBeenCalled();
    });

    it('deve salvar histórico ao atualizar valorMaoDeObraCusto', async () => {
      const { historicoValoresRepository } = require('../../repositories/historicoValoresRepository');
      const itemExistente = {
        ...mockItemServico,
        valorMaoDeObraCusto: 40,
      };
      const itemAtualizado = {
        ...itemExistente,
        valorMaoDeObraCusto: 60,
      };

      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(itemExistente);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue(itemAtualizado);

      await itemServicoService.atualizar('1', { valorMaoDeObraCusto: 60 });

      expect(historicoValoresRepository.salvarHistoricoItem).toHaveBeenCalled();
    });

    it('não deve salvar histórico quando valores não mudaram', async () => {
      const { historicoValoresRepository } = require('../../repositories/historicoValoresRepository');
      historicoValoresRepository.salvarHistoricoItem.mockClear();

      const itemExistente = {
        ...mockItemServico,
        valorUnitario: 100,
      };

      (itemServicoRepository.findById as jest.Mock).mockResolvedValue(itemExistente);
      (itemServicoRepository.update as jest.Mock).mockResolvedValue(itemExistente);

      // Atualizar apenas a descrição, não os valores
      await itemServicoService.atualizar('1', { descricao: 'Nova descrição' });

      expect(historicoValoresRepository.salvarHistoricoItem).not.toHaveBeenCalled();
    });
  });
});
