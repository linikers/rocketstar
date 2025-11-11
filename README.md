# Rocketstar - Sistema de Votação

Este é um projeto [Next.js](https://nextjs.org/) para um sistema de votação em tempo real. O objetivo é permitir que os usuários votem em diferentes categorias, que são organizadas por dia. Os resultados serão armazenados em um banco de dados MongoDB e uma interface com QR code facilitará o acesso dos votantes às enquetes do dia. O sistema permitirá o registro de competidores e a contabilização de votos por jurado.

## Andamento do Projeto

Esta seção detalha o status atual do desenvolvimento, o que já foi implementado e o que ainda precisa ser feito.

### Funcionalidades Implementadas

Com base na análise, as seguintes funcionalidades já estão implementadas e prontas para uso com MongoDB:

-   **Estrutura Inicial do Projeto:** Projeto configurado com Next.js.
-   **Conexão com MongoDB:** Configuração básica para conexão com o MongoDB.
-   **Registro de Competidores:**
    -   API (`/api/save`) para cadastrar novos competidores no MongoDB.
    -   Interface de usuário (`Register.tsx`) para o registro de competidores, incluindo nome, trabalho e categoria.
-   **Contabilização de Votos:**
    -   API (`/api/vote`) para registrar votos de jurados em competidores específicos.
    -   Lógica de backend para atualizar o array de votos e recalcular os scores totais do competidor de forma atômica no MongoDB.
-   **Listagem de Competidores:**
    -   API (`/api/list`) para listar todos os competidores cadastrados no MongoDB.
-   **Modelos de Dados:** Modelos `Competidor` e `Jurado` definidos para o MongoDB.

### Próximos Passos / Funcionalidades Faltantes

Para que o sistema de votação esteja completo e atenda a todos os requisitos, as seguintes funcionalidades precisam ser desenvolvidas:

1.  **Estrutura de Eventos/Votações por Dia (Model `Evento`):**
    -   [ ] **Criar Model `Evento`:** Implementar um modelo `Evento` (ou `Votacao`) para agrupar categorias e competidores por data, permitindo gerenciar "votações do dia".
    -   [ ] **Atualizar Model `Competidor`:** Modificar o modelo `Competidor` para incluir uma referência ao `Evento` ao qual pertence.
    -   [ ] **Atualizar API de Registro (`/api/save`):** Adaptar a API para associar competidores a um `Evento` específico.
    -   [ ] **APIs de Gerenciamento de Eventos:** Criar APIs para criar, listar e gerenciar os eventos de votação.

2.  **Página Pública de Votação e QR Code:**
    -   [ ] **Página de Votação:** Desenvolver uma página no frontend (`/votacao` ou similar) que:
        -   Busque e exiba os `Eventos` ativos para o dia atual.
        -   Liste as categorias e os competidores associados a esses eventos.
        -   Permita que os usuários visualizem os competidores e registrem seus votos (interagindo com a API `/api/vote`).
    -   [ ] **Geração de QR Code:** Implementar a funcionalidade para gerar um QR Code que direcione os votantes para a página de votação do dia.
    -   [ ] **Controle de Voto por Jurado/Dispositivo:** Implementar a lógica para garantir que um jurado (ou dispositivo) vote apenas uma vez por competidor/categoria, conforme o requisito.
3.  **Visualização de Resultados:**
    -   [ ] Criar uma página ou seção para exibir os resultados das votações em tempo real ou após o encerramento, possivelmente com gráficos e rankings.

## Como Iniciar

Primeiro, execute o servidor de desenvolvimento:

```bash
npm run dev # ou yarn dev, pnpm dev, bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
