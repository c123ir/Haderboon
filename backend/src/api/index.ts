// backend/src/api/index.ts

import { Router } from 'express';
import { authRouter } from './auth';

const apiRouter = Router();

// تمام مسیرهایی که با /auth شروع میشوند به authRouter فرستاده میشوند
apiRouter.use('/auth', authRouter);

export { apiRouter };