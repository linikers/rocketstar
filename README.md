# Rocketstar - Sistema de Votação

Este é um projeto Next.js para um sistema de votação em tempo real. O objetivo é permitir que os usuários votem em diferentes categorias, que são organizadas por dia. Os resultados serão armazenados em um banco de dados MongoDB e uma interface com QR code facilitará o acesso dos votantes às enquetes do dia.

## Andamento do Projeto

Esta seção detalha o status atual do desenvolvimento, o que já foi implementado e o que ainda precisa ser feito.

### Funcionalidades Implementadas

Com base na análise, o seguinte já está funcional:

-   **Estrutura Inicial do Projeto:** Projeto configurado com Next.js.
-   **Cadastro de Categorias por Dia:** A lógica para cadastrar e organizar as categorias de votação de acordo com a data está implementada.

### Próximos Passos / Funcionalidades Faltantes

Para que o sistema de votação esteja completo, as seguintes funcionalidades precisam ser desenvolvidas:

1.  **Contabilização dos Votos:**
    -   [ ] Criar a lógica de backend para receber e incrementar os votos para cada opção dentro de uma categoria.
    -   [ ] Garantir que um usuário/dispositivo não possa votar múltiplas vezes na mesma categoria (se for um requisito).

2.  **Integração com MongoDB:**
    -   [ ] Configurar a conexão com um banco de dados MongoDB.
    -   [ ] Definir os *schemas* para as coleções (ex: `Categorias`, `OpcoesDeVoto`, `Votos`).
    -   [ ] Implementar as rotas de API para salvar e recuperar os dados do MongoDB (categorias, votos, etc.). Atualmente, os dados podem estar sendo armazenados de forma volátil.

3.  **Página de Acesso para Votantes com QR Code:**
    -   [ ] Desenvolver uma página pública (`/votacao` ou similar) que exiba as categorias de votação ativas para o dia atual.
    -   [ ] Criar uma interface para o usuário selecionar uma opção e registrar seu voto.
    -   [ ] Gerar um QR Code que aponte para a URL desta página de votação, para ser facilmente compartilhado.

## Como Iniciar

Primeiro, execute o servidor de desenvolvimento:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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
