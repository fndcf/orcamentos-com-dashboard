import { limitacaoService } from '../../services/limitacaoService';
import { limitacaoRepository } from '../../repositories/limitacaoRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { Limitacao } from '../../models';

// Mock do repository
jest.mock('../../repositories/limitacaoRepository');

describe('limitacaoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLimitacao: Limitacao = {
    id: '1',
    texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de limitações', async () => {
      const limitacoes = [mockLimitacao, { ...mockLimitacao, id: '2', texto: 'Outra limitação de teste com texto suficiente' }];
      (limitacaoRepository.findAll as jest.Mock).mockResolvedValue(limitacoes);

      const resultado = await limitacaoService.listar();

      expect(limitacaoRepository.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(limitacoes);
    });

    it('deve retornar lista vazia quando não houver limitações', async () => {
      (limitacaoRepository.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await limitacaoService.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar apenas limitações ativas', async () => {
      const limitacoesAtivas = [mockLimitacao];
      (limitacaoRepository.findAtivas as jest.Mock).mockResolvedValue(limitacoesAtivas);

      const resultado = await limitacaoService.listarAtivas();

      expect(limitacaoRepository.findAtivas).toHaveBeenCalled();
      expect(resultado).toEqual(limitacoesAtivas);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar limitação por ID', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);

      const resultado = await limitacaoService.buscarPorId('1');

      expect(limitacaoRepository.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockLimitacao);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(limitacaoService.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(limitacaoService.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando limitação não existir', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(limitacaoService.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(limitacaoService.buscarPorId('inexistente')).rejects.toThrow('Limitação não encontrada');
    });
  });

  describe('buscarPorIds', () => {
    it('deve retornar limitações por IDs', async () => {
      const limitacoes = [mockLimitacao, { ...mockLimitacao, id: '2' }];
      (limitacaoRepository.findByIds as jest.Mock).mockResolvedValue(limitacoes);

      const resultado = await limitacaoService.buscarPorIds(['1', '2']);

      expect(limitacaoRepository.findByIds).toHaveBeenCalledWith(['1', '2']);
      expect(resultado).toEqual(limitacoes);
    });

    it('deve retornar lista vazia quando nenhum ID for encontrado', async () => {
      (limitacaoRepository.findByIds as jest.Mock).mockResolvedValue([]);

      const resultado = await limitacaoService.buscarPorIds(['inexistente']);

      expect(resultado).toEqual([]);
    });
  });

  describe('criar', () => {
    it('deve criar limitação com sucesso', async () => {
      const dados = { texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres' };
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(null);
      (limitacaoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (limitacaoRepository.create as jest.Mock).mockResolvedValue(mockLimitacao);

      const resultado = await limitacaoService.criar(dados);

      expect(limitacaoRepository.findByTexto).toHaveBeenCalledWith(dados.texto);
      expect(limitacaoRepository.getNextOrdem).toHaveBeenCalled();
      expect(limitacaoRepository.create).toHaveBeenCalledWith({
        texto: dados.texto,
        ativo: true,
        ordem: 1,
      });
      expect(resultado).toEqual(mockLimitacao);
    });

    it('deve criar limitação inativa quando especificado', async () => {
      const dados = { texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres', ativo: false };
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(null);
      (limitacaoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (limitacaoRepository.create as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });

      await limitacaoService.criar(dados);

      expect(limitacaoRepository.create).toHaveBeenCalledWith({
        texto: dados.texto,
        ativo: false,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando texto for muito curto', async () => {
      await expect(limitacaoService.criar({ texto: 'Curto' })).rejects.toThrow(ValidationError);
      await expect(limitacaoService.criar({ texto: 'Curto' })).rejects.toThrow(
        'Texto deve ter pelo menos 20 caracteres'
      );
    });

    it('deve lançar ValidationError quando texto for vazio', async () => {
      await expect(limitacaoService.criar({ texto: '' })).rejects.toThrow(ValidationError);
    });

    it('deve lançar AppError quando texto já existir', async () => {
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(mockLimitacao);

      await expect(
        limitacaoService.criar({ texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres' })
      ).rejects.toThrow(AppError);
      await expect(
        limitacaoService.criar({ texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres' })
      ).rejects.toThrow('Já existe uma limitação com este texto');
    });

    it('deve fazer trim do texto antes de salvar', async () => {
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(null);
      (limitacaoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (limitacaoRepository.create as jest.Mock).mockResolvedValue(mockLimitacao);

      await limitacaoService.criar({ texto: '  Esta é uma limitação de teste com pelo menos 20 caracteres  ' });

      expect(limitacaoRepository.create).toHaveBeenCalledWith({
        texto: 'Esta é uma limitação de teste com pelo menos 20 caracteres',
        ativo: true,
        ordem: 1,
      });
    });

    it('deve lançar ValidationError quando texto exceder 1000 caracteres', async () => {
      const textoGrande = 'a'.repeat(1001);

      await expect(limitacaoService.criar({ texto: textoGrande })).rejects.toThrow(ValidationError);
      await expect(limitacaoService.criar({ texto: textoGrande })).rejects.toThrow(
        'Texto deve ter no máximo 1000 caracteres'
      );
    });

    it('deve aceitar texto com exatamente 1000 caracteres', async () => {
      const textoExato = 'a'.repeat(1000);
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(null);
      (limitacaoRepository.getNextOrdem as jest.Mock).mockResolvedValue(1);
      (limitacaoRepository.create as jest.Mock).mockResolvedValue({ ...mockLimitacao, texto: textoExato });

      const resultado = await limitacaoService.criar({ texto: textoExato });

      expect(resultado).toBeDefined();
      expect(limitacaoRepository.create).toHaveBeenCalled();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar limitação com sucesso', async () => {
      const dados = { texto: 'Texto atualizado com caracteres suficientes para o teste' };
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(null);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ...dados });

      const resultado = await limitacaoService.atualizar('1', dados);

      expect(limitacaoRepository.findById).toHaveBeenCalledWith('1');
      expect(limitacaoRepository.update).toHaveBeenCalledWith('1', { texto: dados.texto });
      expect(resultado.texto).toBe(dados.texto);
    });

    it('deve atualizar apenas o status ativo', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });

      await limitacaoService.atualizar('1', { ativo: false });

      expect(limitacaoRepository.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve atualizar apenas a ordem', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ordem: 5 });

      await limitacaoService.atualizar('1', { ordem: 5 });

      expect(limitacaoRepository.update).toHaveBeenCalledWith('1', { ordem: 5 });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(limitacaoService.atualizar('', { texto: 'texto teste com mais de 20 caracteres' })).rejects.toThrow(
        ValidationError
      );
      await expect(limitacaoService.atualizar('', { texto: 'texto teste com mais de 20 caracteres' })).rejects.toThrow(
        'ID é obrigatório'
      );
    });

    it('deve lançar NotFoundError quando limitação não existir', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        limitacaoService.atualizar('inexistente', { texto: 'texto teste com mais de 20 caracteres' })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ValidationError quando novo texto for muito curto', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);

      await expect(limitacaoService.atualizar('1', { texto: 'curto' })).rejects.toThrow(ValidationError);
      await expect(limitacaoService.atualizar('1', { texto: 'curto' })).rejects.toThrow(
        'Texto deve ter pelo menos 20 caracteres'
      );
    });

    it('deve lançar AppError quando novo texto já existir em outra limitação', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue({
        ...mockLimitacao,
        id: '2',
        texto: 'Outro texto de limitação existente com caracteres suficientes',
      });

      await expect(
        limitacaoService.atualizar('1', { texto: 'Outro texto de limitação existente com caracteres suficientes' })
      ).rejects.toThrow(AppError);
      await expect(
        limitacaoService.atualizar('1', { texto: 'Outro texto de limitação existente com caracteres suficientes' })
      ).rejects.toThrow('Já existe uma limitação com este texto');
    });

    it('deve permitir atualizar mantendo o mesmo texto', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue(mockLimitacao);

      await limitacaoService.atualizar('1', { texto: mockLimitacao.texto });

      expect(limitacaoRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro quando update retornar null', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(limitacaoService.atualizar('1', { ativo: false })).rejects.toThrow('Erro ao atualizar limitação');
    });

    it('deve lançar ValidationError quando novo texto exceder 1000 caracteres', async () => {
      const textoGrande = 'a'.repeat(1001);
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);

      await expect(limitacaoService.atualizar('1', { texto: textoGrande })).rejects.toThrow(ValidationError);
      await expect(limitacaoService.atualizar('1', { texto: textoGrande })).rejects.toThrow(
        'Texto deve ter no máximo 1000 caracteres'
      );
    });

    it('deve aceitar atualização com texto de exatamente 1000 caracteres', async () => {
      const textoExato = 'a'.repeat(1000);
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.findByTexto as jest.Mock).mockResolvedValue(null);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, texto: textoExato });

      const resultado = await limitacaoService.atualizar('1', { texto: textoExato });

      expect(resultado).toBeDefined();
      expect(limitacaoRepository.update).toHaveBeenCalled();
    });
  });

  describe('excluir', () => {
    it('deve excluir limitação com sucesso', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.delete as jest.Mock).mockResolvedValue(true);

      await expect(limitacaoService.excluir('1')).resolves.not.toThrow();

      expect(limitacaoRepository.findById).toHaveBeenCalledWith('1');
      expect(limitacaoRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(limitacaoService.excluir('')).rejects.toThrow(ValidationError);
      await expect(limitacaoService.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando limitação não existir', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(limitacaoService.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(limitacaoService.excluir('inexistente')).rejects.toThrow('Limitação não encontrada');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(mockLimitacao);
      (limitacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });

      const resultado = await limitacaoService.toggleAtivo('1');

      expect(limitacaoRepository.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: false });
      (limitacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockLimitacao, ativo: true });

      const resultado = await limitacaoService.toggleAtivo('1');

      expect(limitacaoRepository.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando limitação não existir', async () => {
      (limitacaoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(limitacaoService.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
