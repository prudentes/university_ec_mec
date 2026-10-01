import fs from "node:fs";
import vm from "node:vm";
import {execFileSync} from "node:child_process";

const root=new URL("../",import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),"utf8");
const baseline=read("assets/css/v020-baseline.css");
const reference=read("docs/v0.2.0_LAYOUT_REFERENCE.css");
if(baseline!==reference) throw new Error("A folha visual v0.2.0 foi alterada. Baseline e referência não são idênticas.");

execFileSync(process.execPath,["--check",new URL("assets/js/app.js",root).pathname],{stdio:"inherit"});
execFileSync(process.execPath,["--check",new URL("assets/js/seed.js",root).pathname],{stdio:"inherit"});

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(read("assets/js/seed.js"),sandbox);
const seed=sandbox.window.ITCC_SEED;
if(seed.appVersion!=="0.5.0") throw new Error("Versão de seed incorreta.");
const p=seed.projects.find(x=>x.id==="sta-terezinha");
if(!p) throw new Error("Projeto Santa Terezinha ausente.");

const expectedCosts={EPS:206.29,CER:202.39,NER:230.62,MAC:263.19};
for(const [k,v] of Object.entries(expectedCosts)){
  const got=p.systems.find(s=>s.key===k)?.cost;
  if(Math.abs(got-v)>.001) throw new Error("Custo divergente "+k+": "+got);
}
const score=k=>p.criteria.reduce((s,c)=>s+Number(c.w)*Number(c.s[k])/5,0);
const expectedScores={EPS:84.6,CER:83.6,NER:72.2,MAC:63};
for(const [k,v] of Object.entries(expectedScores)){
  const got=score(k);
  if(Math.abs(got-v)>.01) throw new Error("Matriz divergente "+k+": "+got);
}
if(p.selected!=="EPS")throw new Error("Sistema-base deixou de ser EPS.");
if(Math.abs(p.zones.find(z=>z.id==="Z1").span-4.93)>.001)throw new Error("Vão crítico divergente.");
const budget=p.budgetItems.reduce((s,x)=>s+Number(x.qty)*Number(x.unitPrice),0);
if(Math.abs(budget-20629.00)>.10)throw new Error("Orçamento-base divergente: "+budget);
if(p.areaParam!==100)throw new Error("Área comparativa deve ser 100 m²: "+p.areaParam);
const zoneArea=p.zones.reduce((s,z)=>s+Number(z.area||0),0);
if(Math.abs(zoneArea-235)>.001)throw new Error("Áreas paramétricas das zonas devem continuar somando 235 m²: "+zoneArea);
const expectedQty={B001:100,B002:6.8,B003:118.5,B004:160,B005:99,B006:33.7,B007:25.3,B008:3.4};
for(const [id,qty] of Object.entries(expectedQty)){
  const got=p.budgetItems.find(x=>x.id===id)?.qty;
  if(Math.abs(Number(got)-qty)>.0001)throw new Error("Quantidade orçamentária divergente "+id+": "+got);
}
for(const s of p.supplies){
  const b=p.budgetItems.find(x=>x.id===s.budgetItemId);
  if(b&&Math.abs(Number(s.qty)-Number(b.qty))>.0001)throw new Error("Suprimento divergente do orçamento: "+s.id);
}
if(Math.abs(budget/p.areaParam-206.29)>.01)throw new Error("R$/m² não reproduz a Entrega 1.");

for(const t of ["SINAPI_NAT","SINAPI_DF","SICRO_NAT","SICRO_DF","MARKET_NAT","MARKET_DF"]){
  if(!p.sources.some(s=>s.type===t))throw new Error("Fonte ausente: "+t);
}
for(const front of ["budget","planning","supplies","sources","suppliers"]){
  if(!p.groups[front]?.length)throw new Error("Agrupamentos ausentes: "+front);
}
if(!p.budgetItems.length||!p.activities.length||!p.supplies.length||!p.suppliers.length||!p.quotes.length)throw new Error("Dados detalhados incompletos.");

const app=read("assets/js/app.js");
const required=[
 "Planejamento que vira decisão.","login-shell","sidebar","topbar","grid grid-4","Curva ABC","Gantt paramétrico",
 "pageActions('budget','budget')","pageActions('planning','activity')","pageActions('supplies','supply')","pageActions('sources','source')",
 "pageActions('suppliers','supplier')","data-add=\"quote\"","data-groups","zoneMap","shareModal","exportBudgetCsv",
 "Orçamento","Planejamento","Suprimentos","Fornecedores","Fontes e cotações","Equipes e produtividade",
 "Logística","Riscos","Matriz multicritério","Cenários","Canteiro para o ciclo de lajes","Insights do estudo",
 "Referências","Auditoria e comentários","Usuários"
];
const missing=required.filter(x=>!app.includes(x));
if(missing.length)throw new Error("Funcionalidades/markup ausentes: "+missing.join(", "));

console.log("OK static QA v0.5.0");
console.log("CSS baseline v0.2.0: byte-for-byte preservado.");
console.log("Baseline Santa Terezinha:",budget.toFixed(2),"R$ total;",(budget/p.areaParam).toFixed(2),"R$/m²; EPS",score("EPS").toFixed(1));
