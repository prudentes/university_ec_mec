# Paridade visual v0.2.0 → v0.5.0

## Regra adotada

A folha visual original da v0.2.0 foi congelada em dois arquivos idênticos:

- `assets/css/v020-baseline.css` — CSS efetivamente carregado pela aplicação.
- `docs/v0.2.0_LAYOUT_REFERENCE.css` — cópia de referência para QA.

O teste `validate.mjs` exige igualdade byte a byte. A versão v0.5.0 não modifica seletores da baseline; os componentes novos estão somente em `assets/css/app.css`.

## Elementos cuja geometria é validada

| Elemento | Referência v0.2.0 | Teste |
|---|---|---|
| Login | duas colunas 1.15fr / 0.85fr | Chromium 1440×1000 |
| Login card | máx. 440 px | bounding box |
| Sidebar | 258 px | bounding box |
| Main | inicia em x=258 px | bounding box |
| Topbar | 68 px | bounding box |
| Desktop | sem overflow global | scrollWidth/clientWidth |
| Tabelas | overflow interno em .table-wrap | inspeção em todas as abas |
| Modal | dentro do viewport | bounding box |
| Mobile | login brand oculto ≤850 px | computed style |
| Mobile | sidebar fora da tela, main x=0 | bounding box |
| Mobile | seletor de página visível | visibility |
| Temas | light/dark/system | atributo data-bs-theme |

## Adições visuais permitidas

Somente componentes que não existiam na v0.2.0:
- linhas de agrupamento;
- campos CRUD em tabelas;
- mapa de zonas editável;
- resumo de fontes;
- editor de agrupamentos;
- seletor de página mobile.

Todos reutilizam cores, raio, bordas, tipografia, cards, botões e espaçamentos da baseline.


A v0.5.0 não altera CSS, geometria ou disposição em relação à v0.4.1; a mudança é exclusivamente de dados orçamentários e metadados de versão.
