TalentMatchIA — Implementação (MVP)

Stack
- Frontend: Flutter (Web e Mobile)
- Backend: Node.js + TypeScript + Express + Prisma
- Banco: PostgreSQL
- IA: OpenAI API (GPT-4o-mini)

Como rodar
- Banco (PostgreSQL): crie DB e configure `backend/.env` a partir de `backend/.env.example`.
- Backend:
  - `cd backend`
  - `npm install`
  - `npx prisma generate`
  - `npx prisma migrate dev -n init`
  - Dev: `npm run dev`
  - Prod: `npm run build && npm start`
- Frontend (Flutter):
  - `cd frontend`
  - `flutter pub get`
  - Web: `flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:4000`
  - Mobile: `flutter run --dart-define=API_BASE_URL=http://SEU_IP:4000`

Endpoints principais
- Auth: `POST /auth/register`, `POST /auth/login`
- Vagas: `GET/POST/PUT/DELETE /jobs`
- Currículos: `POST /resumes/upload` (multipart: `file`, `candidate`, `jobId` opcional)
- Entrevistas: `POST /interviews/:id/questions`, `POST /interviews/:id/report`, `GET /interviews/:id/report/pdf`
- Dashboard: `GET /dashboard`

Segurança e LGPD
- Hash de senhas (bcrypt), JWT com expiração, CORS configurável.
- Aceite de LGPD em `User.acceptedLGPD`.
- Armazena apenas texto do currículo e análise; ajuste retenção conforme política.

Próximos passos
- Integração GitHub API; histórico de entrevistas; transcrição/avaliação em tempo real; logs de auditoria.
