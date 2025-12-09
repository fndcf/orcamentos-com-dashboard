import { Router } from 'express';
import { limitacaoController } from '../controllers/limitacaoController';

const router = Router();

router.get('/', limitacaoController.listar);
router.get('/ativas', limitacaoController.listarAtivas);
router.get('/:id', limitacaoController.buscarPorId);
router.post('/', limitacaoController.criar);
router.put('/:id', limitacaoController.atualizar);
router.patch('/:id/toggle', limitacaoController.toggleAtivo);
router.delete('/:id', limitacaoController.excluir);

export default router;
