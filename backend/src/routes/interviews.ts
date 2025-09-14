import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { generateInterviewQuestions } from '../services/ai';
// PDF simples via pdfkit
import type PDFDocument from 'pdfkit';
const PDFKit: typeof PDFDocument = require('pdfkit');

const router = Router();
router.use(requireAuth);

router.get('/:id', async (req, res) => {
  const interview = await prisma.interview.findUnique({
    where: { id: req.params.id },
    include: { job: true, candidate: true, resume: true, questions: true, report: true },
  });
  if (!interview) return res.status(404).json({ error: 'Entrevista não encontrada' });
  res.json(interview);
});

router.post('/:id/questions', async (req, res) => {
  const interview = await prisma.interview.findUnique({
    where: { id: req.params.id },
    include: { job: true, candidate: true, resume: true },
  });
  if (!interview) return res.status(404).json({ error: 'Entrevista não encontrada' });

  const analysis = (interview.resume?.analysisJson as any) || {};
  const qs = await generateInterviewQuestions({
    resumeSummary: analysis.summary || interview.resume?.textContent.slice(0, 500) || '',
    skills: analysis.skills || [],
    jobDescription: interview.job?.description || '',
    count: Number(req.query.count || 8),
  });
  const created = await prisma.$transaction(
    qs.map((q: string) => prisma.question.create({ data: { interviewId: interview.id, text: q } }))
  );
  res.json(created);
});

router.post('/:id/report', async (req, res) => {
  const interview = await prisma.interview.findUnique({
    where: { id: req.params.id },
    include: { job: true, candidate: true, resume: true, questions: true },
  });
  if (!interview) return res.status(404).json({ error: 'Entrevista não encontrada' });

  const analysis = (interview.resume?.analysisJson as any) || {};
  const html = `
  <html><head><meta charset="utf-8"><style>
    body{font-family:Arial, sans-serif;padding:24px;}
    h1{color:#2763dc;margin-bottom:4px}
    h2{color:#333}
    .section{margin:16px 0}
    .pill{display:inline-block;background:#eef3ff;color:#2763dc;padding:4px 8px;margin:2px;border-radius:12px;font-size:12px}
    .meta{color:#555;font-size:12px}
  </style></head><body>
    <h1>Relatório de Entrevista</h1>
    <div class="meta">Candidato: <b>${interview.candidate.name}</b> | Vaga: <b>${interview.job.title}</b> | Data: ${new Date().toLocaleString('pt-BR')}</div>
    <div class="section"><h2>Resumo</h2><p>${analysis.summary || 'Resumo indisponível'}</p></div>
    <div class="section"><h2>Skills</h2><div>${(analysis.skills||[]).map((s:string)=>`<span class='pill'>${s}</span>`).join('')}</div></div>
    <div class="section"><h2>Perguntas</h2><ol>${interview.questions.map(q=>`<li>${q.text}</li>`).join('')}</ol></div>
  </body></html>`;

  // Store HTML report
  const report = await prisma.report.upsert({
    where: { interviewId: interview.id },
    update: { html },
    create: { interviewId: interview.id, html },
  });
  res.json(report);
});

router.get('/:id/report/pdf', async (req, res) => {
  const report = await prisma.report.findUnique({ where: { interviewId: req.params.id } });
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });

  // Generate simple PDF using pdfkit
  const contentText = report.html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000);
  const doc = new PDFKit({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  doc.on('end', () => {
    const pdf = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="relatorio.pdf"');
    res.send(pdf);
  });
  doc.fillColor('#2763dc').fontSize(20).text('Relatório de Entrevista', { align: 'left' });
  doc.moveDown(0.5);
  doc.fillColor('#333').fontSize(12).text(contentText, { align: 'left' });
  doc.end();
});

export default router;
