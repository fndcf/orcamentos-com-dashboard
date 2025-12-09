import { Router } from 'express';
import { categoriaItemController } from '../controllers/categoriaItemController';

const router = Router();

router.get('/', categoriaItemController.listar);
router.get('/ativas', categoriaItemController.listarAtivas);
router.get('/:id', categoriaItemController.buscarPorId);
router.post('/', categoriaItemController.criar);
router.put('/:id', categoriaItemController.atualizar);
router.patch('/:id/toggle', categoriaItemController.toggleAtivo);
router.delete('/:id', categoriaItemController.excluir);

export default router;
