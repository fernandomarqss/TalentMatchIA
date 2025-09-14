import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import resumesRouter from './routes/resumes';
import interviewsRouter from './routes/interviews';
import dashboardRouter from './routes/dashboard';

const app = express();

const allowOrigin = (process.env.ALLOW_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({ origin: allowOrigin.length ? allowOrigin : true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/jobs', jobsRouter);
app.use('/resumes', resumesRouter);
app.use('/interviews', interviewsRouter);
app.use('/dashboard', dashboardRouter);

// Static for generated files (PDFs, etc.)
app.use('/public', express.static(path.join(process.cwd(), 'public')));

export default app;

