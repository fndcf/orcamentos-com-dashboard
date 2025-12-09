import { Router } from 'express';
import { servicoController } from '../controllers/servicoController';

const router = Router();

router.get('/', servicoController.listar);
router.get('/ativos', servicoController.listarAtivos);
router.get('/:id', servicoController.buscarPorId);
router.post('/', servicoController.criar);
router.put('/:id', servicoController.atualizar);
router.patch('/:id/toggle', servicoController.toggleAtivo);
router.delete('/:id', servicoController.excluir);

export default router;
