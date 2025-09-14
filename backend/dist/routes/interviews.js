"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const ai_1 = require("../services/ai");
const PDFKit = require('pdfkit');
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/:id', async (req, res) => {
    const interview = await prisma_1.prisma.interview.findUnique({
        where: { id: req.params.id },
        include: { job: true, candidate: true, resume: true, questions: true, report: true },
    });
    if (!interview)
        return res.status(404).json({ error: 'Entrevista não encontrada' });
    res.json(interview);
});
router.post('/:id/questions', async (req, res) => {
    const interview = await prisma_1.prisma.interview.findUnique({
        where: { id: req.params.id },
        include: { job: true, candidate: true, resume: true },
    });
    if (!interview)
        return res.status(404).json({ error: 'Entrevista não encontrada' });
    const analysis = interview.resume?.analysisJson || {};
    const qs = await (0, ai_1.generateInterviewQuestions)({
        resumeSummary: analysis.summary || interview.resume?.textContent.slice(0, 500) || '',
        skills: analysis.skills || [],
        jobDescription: interview.job?.description || '',
        count: Number(req.query.count || 8),
    });
    const created = await prisma_1.prisma.$transaction(qs.map((q) => prisma_1.prisma.question.create({ data: { interviewId: interview.id, text: q } })));
    res.json(created);
});
router.post('/:id/report', async (req, res) => {
    const interview = await prisma_1.prisma.interview.findUnique({
        where: { id: req.params.id },
        include: { job: true, candidate: true, resume: true, questions: true },
    });
    if (!interview)
        return res.status(404).json({ error: 'Entrevista não encontrada' });
    const analysis = interview.resume?.analysisJson || {};
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
    <div class="section"><h2>Skills</h2><div>${(analysis.skills || []).map((s) => `<span class='pill'>${s}</span>`).join('')}</div></div>
    <div class="section"><h2>Perguntas</h2><ol>${interview.questions.map(q => `<li>${q.text}</li>`).join('')}</ol></div>
  </body></html>`;
    // Store HTML report
    const report = await prisma_1.prisma.report.upsert({
        where: { interviewId: interview.id },
        update: { html },
        create: { interviewId: interview.id, html },
    });
    res.json(report);
});
router.get('/:id/report/pdf', async (req, res) => {
    const report = await prisma_1.prisma.report.findUnique({ where: { interviewId: req.params.id } });
    if (!report)
        return res.status(404).json({ error: 'Relatório não encontrado' });
    // Generate simple PDF using pdfkit
    const contentText = report.html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000);
    const doc = new PDFKit({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
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
exports.default = router;
//# sourceMappingURL=interviews.js.map