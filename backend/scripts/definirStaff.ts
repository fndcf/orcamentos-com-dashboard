/**
 * Gerencia a custom claim "staff", exigida pelo authMiddleware para acessar a API.
 *
 * Usa as credenciais do Firebase Admin de backend/.env.local (mesmas do servidor local).
 *
 * Uso (dentro de backend/):
 *   npm run staff -- --listar
 *   npm run staff -- --adicionar email@empresa.com [outro@empresa.com ...]
 *   npm run staff -- --remover email@empresa.com [outro@empresa.com ...]
 *
 * Após --adicionar, o usuário precisa sair e entrar de novo no sistema para o token
 * passar a conter a claim. --remover também revoga as sessões abertas do usuário.
 */
import { auth } from "../src/config/firebase";
import { STAFF_CLAIM } from "../src/middlewares/authMiddleware";

async function listar(): Promise<void> {
  let pageToken: string | undefined;
  do {
    const resultado = await auth.listUsers(1000, pageToken);
    for (const user of resultado.users) {
      const staff = user.customClaims?.[STAFF_CLAIM] === true ? "staff" : "-";
      const status = user.disabled ? "desativada" : "ativa";
      console.log(`${(user.email || user.uid).padEnd(40)} ${staff.padEnd(6)} ${status}`);
    }
    pageToken = resultado.pageToken;
  } while (pageToken);
}

async function adicionar(email: string): Promise<void> {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, [STAFF_CLAIM]: true });
  console.log(`✔ ${email}: claim "${STAFF_CLAIM}" adicionada (sair e entrar de novo no sistema)`);
}

async function remover(email: string): Promise<void> {
  const user = await auth.getUserByEmail(email);
  const claims = { ...user.customClaims };
  delete claims[STAFF_CLAIM];
  await auth.setCustomUserClaims(user.uid, claims);
  await auth.revokeRefreshTokens(user.uid);
  console.log(`✔ ${email}: claim "${STAFF_CLAIM}" removida e sessões revogadas`);
}

async function main(): Promise<void> {
  const [acao, ...emails] = process.argv.slice(2);

  if (acao === "--listar") {
    await listar();
    return;
  }

  if ((acao === "--adicionar" || acao === "--remover") && emails.length > 0) {
    for (const email of emails) {
      await (acao === "--adicionar" ? adicionar(email) : remover(email));
    }
    return;
  }

  console.error("Uso: npm run staff -- --listar | --adicionar <email...> | --remover <email...>");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Erro:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
