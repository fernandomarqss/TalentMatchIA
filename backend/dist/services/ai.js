"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
exports.analyzeResumeText = analyzeResumeText;
exports.generateInterviewQuestions = generateInterviewQuestions;
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
exports.openai = apiKey ? new openai_1.default({ apiKey }) : null;
async function analyzeResumeText(text, jobDescription) {
    if (!exports.openai) {
        return {
            summary: 'OpenAI API não configurada. Forneça OPENAI_API_KEY.',
            keywords: [],
            skills: [],
            experiences: [],
        };
    }
    const prompt = `Analise o currículo abaixo${jobDescription ? ' considerando a descrição da vaga entre <<>>' : ''}.
Retorne JSON com: summary, keywords[], skills[], experiences[] (cada experience com role, company, duration, highlights[]).
Currículo:
"""
${text.slice(0, 12000)}
"""
${jobDescription ? `<<Vaga>>\n${jobDescription}` : ''}`;
    const resp = await exports.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Você é um assistente de RH especialista em análise de currículos. Responda apenas em JSON válido.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.2,
    });
    const content = resp.choices?.[0]?.message?.content ?? '{}';
    try {
        return JSON.parse(content);
    }
    catch {
        return { summary: content, keywords: [], skills: [], experiences: [] };
    }
}
async function generateInterviewQuestions(input) {
    if (!exports.openai) {
        return [
            'OpenAI API não configurada. Informe OPENAI_API_KEY.',
        ];
    }
    const count = input.count || 8;
    const prompt = `Gere ${count} perguntas de entrevista técnicas e comportamentais, em português, baseadas no resumo abaixo e na vaga se houver. Responda apenas como uma lista JSON de strings.
Resumo do currículo: ${input.resumeSummary}\nSkills: ${(input.skills || []).join(', ')}\nVaga: ${input.jobDescription || 'N/A'}`;
    const resp = await exports.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Você é um entrevistador técnico sênior.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.3,
    });
    const content = resp.choices?.[0]?.message?.content ?? '[]';
    try {
        const arr = JSON.parse(content);
        return Array.isArray(arr) ? arr : [String(content)];
    }
    catch {
        return [content];
    }
}
//# sourceMappingURL=ai.js.map