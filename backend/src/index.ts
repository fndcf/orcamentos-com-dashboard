import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as functions from "firebase-functions";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { origemCors } from "./config/cors";
import { inicializarEventHandlers } from "./services/notificacaoService";

dotenv.config();

// Inicializa os handlers de eventos para comunicação entre serviços
inicializarEventHandlers();

const app = express();

// Não anunciar a tecnologia do backend nas respostas
app.disable("x-powered-by");

// Middlewares
app.use(
  cors({
    origin: origemCors(),
    credentials: true,
  })
);
app.use(express.json());

// Rotas
app.use("/api", routes);

// Error Handler
app.use(errorHandler);

// Export para Firebase Cloud Functions
// Roda com a service account dedicada (Firestore + leitura do Firebase Auth), não com a padrão do Compute
export const api = functions.https.onRequest({ serviceAccount: "flama-api@" }, app);

export default app;
