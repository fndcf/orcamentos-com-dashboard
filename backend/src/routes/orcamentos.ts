import { Router } from 'express';
import { orcamentoController } from '../controllers/orcamentoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/orcamentos - Listar todos os orçamentos
router.get('/', orcamentoController.listar);

// GET /api/orcamentos/estatisticas - Obter estatísticas
router.get('/estatisticas', orcamentoController.estatisticas);

// GET /api/orcamentos/cliente/:clienteId - Buscar por cliente
router.get('/cliente/:clienteId', orcamentoController.buscarPorCliente);

// GET /api/orcamentos/status/:status - Buscar por status
router.get('/status/:status', orcamentoController.buscarPorStatus);

// POST /api/orcamentos/verificar-expirados - Verificar e atualizar orçamentos expirados
router.post('/verificar-expirados', orcamentoController.verificarExpirados);

// GET /api/orcamentos/:id - Buscar por ID
router.get('/:id', orcamentoController.buscarPorId);

// POST /api/orcamentos - Criar orçamento
router.post('/', orcamentoController.criar);

// POST /api/orcamentos/:id/duplicar - Duplicar orçamento
router.post('/:id/duplicar', orcamentoController.duplicar);

// PUT /api/orcamentos/:id - Atualizar orçamento
router.put('/:id', orcamentoController.atualizar);

// PATCH /api/orcamentos/:id/status - Atualizar status
router.patch('/:id/status', orcamentoController.atualizarStatus);

// DELETE /api/orcamentos/:id - Excluir orçamento
router.delete('/:id', orcamentoController.excluir);

export default router;
