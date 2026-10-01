# ITCC Planner v0.5.0

Versão de correção orçamentária baseada integralmente na v0.4.1.

## Escopo desta versão

A v0.5.0 altera somente os dados derivados do orçamento-base e os metadados de versão. O layout, CSS, estrutura de telas, navegação e funcionalidades permanecem iguais à v0.4.1, que já preservava a linguagem visual da v0.2.0.

## Acesso

- Usuário: `ITCC`
- Senha: `ITCC`
- Abra `index.html` diretamente no navegador.

## Correção do orçamento-base

A Entrega 1 compara os sistemas por R$/m² e usa uma área acadêmica padrão de 100 m² para o orçamento comparativo.

- EPS LT20: R$ 206,29/m²
- Área comparativa do orçamento-base: 100 m²
- Orçamento-base: R$ 20.629,00

As cinco zonas gerenciais continuam com as áreas paramétricas originais:
- Z1: 100 m²
- Z2: 30 m²
- Z3: 45 m²
- Z4: 35 m²
- Z5: 25 m²
- Soma paramétrica: 235 m²

Os 235 m² permanecem apenas como simulação gerencial de zonas e não alimentam o orçamento-base.

## Valores preservados da Entrega 1

- EPS LT20: R$ 206,29/m²
- Cerâmica LT20: R$ 202,39/m²
- Nervurada: R$ 230,62/m²
- Maciça: R$ 263,19/m²
- Matriz: EPS 84,6; cerâmica 83,6; nervurada 72,2; maciça 63,0
- Solução recomendada: EPS LT20

## Funcionalidades preservadas

Todas as funcionalidades da v0.4.1 permanecem: dashboard, projetos, zonas, orçamento, planejamento/Gantt, suprimentos, fornecedores, fontes/cotações, equipes, logística, Curva ABC, riscos, matriz, cenários, canteiro, insights, referências, auditoria, usuários, temas, múltiplos projetos, importação/exportação JSON, CSV, CRUD e agrupamentos.

## Validação

Os testes verificam:
- paridade visual da v0.2.0;
- sintaxe JavaScript;
- orçamento-base de R$ 20.629,00;
- custo unitário EPS de R$ 206,29/m²;
- área comparativa de 100 m²;
- manutenção dos 235 m² apenas nas zonas;
- coerência entre orçamento e suprimentos;
- matriz multicritério;
- presença de todas as funcionalidades;
- desktop/mobile, overflow, modais, temas e CRUD.
