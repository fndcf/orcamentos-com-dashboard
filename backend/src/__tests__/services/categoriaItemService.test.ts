import { categoriaItemService } from '../../services/categoriaItemService';
import { categoriaItemRepository } from '../../repositories/categoriaItemRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { CategoriaItem } from '../../models';

// Mock do repository
jest.mock('../../repositories/categoriaItemRepository');

describe('categoriaItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategoria: CategoriaItem = {
    id: '1',
    nome: 'Bomba de Incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de categorias', async () => {
      const categorias = [mockCategoria, { ...mockCategoria, id: '2', nome: 'Sistema de Hidrantes' }];
      (categoriaItemRepository.findAll as jest.Mock).mockResolvedValue(categorias);

      const resultado = await categoriaItemService.listar();

      expect(categoriaItemRepository.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(categorias);
    });

    it('deve retornar lista vazia quando não houver categorias', async () => {
      (categoriaItemRepository.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await categoriaItemService.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar apenas categorias ativas', async () => {
      const categoriasAtivas = [mockCategoria];
      (categoriaItemRepository.findAtivas as jest.Mock).mockResolvedValue(categoriasAtivas);

      const resultado = await categoriaItemService.listarAtivas();

      expect(categoriaItemRepository.findAtivas).toHaveBeenCalled();
      expect(resultado).toEqual(categoriasAtivas);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar categoria por ID', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);

      const resultado = await categoriaItemService.buscarPorId('1');

      expect(categoriaItemRepository.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockCategoria);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(categoriaItemService.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(categoriaItemService.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(categoriaItemService.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(categoriaItemService.buscarPorId('inexistente')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('criar', () => {
    it('deve criar categoria com sucesso', async () => {
      const dados = { nome: 'Bomba de Incêndio' };
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue(null);
      (categoriaItemRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (categoriaItemRepository.create as jest.Mock).mockResolvedValue(mockCategoria);

      const resultado = await categoriaItemService.criar(dados);

      expect(categoriaItemRepository.findByNome).toHaveBeenCalledWith(dados.nome);
      expect(categoriaItemRepository.getNextOrdem).toHaveBeenCalled();
      expect(categoriaItemRepository.create).toHaveBeenCalledWith({
        nome: dados.nome,
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockCategoria);
    });

    it('deve criar categoria inativa quando especificado', async () => {
      const dados = { nome: 'Bomba de Incêndio', ativo: false };
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue(null);
      (categoriaItemRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (categoriaItemRepository.create as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });

      await categoriaItemService.criar(dados);

      expect(categoriaItemRepository.create).toHaveBeenCalledWith({
        nome: dados.nome,
        ativo: false,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando nome for muito curto', async () => {
      await expect(categoriaItemService.criar({ nome: 'AB' })).rejects.toThrow(ValidationError);
      await expect(categoriaItemService.criar({ nome: 'AB' })).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    it('deve lançar ValidationError quando nome for vazio', async () => {
      await expect(categoriaItemService.criar({ nome: '' })).rejects.toThrow(ValidationError);
    });

    it('deve lançar AppError quando nome já existir', async () => {
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue(mockCategoria);

      await expect(categoriaItemService.criar({ nome: 'Bomba de Incêndio' })).rejects.toThrow(AppError);
      await expect(categoriaItemService.criar({ nome: 'Bomba de Incêndio' })).rejects.toThrow(
        'Já existe uma categoria com este nome'
      );
    });

    it('deve fazer trim do nome antes de salvar', async () => {
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue(null);
      (categoriaItemRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (categoriaItemRepository.create as jest.Mock).mockResolvedValue(mockCategoria);

      await categoriaItemService.criar({ nome: '  Bomba de Incêndio  ' });

      expect(categoriaItemRepository.create).toHaveBeenCalledWith({
        nome: 'Bomba de Incêndio',
        ativo: true,
        ordem: 1,
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar categoria com sucesso', async () => {
      const dados = { nome: 'Bomba Atualizada' };
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue(null);
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ...dados });

      const resultado = await categoriaItemService.atualizar('1', dados);

      expect(categoriaItemRepository.findById).toHaveBeenCalledWith('1');
      expect(categoriaItemRepository.update).toHaveBeenCalledWith('1', { nome: dados.nome });
      expect(resultado.nome).toBe(dados.nome);
    });

    it('deve atualizar apenas o status ativo', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });

      await categoriaItemService.atualizar('1', { ativo: false });

      expect(categoriaItemRepository.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve atualizar apenas a ordem', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ordem: 5 });

      await categoriaItemService.atualizar('1', { ordem: 5 });

      expect(categoriaItemRepository.update).toHaveBeenCalledWith('1', { ordem: 5 });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(categoriaItemService.atualizar('', { nome: 'Teste' })).rejects.toThrow(ValidationError);
      await expect(categoriaItemService.atualizar('', { nome: 'Teste' })).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(categoriaItemService.atualizar('inexistente', { nome: 'Teste' })).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ValidationError quando novo nome for muito curto', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);

      await expect(categoriaItemService.atualizar('1', { nome: 'AB' })).rejects.toThrow(ValidationError);
      await expect(categoriaItemService.atualizar('1', { nome: 'AB' })).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    it('deve lançar AppError quando novo nome já existir em outra categoria', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue({
        ...mockCategoria,
        id: '2',
        nome: 'Outra Categoria',
      });

      await expect(categoriaItemService.atualizar('1', { nome: 'Outra Categoria' })).rejects.toThrow(AppError);
      await expect(categoriaItemService.atualizar('1', { nome: 'Outra Categoria' })).rejects.toThrow(
        'Já existe uma categoria com este nome'
      );
    });

    it('deve permitir atualizar mantendo o mesmo nome', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.findByNome as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue(mockCategoria);

      await categoriaItemService.atualizar('1', { nome: mockCategoria.nome });

      expect(categoriaItemRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(categoriaItemService.atualizar('1', { ativo: false })).rejects.toThrow(
        'Erro ao atualizar categoria'
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir categoria com sucesso', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.delete as jest.Mock).mockResolvedValue(true);

      await expect(categoriaItemService.excluir('1')).resolves.not.toThrow();

      expect(categoriaItemRepository.findById).toHaveBeenCalledWith('1');
      expect(categoriaItemRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(categoriaItemService.excluir('')).rejects.toThrow(ValidationError);
      await expect(categoriaItemService.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(categoriaItemService.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(categoriaItemService.excluir('inexistente')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(mockCategoria);
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });

      const resultado = await categoriaItemService.toggleAtivo('1');

      expect(categoriaItemRepository.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: false });
      (categoriaItemRepository.update as jest.Mock).mockResolvedValue({ ...mockCategoria, ativo: true });

      const resultado = await categoriaItemService.toggleAtivo('1');

      expect(categoriaItemRepository.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando categoria não existir', async () => {
      (categoriaItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(categoriaItemService.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
