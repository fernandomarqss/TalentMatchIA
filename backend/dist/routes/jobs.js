"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const jobSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().min(10),
    requirements: zod_1.z.string().min(5),
    status: zod_1.z.enum(['open', 'closed']).optional(),
});
router.get('/', async (_req, res) => {
    const jobs = await prisma_1.prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(jobs);
});
router.post('/', async (req, res) => {
    const parsed = jobSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error);
    const { status, ...rest } = parsed.data;
    const data = { ...rest };
    if (typeof status === 'string')
        data.status = status;
    const job = await prisma_1.prisma.job.create({ data });
    res.status(201).json(job);
});
router.get('/:id', async (req, res) => {
    const job = await prisma_1.prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job)
        return res.status(404).json({ error: 'Job não encontrado' });
    res.json(job);
});
router.put('/:id', async (req, res) => {
    const parsed = jobSchema.partial().safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error);
    const { status, ...rest } = parsed.data;
    const data = { ...rest };
    if (typeof status === 'string')
        data.status = status;
    try {
        const job = await prisma_1.prisma.job.update({ where: { id: req.params.id }, data });
        res.json(job);
    }
    catch {
        res.status(404).json({ error: 'Job não encontrado' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.prisma.job.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch {
        res.status(404).json({ error: 'Job não encontrado' });
    }
});
exports.default = router;
//# sourceMappingURL=jobs.js.map