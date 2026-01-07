import { Request, Response, NextFunction } from 'express';
import { configuracoesGeraisController } from '../../controllers/configuracoesGeraisController';
import { configuracoesGeraisService } from '../../services/configuracoesGeraisService';

// Mock do configuracoesGeraisService
jest.mock('../../services/configuracoesGeraisService');

describe('configuracoesGeraisController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('buscar', () => {
    it('deve retornar configurações com sucesso', async () => {
      const configuracoes = {
        diasValidadeOrcamento: 30,
        nomeEmpresa: 'Empresa Teste',
        cnpjEmpresa: '12345678901234',
        enderecoEmpresa: 'Rua Teste, 123',
        telefoneEmpresa: '11999999999',
        emailEmpresa: 'teste@empresa.com',
      };
      (configuracoesGeraisService.buscar as jest.Mock).mockResolvedValue(configuracoes);

      await configuracoesGeraisController.buscar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(configuracoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (configuracoesGeraisService.buscar as jest.Mock).mockRejectedValue(error);

      await configuracoesGeraisController.buscar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar configurações com sucesso', async () => {
      const dadosAtualizacao = { diasValidadeOrcamento: 60 };
      const configuracoes = {
        diasValidadeOrcamento: 60,
        nomeEmpresa: 'Empresa Teste',
        cnpjEmpresa: '12345678901234',
        enderecoEmpresa: 'Rua Teste, 123',
        telefoneEmpresa: '11999999999',
        emailEmpresa: 'teste@empresa.com',
      };
      mockReq.body = dadosAtualizacao;
      (configuracoesGeraisService.atualizar as jest.Mock).mockResolvedValue(configuracoes);

      await configuracoesGeraisController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(configuracoesGeraisService.atualizar).toHaveBeenCalledWith(dadosAtualizacao);
      expect(jsonMock).toHaveBeenCalledWith(configuracoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { diasValidadeOrcamento: 0 };
      const error = new Error('Dias de validade inválido');
      (configuracoesGeraisService.atualizar as jest.Mock).mockRejectedValue(error);

      await configuracoesGeraisController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve atualizar impostos com sucesso', async () => {
      const dadosAtualizacao = { impostoMaterial: 10, impostoServico: 15 };
      const configuracoes = {
        diasValidadeOrcamento: 30,
        nomeEmpresa: 'Empresa Teste',
        cnpjEmpresa: '12345678901234',
        enderecoEmpresa: 'Rua Teste, 123',
        telefoneEmpresa: '11999999999',
        emailEmpresa: 'teste@empresa.com',
        impostoMaterial: 10,
        impostoServico: 15,
      };
      mockReq.body = dadosAtualizacao;
      (configuracoesGeraisService.atualizar as jest.Mock).mockResolvedValue(configuracoes);

      await configuracoesGeraisController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(configuracoesGeraisService.atualizar).toHaveBeenCalledWith(dadosAtualizacao);
      expect(jsonMock).toHaveBeenCalledWith(configuracoes);
    });
  });
});
