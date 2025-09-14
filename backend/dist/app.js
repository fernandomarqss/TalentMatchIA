"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const resumes_1 = __importDefault(require("./routes/resumes"));
const interviews_1 = __importDefault(require("./routes/interviews"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const app = (0, express_1.default)();
const allowOrigin = (process.env.ALLOW_ORIGIN || '').split(',').filter(Boolean);
app.use((0, cors_1.default)({ origin: allowOrigin.length ? allowOrigin : true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', auth_1.default);
app.use('/jobs', jobs_1.default);
app.use('/resumes', resumes_1.default);
app.use('/interviews', interviews_1.default);
app.use('/dashboard', dashboard_1.default);
// Static for generated files (PDFs, etc.)
app.use('/public', express_1.default.static(path_1.default.join(process.cwd(), 'public')));
exports.default = app;
//# sourceMappingURL=app.js.map