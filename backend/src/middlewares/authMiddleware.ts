import { Request, Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "../config/firebase";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

// Custom claim que marca as contas autorizadas a usar a API (definida via scripts/definirStaff.ts)
export const STAFF_CLAIM = "staff";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let decodedToken: DecodedIdToken;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token não fornecido");
    }

    const token = authHeader.split("Bearer ")[1];

    // checkRevoked: contas desativadas ou com tokens revogados perdem acesso imediatamente
    decodedToken = await auth.verifyIdToken(token, true);
  } catch (_error) {
    next(new UnauthorizedError("Token inválido ou expirado"));
    return;
  }

  // Ter uma conta no Firebase não basta: só contas marcadas como staff acessam a API
  if (decodedToken[STAFF_CLAIM] !== true) {
    next(new ForbiddenError("Usuário sem permissão de acesso"));
    return;
  }

  req.user = {
    uid: decodedToken.uid,
    email: decodedToken.email || "",
  };

  next();
};
