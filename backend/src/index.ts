import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";
import { inicializarEventHandlers } from "./services/notificacaoService";

dotenv.config();

// Inicializa os handlers de eventos para comunicação entre serviços
inicializarEventHandlers();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Rotas
app.use("/api", routes);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`FLAMA API rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});

export default app;
