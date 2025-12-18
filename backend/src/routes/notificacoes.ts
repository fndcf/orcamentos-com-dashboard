import { Router } from 'express';
import { notificacaoController } from '../controllers/notificacaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/notificacoes/resumo - Obter resumo (total, não lidas, vencidas, próximas)
router.get('/resumo', notificacaoController.obterResumo);

// GET /api/notificacoes/nao-lidas/count - Contar não lidas
router.get('/nao-lidas/count', notificacaoController.contarNaoLidas);

// ========== ROTAS PAGINADAS ==========

// GET /api/notificacoes/paginado - Listar todas paginado (?pageSize=10&cursor=xxx)
router.get('/paginado', notificacaoController.listarPaginado);

// GET /api/notificacoes/nao-lidas/paginado - Listar não lidas paginado
router.get('/nao-lidas/paginado', notificacaoController.listarNaoLidasPaginado);

// GET /api/notificacoes/vencidas/paginado - Listar vencidas paginado
router.get('/vencidas/paginado', notificacaoController.listarVencidasPaginado);

// GET /api/notificacoes/ativas/paginado - Listar ativas paginado (?dias=60&pageSize=10&cursor=xxx)
router.get('/ativas/paginado', notificacaoController.listarAtivasPaginado);

// GET /api/notificacoes/proximas/paginado - Listar próximas a vencer paginado (?dias=30&pageSize=10&cursor=xxx)
router.get('/proximas/paginado', notificacaoController.listarProximasPaginado);

// PATCH /api/notificacoes/marcar-todas-lidas - Marcar todas como lidas (antes de /:id)
router.patch('/marcar-todas-lidas', notificacaoController.marcarTodasComoLidas);

// GET /api/notificacoes/:id - Buscar por ID
router.get('/:id', notificacaoController.buscarPorId);

// PATCH /api/notificacoes/:id/lida - Marcar como lida
router.patch('/:id/lida', notificacaoController.marcarComoLida);

// DELETE /api/notificacoes/:id - Excluir
router.delete('/:id', notificacaoController.excluir);

// POST /api/notificacoes/gerar/:orcamentoId - Gerar notificações para um orçamento
router.post('/gerar/:orcamentoId', notificacaoController.gerarParaOrcamento);

// POST /api/notificacoes/processar-todos - Processar todos os orçamentos aceitos
router.post('/processar-todos', notificacaoController.processarTodos);

export default router;
