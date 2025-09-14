# TalentMatchIA

## Sistema de Análise de Currículos e Entrevistas Assistidas por IA

---

### 1. Visão Geral do Projeto

O TalentMatchIA é uma ferramenta inovadora projetada para auxiliar recrutadores e profissionais de RH no processo de triagem de currículos e na condução de entrevistas. Utilizando o poder da Inteligência Artificial, o sistema visa otimizar a seleção de candidatos, fornecendo análises aprofundadas, sugerindo perguntas estratégicas e gerando relatórios objetivos, resultando em um processo de recrutamento mais eficiente, justo e baseado em dados.

### 2. Objetivo Principal

Desenvolver uma plataforma robusta e intuitiva que potencialize a capacidade dos recrutadores de identificar os melhores talentos, minimizando vieses e maximizando a eficácia da seleção através de insights gerados por IA.

### 3. Escopo do Projeto (Funcionalidades Chave)

*   **Upload e Análise de Currículos:**
    *   Permitir o upload de currículos em diversos formatos (PDF, DOCX).
    *   Extração inteligente de informações chave (experiência, habilidades, educação, etc.).
    *   Análise de compatibilidade do currículo com a descrição da vaga utilizando IA.
    *   Geração de um score de compatibilidade.
*   **Assistente de Entrevista com IA:**
    *   Sugestão de perguntas estratégicas e personalizadas para cada candidato, baseadas no currículo e na vaga.
    *   Auxílio em tempo real durante a entrevista (opcional, com considerações de privacidade).
    *   Análise de respostas (se a entrevista for gravada ou transcrita e consentida).
*   **Relatórios e Dashboards:**
    *   Geração de relatórios objetivos sobre o desempenho do candidato.
    *   Comparativos entre candidatos para uma mesma vaga.
    *   Dashboards com métricas de recrutamento (tempo de contratação, qualidade dos candidatos, etc.).
*   **Gerenciamento de Vagas:**
    *   Cadastro e edição de descrições de vagas.
    *   Associação de candidatos a vagas específicas.
*   **Gerenciamento de Candidatos:**
    *   Visualização e organização de perfis de candidatos.
    *   Histórico de interações e feedback.
*   **Perfis de Usuários (Recrutadores):**
    *   Autenticação segura.
    *   Gerenciamento de configurações e preferências.

### 4. Arquitetura do Sistema

A arquitetura do TalentMatchIA será construída com uma abordagem de microsserviços e separação de preocupações, garantindo escalabilidade, flexibilidade e manutenibilidade.

*   **Front-end (Interface do Usuário):**
    *   **Tecnologia:** Flutter
    *   **Propósito:** Desenvolvimento de uma interface de usuário rica, responsiva e performática para aplicações WEB e Mobile a partir de um único codebase. Focará na experiência do usuário (UX) para recrutadores.
*   **Back-end (Lógica de Negócios e APIs):**
    *   **Tecnologia:** Node.js
    *   **Propósito:** Servir como a camada central de processamento. Irá gerenciar a lógica de negócios, autenticação, autorização, comunicação com o banco de dados e orquestração dos serviços de Inteligência Artificial.
    *   **Frameworks/Bibliotecas Potenciais:** Express.js, NestJS (para arquitetura mais estruturada), Mongoose (se houver uso de MongoDB em algum ponto, mas a prioridade é PostgreSQL).
*   **Banco de Dados:**
    *   **Tecnologia:** PostgreSQL
    *   **Propósito:** Armazenamento robusto e relacional de todos os dados do sistema, incluindo perfis de recrutadores, dados de vagas, informações de candidatos, resultados de análises de IA, histórico de entrevistas e relatórios. Escolhido por sua confiabilidade, integridade de dados e suporte a operações complexas.
*   **Módulo/Serviços de Inteligência Artificial (IA):**
    *   **Tecnologia:** Python (para desenvolvimento de modelos), APIs de IA de terceiros (ex: OpenAI, Google AI).
    *   **Propósito:** Componente responsável por todas as funcionalidades de IA, como análise de currículos (NLP), extração de entidades, geração de perguntas, e análise de dados para relatórios. Este módulo será consumido pelo back-end Node.js via APIs.
    *   **Considerações:** Poderá ser implementado como microsserviços dedicados (e.g., usando Flask ou FastAPI em Python) ou através de integrações diretas com plataformas de IA externas.

#### 4.1. Diagrama de Arquitetura Proposto
[ Usuário (Recrutador) ]
|
v
[ Aplicativo/Página WEB (Flutter) ]
| (Requisições HTTP/API RESTful/GraphQL)
v
[ Servidor Back-end (Node.js) ]
| -- Autenticação/Autorização
| -- Lógica de Negócios
| -- Comunicação com IA
| -- Armazenamento/Recuperação de dados
v
[ Módulo/Serviço de IA ] <-- Pode ser:
| -- APIs de IA de Terceiros (OpenAI, etc.)
| -- Modelos de IA customizados (Python/Flask)
|
v
[ Banco de Dados (PostgreSQL) ]
-- Dados de Recrutadores
-- Currículos (referências ou dados sanitizados)
-- Histórico de triagens/entrevistas
-- Configurações de IA

![alt text](<Sem título-1.png>)