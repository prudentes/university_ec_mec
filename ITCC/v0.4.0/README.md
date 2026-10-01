# ITCC Planner v0.4.0

Abra `index.html` diretamente no navegador.

Acesso inicial:
- usuário: ITCC
- senha: ITCC

## Objetivo da versão 0.4.0

Esta versão preserva a estrutura visual e funcional da v0.2.0 e acrescenta CRUD completo e agrupamento visual para:
- Orçamento;
- Planejamento;
- Suprimentos;
- Fontes;
- Fornecedores.

Também passa a tratar preços por fonte:
- SINAPI - Média Nacional;
- SINAPI - DF;
- SICRO - Média Nacional (média calculada pelo usuário a partir das UFs; não é uma tabela nacional única oficial);
- SICRO - DF;
- Pesquisa média de mercado nacional;
- Pesquisa média regional de Brasília/DF;
- Fornecedores individuais.

O projeto Santa Terezinha inicia reproduzindo a Entrega 1:
- EPS LT20: R$ 206,29/m²;
- cerâmica LT20: R$ 202,39/m²;
- nervurada: R$ 230,62/m²;
- maciça: R$ 263,19/m²;
- matriz: EPS 84,6; cerâmica 83,6; nervurada 72,2; maciça 63,0;
- área paramétrica: 235 m²;
- orçamento-base EPS: R$ 48.478,15.

Os registros iniciais foram desagregados no menor nível utilizado na Entrega 1. Quando a própria fonte SINAPI publica um insumo composto (ex.: código 43355, laje treliçada com vigotas + EPS), ele é mantido como uma linha indivisível de origem, com observação explícita.

## Fontes de pesquisa incorporadas ao cadastro inicial

- CAIXA / SINAPI.
- DNIT / SICRO DF julho/2026.
- Buscador SINAPI para comparação nacional e regional dos códigos utilizados.
- LajesPlan DF.
- DF Lajes / H Franco Premoldados Ltda — CNPJ 23.791.721/0001-62.
- LA Premoldados Ltda / Premoldados & Cia — CNPJ 56.876.203/0001-09.
- Construvel Ltda — CNPJ 68.901.753/0001-01.
- Construcel — CNPJ 11.893.055/0001-94.
- Construalves — CNPJ 57.971.214/0001-22.
- Gerdau Aços Longos S.A. — CNPJ matriz 07.358.761/0001-69.
- Dominik MetalCenter — CNPJ 72.332.794/0001-00.
- Gasparin & Filhos Ltda — CNPJ 78.952.082/0001-61.

CNPJ só foi preenchido quando localizado com segurança em fonte pública.