import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  const [jobs, candidates, interviews] = await Promise.all([
    prisma.job.count(),
    prisma.candidate.count(),
    prisma.interview.count(),
  ]);
  res.json({ jobs, candidates, interviews });
});

export default router;

