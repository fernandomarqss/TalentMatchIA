import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { analyzeResumeText } from '../services/ai';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const candidateSchema = z.object({ name: z.string().min(2), email: z.string().email().optional(), github: z.string().url().optional() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const candidateData = candidateSchema.parse(JSON.parse(String(req.body.candidate || '{}')));
    const jobId = String(req.body.jobId || '');
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
    const { originalname, mimetype, size, buffer } = req.file as any;
    let text = '';
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (mimetype === 'text/plain') {
      text = buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Formatos aceitos: PDF ou TXT' });
    }

    // Persist candidate
    const candidate = await prisma.candidate.upsert({
      where: { email: candidateData.email || `${candidateData.name}@anon.local` },
      update: { name: candidateData.name, github: candidateData.github ?? null },
      create: { name: candidateData.name, email: candidateData.email || `${candidateData.name}@anon.local`, github: candidateData.github ?? null },
    });

    // Get job description if provided
    const job = jobId ? await prisma.job.findUnique({ where: { id: jobId } }) : null;
    const analysis = await analyzeResumeText(text, job?.description);

    const resume = await prisma.resume.create({
      data: {
        filename: originalname,
        mimetype,
        size,
        textContent: text.slice(0, 15000),
        analysisJson: analysis,
        candidateId: candidate.id,
      },
    });

    let interview = null;
    if (job) {
      interview = await prisma.interview.create({ data: { jobId: job.id, candidateId: candidate.id, resumeId: resume.id } });
    }

    res.json({ candidate, resume, interview });
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e.message || 'Falha no upload/análise' });
  }
});

router.get('/:id', async (req, res) => {
  const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
  if (!resume) return res.status(404).json({ error: 'Não encontrado' });
  res.json(resume);
});

export default router;
