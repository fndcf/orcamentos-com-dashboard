import { Router } from 'express';
import { palavraChaveController } from '../controllers/palavraChaveController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/palavras-chave - Listar todas
router.get('/', palavraChaveController.listar);

// GET /api/palavras-chave/ativas - Listar apenas ativas
router.get('/ativas', palavraChaveController.listarAtivas);

// GET /api/palavras-chave/:id - Buscar por ID
router.get('/:id', palavraChaveController.buscarPorId);

// POST /api/palavras-chave - Criar
router.post('/', palavraChaveController.criar);

// PUT /api/palavras-chave/:id - Atualizar
router.put('/:id', palavraChaveController.atualizar);

// PATCH /api/palavras-chave/:id/toggle - Ativar/Desativar
router.patch('/:id/toggle', palavraChaveController.toggleAtivo);

// DELETE /api/palavras-chave/:id - Excluir
router.delete('/:id', palavraChaveController.excluir);

export default router;
