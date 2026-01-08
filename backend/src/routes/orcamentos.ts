import { Router } from 'express';
import { orcamentoController } from '../controllers/orcamentoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/orcamentos - Listar todos os orçamentos
router.get('/', orcamentoController.listar);

// GET /api/orcamentos/paginated - Listar orçamentos com paginação
router.get('/paginated', orcamentoController.listarPaginado);

// GET /api/orcamentos/estatisticas - Obter estatísticas
router.get('/estatisticas', orcamentoController.estatisticas);

// GET /api/orcamentos/dashboard-stats - Obter estatísticas agregadas para o Dashboard
router.get('/dashboard-stats', orcamentoController.dashboardStats);

// GET /api/orcamentos/cliente/:clienteId - Buscar por cliente
router.get('/cliente/:clienteId', orcamentoController.buscarPorCliente);

// GET /api/orcamentos/cliente/:clienteId/historico - Histórico do cliente com resumo agregado
router.get('/cliente/:clienteId/historico', orcamentoController.historicoCliente);

// GET /api/orcamentos/status/:status - Buscar por status
router.get('/status/:status', orcamentoController.buscarPorStatus);

// GET /api/orcamentos/periodo?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD - Buscar por período
router.get('/periodo', orcamentoController.buscarPorPeriodo);

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
