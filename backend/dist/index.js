"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
(async () => {
    const port = Number(process.env.APP_PORT || 4000);
    await prisma.$connect();
    app_1.default.listen(port, () => {
        console.log(`TalentMatchIA API rodando na porta ${port}`);
    });
})();
//# sourceMappingURL=index.js.map