# ITCC Planner v0.4.1

Correção de compatibilidade visual da v0.4.0.

## Objetivo

A v0.4.1 volta a usar literalmente a linguagem visual da v0.2.0 — inclusive login em duas colunas, sidebar fixa azul-marinho, topbar de 68 px, cartões, tabelas, grids, modais, badges, Gantt e responsividade — mantendo as funcionalidades acrescentadas na v0.4.0.

## Acesso

- Usuário: `ITCC`
- Senha: `ITCC`
- Abra `index.html` diretamente no navegador.

## Funcionalidades preservadas da v0.2.0

- Login original em duas áreas.
- Sidebar fixa e navegação por módulos.
- Tema sistema/claro/escuro.
- Múltiplos projetos, proprietário e compartilhamento.
- Dashboard com KPIs, saúde do estudo, recomendações e Curva ABC.
- Gerenciamento de zonas e mapa gerencial com imagem de planta opcional.
- Orçamento, Gantt/planejamento, equipes, logística, riscos, cenários.
- Matriz multicritério, prós/contras e insights automáticos.
- Canteiro, referências, comentários, auditoria e usuários.
- Importação/exportação JSON e exportação CSV.

## Funcionalidades da v0.4.0 mantidas

CRUD e agrupamento visual para:
- itens orçamentários;
- atividades;
- suprimentos;
- fontes;
- fornecedores;
- cotações/preços.

Fontes:
- SINAPI - Média Nacional;
- SINAPI - DF;
- SICRO - Média Nacional;
- SICRO - DF;
- pesquisa de mercado nacional;
- pesquisa regional Brasília/DF;
- fornecedor individual.

Os agrupamentos são somente visuais: nenhum item elementar deixa de existir em sua própria linha.

## Baseline Santa Terezinha

A configuração inicial continua reproduzindo a Entrega 1, sem alterá-la:
- EPS LT20: R$ 206,29/m²;
- cerâmica LT20: R$ 202,39/m²;
- nervurada: R$ 230,62/m²;
- maciça: R$ 263,19/m²;
- matriz: EPS 84,6; cerâmica 83,6; nervurada 72,2; maciça 63,0;
- área paramétrica: 235 m²;
- orçamento-base: R$ 48.478,15.

## Validação

O diretório `tests` contém:
- `validate.mjs`: paridade estrutural, baseline econômica e presença de funcionalidades;
- `layout.spec.mjs`: testes em Chromium para desktop/mobile, login, sidebar, topbar, overflow, modais, temas e CRUD.

A folha `docs/v0.2.0_LAYOUT_REFERENCE.css` é a referência visual congelada. Ela deve permanecer byte a byte idêntica a `assets/css/v020-baseline.css`.
