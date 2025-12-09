import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FLAMA API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
