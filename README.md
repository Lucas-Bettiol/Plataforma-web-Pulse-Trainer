# PulseTrainer

> **Performance · Evolução · Resultado**

Plataforma web completa para academias e personal trainers, com foco em acompanhamento de treinos, evolução física e gamificação. Desenvolvida como projeto acadêmico (A3), a aplicação roda 100% no navegador — sem back-end, sem banco de dados externo.

**Demo ao vivo:** [pulsetrainerproject.vercel.app](https://pulsetrainerproject.vercel.app)

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [Acesso Demo](#acesso-demo)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)

---

## Visão Geral

O PulseTrainer é uma SPA (Single Page Application) voltada para o universo fitness. A plataforma possui dois perfis de acesso — **Aluno** e **Personal Trainer** — cada um com dashboards e funcionalidades dedicadas.

Todos os dados são persistidos via **LocalStorage**, tornando a aplicação totalmente autônoma no lado do cliente.

---

## Funcionalidades

### Área do Aluno

| Módulo | Descrição |
|---|---|
| **Dashboard** | Visão geral de XP, nível, streak semanal e progresso de metas |
| **Treinos** | Visualização dos treinos cadastrados pelo personal, com séries e exercícios |
| **Evolução** | Acompanhamento de peso, % de gordura e histórico de medidas |
| **Fotos** | Registro de fotos de progresso ao longo do tempo |
| **Metas** | Metas pessoais com acompanhamento de conclusão |
| **Feedbacks** | Canal de comunicação com o personal trainer |
| **Desafios** | Participação em desafios coletivos com ranking |
| **Ranking** | Classificação geral entre alunos por XP |
| **Conquistas** | Badges desbloqueáveis por marcos atingidos |
| **Perfil** | Edição de dados pessoais e físicos |

### Área do Personal Trainer (Admin)

| Módulo | Descrição |
|---|---|
| **Dashboard Admin** | Painel com visão geral da academia e alunos |
| **Alunos** | Cadastro, edição, listagem e remoção de alunos |
| **Treinos** | Criação e atribuição de treinos personalizados |
| **Feedbacks** | Envio de mensagens e orientações para os alunos |
| **Metas** | Definição de metas para os alunos |
| **Desafios** | Criação e gerenciamento de desafios coletivos |
| **Configurações** | Dados da academia e configuração de XP por ação |

### Gamificação

O sistema de progressão conta com:

- **XP (Pontos de Experiência)** ganhos por treinos concluídos, metas batidas, streaks, participação em desafios e mais
- **Níveis:** Bronze → Prata → Ouro → Platina → Diamond
- **Badges:** conquistas desbloqueáveis por marcos (primeiro treino, 7 dias seguidos, 50 treinos, etc.)
- **Ranking** entre todos os alunos da academia

---

## Tecnologias

- **HTML5** — estrutura e marcação semântica
- **CSS3** — estilização responsiva com variáveis CSS e temas claro/escuro
- **JavaScript (Vanilla ES6+)** — lógica da aplicação sem frameworks
- **LocalStorage** — persistência de dados no navegador
- **Google Fonts** — fontes Orbitron e Exo 2
- **Vercel** — hospedagem e deploy contínuo

---

## Como Executar

Por ser uma aplicação puramente estática, não é necessário instalar dependências ou rodar um servidor.

**Opção 1 — Abrir direto no navegador:**
```bash
# Clone o repositório
git clone https://github.com/Lucas-Bettiol/Plataforma-web-Pulse-Trainer.git

# Acesse a pasta
cd Plataforma-web-Pulse-Trainer/SitePulseTrainerA3

# Abra o arquivo no navegador
# Clique duas vezes em index.html, ou use uma extensão como Live Server no VS Code
```

**Opção 2 — Live Server (VS Code):**
1. Instale a extensão **Live Server** no VS Code
2. Abra a pasta `SitePulseTrainerA3`
3. Clique com botão direito em `index.html` → **Open with Live Server**

---

## Acesso Demo

A aplicação já vem com dados de demonstração pré-carregados no LocalStorage.

| Perfil | CPF | Senha |
|---|---|---|
| Aluno | `123.456.789-09` | `123456` |
| Personal | `987.654.321-00` | `admin123` |

---

## Estrutura do Projeto

```
Plataforma-web-Pulse-Trainer/
└── SitePulseTrainerA3/
    ├── index.html      # SPA principal — toda a interface da aplicação
    ├── cadastro.html   # Tela de cadastro de novos alunos
    ├── app.js          # Lógica principal: roteamento, renderização e eventos
    ├── storage.js      # Camada de dados: CRUD via LocalStorage
    ├── ui.js           # Utilitários de interface: modais, toasts, tema
    ├── style.css       # Estilos globais, temas e responsividade
    ├── og-image.png    # Imagem para Open Graph / redes sociais
    └── vercel.json     # Configuração de deploy na Vercel
```

---

## Deploy

O projeto está configurado para deploy automático na **Vercel** via `vercel.json`, com:

- URLs limpas (`/cadastro` ao invés de `/cadastro.html`)
- Headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Cache imutável para assets estáticos (JS e CSS)

Para fazer seu próprio deploy:
1. Faça um fork do repositório
2. Importe o projeto na [Vercel](https://vercel.com)
3. Defina o diretório raiz como `SitePulseTrainerA3`
4. Clique em **Deploy**