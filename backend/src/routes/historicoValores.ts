import { Router } from 'express';
import { historicoValoresController } from '../controllers/historicoValoresController';

const router = Router();

// GET /historico-valores/itens?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
router.get('/itens', historicoValoresController.buscarHistoricoItens);

// GET /historico-valores/configuracoes?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
router.get('/configuracoes', historicoValoresController.buscarHistoricoConfiguracoes);

export default router;
