import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
(async () => {
  const port = Number(process.env.APP_PORT || 4000);
  await prisma.$connect();
  app.listen(port, () => {
    console.log(`TalentMatchIA API rodando na porta ${port}`);
  });
})();

