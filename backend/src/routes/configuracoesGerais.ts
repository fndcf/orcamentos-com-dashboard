import { Router } from 'express';
import { configuracoesGeraisController } from '../controllers/configuracoesGeraisController';

const router = Router();

router.get('/', configuracoesGeraisController.buscar);
router.put('/', configuracoesGeraisController.atualizar);

export default router;
