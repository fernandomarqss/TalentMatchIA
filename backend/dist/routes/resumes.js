"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const ai_1 = require("../services/ai");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const upload = (0, multer_1.default)({ limits: { fileSize: 5 * 1024 * 1024 } });
const candidateSchema = zod_1.z.object({ name: zod_1.z.string().min(2), email: zod_1.z.string().email().optional(), github: zod_1.z.string().url().optional() });
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const candidateData = candidateSchema.parse(JSON.parse(String(req.body.candidate || '{}')));
        const jobId = String(req.body.jobId || '');
        if (!req.file)
            return res.status(400).json({ error: 'Arquivo não enviado' });
        const { originalname, mimetype, size, buffer } = req.file;
        let text = '';
        if (mimetype === 'application/pdf') {
            const data = await (0, pdf_parse_1.default)(buffer);
            text = data.text;
        }
        else if (mimetype === 'text/plain') {
            text = buffer.toString('utf8');
        }
        else {
            return res.status(400).json({ error: 'Formatos aceitos: PDF ou TXT' });
        }
        // Persist candidate
        const candidate = await prisma_1.prisma.candidate.upsert({
            where: { email: candidateData.email || `${candidateData.name}@anon.local` },
            update: { name: candidateData.name, github: candidateData.github ?? null },
            create: { name: candidateData.name, email: candidateData.email || `${candidateData.name}@anon.local`, github: candidateData.github ?? null },
        });
        // Get job description if provided
        const job = jobId ? await prisma_1.prisma.job.findUnique({ where: { id: jobId } }) : null;
        const analysis = await (0, ai_1.analyzeResumeText)(text, job?.description);
        const resume = await prisma_1.prisma.resume.create({
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
            interview = await prisma_1.prisma.interview.create({ data: { jobId: job.id, candidateId: candidate.id, resumeId: resume.id } });
        }
        res.json({ candidate, resume, interview });
    }
    catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message || 'Falha no upload/análise' });
    }
});
router.get('/:id', async (req, res) => {
    const resume = await prisma_1.prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!resume)
        return res.status(404).json({ error: 'Não encontrado' });
    res.json(resume);
});
exports.default = router;
//# sourceMappingURL=resumes.js.map