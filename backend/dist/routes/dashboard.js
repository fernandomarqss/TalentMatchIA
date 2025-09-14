"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (_req, res) => {
    const [jobs, candidates, interviews] = await Promise.all([
        prisma_1.prisma.job.count(),
        prisma_1.prisma.candidate.count(),
        prisma_1.prisma.interview.count(),
    ]);
    res.json({ jobs, candidates, interviews });
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map