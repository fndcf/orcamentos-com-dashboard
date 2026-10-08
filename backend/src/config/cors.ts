/**
 * Origem liberada no CORS.
 *
 * Em produção o frontend chama a API pela mesma origem (rewrite /api/** do Firebase Hosting),
 * então o CORS não é necessário: sem FRONTEND_URL ele fica desligado. O fallback para o Vite
 * local só vale fora do Cloud Run (que sempre define K_SERVICE).
 */
export function origemCors(env: NodeJS.ProcessEnv = process.env): string | false {
  if (env.FRONTEND_URL) {
    return env.FRONTEND_URL;
  }
  return env.K_SERVICE ? false : "http://localhost:5173";
}
