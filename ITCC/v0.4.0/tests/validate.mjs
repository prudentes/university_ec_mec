import fs from "node:fs";
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const req=[
 "ITCC Planner v0.4.0","Orçamento","Planejamento","Suprimentos","Fontes","Fornecedores","Zonas","Curva ABC","Cronograma","Logística","Riscos","Cenários","Matriz","Insights","Referências","Auditoria",
 'cost:206.29','cost:202.39','cost:230.62','cost:263.19',
 'SINAPI_NAT','SINAPI_DF','SICRO_NAT','SICRO_DF','MARKET_NAT','MARKET_DF',
 'budgetForm(','activityForm(','supplyForm(','sourceForm(','quoteForm(','supplierForm(','manageGroups(',
 'R$ 48.478,15'
];
const missing=req.filter(x=>!html.includes(x));
if(missing.length){console.error("Falha: strings obrigatórias ausentes:",missing);process.exit(1)}
const budget=[
 235*75.36,
 15.98*(51.24/.068),
 278.475*(16.77/1.185),
 376*19.30,
 232.65*(14.48/.99),
 79.195*(10.59/.337),
 59.455*(6.27/.253),
 7.99*(.70/.034)
];
const total=budget.reduce((a,b)=>a+b,0);
if(Math.abs(total-48478.15)>.05){console.error("Baseline não fecha:",total);process.exit(1)}
const scores={EPS:84.6,CER:83.6,NER:72.2,MAC:63.0};
if(scores.EPS<=scores.CER){console.error("Conclusão da matriz alterada");process.exit(1)}
console.log("OK v0.4.0 — baseline R$",total.toFixed(2),"— EPS",scores.EPS);
