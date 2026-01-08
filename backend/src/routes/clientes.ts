import { Router } from 'express';
import { clienteController } from '../controllers/clienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/clientes - Listar todos os clientes
router.get('/', clienteController.listar);

// GET /api/clientes/paginated - Listar clientes com paginação
router.get('/paginated', clienteController.listarPaginado);

// GET /api/clientes/pesquisar?termo=xxx - Pesquisar clientes
router.get('/pesquisar', clienteController.pesquisar);

// GET /api/clientes/documento/:documento - Buscar por CPF ou CNPJ
router.get('/documento/:documento', clienteController.buscarPorDocumento);

// GET /api/clientes/:id - Buscar por ID
router.get('/:id', clienteController.buscarPorId);

// POST /api/clientes - Criar cliente
router.post('/', clienteController.criar);

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', clienteController.atualizar);

// DELETE /api/clientes/:id - Excluir cliente
router.delete('/:id', clienteController.excluir);

export default router;
