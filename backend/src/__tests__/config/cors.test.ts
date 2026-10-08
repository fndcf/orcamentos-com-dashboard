import { origemCors } from '../../config/cors';

describe('origemCors', () => {
  it('deve usar FRONTEND_URL quando definida', () => {
    expect(origemCors({ FRONTEND_URL: 'https://flama-ita.web.app', K_SERVICE: 'api' })).toBe(
      'https://flama-ita.web.app'
    );
  });

  it('deve desligar o CORS no Cloud Run sem FRONTEND_URL', () => {
    expect(origemCors({ K_SERVICE: 'api' })).toBe(false);
  });

  it('deve liberar o Vite local fora do Cloud Run', () => {
    expect(origemCors({})).toBe('http://localhost:5173');
  });
});
