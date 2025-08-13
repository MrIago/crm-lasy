## Lasy CRM

Mini CRM responsivo desenvolvido com Next.js, TypeScript e Firebase, focado em usabilidade e design moderno.

### Demo ao vivo

Site em produção na Netlify: [crmlasy.netlify.app](https://crmlasy.netlify.app)

### Vídeo de apresentação

<iframe width="100%" height="420" src="https://www.youtube.com/embed/KXuJnqp8JFc" title="Apresentação Lasy CRM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Caso seu visualizador não suporte iframes, use o link abaixo:

[Assista no YouTube](https://www.youtube.com/watch?v=KXuJnqp8JFc)

Ou clique na thumbnail:

[![Assista à apresentação no YouTube](https://img.youtube.com/vi/KXuJnqp8JFc/maxresdefault.jpg)](https://www.youtube.com/watch?v=KXuJnqp8JFc)

### Funcionalidades

- **Autenticação de usuário**: Firebase Auth com RBAC
- **Pipeline Kanban**: drag & drop com colunas personalizáveis
- **Inserção e Importação**: formulários e upload de CSV/XLSX
- **Busca e Filtros**: por nome, estágio, data e origem
- **Exportação de dados**: download em planilha Excel
- **Detalhes do lead**: visualização e edição completas
- **Histórico de interações**: timeline por lead
- **Design responsivo**: interface otimizada para desktop e mobile
- **UX otimizada**: foco nas tarefas mais comuns
- **Validações e máscaras**: campos formatados e validados

### Stack Tecnológica

- **Next.js 15** (React)
- **Firestore** (NoSQL Database)
- **Firebase Auth**
- **shadcn/ui** (componentes)
- **Tailwind CSS** (estilos)
- **Zustand** (state management)

### Como executar localmente

Pré-requisitos: Node.js 18+ e pnpm/yarn/npm/bun.

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Alternativas
# npm run dev
# yarn dev
# bun dev
```

Abra `http://localhost:3000` no navegador.

### Estrutura e notas

- Página inicial em `src/app/page.tsx` com o vídeo e links rápidos.
- Componentes de UI baseados em `shadcn/ui` e estilos com Tailwind.
- Estado global com `Zustand` e autenticação com `Firebase Auth`.

### Deploy

Aplicação publicada na Netlify: [crmlasy.netlify.app](https://crmlasy.netlify.app)
