import express, { Router } from 'express';
import { AddressInfo } from 'net';
import { Server } from 'http';
import routes from '../../routes';
import { errorHandler } from '../../middlewares/errorHandler';
import { configuracoesGeraisService } from '../../services/configuracoesGeraisService';
import { auth } from '../../config/firebase';

interface RotaRegistrada {
  method: string;
  path: string;
}

type Layer = {
  route?: { path: string; methods: Record<string, boolean> };
  name: string;
  regexp: RegExp;
  handle: Router & { stack?: Layer[] };
};

// Converte o regexp de montagem do Express 4 (ex.: /^\/clientes\/?(?=\/|$)/i) em '/clientes'
const caminhoDeMontagem = (regexp: RegExp): string =>
  regexp.source
    .replace('^', '')
    .replace('\\/?(?=\\/|$)', '')
    .replace(/\\\//g, '/');

// Percorre o router (inclusive sub-routers) e lista todas as rotas registradas
const listarRotas = (stack: Layer[], prefixo = ''): RotaRegistrada[] =>
  stack.flatMap((layer) => {
    if (layer.route) {
      return Object.keys(layer.route.methods).map((method) => ({
        method: method.toUpperCase(),
        path: prefixo + layer.route!.path,
      }));
    }
    if (layer.name === 'router' && layer.handle.stack) {
      return listarRotas(layer.handle.stack, prefixo + caminhoDeMontagem(layer.regexp));
    }
    return [];
  });

describe('Proteção de autenticação das rotas', () => {
  let server: Server;
  let baseUrl: string;

  const rotas = listarRotas((routes as unknown as { stack: Layer[] }).stack);
  const rotasProtegidas = rotas.filter((r) => !r.path.startsWith('/health'));

  beforeAll((done) => {
    const app = express();
    app.use(express.json());
    app.use('/api', routes);
    app.use(errorHandler);
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  const requisitar = (method: string, path: string, headers: Record<string, string> = {}) =>
    fetch(baseUrl + path.replace(/:\w+/g, 'x'), {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: ['POST', 'PUT', 'PATCH'].includes(method) ? '{}' : undefined,
    });

  it('deve encontrar as rotas de todos os routers', () => {
    const prefixos = new Set(rotas.map((r) => r.path.split('/')[1]));
    expect(prefixos).toEqual(
      new Set([
        'health',
        'clientes',
        'orcamentos',
        'palavras-chave',
        'servicos',
        'categorias-item',
        'limitacoes',
        'configuracoes-gerais',
        'itens-servico',
        'notificacoes',
        'historico-valores',
      ])
    );
    expect(rotasProtegidas.length).toBeGreaterThanOrEqual(78);
  });

  it('GET /health deve responder sem token', async () => {
    const res = await requisitar('GET', '/health');
    expect(res.status).toBe(200);
  });

  it.each(rotasProtegidas.map((r) => [r.method, r.path]))(
    '%s %s deve retornar 401 sem token',
    async (method, path) => {
      const res = await requisitar(method, path);
      expect(res.status).toBe(401);
      expect(auth.verifyIdToken).not.toHaveBeenCalled();
    }
  );

  it('deve retornar 403 para conta válida sem a claim staff', async () => {
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1', email: 'a@b.com' });

    const res = await requisitar('GET', '/configuracoes-gerais', { Authorization: 'Bearer token-valido' });

    expect(res.status).toBe(403);
  });

  it('deve permitir acesso com token válido de conta staff', async () => {
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1', email: 'a@b.com', staff: true });
    const spy = jest
      .spyOn(configuracoesGeraisService, 'buscar')
      .mockResolvedValue({} as Awaited<ReturnType<typeof configuracoesGeraisService.buscar>>);

    const res = await requisitar('GET', '/configuracoes-gerais', { Authorization: 'Bearer token-valido' });

    expect(res.status).toBe(200);
    expect(auth.verifyIdToken).toHaveBeenCalledWith('token-valido', true);
    spy.mockRestore();
  });
});
