import { Router } from 'express';
import healthRoutes from './health';
import clienteRoutes from './clientes';
import orcamentoRoutes from './orcamentos';
import palavrasChaveRoutes from './palavrasChave';
import servicoRoutes from './servicos';
import categoriaItemRoutes from './categoriasItem';
import limitacaoRoutes from './limitacoes';
import configuracoesGeraisRoutes from './configuracoesGerais';
import itensServicoRoutes from './itensServico';
import notificacaoRoutes from './notificacoes';
import historicoValoresRoutes from './historicoValores';

const router = Router();

router.use('/health', healthRoutes);
router.use('/clientes', clienteRoutes);
router.use('/orcamentos', orcamentoRoutes);
router.use('/palavras-chave', palavrasChaveRoutes);
router.use('/servicos', servicoRoutes);
router.use('/categorias-item', categoriaItemRoutes);
router.use('/limitacoes', limitacaoRoutes);
router.use('/configuracoes-gerais', configuracoesGeraisRoutes);
router.use('/itens-servico', itensServicoRoutes);
router.use('/notificacoes', notificacaoRoutes);
router.use('/historico-valores', historicoValoresRoutes);

export default router;
