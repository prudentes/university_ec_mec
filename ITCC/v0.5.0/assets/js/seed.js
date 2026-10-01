const model={
 id:"sta-terezinha",name:"Igreja Santa Terezinha",owner:"ITCC",location:"Brasília/DF",areaParam:100,costBase:"SINAPI DF Ago/2026",selected:"EPS",
 systems:[
  {key:"CER",name:"Pré-moldada - lajota cerâmica",h:20,cost:202.39,hh:.747,concrete:.073,steel:1.185,pros:"Menor custo direto; ampla disponibilidade; solução conhecida.",cons:"Mais pesada e frágil que EPS; consumo de concreto ligeiramente superior."},
  {key:"EPS",name:"Pré-moldada - EPS",h:20,cost:206.29,hh:.590,concrete:.068,steel:1.185,pros:"Leve, fácil manuseio, produtividade favorável e menor consumo de concreto.",cons:"Exige armazenamento protegido, acabamento compatível e controle de incêndio."},
  {key:"NER",name:"Nervurada - cubeta",h:20,cost:230.62,hh:.879,concrete:.100,steel:9,pros:"Boa eficiência estrutural e cubetas reutilizáveis.",cons:"Mais fôrmas, ciclo e especialização para o vão de 4,93 m."},
  {key:"MAC",name:"Maciça",h:13,cost:263.19,hh:.945,concrete:.130,steel:10,pros:"Robusta, contínua e amplamente conhecida.",cons:"Maior peso, consumo de concreto/aço, fôrmas e custo."}
 ],
 criteria:[
  {n:"Adequação estrutural",w:18,s:{CER:4,EPS:4,NER:5,MAC:5}},{n:"Peso próprio",w:10,s:{CER:4,EPS:5,NER:4,MAC:2}},
  {n:"Custo total",w:18,s:{CER:5,EPS:4,NER:3,MAC:2}},{n:"Prazo",w:12,s:{CER:4,EPS:5,NER:3,MAC:2}},
  {n:"Fôrmas/escoramento",w:6,s:{CER:4,EPS:4,NER:3,MAC:2}},{n:"Mão de obra",w:5,s:{CER:4,EPS:4,NER:3,MAC:2}},
  {n:"Construtibilidade/logística",w:6,s:{CER:4,EPS:5,NER:3,MAC:3}},{n:"Instalações",w:5,s:{CER:3,EPS:4,NER:3,MAC:4}},
  {n:"Térmico/acústico",w:5,s:{CER:4,EPS:4,NER:3,MAC:4}},{n:"Incêndio",w:5,s:{CER:5,EPS:3,NER:5,MAC:5}},
  {n:"Sustentabilidade",w:5,s:{CER:3,EPS:4,NER:4,MAC:3}},{n:"Fornecedores DF",w:5,s:{CER:5,EPS:4,NER:3,MAC:5}}
 ],
 zones:[
  {id:"Z1",name:"Nave principal",span:4.93,load:5,area:100,sys:"EPS",x:7,y:7,w:48,h:49,note:"Zona crítica do pré-dimensionamento."},
  {id:"Z2",name:"Presbitério / altar",span:4.93,load:5,area:30,sys:"EPS",x:59,y:7,w:29,h:21,note:"Conferir cargas localizadas."},
  {id:"Z3",name:"Circulação, coro/mezanino e reunião",span:4.93,load:5,area:45,sys:"EPS",x:59,y:31,w:29,h:25,note:"Uso público; cenário conservador."},
  {id:"Z4",name:"Sacristia e salas de apoio",span:4.93,load:3,area:35,sys:"EPS",x:7,y:61,w:34,h:22,note:"Padronização da solução."},
  {id:"Z5",name:"Sanitários, molhadas e técnicas",span:4.93,load:3,area:25,sys:"EPS",x:44,y:61,w:24,h:22,note:"Compatibilizar passagens e impermeabilização."}
 ],
 site:{gate:true,unload:true,store:true,epsProtected:true,assembly:true,sanitary:true,changing:true,meal:true,water:true,waste:true,concrete:true,firePlan:true},
 planImage:null,
 groups:{
  budget:[
   {id:"B-G1",name:"Sistema pré-moldado / enchimento",order:1},{id:"B-G2",name:"Concreto e lançamento",order:2},{id:"B-G3",name:"Armaduras",order:3},
   {id:"B-G4",name:"Escoramento e madeira",order:4},{id:"B-G5",name:"Mão de obra direta",order:5},{id:"B-G6",name:"Consumíveis",order:6}
  ],
  planning:[
   {id:"P-G1",name:"Preparação da frente",order:1},{id:"P-G2",name:"Escoramento",order:2},{id:"P-G3",name:"Montagem da laje",order:3},
   {id:"P-G4",name:"Instalações e armaduras",order:4},{id:"P-G5",name:"Concretagem",order:5},{id:"P-G6",name:"Cura e liberação",order:6}
  ],
  supplies:[
   {id:"S-G1",name:"Pré-moldados e EPS",order:1},{id:"S-G2",name:"Concreto",order:2},{id:"S-G3",name:"Aço e acessórios",order:3},
   {id:"S-G4",name:"Madeira e escoramento",order:4},{id:"S-G5",name:"Consumíveis",order:5}
  ],
  sources:[
   {id:"SRC-G1",name:"Bases oficiais",order:1},{id:"SRC-G2",name:"Pesquisa de mercado",order:2},{id:"SRC-G3",name:"Fornecedores individuais",order:3}
  ],
  suppliers:[
   {id:"SUP-G1",name:"Pré-moldados / EPS",order:1},{id:"SUP-G2",name:"Concreto",order:2},{id:"SUP-G3",name:"Aço / ferragens",order:3},{id:"SUP-G4",name:"Madeira / escoramento",order:4},{id:"SUP-G5",name:"Materiais gerais",order:5}
  ]
 },
 budgetItems:[
  {id:"B001",groupId:"B-G1",kind:"Material",code:"SINAPI 43355",name:"Laje pré-moldada treliçada com enchimento EPS H16 + vigotas VTR 12x16 (menor nível publicado no SINAPI)",qty:100,unit:"m²",unitPrice:75.36,sourceId:"SRC-SINAPI-DF",supplierId:"SUP-LAJESPLAN",baseline:true},
  {id:"B002",groupId:"B-G2",kind:"Serviço",code:"SINAPI 103674",name:"Concretagem FCK 25 MPa para laje pré-moldada com bomba: lançamento, adensamento e acabamento",qty:6.8,unit:"m³",unitPrice:753.5294117647,sourceId:"SRC-SINAPI-DF",supplierId:"SUP-CONSTRUVEL",baseline:true},
  {id:"B003",groupId:"B-G3",kind:"Serviço",code:"SINAPI 92768",name:"Armação de distribuição CA-60 5,0 mm - montagem",qty:118.5,unit:"kg",unitPrice:14.1518987342,sourceId:"SRC-SINAPI-DF",supplierId:"SUP-GERDAU",baseline:true},
  {id:"B004",groupId:"B-G4",kind:"Material",code:"SINAPI 6193",name:"Tábua não aparelhada 2,5 x 20 cm",qty:160,unit:"m",unitPrice:19.30,sourceId:"SRC-SINAPI-DF",supplierId:"SUP-CONSTRUALVES",baseline:true},
  {id:"B005",groupId:"B-G4",kind:"Serviço",code:"SINAPI 92273",name:"Fabricação de escoras tipo pontalete em madeira para pé-direito simples",qty:99,unit:"m",unitPrice:14.6262626263,sourceId:"SRC-SINAPI-DF",supplierId:"SUP-CONSTRUALVES",baseline:true},
  {id:"B006",groupId:"B-G5",kind:"Mão de obra",code:"SINAPI 88262",name:"Carpinteiro de fôrmas com encargos complementares",qty:33.7,unit:"h",unitPrice:31.4243323442,sourceId:"SRC-SINAPI-DF",supplierId:"",baseline:true},
  {id:"B007",groupId:"B-G5",kind:"Mão de obra",code:"SINAPI 88316",name:"Servente com encargos complementares",qty:25.3,unit:"h",unitPrice:24.7826086957,sourceId:"SRC-SINAPI-DF",supplierId:"",baseline:true},
  {id:"B008",groupId:"B-G6",kind:"Consumível",code:"SINAPI 40304",name:"Prego de aço polido com cabeça dupla 17 x 27",qty:3.4,unit:"kg",unitPrice:20.5882352941,sourceId:"SRC-SINAPI-DF",supplierId:"SUP-DOMINIK",baseline:true}
 ],
 activities:[
  {id:"A001",groupId:"P-G1",name:"Receber materiais da frente",zone:"Z1",pred:"",days:.5,crew:2,lead:0,status:"Planejada"},
  {id:"A002",groupId:"P-G1",name:"Locar e conferir níveis/apoios",zone:"Z1",pred:"A001",days:.5,crew:2,lead:0,status:"Planejada"},
  {id:"A003",groupId:"P-G2",name:"Posicionar pontaletes e linhas de escora",zone:"Z1",pred:"A002",days:.75,crew:3,lead:0,status:"Planejada"},
  {id:"A004",groupId:"P-G2",name:"Instalar travessas, nivelar e contraventar escoramento",zone:"Z1",pred:"A003",days:.75,crew:3,lead:0,status:"Planejada"},
  {id:"A005",groupId:"P-G3",name:"Distribuir e apoiar vigotas treliçadas",zone:"Z1",pred:"A004",days:.75,crew:4,lead:0,status:"Planejada"},
  {id:"A006",groupId:"P-G3",name:"Distribuir blocos EPS H16 e passarelas",zone:"Z1",pred:"A005",days:.5,crew:4,lead:0,status:"Planejada"},
  {id:"A007",groupId:"P-G3",name:"Conferir alinhamento, esquadro, apoios e contraflecha prevista",zone:"Z1",pred:"A006",days:.25,crew:2,lead:0,status:"Planejada"},
  {id:"A008",groupId:"P-G4",name:"Executar reservas e passagens de instalações",zone:"Z1",pred:"A007",days:.5,crew:2,lead:0,status:"Planejada"},
  {id:"A009",groupId:"P-G4",name:"Montar armadura de distribuição CA-60 5 mm",zone:"Z1",pred:"A008",days:.5,crew:3,lead:0,status:"Planejada"},
  {id:"A010",groupId:"P-G4",name:"Montar armaduras negativas/complementares quando previstas",zone:"Z1",pred:"A009",days:.5,crew:3,lead:0,status:"Planejada"},
  {id:"A011",groupId:"P-G4",name:"Realizar inspeção pré-concretagem e liberar frente",zone:"Z1",pred:"A010",days:.25,crew:2,lead:0,status:"Planejada"},
  {id:"A012",groupId:"P-G5",name:"Posicionar bomba/mangotes e organizar sequência de lançamento",zone:"Z1",pred:"A011",days:.25,crew:3,lead:1,status:"Planejada"},
  {id:"A013",groupId:"P-G5",name:"Lançar concreto FCK 25 MPa",zone:"Z1",pred:"A012",days:.5,crew:6,lead:0,status:"Planejada"},
  {id:"A014",groupId:"P-G5",name:"Adensar concreto",zone:"Z1",pred:"A013",days:.25,crew:3,lead:0,status:"Planejada"},
  {id:"A015",groupId:"P-G5",name:"Executar acabamento da capa",zone:"Z1",pred:"A014",days:.25,crew:3,lead:0,status:"Planejada"},
  {id:"A016",groupId:"P-G6",name:"Executar cura do concreto",zone:"Z1",pred:"A015",days:7,crew:1,lead:0,status:"Planejada"},
  {id:"A017",groupId:"P-G6",name:"Liberar retirada/reescoramento mediante resistência e projeto",zone:"Z1",pred:"A016",days:.25,crew:2,lead:0,status:"Planejada"}
 ],
 supplies:[
  {id:"S001",groupId:"S-G1",budgetItemId:"B001",name:"Sistema treliçado com EPS H16",qty:100,unit:"m²",safety:5,lead:5,supplierId:"SUP-LAJESPLAN",status:"A cotar"},
  {id:"S002",groupId:"S-G2",budgetItemId:"B002",name:"Concreto usinado FCK 25 MPa",qty:6.8,unit:"m³",safety:0,lead:3,supplierId:"SUP-CONSTRUVEL",status:"Programar"},
  {id:"S003",groupId:"S-G3",budgetItemId:"B003",name:"Aço CA-60 5,0 mm / armação de distribuição",qty:118.5,unit:"kg",safety:5,lead:3,supplierId:"SUP-GERDAU",status:"A cotar"},
  {id:"S004",groupId:"S-G4",budgetItemId:"B004",name:"Tábua 2,5 x 20 cm",qty:160,unit:"m",safety:10,lead:2,supplierId:"SUP-CONSTRUALVES",status:"A cotar"},
  {id:"S005",groupId:"S-G4",budgetItemId:"B005",name:"Escoras/pontaletes de madeira",qty:99,unit:"m",safety:10,lead:2,supplierId:"SUP-CONSTRUALVES",status:"A cotar"},
  {id:"S006",groupId:"S-G5",budgetItemId:"B008",name:"Prego cabeça dupla 17 x 27",qty:3.4,unit:"kg",safety:5,lead:2,supplierId:"SUP-DOMINIK",status:"A cotar"}
 ],
 sources:[
  {id:"SRC-SINAPI-NAT",groupId:"SRC-G1",type:"SINAPI_NAT",name:"SINAPI - Média Nacional",region:"Brasil",date:"2026-08",url:"https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/",note:"Média entre UFs para comparação; confirmar relatório oficial."},
  {id:"SRC-SINAPI-DF",groupId:"SRC-G1",type:"SINAPI_DF",name:"SINAPI - Distrito Federal",region:"DF",date:"2026-08",url:"https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/",note:"Base econômica do relatório Entrega 1; preços iniciais calibrados para reproduzir exatamente R$ 206,29/m²."},
  {id:"SRC-SICRO-NAT",groupId:"SRC-G1",type:"SICRO_NAT",name:"SICRO - Média Nacional",region:"Brasil",date:"2026-07",url:"https://www.gov.br/dnit/pt-br/assuntos/planejamento-e-pesquisa/custos-referenciais/sistemas-de-custos/sicro",note:"Não existe tabela única nacional oficial: usar média calculada a partir das UFs selecionadas. Para laje predial, normalmente não aplicável."},
  {id:"SRC-SICRO-DF",groupId:"SRC-G1",type:"SICRO_DF",name:"SICRO - Distrito Federal",region:"DF",date:"2026-07",url:"https://www.gov.br/dnit/pt-br/assuntos/planejamento-e-pesquisa/custos-referenciais/sistemas-de-custos/sicro/relatorios/relatorios-sicro/centro-oeste/distrito-federal/2026/julho/julho-2026",note:"Referência DNIT para infraestrutura de transportes; só usar quando a composição for tecnicamente aplicável."},
  {id:"SRC-MKT-NAT",groupId:"SRC-G2",type:"MARKET_NAT",name:"Pesquisa média de mercado nacional",region:"Brasil",date:"2026-10-01",url:"",note:"Média automática das cotações nacionais cadastradas por item."},
  {id:"SRC-MKT-DF",groupId:"SRC-G2",type:"MARKET_DF",name:"Pesquisa média regional Brasília/DF",region:"Brasília/DF",date:"2026-10-01",url:"",note:"Média automática das cotações regionais cadastradas por item."},
  {id:"SRC-BASE",groupId:"SRC-G3",type:"BASELINE",name:"Baseline da Entrega 1",region:"Brasília/DF",date:"2026-09-30",url:"",note:"Referência congelada para conferir que o projeto inicial reproduz a Entrega 1."}
 ],
 suppliers:[
  {id:"SUP-LAJESPLAN",groupId:"SUP-G1",name:"LajesPlan DF",cnpj:"",city:"Brasília/DF",address:"QI 25 Lote 42-47, Setor Industrial - Taguatinga",phone:"(61) 3568-1040 / (61) 99986-9827",url:"https://www.lajesplandf.com.br/",categories:"Lajes treliçadas, vigotas, EPS",status:"CNPJ não localizado com segurança na pesquisa"},
  {id:"SUP-DFLAJES",groupId:"SUP-G1",name:"DF Lajes - H Franco Premoldados Ltda",cnpj:"23.791.721/0001-62",city:"Brasília/DF",address:"SMAS Conjunto B1, Lote 18, Zona Industrial - Guará",phone:"",url:"",categories:"Pré-moldados / lajes",status:"Ativa"},
  {id:"SUP-PREMOLDADOSCIA",groupId:"SUP-G1",name:"Premoldados & Cia - LA Premoldados Ltda",cnpj:"56.876.203/0001-09",city:"Brasília/DF",address:"SDMC Q1 LT 9, Setor de Materiais de Construção - Ceilândia",phone:"(61) 3585-8833",url:"",categories:"Estruturas pré-moldadas de concreto",status:"Ativa"},
  {id:"SUP-CONSTRUVEL",groupId:"SUP-G5",name:"Construvel Ltda",cnpj:"68.901.753/0001-01",city:"Brasília/DF",address:"SDE Norte Q2 CJ C LT 4, Taguatinga",phone:"(61) 99517-6822",url:"https://www.construvel.com/",categories:"Materiais gerais, concreto, madeira, ferragens",status:"Ativa"},
  {id:"SUP-CONSTRUCEL",groupId:"SUP-G5",name:"Construcel Materiais de Construção Ltda",cnpj:"11.893.055/0001-94",city:"Brasília/DF",address:"QNN 9 Conjunto G, Ceilândia Norte",phone:"",url:"",categories:"Materiais de construção",status:"Ativa"},
  {id:"SUP-CONSTRUALVES",groupId:"SUP-G4",name:"Construalves Materiais para Construção Ltda",cnpj:"57.971.214/0001-22",city:"Brasília/DF",address:"São Sebastião",phone:"(61) 98530-8532",url:"",categories:"Ferragens, madeira e artefatos",status:"Ativa"},
  {id:"SUP-GERDAU",groupId:"SUP-G3",name:"Gerdau Aços Longos S.A.",cnpj:"07.358.761/0001-69",city:"Brasil",address:"Matriz - Rio de Janeiro/RJ",phone:"(11) 3094-6600",url:"https://www.gerdau.com/",categories:"Aço longo, pregos, arames",status:"Fabricante / matriz ativa"},
  {id:"SUP-DOMINIK",groupId:"SUP-G3",name:"Dominik MetalCenter",cnpj:"72.332.794/0001-00",city:"São José/SC",address:"Rua Camilo Veríssimo da Silva, 255, Roçado",phone:"(48) 3381-3300",url:"https://dominik.com.br/",categories:"Aços, ferragens, pregos e ferramentas",status:"Ativa"},
  {id:"SUP-GASPARIN",groupId:"SUP-G5",name:"Gasparin & Filhos Ltda",cnpj:"78.952.082/0001-61",city:"Colombo/PR",address:"Rua José Cavassin, 426",phone:"(41) 3675-3700",url:"https://lojasgasparin.com.br/",categories:"Materiais de construção",status:"Ativa"}
 ],
 quotes:[
  {id:"Q001",budgetItemId:"B001",sourceId:"SRC-SINAPI-DF",supplierId:"",price:75.36,unit:"m²",date:"2026-07",region:"DF",url:"https://buscadorsinapi.com.br/insumo/43355-laje-pre-moldada-trelicada-lajotas-vigotas-com-lajota-em-pol",note:"Valor que reproduz a Entrega 1."},
  {id:"Q002",budgetItemId:"B001",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:106.50,unit:"m²",date:"2026-07",region:"Brasil",url:"https://buscadorsinapi.com.br/insumo/43355-laje-pre-moldada-trelicada-lajotas-vigotas-com-lajota-em-pol",note:"Média nacional publicada pelo comparador."},
  {id:"Q003",budgetItemId:"B002",sourceId:"SRC-SINAPI-DF",supplierId:"",price:753.5294117647,unit:"m³",date:"2026-08",region:"DF",url:"",note:"Preço calibrado pela Entrega 1: R$ 51,24/m² ÷ 0,068 m³/m²."},
  {id:"Q004",budgetItemId:"B002",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:896.98,unit:"m³",date:"2026-08",region:"Brasil",url:"https://buscadorsinapi.com.br/composicao/103674-concretagem-de-vigas-e-lajes-fck-25-mpa-para-lajes-premoldad",note:"Média nacional."},
  {id:"Q005",budgetItemId:"B003",sourceId:"SRC-SINAPI-DF",supplierId:"",price:14.1518987342,unit:"kg",date:"2026-08",region:"DF",url:"",note:"Preço calibrado pela Entrega 1: R$ 16,77/m² ÷ 1,185 kg/m²."},
  {id:"Q006",budgetItemId:"B003",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:14.06,unit:"kg",date:"2026-08",region:"Brasil",url:"https://buscadorsinapi.com.br/composicao/92768-armacao-de-laje-de-estrutura-convencional-de-concreto-armado",note:"Média nacional de referência."},
  {id:"Q007",budgetItemId:"B004",sourceId:"SRC-SINAPI-DF",supplierId:"",price:19.30,unit:"m",date:"2026-08",region:"DF",url:"https://buscadorsinapi.com.br/insumo/6193-tabua-nao-aparelhada-2-5-x-20-cm-em-macaranduba-massaranduba",note:"SINAPI DF."},
  {id:"Q008",budgetItemId:"B004",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:20.48,unit:"m",date:"2026-08",region:"Brasil",url:"https://buscadorsinapi.com.br/insumo/6193-tabua-nao-aparelhada-2-5-x-20-cm-em-macaranduba-massaranduba",note:"Média nacional."},
  {id:"Q009",budgetItemId:"B005",sourceId:"SRC-SINAPI-DF",supplierId:"",price:14.6262626263,unit:"m",date:"2026-08",region:"DF",url:"",note:"Preço calibrado pela Entrega 1."},
  {id:"Q010",budgetItemId:"B005",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:17.32,unit:"m",date:"2026-08",region:"Brasil",url:"https://buscadorsinapi.com.br/composicao/92273-fabricacao-de-escoras-do-tipo-pontalete-em-madeira-para-pe-d",note:"Média nacional."},
  {id:"Q011",budgetItemId:"B006",sourceId:"SRC-SINAPI-DF",supplierId:"",price:31.4243323442,unit:"h",date:"2026-08",region:"DF",url:"",note:"Preço calibrado pela Entrega 1."},
  {id:"Q012",budgetItemId:"B006",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:30.76,unit:"h",date:"2026-08",region:"Brasil",url:"https://buscadorsinapi.com.br/composicao/88262-carpinteiro-de-formas-com-encargos-complementares",note:"Média nacional."},
  {id:"Q013",budgetItemId:"B007",sourceId:"SRC-SINAPI-DF",supplierId:"",price:24.7826086957,unit:"h",date:"2026-08",region:"DF",url:"",note:"Preço calibrado pela Entrega 1."},
  {id:"Q014",budgetItemId:"B007",sourceId:"SRC-SINAPI-NAT",supplierId:"",price:24.62,unit:"h",date:"2026-08",region:"Brasil",url:"https://buscadorsinapi.com.br/composicao/88316-servente-com-encargos-complementares",note:"Média nacional."},
  {id:"Q015",budgetItemId:"B008",sourceId:"SRC-SINAPI-DF",supplierId:"",price:20.5882352941,unit:"kg",date:"2026-08",region:"DF",url:"",note:"Preço calibrado pela Entrega 1."},
  {id:"Q016",budgetItemId:"B008",sourceId:"SRC-MKT-NAT",supplierId:"SUP-DOMINIK",price:19.25,unit:"kg",date:"2026-09",region:"São José/SC",url:"https://dominik.com.br/products/prego-polido-17-x-27-dupla-cabeca-1kg-gerdau-belgo",note:"Prego cabeça dupla 17x27; cotação online individual."},
  {id:"Q017",budgetItemId:"B008",sourceId:"SRC-MKT-DF",supplierId:"SUP-CONSTRUVEL",price:null,unit:"kg",date:"2026-09",region:"Brasília/DF",url:"https://www.construvel.com/produto/prego-17x27-1kg",note:"Produto regional 17x27 cadastrado; confirmar cabeça dupla antes de comparar."},
  {id:"Q018",budgetItemId:"B001",sourceId:"SRC-MKT-DF",supplierId:"SUP-LAJESPLAN",price:null,unit:"m²",date:"2026-10",region:"Brasília/DF",url:"https://www.lajesplandf.com.br/",note:"Fornecedor regional identificado; cotar especificação H16/VTR compatível."},
  {id:"Q019",budgetItemId:"B001",sourceId:"SRC-MKT-DF",supplierId:"SUP-DFLAJES",price:null,unit:"m²",date:"2026-10",region:"Brasília/DF",url:"",note:"Fornecedor regional identificado; preço sob cotação."},
  {id:"Q020",budgetItemId:"B002",sourceId:"SRC-MKT-DF",supplierId:"SUP-CONSTRUVEL",price:null,unit:"m³",date:"2026-10",region:"Brasília/DF",url:"https://www.construvel.com/produtos",note:"Concreto 25 MPa sob orçamento; mínimo informado no catálogo: 3 m³."}
 ],
 risks:[
  {id:"R1",name:"Carga real superior à referência da vigota",p:4,i:5,action:"Dimensionar vigotas e armaduras para as ações efetivas."},
  {id:"R2",name:"Interferência de instalações",p:3,i:4,action:"Congelar reservas e passagens antes da concretagem."},
  {id:"R3",name:"Dano/deslocamento do EPS",p:2,i:3,action:"Estoque protegido, passarelas e inspeção."},
  {id:"R4",name:"Retirada prematura do escoramento",p:2,i:5,action:"Plano de escoramento/reescoramento e liberação técnica."}
 ],
 scenarios:{base:1,optimistic:.95,pessimistic:1.15,current:"base"},
 comments:[],audit:["Projeto-base v0.4.0 criado para reproduzir integralmente os cálculos e a conclusão da Entrega 1."],
 references:[
  {name:"Entrega 1 - Estudo de Viabilidade de Lajes",type:"Baseline acadêmica",date:"2026-09-30",url:""},
  {name:"SINAPI - Caixa/IBGE",type:"Custos referenciais",date:"2026-08",url:"https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/"},
  {name:"SICRO - DNIT / DF julho 2026",type:"Custos de infraestrutura",date:"2026-07",url:"https://www.gov.br/dnit/pt-br/assuntos/planejamento-e-pesquisa/custos-referenciais/sistemas-de-custos/sicro/relatorios/relatorios-sicro/centro-oeste/distrito-federal/2026/julho/julho-2026"}
 ]
};;

