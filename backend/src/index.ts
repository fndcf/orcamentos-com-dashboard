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
export const api = functions.https.onRequest(app);

export default app;
