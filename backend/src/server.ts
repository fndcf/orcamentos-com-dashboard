import app from "./index";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`FLAMA API rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});
