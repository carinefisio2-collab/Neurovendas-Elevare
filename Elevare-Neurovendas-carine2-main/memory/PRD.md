# PRD - Elevare NeuroVendas

## Visão Geral
Plataforma SaaS premium para profissionais da estética que automatiza vendas, cria conteúdo estratégico e gerencia negócios com IA.

## Stack Técnico
- **Backend**: FastAPI + Python + MongoDB
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Database**: MongoDB
- **Auth**: JWT Token-based authentication
- **AI**: OpenAI GPT-4o (via chave direta + emergentintegrations)
- **PDF**: fpdf2 para geração de PDF
- **Image AI**: gpt-image-1 para geração de capas
- **PDF Viewer**: PDF.js (renderização client-side)

## Status Atual: BETA MODE ATIVO
- Todas as features PRO desbloqueadas
- Sistema de créditos em modo infinito
- Pronto para testes de usuários

---

## ATUALIZAÇÃO ESTRATÉGICA (14 Jan 2026) - CAMADA INICIANTE

### Filosofia de Produto
> "A plataforma que pensa por você, mas caminha com você."

**Princípios:**
- Menos "olha tudo o que eu faço"
- Mais "vem aqui, eu te conduzo"

### Paleta Premium Oficial
```css
--elevare-lavanda: #8A7CA8    /* Primário - botões, destaques */
--elevare-lavanda-light: #9B8FCB /* Secundário - backgrounds, cards */
--elevare-petroleo: #34495E   /* Textos, cabeçalhos */
--elevare-dourado: #D4AF37    /* Acentos, CTAs hover */
--elevare-neutro: #F8F7FC     /* Fundo neutro */
```

### Dashboard Camada Iniciante (IMPLEMENTADO ✅)
**Conceito:** Dashboard como ROTEIRO, não menu

**Estrutura:**
1. **Roteiro de 4 etapas:**
   - Fazer diagnóstico → Criar primeiro conteúdo → Organizar vendas → Acompanhar leads
2. **Barra de progresso visual** (X de 4 concluídas)
3. **Etapa ativa destacada** com borda e ícone
4. **Ferramentas extras** (só 4, não 10+)
5. **Indicador de créditos** (sutil, no rodapé)

### Menu Lateral Simplificado (IMPLEMENTADO ✅)
**Antes:** 15+ itens em 5 seções confusas
**Depois:** 12 itens em 3 seções claras

| Seção | Itens |
|-------|-------|
| ANÁLISE | Meu Diagnóstico, Análise do Instagram, Histórico |
| CRIAR CONTEÚDO | Criador de Posts (IA), Stories Prontos, E-books, Artigos para Blog |
| VENDER MAIS | Scripts WhatsApp, Meus Leads, Calendário |

### Renomeação de Jargões (IMPLEMENTADO ✅)
| Antes (confuso) | Agora (claro) |
|-----------------|---------------|
| Dashboard | Início |
| Diagnóstico Premium | Meu Diagnóstico |
| Diagnóstico de Presença | Análise do Instagram |
| Assistente de Conteúdo / Robô Produtor | Criador de Posts |
| Stories em Sequência | Stories Prontos |
| Scripts de Vendas | Scripts WhatsApp |
| Gestão de Leads | Meus Leads |
| Blog & Artigos | Artigos para Blog |

### Correções de Navegação (IMPLEMENTADO ✅)
- `/dashboard/story-sequences` → redireciona para `/dashboard/stories`
- `/dashboard/central` → redireciona para `/dashboard/biblioteca`
- Todos os links 404 corrigidos

### Página E-books (MELHORADA ✅)
- Ícone visual centralizado
- Fluxo de 4 passos com ícones visuais
- Cards de benefícios ("Rápido", "Estratégico")
- CTA claro com info de créditos
- Mantém elegância com vida visual

---

## PRÓXIMAS TAREFAS (Backlog)

### P0 - Crítico
- [ ] Configurar GAMMA_API_KEY para ativar geração de E-books e Blog
- [ ] Implementar Tour Guiado (3 telas) pós-diagnóstico

### P1 - Alto
- [ ] Quick Win obrigatório: Gerar 1 post em 30 segundos
- [ ] Integrar E-book Generator com API Gamma (`/api/gamma/create-ebook`)
- [ ] Integrar visualizador de e-books (`/public/ebook-viewer/`)

### P2 - Médio
- [ ] Refatorar `server.py` (6000+ linhas → módulos separados)
- [ ] Implementar Camadas de Experiência (Iniciante/Evolução/Avançada)
- [ ] Testar estabilidade de sessão (logout aleatório)

### P3 - Baixo
- [ ] Implementar callbacks OAuth (Instagram, Canva)
- [ ] Criar tela comparativa de planos (FREE/PRO/PRO+)
- [ ] Cleanup de arquivos obsoletos

---

## Features Funcionais
- [x] Autenticação JWT
- [x] Dashboard com roteiro visual
- [x] Diagnóstico Premium completo
- [x] Análise de Presença (Radar Bio)
- [x] Histórico de Diagnósticos
- [x] Criador de Posts (Robô Produtor)
- [x] Stories em Sequência
- [x] Scripts de WhatsApp
- [x] Gestão de Leads
- [x] Calendário Estratégico
- [x] Sistema de créditos
- [ ] E-books via Gamma API (aguardando key)
- [ ] Blog via Gamma API (aguardando key)

---

## Credenciais de Teste
- **Email:** beta@teste.com
- **Password:** senha123

## URLs Importantes
- **Preview:** https://aivendas-1.preview.emergentagent.com
- **Landing Reference:** https://aivendas-1.preview.emergentagent.com/

---
## Changelog - 16/01/2025

### Integração Completa do ZIP do Usuário
- ✅ **Nova Landing Page** com 19 componentes modulares
- ✅ **Novos Funis Públicos**: Hub Inicial, Diagnóstico Gratuito, Análise Presença Digital
- ✅ **Páginas Legais**: Termos de Uso, Política de Privacidade
- ✅ **Backend Routers Modularizados**: ai, auth, dashboard, diagnosis, ebooks, gamification, onboarding, payments
- ✅ **Novos Services**: ebook_generator_v2, email_service, neurovendas_prompts
- ✅ **Novos Utils**: ai_retry, plan_limits
- ✅ **App.tsx** atualizado com todas as rotas

### Arquivos Adicionados
- `/components/landing/` (19 componentes)
- `/pages/LandingNew.tsx`, `HubInicial.tsx`, `DiagnosticoGratuito.tsx`, etc.
- `/backend/routers/` (9 arquivos)
- `/data/mock.js` (dados para landing page)