model.shortName="Santa Terezinha - Lajes";
model.status="Estudo de viabilidade";
model.description="Estudo de viabilidade técnica e econômica dos sistemas de laje da Igreja Santa Terezinha, com solução-base EPS LT20.";
model.ownerUserId="u-itcc";
model.members=[{userId:"u-itcc",projectRole:"owner"}];
model.currency="BRL";
model.baseDate="2026-08";
model.bdi=0;
model.contingency=0;
model.workHoursDay=8;
model.efficiency=.85;
model.scenario="base";
model.criticalSpan=4.93;
model.comparisonArea=100;
model.teams=[
 {id:"E001",name:"Montagem de laje pré-moldada",people:4,costHour:0,qualification:"Equipe treinada em vigotas treliçadas e EPS",availability:100},
 {id:"E002",name:"Armação e compatibilização",people:4,costHour:0,qualification:"Armadores + apoio de instalações",availability:100},
 {id:"E003",name:"Concretagem e acabamento",people:6,costHour:0,qualification:"Equipe de concretagem/bomba/acabamento",availability:100}
];
model.logistics=[
 {id:"L001",material:"Sistema vigotas + EPS H16",required:100,unit:"m²",vehicleCapacity:100,lead:5,stockSafety:10,dailyUse:35},
 {id:"L002",material:"Concreto FCK 25 MPa",required:6.8,unit:"m³",vehicleCapacity:8,lead:3,stockSafety:0,dailyUse:8},
 {id:"L003",material:"Aço CA-60 / armadura de distribuição",required:118.5,unit:"kg",vehicleCapacity:1000,lead:3,stockSafety:11.85,dailyUse:140},
 {id:"L004",material:"Tábuas e pontaletes / escoramento",required:259,unit:"m",vehicleCapacity:1000,lead:2,stockSafety:25.9,dailyUse:250}
];
model.budgetItems.forEach(x=>{x.waste=x.waste??0;x.evidence=x.evidence||"R";x.zone=x.zone||"Todas as zonas";});
model.activities.forEach((x,i)=>{x.unit=x.unit||"atividade";x.progress=x.progress??0;x.category=x.category||model.groups.planning.find(g=>g.id===x.groupId)?.name||"Planejamento";});
model.risks=model.risks.map(x=>({...x,prob:x.prob??x.p,impact:x.impact??x.i,owner:x.owner||"Equipe de projeto",mitigation:x.mitigation||x.action,status:x.status||"Controlado"}));
model.references=(model.references||[]).map((r,i)=>({id:r.id||"REF"+(i+1),type:r.type||"Referência",title:r.title||r.name,organization:r.organization||r.source||"",date:r.date||"",url:r.url||"",note:r.note||""}));
model.comments=[];
model.audit=[{at:"01/10/2026 08:50",user:"ITCC",action:"Projeto-base v0.5.0 inicializado preservando baseline da Entrega 1",version:"0.5.0"}];

window.ITCC_SEED={
 schemaVersion:5,
 appVersion:"0.5.0",
 createdAt:"2026-10-01T08:50:00-03:00",
 theme:"system",
 activeProjectId:model.id,
 users:[{id:"u-itcc",username:"ITCC",password:"ITCC",name:"ITCC Master",globalRole:"master",active:true}],
 projects:[model]
};
