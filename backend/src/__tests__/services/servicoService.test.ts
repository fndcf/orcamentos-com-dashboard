import { servicoService } from '../../services/servicoService';
import { servicoRepository } from '../../repositories/servicoRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { Servico } from '../../models';

// Mock do repository
jest.mock('../../repositories/servicoRepository');

describe('servicoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockServico: Servico = {
    id: '1',
    descricao: 'Assessoria e fornecimento de equipamentos de incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de serviços', async () => {
      const servicos = [mockServico, { ...mockServico, id: '2', descricao: 'Manutenção de extintores' }];
      (servicoRepository.findAll as jest.Mock).mockResolvedValue(servicos);

      const resultado = await servicoService.listar();

      expect(servicoRepository.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(servicos);
    });

    it('deve retornar lista vazia quando não houver serviços', async () => {
      (servicoRepository.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await servicoService.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivos', () => {
    it('deve retornar apenas serviços ativos', async () => {
      const servicosAtivos = [mockServico];
      (servicoRepository.findAtivos as jest.Mock).mockResolvedValue(servicosAtivos);

      const resultado = await servicoService.listarAtivos();

      expect(servicoRepository.findAtivos).toHaveBeenCalled();
      expect(resultado).toEqual(servicosAtivos);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar serviço por ID', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);

      const resultado = await servicoService.buscarPorId('1');

      expect(servicoRepository.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockServico);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(servicoService.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(servicoService.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando serviço não existir', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(servicoService.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(servicoService.buscarPorId('inexistente')).rejects.toThrow('Serviço não encontrado');
    });
  });

  describe('criar', () => {
    it('deve criar serviço com sucesso', async () => {
      const dados = { descricao: 'Assessoria e fornecimento de equipamentos de incêndio' };
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue(null);
      (servicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (servicoRepository.create as jest.Mock).mockResolvedValue(mockServico);

      const resultado = await servicoService.criar(dados);

      expect(servicoRepository.findByDescricao).toHaveBeenCalledWith(dados.descricao);
      expect(servicoRepository.getNextOrdem).toHaveBeenCalled();
      expect(servicoRepository.create).toHaveBeenCalledWith({
        descricao: dados.descricao,
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockServico);
    });

    it('deve criar serviço inativo quando especificado', async () => {
      const dados = { descricao: 'Assessoria e fornecimento de equipamentos de incêndio', ativo: false };
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue(null);
      (servicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (servicoRepository.create as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });

      await servicoService.criar(dados);

      expect(servicoRepository.create).toHaveBeenCalledWith({
        descricao: dados.descricao,
        ativo: false,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando descrição for muito curta', async () => {
      await expect(servicoService.criar({ descricao: 'Teste' })).rejects.toThrow(ValidationError);
      await expect(servicoService.criar({ descricao: 'Teste' })).rejects.toThrow(
        'Descrição deve ter pelo menos 10 caracteres'
      );
    });

    it('deve lançar ValidationError quando descrição for vazia', async () => {
      await expect(servicoService.criar({ descricao: '' })).rejects.toThrow(ValidationError);
    });

    it('deve lançar AppError quando descrição já existir', async () => {
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue(mockServico);

      await expect(
        servicoService.criar({ descricao: 'Assessoria e fornecimento de equipamentos de incêndio' })
      ).rejects.toThrow(AppError);
      await expect(
        servicoService.criar({ descricao: 'Assessoria e fornecimento de equipamentos de incêndio' })
      ).rejects.toThrow('Já existe um serviço com esta descrição');
    });

    it('deve fazer trim da descrição antes de salvar', async () => {
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue(null);
      (servicoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (servicoRepository.create as jest.Mock).mockResolvedValue(mockServico);

      await servicoService.criar({ descricao: '  Assessoria e fornecimento de equipamentos  ' });

      expect(servicoRepository.create).toHaveBeenCalledWith({
        descricao: 'Assessoria e fornecimento de equipamentos',
        ativo: true,
        ordem: 1,
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar serviço com sucesso', async () => {
      const dados = { descricao: 'Descrição atualizada com mais caracteres' };
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue(null);
      (servicoRepository.update as jest.Mock).mockResolvedValue({ ...mockServico, ...dados });

      const resultado = await servicoService.atualizar('1', dados);

      expect(servicoRepository.findById).toHaveBeenCalledWith('1');
      expect(servicoRepository.update).toHaveBeenCalledWith('1', { descricao: dados.descricao });
      expect(resultado.descricao).toBe(dados.descricao);
    });

    it('deve atualizar apenas o status ativo', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.update as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });

      await servicoService.atualizar('1', { ativo: false });

      expect(servicoRepository.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve atualizar apenas a ordem', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.update as jest.Mock).mockResolvedValue({ ...mockServico, ordem: 5 });

      await servicoService.atualizar('1', { ordem: 5 });

      expect(servicoRepository.update).toHaveBeenCalledWith('1', { ordem: 5 });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(servicoService.atualizar('', { descricao: 'teste teste teste' })).rejects.toThrow(
        ValidationError
      );
      await expect(servicoService.atualizar('', { descricao: 'teste teste teste' })).rejects.toThrow(
        'ID é obrigatório'
      );
    });

    it('deve lançar NotFoundError quando serviço não existir', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(servicoService.atualizar('inexistente', { descricao: 'teste teste teste' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('deve lançar ValidationError quando nova descrição for muito curta', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);

      await expect(servicoService.atualizar('1', { descricao: 'curta' })).rejects.toThrow(ValidationError);
      await expect(servicoService.atualizar('1', { descricao: 'curta' })).rejects.toThrow(
        'Descrição deve ter pelo menos 10 caracteres'
      );
    });

    it('deve lançar AppError quando nova descrição já existir em outro registro', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue({
        ...mockServico,
        id: '2',
        descricao: 'Outra descrição de serviço existente',
      });

      await expect(
        servicoService.atualizar('1', { descricao: 'Outra descrição de serviço existente' })
      ).rejects.toThrow(AppError);
      await expect(
        servicoService.atualizar('1', { descricao: 'Outra descrição de serviço existente' })
      ).rejects.toThrow('Já existe um serviço com esta descrição');
    });

    it('deve permitir atualizar mantendo a mesma descrição', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.findByDescricao as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.update as jest.Mock).mockResolvedValue(mockServico);

      await servicoService.atualizar('1', { descricao: mockServico.descricao });

      expect(servicoRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(servicoService.atualizar('1', { ativo: false })).rejects.toThrow('Erro ao atualizar serviço');
    });
  });

  describe('excluir', () => {
    it('deve excluir serviço com sucesso', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.delete as jest.Mock).mockResolvedValue(true);

      await expect(servicoService.excluir('1')).resolves.not.toThrow();

      expect(servicoRepository.findById).toHaveBeenCalledWith('1');
      expect(servicoRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(servicoService.excluir('')).rejects.toThrow(ValidationError);
      await expect(servicoService.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando serviço não existir', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(servicoService.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(servicoService.excluir('inexistente')).rejects.toThrow('Serviço não encontrado');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(mockServico);
      (servicoRepository.update as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });

      const resultado = await servicoService.toggleAtivo('1');

      expect(servicoRepository.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue({ ...mockServico, ativo: false });
      (servicoRepository.update as jest.Mock).mockResolvedValue({ ...mockServico, ativo: true });

      const resultado = await servicoService.toggleAtivo('1');

      expect(servicoRepository.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando serviço não existir', async () => {
      (servicoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(servicoService.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
