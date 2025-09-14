import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAuth);

const jobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  requirements: z.string().min(5),
  status: z.enum(['open', 'closed']).optional(),
});

router.get('/', async (_req, res) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(jobs);
});

router.post('/', async (req, res) => {
  const parsed = jobSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { status, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (typeof status === 'string') data.status = status;
  const job = await prisma.job.create({ data });
  res.status(201).json(job);
});

router.get('/:id', async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });
  res.json(job);
});

router.put('/:id', async (req, res) => {
  const parsed = jobSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { status, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (typeof status === 'string') data.status = status;
  try {
    const job = await prisma.job.update({ where: { id: req.params.id }, data });
    res.json(job);
  } catch {
    res.status(404).json({ error: 'Job não encontrado' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Job não encontrado' });
  }
});

export default router;
