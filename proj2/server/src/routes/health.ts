import { Router } from 'express';

import { env } from '../env';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'RouteDash API',
    environment: env.NODE_ENV,
  });
});
