(function appFactory(){
'use strict';
const VERSION='0.5.0';
const STORE_KEY='itcc-planner-store-v050';
const SESSION_KEY='itcc-planner-session-v050';
const I=window.ITCC_ICONS;
const clone=o=>JSON.parse(JSON.stringify(o));
let db=loadStore();
let session=loadSession();
let page='dashboard';
let modal='';
let toasts=[];

function normalizeStore(x){
  x.theme=x.theme||'system';
  x.users=x.users||[];
  x.projects=x.projects||[];
  for(const p of x.projects){
    p.shortName=p.shortName||p.name;
    p.status=p.status||'Planejamento';
    p.description=p.description||'';
    p.ownerUserId=p.ownerUserId||x.users[0]?.id||'u-itcc';
    p.members=p.members||[{userId:p.ownerUserId,projectRole:'owner'}];
    p.bdi=Number(p.bdi||0);
    p.contingency=Number(p.contingency||0);
    p.workHoursDay=Number(p.workHoursDay||8);
    p.efficiency=Number(p.efficiency||.85);
    p.scenario=p.scenario||'base';
    p.planImage=p.planImage||null;
    p.comments=(p.comments||[]).map(c=>typeof c==='string'?{id:'c-'+Date.now()+Math.random(),at:'',user:'ITCC',text:c}:c);
    p.audit=(p.audit||[]).map(a=>typeof a==='string'?{at:'',user:'ITCC',action:a,version:VERSION}:a);
    p.teams=p.teams||[];
    p.logistics=p.logistics||[];
    p.groups=p.groups||{budget:[],planning:[],supplies:[],sources:[],suppliers:[]};
    for(const k of ['budget','planning','supplies','sources','suppliers'])p.groups[k]=p.groups[k]||[];
    p.quotes=p.quotes||[];
    p.sources=p.sources||[];
    p.suppliers=p.suppliers||[];
    p.supplies=p.supplies||[];
    p.budgetItems=p.budgetItems||[];
    p.activities=p.activities||[];
    p.risks=p.risks||[];
    p.criteria=p.criteria||[];
    p.systems=p.systems||[];
    p.zones=p.zones||[];
    p.references=p.references||[];
    p.site=p.site||{};
  }
  x.activeProjectId=x.activeProjectId||x.projects[0]?.id;
  return x;
}
function loadStore(){
  try{
    const x=JSON.parse(localStorage.getItem(STORE_KEY));
    if(x&&x.schemaVersion===5)return normalizeStore(x);
  }catch(e){}
  const x=normalizeStore(clone(window.ITCC_SEED));
  localStorage.setItem(STORE_KEY,JSON.stringify(x));
  return x;
}
function persist(){localStorage.setItem(STORE_KEY,JSON.stringify(db))}
function loadSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY))}catch(e){return null}}
function saveSession(){sessionStorage.setItem(SESSION_KEY,JSON.stringify(session))}
function currentUser(){return db.users.find(u=>u.id===session?.userId)}
function project(){return db.projects.find(p=>p.id===db.activeProjectId)||db.projects[0]}
function accessibleProjects(){
  const u=currentUser();
  return db.projects.filter(p=>u?.globalRole==='master'||p.ownerUserId===u?.id||p.members?.some(m=>m.userId===u?.id));
}
function memberRole(p=project()){
  const u=currentUser();
  if(u?.globalRole==='master')return 'master';
  return p?.members?.find(m=>m.userId===u?.id)?.projectRole||null;
}
function canEdit(){return ['master','owner','editor'].includes(memberRole())}
function canShare(){return ['master','owner'].includes(memberRole())}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function num(n,d=0){return Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function icon(n){return I[n]||I.dashboard||''}
function audit(action){
  const p=project();
  p.audit.unshift({at:new Date().toLocaleString('pt-BR'),user:currentUser()?.username||'Sistema',action,version:VERSION});
  p.audit=p.audit.slice(0,250);
  persist();
}
function toast(title,msg='Alteração salva com sucesso.'){
  toasts.push({id:Date.now(),title,msg});
  renderToasts();
  setTimeout(()=>{toasts.shift();renderToasts()},2500);
}
function applyTheme(){
  const dark=db.theme==='dark'||(db.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-bs-theme',dark?'dark':'light');
}
function setTheme(mode){db.theme=mode;persist();applyTheme();render()}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(db.theme==='system')applyTheme()});

function scenarioFactor(){return project().scenario==='optimistic'?.95:project().scenario==='pessimistic'?1.15:1}
function budgetRows(){
  return project().budgetItems.map(x=>({...x,total:Number(x.qty||0)*Number(x.unitPrice||0)*(1+Number(x.waste||0)/100)*scenarioFactor()}));
}
function costs(){
  const p=project(),direct=budgetRows().reduce((s,x)=>s+x.total,0),bdi=direct*p.bdi/100,cont=(direct+bdi)*p.contingency/100;
  return {direct,bdi,cont,total:direct+bdi+cont};
}
function schedule(){
  const p=project(),out={};
  for(const t of p.activities){
    const pred=t.pred?out[t.pred]?.end||0:0;
    const dur=Math.max(.25,Number(t.days||0));
    const start=pred+Number(t.lead||0);
    out[t.id]={dur,start,end:start+dur,hh:dur*Number(t.crew||0)*p.workHoursDay*p.efficiency,critical:false};
  }
  const max=Math.max(0,...Object.values(out).map(x=>x.end));
  Object.values(out).forEach(x=>{x.critical=x.end>=max-1});
  return out;
}
function riskScore(r){return Number((r.prob??r.p)||0)*Number((r.impact??r.i)||0)}
function weights(){return project().criteria.reduce((s,c)=>s+Number(c.w),0)}
function matrixScore(key){return project().criteria.reduce((s,c)=>s+Number(c.w)*Number(c.s?.[key]||0)/5,0)}
function slabWinner(){return [...project().systems].sort((a,b)=>matrixScore(b.key)-matrixScore(a.key))[0]}
function abc(){
  const rows=[...budgetRows()].sort((a,b)=>b.total-a.total),sum=rows.reduce((s,x)=>s+x.total,0)||1;let acc=0;
  return rows.map(x=>{acc+=x.total;const pct=acc/sum*100;return {...x,share:x.total/sum*100,acc:pct,abc:pct<=80?'A':pct<=95?'B':'C'}});
}
function groupName(front,id){return project().groups?.[front]?.find(g=>g.id===id)?.name||'Sem grupo'}
function sourceName(id){return project().sources.find(s=>s.id===id)?.name||'—'}
function supplierName(id){return project().suppliers.find(s=>s.id===id)?.name||'—'}
function sourceType(id){return project().sources.find(s=>s.id===id)?.type||''}
function sourceTypeLabel(t){
  return ({SINAPI_NAT:'SINAPI - Média Nacional',SINAPI_DF:'SINAPI - DF',SICRO_NAT:'SICRO - Média Nacional',SICRO_DF:'SICRO - DF',MARKET_NAT:'Mercado - Média Nacional',MARKET_DF:'Mercado - Brasília/DF',SUPPLIER:'Fornecedor individual',BASELINE:'Baseline Entrega 1'})[t]||t;
}
function quoteAverage(itemId,type){
  const q=project().quotes.filter(x=>x.budgetItemId===itemId&&sourceType(x.sourceId)===type&&x.price!=null&&x.price!=='');
  return q.length?q.reduce((s,x)=>s+Number(x.price),0)/q.length:null;
}
function baselineExpected(){return Number(project().areaParam||100)*206.29}
function health(){
  const p=project();
  return [
    {label:'Cadastro do projeto',ok:!!(p.name&&p.location&&p.ownerUserId),txt:'Metadados essenciais preenchidos'},
    {label:'Sistemas de laje',ok:p.systems.length===4&&!!p.selected,txt:`${p.systems.length} sistemas; seleção ${p.selected}`},
    {label:'Zonas',ok:p.zones.length>0&&p.zones.every(z=>z.name&&z.span>0&&z.load>0),txt:`${p.zones.length} zonas parametrizadas`},
    {label:'Orçamento',ok:p.budgetItems.length>0&&p.budgetItems.every(x=>x.name&&x.qty>0),txt:`${p.budgetItems.length} itens elementares`},
    {label:'Planejamento',ok:p.activities.length>0&&p.activities.every(x=>x.name&&x.days>0),txt:`${p.activities.length} atividades elementares`},
    {label:'Suprimentos',ok:p.supplies.length>0&&p.supplies.every(x=>x.name&&x.qty>0),txt:`${p.supplies.length} suprimentos`},
    {label:'Fontes',ok:['SINAPI_NAT','SINAPI_DF','SICRO_NAT','SICRO_DF','MARKET_NAT','MARKET_DF'].every(t=>p.sources.some(s=>s.type===t)),txt:`${p.sources.length} fontes cadastradas`},
    {label:'Matriz multicritério',ok:weights()===100,txt:`Pesos = ${weights()}%`}
  ];
}
function recommendations(){
  const p=project(),r=[],w=slabWinner(),a=abc(),hi=p.risks.filter(x=>riskScore(x)>=12),cur=costs().direct;
  Math.abs(cur-baselineExpected())<.1?r.push({title:'Baseline preservada',text:`O orçamento base mantém ${money(cur)} para ${p.areaParam} m², equivalente à Entrega 1.`,kind:'Custo'}):r.push({title:'Baseline alterada',text:`O orçamento atual difere da Entrega 1 em ${money(cur-baselineExpected())}.`,kind:'Custo'});
  weights()===100?r.push({title:'Matriz consistente',text:'Os pesos totalizam 100%.',kind:'Matriz'}):r.push({title:'Revisar pesos',text:`Os pesos somam ${weights()}%.`,kind:'Matriz'});
  w?.key===p.selected?r.push({title:'Escolha coerente',text:`${w.name} permanece em primeiro lugar com ${num(matrixScore(w.key),1)}/100.`,kind:'Decisão'}):r.push({title:'Seleção diverge da matriz',text:`O primeiro colocado atual é ${w?.name||'—'}.`,kind:'Decisão'});
  if(a[0])r.push({title:'Item A prioritário',text:`${a[0].name} representa ${num(a[0].share,1)}% do custo direto atual.`,kind:'Custo'});
  if(hi.length)r.push({title:'Riscos prioritários',text:`${hi.length} risco(s) possuem P×I ≥ 12.`,kind:'Risco'});
  const noQuotes=p.budgetItems.filter(i=>!p.quotes.some(q=>q.budgetItemId===i.id&&q.price!=null));
  if(noQuotes.length)r.push({title:'Ampliar pesquisa de preços',text:`${noQuotes.length} item(ns) ainda não possuem cotação numérica individual além das bases cadastradas.`,kind:'Fontes'});
  if(p.selected==='EPS'&&!p.site.epsProtected)r.push({title:'Proteção do EPS',text:'O armazenamento protegido do EPS foi desativado.',kind:'Canteiro'});
  return r;
}

const nav=[
 ['dashboard','Visão geral','dashboard'],['projects','Projetos','projects'],['zones','Zonas da laje','zones'],['budget','Orçamento','budget'],['planning','Planejamento','plan'],['supply','Suprimentos','supply'],['suppliers','Fornecedores','suppliers'],['sources','Fontes','sources'],['teams','Equipes','team'],['logistics','Logística','logistics'],['abcpage','Curva ABC','abc'],['risks','Riscos','risk'],['matrix','Matriz','matrix'],['scenarios','Cenários','scenario'],['site','Canteiro','logistics'],['insights','Insights','insights'],['references','Referências','refs'],['audit','Auditoria','audit'],['users','Usuários','users']
];

function loginView(){
  return `<div class="login-shell"><section class="login-brand"><div class="login-brand-inner"><div class="brand-mark">${icon('plan')}</div><div class="eyebrow" style="color:#b9d9ff">Inovação e Tecnologia na Construção Civil</div><h1>Planejamento que vira decisão.</h1><p>Orçamento, cronograma, produtividade, riscos, suprimentos, logística e análise multicritério em um único ambiente demonstrável.</p><div class="login-features"><div class="login-feature">${icon('budget')} Orçamento paramétrico</div><div class="login-feature">${icon('plan')} Cronograma e HH</div><div class="login-feature">${icon('risk')} Riscos tratados</div><div class="login-feature">${icon('insights')} Recomendações inteligentes</div></div></div></section><section class="login-panel"><div class="login-card"><div class="eyebrow">ITCC Planner v${VERSION}</div><h2>Acessar plataforma</h2><p class="text-muted">Ambiente acadêmico local, sem dependência de servidor.</p><div class="login-help"><b>Acesso inicial</b><br>Usuário <span class="mono">ITCC</span> &nbsp; Senha <span class="mono">ITCC</span></div><label class="form-label">Usuário</label><input id="loginUser" class="form-control" value="ITCC"><label class="form-label">Senha</label><input id="loginPass" type="password" class="form-control" value="ITCC"><div style="margin-top:16px"><button id="loginBtn" class="btn btn-primary w-100">Entrar</button></div><p id="loginMsg" class="small text-muted" style="min-height:18px"></p></div></section></div>`;
}
function navButton(n){return `<button class="nav-item ${page===n[0]?'active':''}" data-page="${n[0]}">${icon(n[2])}<span>${n[1]}</span></button>`}
function shell(){
  const p=project(),u=currentUser(),split=15;
  return `<div class="app-shell"><aside class="sidebar"><div class="sidebar-brand"><div class="logo">${icon('plan')}</div><div><b>ITCC Planner</b><div class="version">v${VERSION} · SemVer</div></div></div><div class="project-chip"><div class="small" style="opacity:.65;margin-bottom:5px">PROJETO ATIVO</div><select id="projectSelect">${accessibleProjects().map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${esc(x.shortName)}</option>`).join('')}</select></div><div class="nav-group-title">Gestão do projeto</div>${nav.slice(0,split).map(navButton).join('')}<div class="nav-group-title">Governança</div>${nav.slice(split).filter(n=>n[0]!=='users'||u.globalRole==='master').map(navButton).join('')}<div class="sidebar-footer"><div class="user">${esc(u.name)}</div><div class="role">${esc(memberRole())}</div><div style="margin-top:10px"><button id="logoutBtn" class="btn btn-sm" style="width:100%;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);color:white">Sair</button></div></div></aside><main class="main"><header class="topbar"><h2>${nav.find(n=>n[0]===page)?.[1]||'ITCC Planner'}</h2><select id="mobilePageSelect" class="form-select mobile-page-select">${nav.filter(n=>n[0]!=='users'||u.globalRole==='master').map(n=>`<option value="${n[0]}" ${n[0]===page?'selected':''}>${n[1]}</option>`).join('')}</select><div class="top-actions"><div class="theme-group" title="Aparência"><button data-theme="system" class="${db.theme==='system'?'active':''}">${icon('system')}</button><button data-theme="light" class="${db.theme==='light'?'active':''}">${icon('sun')}</button><button data-theme="dark" class="${db.theme==='dark'?'active':''}">${icon('moon')}</button></div><span class="badge badge-info">v${VERSION}</span></div></header><section class="content">${pageView()}</section></main>${modal}<div class="toast-wrap" id="toasts"></div></div>`;
}
function title(h,sub,actions=''){return `<div class="page-title"><div><h1>${h}</h1><p>${sub}</p></div><div class="actions">${actions}</div></div>`}
function kpi(label,value,hint,ic='dashboard'){return `<div class="card kpi"><div class="card-body"><div class="kpi-icon">${icon(ic)}</div><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div></div>`}
function editable(path,val,type='text',cls=''){if(!canEdit())return esc(val);return `<input class="${cls}" data-edit="${esc(path)}" data-type="${type}" type="${type}" value="${esc(val)}">`}
function selectEdit(path,value,opts,cls=''){if(!canEdit())return esc(opts.find(o=>o[0]===value)?.[1]||value);return `<select class="${cls}" data-edit="${esc(path)}">${opts.map(o=>`<option value="${esc(o[0])}" ${o[0]===value?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`}
function pageActions(front,addType){return canEdit()?`<button class="btn btn-soft" data-groups="${front}">${icon('sources')} Agrupamentos</button><button class="btn btn-primary" data-add="${addType}">${icon('plus')} Adicionar</button>`:''}
function groupHeaders(front,rows,rowFn,colspan){
  const gs=[...(project().groups?.[front]||[])].sort((a,b)=>Number(a.order)-Number(b.order));let html='';
  for(const g of gs){const rs=rows.filter(x=>x.groupId===g.id);if(rs.length)html+=`<tr class="group-row"><td colspan="${colspan}">${esc(g.name)}</td></tr>`+rs.map(rowFn).join('')}
  const un=rows.filter(x=>!gs.some(g=>g.id===x.groupId));if(un.length)html+=`<tr class="group-row"><td colspan="${colspan}">Sem grupo</td></tr>`+un.map(rowFn).join('');
  return html;
}

function dashboard(){
  const c=costs(),s=schedule(),days=Math.max(0,...Object.values(s).map(x=>x.end)),hrs=Object.values(s).reduce((a,x)=>a+x.hh,0),hi=project().risks.filter(r=>riskScore(r)>=12).length,sel=project().systems.find(x=>x.key===project().selected),w=slabWinner();
  return `${title('Visão geral',`${esc(project().name)} · ${esc(project().location)}`)}<div class="callout"><b>Conclusão do estudo:</b> ${esc(sel?.name||'EPS')} LT ${sel?.h||20} cm permanece como solução-base. A v0.5.0 preserva a interface da v0.2.0 e adiciona cadastros detalhados sem alterar a conclusão da Entrega 1.</div><div class="grid grid-4" style="margin-top:14px">${kpi('Custo direto',money(c.direct),`${project().areaParam} m² · ${money(c.direct/project().areaParam)}/m²`,'budget')}${kpi('Prazo paramétrico',num(days,1)+' dias',`${num(hrs,0)} HH planejadas`,'plan')}${kpi('Maior nota',w?.name||'—',`${num(matrixScore(w?.key),1)}/100`,'matrix')}${kpi('Riscos prioritários',hi,`${project().risks.length} riscos cadastrados`,'risk')}</div><div class="grid grid-2" style="margin-top:14px"><div class="card"><div class="card-header"><h3>Saúde do estudo</h3><span class="badge badge-ok">Pronto</span></div><div class="card-body">${health().map(x=>`<div class="health-row"><div class="health-title"><span class="health-dot"></span><b>${x.label}</b></div><span class="text-muted small">${x.txt}</span></div>`).join('')}</div></div><div class="card"><div class="card-header"><h3>Recomendações imediatas</h3><button class="btn btn-sm btn-soft" data-page="insights">Ver análise completa</button></div><div class="card-body">${recommendations().slice(0,5).map(r=>`<div class="insight"><div class="insight-icon">${icon('insights')}</div><div><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div></div>`).join('')}</div></div></div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Curva ABC - custo direto</h3><span class="badge badge-neutral">Cenário ${esc(project().scenario)}</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Classe</th><th>Item</th><th>Grupo</th><th class="text-end">Custo</th><th class="text-end">% acum.</th></tr></thead><tbody>${abc().slice(0,8).map(x=>`<tr><td><span class="badge abc-${x.abc.toLowerCase()}">${x.abc}</span></td><td>${esc(x.name)}</td><td>${esc(groupName('budget',x.groupId))}</td><td class="text-end fw-bold">${money(x.total)}</td><td class="text-end">${num(x.acc,1)}%</td></tr>`).join('')}</tbody></table></div></div>`;
}
function projects(){
  const p=project();
  return `${title('Projetos','Um mesmo ambiente gerencia N projetos, cada um com proprietário e compartilhamentos.',canEdit()?`<button class="btn btn-soft" id="importJsonBtn">${icon('download')} Importar JSON</button><input id="importJsonFile" type="file" accept=".json" style="display:none"><button class="btn btn-primary" id="newProject">${icon('plus')} Novo projeto</button>`:'')}<div class="grid grid-3">${accessibleProjects().map(x=>`<div class="card project-card ${x.id===p.id?'active-project':''}"><span class="badge badge-info">${esc(x.status||'Projeto')}</span><h3>${esc(x.name)}</h3><p class="text-muted">${esc(x.description||'')}</p><div class="meta-list"><div class="meta"><span class="small text-muted">Local</span><b>${esc(x.location)}</b></div><div class="meta"><span class="small text-muted">Data-base</span><b>${esc(x.baseDate||'')}</b></div><div class="meta"><span class="small text-muted">Responsável</span><b>${esc(db.users.find(u=>u.id===x.ownerUserId)?.name||'—')}</b></div><div class="meta"><span class="small text-muted">Acesso</span><b>${x.members?.length||1} membro(s)</b></div></div><div class="actions" style="margin-top:12px"><button class="btn btn-sm btn-soft activate-project" data-id="${x.id}">Abrir</button>${canShare()?`<button class="btn btn-sm btn-soft share-project" data-id="${x.id}">Compartilhar</button>`:''}<button class="btn btn-sm btn-soft export-project" data-id="${x.id}">JSON</button></div></div>`).join('')}</div>`;
}
function zoneMap(){
  const p=project(),bg=p.planImage?`style="background-image:url(${p.planImage})"`:'';
  return `<div class="zone-map ${p.planImage?'has-image':''}" ${bg}>${p.zones.map(z=>`<div class="zone-block" style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%"><b>${esc(z.id)} · ${esc(z.name)}</b><span>${num(z.span,2)} m · ${esc(z.sys)} · ${num(z.area,0)} m²</span></div>`).join('')}<div class="site-block" style="left:73%;top:64%;width:18%;height:9%"><b>Acesso</b></div><div class="site-block" style="left:73%;top:76%;width:18%;height:9%"><b>Descarga</b></div></div>`;
}
function zones(){
  const p=project();
  return `${title('Zonas da laje','Vãos, cargas preliminares, áreas, sistema e posição no mapa gerencial.',canEdit()?`<label class="btn btn-soft" for="planUpload">Carregar planta</label><input id="planUpload" type="file" accept="image/*" style="display:none"><button class="btn btn-soft" id="clearPlan">Remover fundo</button><button class="btn btn-primary" data-add="zone">${icon('plus')} Adicionar zona</button>`:'')}<div class="grid grid-2"><div class="card"><div class="card-header"><h3>Mapa gerencial</h3><span class="badge badge-info">Vão crítico 4,93 m</span></div><div class="card-body">${zoneMap()}</div></div><div class="card"><div class="card-header"><h3>Leitura técnica</h3></div><div class="card-body">${p.zones.map(z=>`<div class="health-row"><div><b>${esc(z.id)} · ${esc(z.name)}</b><div class="small text-muted">${num(z.area,0)} m² · ${num(z.load,1)} kN/m²</div></div><div class="text-end"><b>${esc(z.sys)}</b><div class="small text-muted">vão ${num(z.span,2)} m</div></div></div>`).join('')}</div></div></div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Cadastro das zonas</h3><span class="badge badge-neutral">CRUD</span></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>Vão</th><th>Carga</th><th>Área</th><th>Sistema</th><th>X</th><th>Y</th><th>Larg.</th><th>Alt.</th><th>Ações</th></tr></thead><tbody>${p.zones.map((z,i)=>`<tr><td>${editable(`zones.${i}.id`,z.id)}</td><td>${editable(`zones.${i}.name`,z.name,'text','field-wide')}</td><td>${editable(`zones.${i}.span`,z.span,'number','field-mini')}</td><td>${editable(`zones.${i}.load`,z.load,'number','field-mini')}</td><td>${editable(`zones.${i}.area`,z.area,'number','field-mini')}</td><td>${selectEdit(`zones.${i}.sys`,z.sys,p.systems.map(s=>[s.key,s.key]))}</td><td>${editable(`zones.${i}.x`,z.x,'number','field-mini')}</td><td>${editable(`zones.${i}.y`,z.y,'number','field-mini')}</td><td>${editable(`zones.${i}.w`,z.w,'number','field-mini')}</td><td>${editable(`zones.${i}.h`,z.h,'number','field-mini')}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="zone" data-id="${z.id}">Excluir</button>`:''}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function priceMatrix(){
  const types=['SINAPI_NAT','SINAPI_DF','SICRO_NAT','SICRO_DF','MARKET_NAT','MARKET_DF'];
  return `<div class="card" style="margin-top:14px"><div class="card-header"><h3>Comparador de fontes</h3><span class="badge badge-neutral">média por item</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Item</th>${types.map(t=>`<th>${esc(sourceTypeLabel(t))}</th>`).join('')}</tr></thead><tbody>${project().budgetItems.map(it=>`<tr><td><b>${esc(it.id)}</b><div class="small text-muted">${esc(it.name)}</div></td>${types.map(t=>{const a=quoteAverage(it.id,t);return `<td>${a==null?'<span class="price-missing">sem preço comparável</span>':money(a)}</td>`}).join('')}</tr>`).join('')}</tbody></table></div></div>`;
}
function budget(){
  const rows=budgetRows(),c=costs(),p=project();
  const row=x=>{const i=p.budgetItems.findIndex(y=>y.id===x.id);return `<tr><td>${esc(x.id)}</td><td>${selectEdit(`budgetItems.${i}.groupId`,x.groupId,p.groups.budget.map(g=>[g.id,g.name]))}</td><td>${selectEdit(`budgetItems.${i}.kind`,x.kind,[['Material','Material'],['Serviço','Serviço'],['Mão de obra','Mão de obra'],['Consumível','Consumível'],['Equipamento','Equipamento']])}</td><td>${editable(`budgetItems.${i}.code`,x.code)}</td><td>${editable(`budgetItems.${i}.name`,x.name,'text','field-wide')}</td><td>${editable(`budgetItems.${i}.qty`,x.qty,'number')}</td><td>${editable(`budgetItems.${i}.unit`,x.unit)}</td><td>${editable(`budgetItems.${i}.unitPrice`,x.unitPrice,'number')}</td><td>${selectEdit(`budgetItems.${i}.sourceId`,x.sourceId,p.sources.map(s=>[s.id,s.name]),'field-source')}</td><td>${selectEdit(`budgetItems.${i}.supplierId`,x.supplierId,p.suppliers.map(s=>[s.id,s.name]),'field-source')}</td><td class="text-end fw-bold">${money(x.total)}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="budget" data-id="${x.id}">Excluir</button>`:''}</td></tr>`};
  return `${title('Orçamento','Itens no menor nível disponível; agrupamentos são apenas visuais.',`${pageActions('budget','budget')}<button class="btn btn-soft" id="exportBudgetCsv">${icon('download')} CSV</button>`)}<div class="grid grid-4">${kpi('Custo direto',money(c.direct),'Antes de BDI/contingência','budget')}${kpi('BDI',money(c.bdi),`${p.bdi}%`,'budget')}${kpi('Contingência',money(c.cont),`${p.contingency}%`,'risk')}${kpi('Total',money(c.total),`Cenário ${p.scenario}`,'dashboard')}</div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Itens orçamentários</h3><span class="badge badge-info">${p.budgetItems.length} itens</span></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Grupo</th><th>Classe</th><th>Código</th><th>Descrição</th><th>Qtd.</th><th>Un.</th><th>PU</th><th>Fonte</th><th>Fornecedor</th><th>Total</th><th>Ações</th></tr></thead><tbody>${groupHeaders('budget',rows,row,12)}</tbody></table></div></div>${priceMatrix()}`;
}
function planning(){
  const p=project(),sch=schedule(),max=Math.max(1,...Object.values(sch).map(x=>x.end));
  const row=x=>{const i=p.activities.findIndex(y=>y.id===x.id);return `<tr><td>${esc(x.id)}</td><td>${selectEdit(`activities.${i}.groupId`,x.groupId,p.groups.planning.map(g=>[g.id,g.name]))}</td><td>${editable(`activities.${i}.name`,x.name,'text','field-wide')}</td><td>${selectEdit(`activities.${i}.zone`,x.zone,p.zones.map(z=>[z.id,z.id]))}</td><td>${selectEdit(`activities.${i}.pred`,x.pred||'',[['','Nenhuma'],...p.activities.filter(a=>a.id!==x.id).map(a=>[a.id,a.id])])}</td><td>${editable(`activities.${i}.days`,x.days,'number')}</td><td>${editable(`activities.${i}.crew`,x.crew,'number')}</td><td>${editable(`activities.${i}.lead`,x.lead,'number')}</td><td>${selectEdit(`activities.${i}.status`,x.status,[['Planejada','Planejada'],['Em andamento','Em andamento'],['Concluída','Concluída'],['Bloqueada','Bloqueada']])}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="activity" data-id="${x.id}">Excluir</button>`:''}</td></tr>`};
  return `${title('Planejamento','Atividades elementares, predecessoras, equipe e lead time.',pageActions('planning','activity'))}<div class="grid grid-3">${kpi('Prazo',num(max,1)+' dias','Horizonte paramétrico','plan')}${kpi('HH estimadas',num(Object.values(sch).reduce((s,x)=>s+x.hh,0),0),'dias × equipe × jornada × eficiência','team')}${kpi('Eficiência',num(p.efficiency*100,0)+'%','Fator operacional','dashboard')}</div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Gantt paramétrico</h3><span class="badge badge-warn">Dourado = trecho final crítico</span></div><div class="card-body">${p.activities.map(t=>{const z=sch[t.id];return `<div class="gantt-row"><div><b>${esc(t.name)}</b><div class="small text-muted">${esc(t.id)} · equipe ${t.crew}</div></div><div class="small">${num(z?.dur,2)} dias</div><div class="gantt-bar"><span class="${z?.critical?'critical':''}" style="left:${(z?.start||0)/max*100}%;width:${Math.max(2,(z?.dur||0)/max*100)}%"></span></div></div>`}).join('')}</div></div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Cadastro das atividades</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Grupo</th><th>Atividade</th><th>Zona</th><th>Pred.</th><th>Dias</th><th>Equipe</th><th>Lead</th><th>Status</th><th>Ações</th></tr></thead><tbody>${groupHeaders('planning',p.activities,row,10)}</tbody></table></div></div>`;
}
function supply(){
  const p=project();
  const row=x=>{const i=p.supplies.findIndex(y=>y.id===x.id);return `<tr><td>${esc(x.id)}</td><td>${selectEdit(`supplies.${i}.groupId`,x.groupId,p.groups.supplies.map(g=>[g.id,g.name]))}</td><td>${editable(`supplies.${i}.name`,x.name,'text','field-wide')}</td><td>${selectEdit(`supplies.${i}.budgetItemId`,x.budgetItemId,[['','—'],...p.budgetItems.map(b=>[b.id,b.id])])}</td><td>${editable(`supplies.${i}.qty`,x.qty,'number')}</td><td>${editable(`supplies.${i}.unit`,x.unit)}</td><td>${editable(`supplies.${i}.safety`,x.safety,'number')}</td><td>${editable(`supplies.${i}.lead`,x.lead,'number')}</td><td>${selectEdit(`supplies.${i}.supplierId`,x.supplierId,[['','—'],...p.suppliers.map(s=>[s.id,s.name])],'field-source')}</td><td>${editable(`supplies.${i}.status`,x.status)}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="supply" data-id="${x.id}">Excluir</button>`:''}</td></tr>`};
  return `${title('Suprimentos','Fornecimentos elementares vinculáveis ao orçamento, com lead time e estoque de segurança.',pageActions('supplies','supply'))}<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Grupo</th><th>Suprimento</th><th>Item orçamento</th><th>Qtd.</th><th>Un.</th><th>Segurança %</th><th>Lead</th><th>Fornecedor</th><th>Status</th><th>Ações</th></tr></thead><tbody>${groupHeaders('supplies',p.supplies,row,11)}</tbody></table></div></div>`;
}
function suppliers(){
  const p=project();
  const row=x=>{const i=p.suppliers.findIndex(y=>y.id===x.id);return `<tr><td>${selectEdit(`suppliers.${i}.groupId`,x.groupId,p.groups.suppliers.map(g=>[g.id,g.name]))}</td><td>${editable(`suppliers.${i}.name`,x.name,'text','field-wide')}</td><td class="supplier-cnpj">${editable(`suppliers.${i}.cnpj`,x.cnpj||'')}</td><td>${editable(`suppliers.${i}.city`,x.city||'')}</td><td>${editable(`suppliers.${i}.address`,x.address||'','text','field-wide')}</td><td>${editable(`suppliers.${i}.phone`,x.phone||'')}</td><td>${editable(`suppliers.${i}.categories`,x.categories||'','text','field-wide')}</td><td>${editable(`suppliers.${i}.status`,x.status||'','text','field-wide')}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="supplier" data-id="${x.id}">Excluir</button>`:''}</td></tr>`};
  return `${title('Fornecedores','Cadastro de fornecedor no menor nível identificável, incluindo CNPJ quando localizado com segurança.',pageActions('suppliers','supplier'))}<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Grupo</th><th>Fornecedor</th><th>CNPJ</th><th>Cidade/UF</th><th>Endereço</th><th>Contato</th><th>Categorias</th><th>Status</th><th>Ações</th></tr></thead><tbody>${groupHeaders('suppliers',p.suppliers,row,9)}</tbody></table></div></div>`;
}
function sources(){
  const p=project();
  const srow=x=>{const i=p.sources.findIndex(y=>y.id===x.id);return `<tr><td>${selectEdit(`sources.${i}.groupId`,x.groupId,p.groups.sources.map(g=>[g.id,g.name]))}</td><td>${selectEdit(`sources.${i}.type`,x.type,['SINAPI_NAT','SINAPI_DF','SICRO_NAT','SICRO_DF','MARKET_NAT','MARKET_DF','SUPPLIER','BASELINE'].map(t=>[t,sourceTypeLabel(t)]),'field-source')}</td><td>${editable(`sources.${i}.name`,x.name,'text','field-wide')}</td><td>${editable(`sources.${i}.region`,x.region||'')}</td><td>${editable(`sources.${i}.date`,x.date||'')}</td><td>${editable(`sources.${i}.note`,x.note||'','text','field-wide')}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="source" data-id="${x.id}">Excluir</button>`:''}</td></tr>`};
  const qrow=(x,i)=>`<tr><td>${esc(x.id)}</td><td>${selectEdit(`quotes.${i}.budgetItemId`,x.budgetItemId,p.budgetItems.map(b=>[b.id,b.id]))}</td><td>${selectEdit(`quotes.${i}.sourceId`,x.sourceId,p.sources.map(s=>[s.id,s.name]),'field-source')}</td><td>${selectEdit(`quotes.${i}.supplierId`,x.supplierId||'',[['','—'],...p.suppliers.map(s=>[s.id,s.name])],'field-source')}</td><td>${editable(`quotes.${i}.price`,x.price??'','number')}</td><td>${editable(`quotes.${i}.unit`,x.unit||'')}</td><td>${editable(`quotes.${i}.date`,x.date||'')}</td><td>${editable(`quotes.${i}.region`,x.region||'')}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="quote" data-id="${x.id}">Excluir</button>`:''}</td></tr>`;
  return `${title('Fontes e cotações','Bases oficiais e pesquisa de mercado separadas por abrangência; médias calculadas somente com preços numéricos comparáveis.',`${pageActions('sources','source')}<button class="btn btn-primary" data-add="quote">${icon('plus')} Cotação</button>`)}<div class="source-summary">${['SINAPI_NAT','SINAPI_DF','SICRO_NAT','SICRO_DF','MARKET_NAT','MARKET_DF'].map(t=>`<div class="source-stat"><span class="small text-muted">${esc(sourceTypeLabel(t))}</span><b>${p.sources.filter(s=>s.type===t).length} fonte(s)</b></div>`).join('')}</div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Cadastro de fontes</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Grupo</th><th>Tipo</th><th>Fonte</th><th>Região</th><th>Data-base</th><th>Observação</th><th>Ações</th></tr></thead><tbody>${groupHeaders('sources',p.sources,srow,7)}</tbody></table></div></div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Cotações e preços</h3><span class="badge badge-neutral">${p.quotes.length} registros</span></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Item</th><th>Fonte</th><th>Fornecedor</th><th>Preço</th><th>Un.</th><th>Data</th><th>Região</th><th>Ações</th></tr></thead><tbody>${p.quotes.map(qrow).join('')}</tbody></table></div></div>`;
}
function teams(){
  const p=project();
  return `${title('Equipes e produtividade','Dimensionamento básico do efetivo e qualificação necessária.',canEdit()?`<button class="btn btn-primary" data-add="team">${icon('plus')} Equipe</button>`:'')}<div class="grid grid-2">${p.teams.map((e,i)=>`<div class="card"><div class="card-body"><div style="display:flex;justify-content:space-between"><div><span class="eyebrow">Equipe</span><h3 style="font-size:20px;margin:5px 0">${editable(`teams.${i}.name`,e.name,'text','field-wide')}</h3></div><div class="kpi-icon">${icon('team')}</div></div><div class="meta-list"><div class="meta"><span class="small text-muted">Pessoas</span><b>${editable(`teams.${i}.people`,e.people,'number')}</b></div><div class="meta"><span class="small text-muted">Custo HH</span><b>${editable(`teams.${i}.costHour`,e.costHour,'number')}</b></div><div class="meta"><span class="small text-muted">Qualificação</span><b>${editable(`teams.${i}.qualification`,e.qualification,'text','field-wide')}</b></div><div class="meta"><span class="small text-muted">Disponibilidade</span><b>${editable(`teams.${i}.availability`,e.availability,'number')}%</b></div></div>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="team" data-id="${e.id}" style="margin-top:10px">Excluir equipe</button>`:''}</div></div>`).join('')}</div>`;
}
function logistics(){
  return `${title('Logística','Viagens, consumo, estoque de segurança e ponto de pedido.')}<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Material</th><th>Necessidade</th><th>Capacidade/viagem</th><th>Viagens</th><th>Lead</th><th>Consumo/dia</th><th>Estoque segurança</th><th>Ponto pedido</th></tr></thead><tbody>${project().logistics.map((l,i)=>{const trips=Math.ceil(l.required/l.vehicleCapacity),rop=l.dailyUse*l.lead+l.stockSafety;return `<tr><td>${editable(`logistics.${i}.material`,l.material,'text','field-wide')}</td><td>${editable(`logistics.${i}.required`,l.required,'number')} ${esc(l.unit)}</td><td>${editable(`logistics.${i}.vehicleCapacity`,l.vehicleCapacity,'number')}</td><td><b>${trips}</b></td><td>${editable(`logistics.${i}.lead`,l.lead,'number')} d</td><td>${editable(`logistics.${i}.dailyUse`,l.dailyUse,'number')}</td><td>${editable(`logistics.${i}.stockSafety`,l.stockSafety,'number')}</td><td><b>${num(rop,0)} ${esc(l.unit)}</b></td></tr>`}).join('')}</tbody></table></div></div>`;
}
function abcpage(){
  return `${title('Curva ABC','Classificação automática dos itens pelo custo direto do cenário atual.')}<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Classe</th><th>Item</th><th>Grupo</th><th>Custo</th><th>Participação</th><th>Acumulado</th></tr></thead><tbody>${abc().map(x=>`<tr><td><span class="badge abc-${x.abc.toLowerCase()}">${x.abc}</span></td><td><b>${esc(x.name)}</b></td><td>${esc(groupName('budget',x.groupId))}</td><td>${money(x.total)}</td><td>${num(x.share,1)}%</td><td>${num(x.acc,1)}%</td></tr>`).join('')}</tbody></table></div></div>`;
}
function risks(){
  const p=project();
  return `${title('Riscos','Probabilidade × impacto, responsável e mitigação.',canEdit()?`<button class="btn btn-primary" data-add="risk">${icon('plus')} Risco</button>`:'')}<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Risco</th><th>P</th><th>I</th><th>P×I</th><th>Responsável</th><th>Mitigação</th><th>Status</th><th>Ações</th></tr></thead><tbody>${p.risks.map((r,i)=>`<tr><td>${editable(`risks.${i}.name`,r.name,'text','field-wide')}</td><td>${editable(`risks.${i}.prob`,r.prob,'number')}</td><td>${editable(`risks.${i}.impact`,r.impact,'number')}</td><td><span class="badge ${riskScore(r)>=12?'badge-warn':'badge-ok'}">${riskScore(r)}</span></td><td>${editable(`risks.${i}.owner`,r.owner,'text','field-wide')}</td><td>${editable(`risks.${i}.mitigation`,r.mitigation,'text','field-wide')}</td><td>${editable(`risks.${i}.status`,r.status)}</td><td>${canEdit()?`<button class="btn btn-sm btn-danger" data-delete="risk" data-id="${r.id}">Excluir</button>`:''}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function matrix(){
  const p=project();
  return `${title('Matriz multicritério','Escala 1 a 5. Os pesos totalizam 100% e podem ser ajustados para análise de sensibilidade.')}<div class="callout"><b>Soma dos pesos: ${weights()}%.</b> Resultado-base: EPS 84,6; cerâmica 83,6; nervurada 72,2; maciça 63,0.</div><div class="card" style="margin-top:14px"><div class="table-wrap"><table class="table"><thead><tr><th>Critério</th><th>Peso</th>${p.systems.map(s=>`<th>${esc(s.key)}</th>`).join('')}</tr></thead><tbody>${p.criteria.map((c,ci)=>`<tr><td><b>${editable(`criteria.${ci}.n`,c.n,'text','field-wide')}</b></td><td>${editable(`criteria.${ci}.w`,c.w,'number')}%</td>${p.systems.map(s=>`<td>${canEdit()?`<input class="matrix-score" data-ci="${ci}" data-key="${s.key}" type="number" min="1" max="5" value="${c.s[s.key]}">`:c.s[s.key]}</td>`).join('')}</tr>`).join('')}<tr><td><b>Pontuação / 100</b></td><td></td>${p.systems.map(s=>`<td><b>${num(matrixScore(s.key),1)}</b></td>`).join('')}</tr></tbody></table></div></div><div class="grid grid-2" style="margin-top:14px">${p.systems.map(s=>`<div class="card"><div class="card-body"><h3>${esc(s.name)}</h3><div class="small text-muted">Custo ${money(s.cost)}/m² · h ${s.h} cm · nota ${num(matrixScore(s.key),1)}/100</div><div class="proscons"><div class="pros"><b>Prós</b><div class="small" style="margin-top:7px">${esc(s.pros)}</div></div><div class="cons"><b>Pontos de atenção</b><div class="small" style="margin-top:7px">${esc(s.cons)}</div></div></div></div></div>`).join('')}</div>`;
}
function scenarios(){
  const p=project(),base=costs().direct/scenarioFactor();
  return `${title('Cenários','Compare custos e ajuste BDI, contingência, eficiência e jornada.')}<div class="grid grid-3">${['optimistic','base','pessimistic'].map(s=>`<div class="card project-card ${p.scenario===s?'active-project':''}"><span class="badge ${s==='base'?'badge-info':'badge-neutral'}">${s==='optimistic'?'Otimista':s==='base'?'Base':'Pessimista'}</span><h3>${s==='optimistic'?'Custos -5%':s==='base'?'Custos de entrada':'Custos +15%'}</h3><p class="text-muted">${money(base*(s==='optimistic'?.95:s==='pessimistic'?1.15:1))}</p><button class="btn btn-sm btn-soft set-scenario" data-scenario="${s}">Aplicar cenário</button></div>`).join('')}</div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Parâmetros globais</h3></div><div class="card-body grid grid-4"><div><label class="form-label">BDI (%)</label>${editable('bdi',p.bdi,'number')}</div><div><label class="form-label">Contingência (%)</label>${editable('contingency',p.contingency,'number')}</div><div><label class="form-label">Eficiência (%)</label>${editable('efficiencyPct',p.efficiency*100,'number')}</div><div><label class="form-label">Horas/dia</label>${editable('workHoursDay',p.workHoursDay,'number')}</div></div></div>`;
}
function site(){
  const p=project(),items=[['gate','Acesso e controle'],['unload','Área de descarga'],['store','Estoque coberto'],['epsProtected','EPS protegido'],['assembly','Área de montagem'],['sanitary','Instalações sanitárias'],['changing','Vestiário'],['meal','Local de refeições'],['water','Água potável'],['waste','Resíduos segregados'],['concrete','Acesso bomba/caminhão'],['firePlan','Proteção do EPS/incêndio']];
  return `${title('Canteiro para o ciclo de lajes','Configuração complementar; alterações alimentam os Insights.')}<div class="grid grid-3">${items.map(([k,label])=>`<label class="card site-check"><div class="card-body"><input class="site-toggle" data-key="${k}" type="checkbox" ${p.site?.[k]?'checked':''} ${canEdit()?'':'disabled'}><b>${label}</b><div class="small text-muted">${p.site?.[k]?'Ativo no cenário-base':'Desativado'}</div></div></label>`).join('')}</div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Implantação esquemática</h3></div><div class="card-body">${zoneMap()}</div></div>`;
}
function insights(){
  return `${title('Insights do estudo','Regras locais e explicáveis, recalculadas após cada alteração.')}<div class="grid grid-2"><div>${recommendations().map(r=>`<div class="insight"><div class="insight-icon">${icon('insights')}</div><div><span class="badge badge-info" style="margin-bottom:6px">${esc(r.kind)}</span><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div></div>`).join('')}</div><div><div class="card"><div class="card-header"><h3>Leitura da decisão</h3></div><div class="card-body"><p>O motor cruza custos, matriz, riscos, fontes e canteiro. Não depende de IA nem internet para recalcular as mensagens.</p><div class="callout"><b>Regra:</b> uma indicação orienta revisão; a decisão de engenharia permanece vinculada ao projeto e às fontes.</div></div></div><div class="card" style="margin-top:14px"><div class="card-header"><h3>Prós e contras dos quatro sistemas</h3></div><div class="card-body">${project().systems.map(s=>`<div style="margin-bottom:16px"><b>${esc(s.name)}</b><div class="small text-muted">${money(s.cost)}/m² · nota ${num(matrixScore(s.key),1)}/100</div><div class="proscons"><div class="pros">${esc(s.pros)}</div><div class="cons">${esc(s.cons)}</div></div></div>`).join('')}</div></div></div></div>`;
}
function references(){
  const p=project();
  return `${title('Referências','Fontes rastreáveis do estudo e bases cadastradas.')}<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Tipo</th><th>Título</th><th>Organização</th><th>Data</th><th>Localização</th></tr></thead><tbody>${p.references.map(r=>`<tr><td><span class="badge badge-neutral">${esc(r.type)}</span></td><td><b>${esc(r.title||r.name)}</b></td><td>${esc(r.organization||'')}</td><td>${esc(r.date||'')}</td><td class="small">${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">abrir</a>`:'—'}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function auditPage(){
  return `${title('Auditoria e comentários','Registro de alterações por projeto e versão.',canEdit()?'<button class="btn btn-primary" id="newComment">Adicionar comentário</button>':'')}<div class="grid grid-2"><div class="card"><div class="card-header"><h3>Comentários</h3></div><div class="card-body">${project().comments.length?project().comments.map(c=>`<div class="insight"><div class="insight-icon">${icon('audit')}</div><div><h4>${esc(c.user)} · ${esc(c.at)}</h4><p>${esc(c.text)}</p></div></div>`).join(''):'<div class="empty">Nenhum comentário.</div>'}</div></div><div class="card"><div class="card-header"><h3>Trilha de alterações</h3></div><div class="card-body">${project().audit.slice(0,40).map(a=>`<div class="health-row"><div><b>${esc(a.action)}</b><div class="small text-muted">${esc(a.at)} · ${esc(a.user)}</div></div><span class="badge badge-neutral">v${esc(a.version)}</span></div>`).join('')}</div></div></div>`;
}
function usersPage(){
  if(currentUser().globalRole!=='master')return title('Usuários','Acesso restrito ao master.');
  return `${title('Usuários','Administração local da demonstração.',`<button class="btn btn-primary" id="newUser">${icon('plus')} Novo usuário</button>`)}<div class="callout"><b>Segurança acadêmica:</b> as credenciais ficam no armazenamento local. Não usar esta autenticação em produção.</div><div class="card" style="margin-top:14px"><div class="table-wrap"><table class="table"><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil global</th><th>Status</th></tr></thead><tbody>${db.users.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td class="mono">${esc(u.username)}</td><td>${esc(u.globalRole)}</td><td><span class="badge badge-ok">${u.active?'Ativo':'Inativo'}</span></td></tr>`).join('')}</tbody></table></div></div>`;
}
function pageView(){
  const map={dashboard,projects,zones,budget,planning,supply,suppliers,sources,teams,logistics,abcpage,risks,matrix,scenarios,site,insights,references,audit:auditPage,users:usersPage};
  return (map[page]||dashboard)();
}
function setByPath(path,val,type){
  const p=project();
  if(path==='efficiencyPct'){p.efficiency=Number(val)/100;return}
  const seg=path.split('.');let obj=p;
  for(let i=0;i<seg.length-1;i++)obj=obj[seg[i]];
  const k=seg[seg.length-1];
  obj[k]=type==='number'?Number(val):val;
}
function addRecord(type){
  const p=project(),ts=Date.now();
  if(type==='budget')p.budgetItems.push({id:'B'+ts,groupId:p.groups.budget[0]?.id||'',kind:'Material',code:'',name:'Novo item orçamentário',qty:1,unit:'un',unitPrice:0,sourceId:p.sources.find(s=>s.type==='SINAPI_DF')?.id||'',supplierId:'',waste:0,evidence:'P',zone:'Todas as zonas'});
  if(type==='activity')p.activities.push({id:'A'+ts,groupId:p.groups.planning[0]?.id||'',name:'Nova atividade',zone:p.zones[0]?.id||'',pred:'',days:1,crew:1,lead:0,status:'Planejada'});
  if(type==='supply')p.supplies.push({id:'S'+ts,groupId:p.groups.supplies[0]?.id||'',budgetItemId:'',name:'Novo suprimento',qty:1,unit:'un',safety:0,lead:0,supplierId:'',status:'A cotar'});
  if(type==='supplier')p.suppliers.push({id:'SUP'+ts,groupId:p.groups.suppliers[0]?.id||'',name:'Novo fornecedor',cnpj:'',city:'',address:'',phone:'',url:'',categories:'',status:'A validar'});
  if(type==='source')p.sources.push({id:'SRC'+ts,groupId:p.groups.sources[0]?.id||'',type:'MARKET_DF',name:'Nova fonte',region:'Brasília/DF',date:'',url:'',note:''});
  if(type==='quote')p.quotes.push({id:'Q'+ts,budgetItemId:p.budgetItems[0]?.id||'',sourceId:p.sources.find(s=>s.type==='MARKET_DF')?.id||p.sources[0]?.id||'',supplierId:'',price:null,unit:p.budgetItems[0]?.unit||'un',date:'',region:'Brasília/DF',url:'',note:''});
  if(type==='team')p.teams.push({id:'E'+ts,name:'Nova equipe',people:1,costHour:0,qualification:'A definir',availability:100});
  if(type==='risk')p.risks.push({id:'R'+ts,name:'Novo risco',prob:1,impact:1,owner:'A definir',mitigation:'A definir',status:'Aberto'});
  if(type==='zone')p.zones.push({id:'Z'+(p.zones.length+1),name:'Nova zona',span:4.93,load:3,area:20,sys:p.selected,x:10,y:10,w:20,h:18,note:''});
  audit(`Registro adicionado: ${type}`);toast('Registro adicionado');render();
}
function deleteRecord(type,id){
  if(!confirm('Excluir este registro?'))return;
  const p=project(),map={budget:'budgetItems',activity:'activities',supply:'supplies',supplier:'suppliers',source:'sources',quote:'quotes',team:'teams',risk:'risks',zone:'zones'},arr=map[type];
  if(!arr)return;
  p[arr]=p[arr].filter(x=>x.id!==id);
  if(type==='budget'){p.quotes=p.quotes.filter(x=>x.budgetItemId!==id);p.supplies.forEach(s=>{if(s.budgetItemId===id)s.budgetItemId=''})}
  audit(`Registro excluído: ${type} ${id}`);toast('Registro excluído');render();
}
function groupsModal(front){
  const gs=project().groups[front]||[];
  modal=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Agrupamentos · ${esc(front)}</h3><button class="btn btn-sm" data-close-modal>Fechar</button></div><div class="modal-body"><p class="text-muted small">Agrupamentos são exclusivamente visuais; cada item permanece em linha própria.</p>${gs.map((g,i)=>`<div class="group-editor"><input class="form-control group-name" data-i="${i}" value="${esc(g.name)}"><input class="form-control group-order" data-i="${i}" type="number" value="${g.order}"><button class="btn btn-sm btn-danger delete-group" data-front="${front}" data-id="${g.id}">Excluir</button></div>`).join('')}<button class="btn btn-soft" id="addGroup" data-front="${front}" style="margin-top:12px">${icon('plus')} Novo grupo</button></div><div class="modal-foot"><button class="btn" data-close-modal>Cancelar</button><button class="btn btn-primary" id="saveGroups" data-front="${front}">Salvar</button></div></div></div>`;
  render();
}
function saveGroups(front){
  document.querySelectorAll('.group-name').forEach(el=>project().groups[front][Number(el.dataset.i)].name=el.value);
  document.querySelectorAll('.group-order').forEach(el=>project().groups[front][Number(el.dataset.i)].order=Number(el.value));
  audit(`Agrupamentos atualizados: ${front}`);modal='';render();
}
function addGroup(front){
  const gs=project().groups[front];gs.push({id:front.toUpperCase().slice(0,3)+'-G'+Date.now(),name:'Novo grupo',order:gs.length+1});persist();groupsModal(front);
}
function deleteGroup(front,id){
  if(!confirm('Excluir este agrupamento? Os itens não serão excluídos.'))return;
  project().groups[front]=project().groups[front].filter(g=>g.id!==id);
  const map={budget:'budgetItems',planning:'activities',supplies:'supplies',sources:'sources',suppliers:'suppliers'};
  project()[map[front]].forEach(x=>{if(x.groupId===id)x.groupId=''});
  persist();groupsModal(front);
}
function projectModal(){
  modal=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Novo projeto</h3><button class="btn btn-sm" data-close-modal>Fechar</button></div><div class="modal-body"><label class="form-label">Nome</label><input id="npName" class="form-control" value="Novo estudo de lajes"><label class="form-label">Nome curto</label><input id="npShort" class="form-control" value="Novo projeto"><label class="form-label">Local</label><input id="npLoc" class="form-control" value="Brasília/DF"><label class="form-label">Descrição</label><textarea id="npDesc" class="form-control" rows="3">Projeto criado a partir do modelo funcional do ITCC Planner.</textarea></div><div class="modal-foot"><button class="btn" data-close-modal>Cancelar</button><button class="btn btn-primary" id="createProject">Criar projeto</button></div></div></div>`;render();
}
function shareModal(id){
  const p=db.projects.find(x=>x.id===id);
  modal=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Compartilhar projeto</h3><button class="btn btn-sm" data-close-modal>Fechar</button></div><div class="modal-body">${db.users.filter(u=>u.id!==p.ownerUserId).length?db.users.filter(u=>u.id!==p.ownerUserId).map(u=>`<div class="health-row"><div><b>${esc(u.name)}</b><div class="small text-muted">${esc(u.username)}</div></div><select class="form-select share-role" data-uid="${u.id}" style="width:180px"><option value="none">Sem acesso</option><option value="editor" ${p.members.some(m=>m.userId===u.id&&m.projectRole==='editor')?'selected':''}>Projetista/Editor</option><option value="viewer" ${p.members.some(m=>m.userId===u.id&&m.projectRole==='viewer')?'selected':''}>Visualizador</option></select></div>`).join(''):'<div class="empty">Cadastre outro usuário primeiro.</div>'}</div><div class="modal-foot"><button class="btn" data-close-modal>Cancelar</button><button class="btn btn-primary" id="saveShare" data-id="${id}">Salvar acessos</button></div></div></div>`;render();
}
function userModal(){
  modal=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Novo usuário</h3><button class="btn btn-sm" data-close-modal>Fechar</button></div><div class="modal-body"><label class="form-label">Nome</label><input id="nuName" class="form-control" value="Projetista"><label class="form-label">Usuário</label><input id="nuUser" class="form-control" value="projetista"><label class="form-label">Senha</label><input id="nuPass" class="form-control" type="password" value="ITCC2026"><label class="form-label">Perfil global</label><select id="nuRole" class="form-select"><option value="user">Usuário de projeto</option><option value="master">Master</option></select></div><div class="modal-foot"><button class="btn" data-close-modal>Cancelar</button><button class="btn btn-primary" id="createUser">Criar usuário</button></div></div></div>`;render();
}
function commentModal(){
  modal=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Novo comentário</h3><button class="btn btn-sm" data-close-modal>Fechar</button></div><div class="modal-body"><textarea id="commentText" class="form-control" rows="5" placeholder="Registrar decisão, premissa ou observação."></textarea></div><div class="modal-foot"><button class="btn" data-close-modal>Cancelar</button><button class="btn btn-primary" id="saveComment">Registrar</button></div></div></div>`;render();
}
function render(){
  applyTheme();
  document.getElementById('app').innerHTML=session?shell():loginView();
  bind();
  renderToasts();
}
function renderToasts(){const w=document.getElementById('toasts');if(w)w.innerHTML=toasts.map(t=>`<div class="toast"><b>${esc(t.title)}</b><span>${esc(t.msg)}</span></div>`).join('')}
function bind(){
  if(!session){
    document.getElementById('loginBtn')?.addEventListener('click',login);
    document.getElementById('loginPass')?.addEventListener('keydown',e=>{if(e.key==='Enter')login()});
    return;
  }
  document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',()=>{page=el.dataset.page;render()}));
  document.getElementById('mobilePageSelect')?.addEventListener('change',e=>{page=e.target.value;render()});
  document.getElementById('logoutBtn')?.addEventListener('click',()=>{session=null;sessionStorage.removeItem(SESSION_KEY);render()});
  document.getElementById('projectSelect')?.addEventListener('change',e=>{db.activeProjectId=e.target.value;persist();page='dashboard';render()});
  document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme)));
  document.querySelectorAll('[data-edit]').forEach(inp=>inp.addEventListener('change',()=>{setByPath(inp.dataset.edit,inp.value,inp.dataset.type||inp.type);audit(`Parâmetro alterado: ${inp.dataset.edit}`);toast('Planejamento atualizado');render()}));
  document.querySelectorAll('.matrix-score').forEach(inp=>inp.addEventListener('change',()=>{project().criteria[Number(inp.dataset.ci)].s[inp.dataset.key]=Math.min(5,Math.max(1,Number(inp.value)));audit('Nota da matriz alterada');render()}));
  document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addRecord(b.dataset.add)));
  document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteRecord(b.dataset.delete,b.dataset.id)));
  document.querySelectorAll('[data-groups]').forEach(b=>b.addEventListener('click',()=>groupsModal(b.dataset.groups)));
  document.querySelectorAll('.set-scenario').forEach(b=>b.addEventListener('click',()=>{project().scenario=b.dataset.scenario;audit(`Cenário aplicado: ${b.dataset.scenario}`);render()}));
  document.querySelectorAll('.site-toggle').forEach(s=>s.addEventListener('change',()=>{project().site[s.dataset.key]=s.checked;audit(`Canteiro: ${s.dataset.key}=${s.checked}`);render()}));
  document.querySelectorAll('.activate-project').forEach(b=>b.addEventListener('click',()=>{db.activeProjectId=b.dataset.id;persist();page='dashboard';render()}));
  document.querySelectorAll('.share-project').forEach(b=>b.addEventListener('click',()=>shareModal(b.dataset.id)));
  document.querySelectorAll('.export-project').forEach(b=>b.addEventListener('click',()=>{const p=db.projects.find(x=>x.id===b.dataset.id);download(`${p.shortName.replace(/\s+/g,'_')}_ITCC_v041.json`,JSON.stringify(p,null,2),'application/json')}));
  document.getElementById('newProject')?.addEventListener('click',projectModal);
  document.getElementById('newUser')?.addEventListener('click',userModal);
  document.getElementById('newComment')?.addEventListener('click',commentModal);
  document.getElementById('exportBudgetCsv')?.addEventListener('click',exportBudgetCsv);
  document.getElementById('importJsonBtn')?.addEventListener('click',()=>document.getElementById('importJsonFile')?.click());
  document.getElementById('importJsonFile')?.addEventListener('change',importJson);
  document.getElementById('planUpload')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{project().planImage=r.result;audit('Imagem-base da planta carregada');render()};r.readAsDataURL(f)});
  document.getElementById('clearPlan')?.addEventListener('click',()=>{project().planImage=null;audit('Imagem-base removida');render()});
  document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>{modal='';render()}));
  document.getElementById('createProject')?.addEventListener('click',createProject);
  document.getElementById('createUser')?.addEventListener('click',createUser);
  document.getElementById('saveShare')?.addEventListener('click',saveShare);
  document.getElementById('saveComment')?.addEventListener('click',saveComment);
  document.getElementById('saveGroups')?.addEventListener('click',e=>saveGroups(e.currentTarget.dataset.front));
  document.getElementById('addGroup')?.addEventListener('click',e=>addGroup(e.currentTarget.dataset.front));
  document.querySelectorAll('.delete-group').forEach(b=>b.addEventListener('click',()=>deleteGroup(b.dataset.front,b.dataset.id)));
}
function login(){
  const un=document.getElementById('loginUser').value.trim(),pw=document.getElementById('loginPass').value;
  const u=db.users.find(x=>x.active&&x.username===un&&x.password===pw);
  if(!u){document.getElementById('loginMsg').textContent='Credenciais não conferem. Verifique usuário e senha.';return}
  session={userId:u.id,at:Date.now()};saveSession();render();
}
function createProject(){
  const src=clone(project()),pid='p-'+Date.now();
  src.id=pid;src.name=document.getElementById('npName').value.trim()||'Novo projeto';src.shortName=document.getElementById('npShort').value.trim()||'Novo projeto';src.location=document.getElementById('npLoc').value.trim()||'Brasília/DF';src.description=document.getElementById('npDesc').value.trim();src.status='Planejamento inicial';src.ownerUserId=currentUser().id;src.members=[{userId:currentUser().id,projectRole:'owner'}];src.comments=[];src.audit=[{at:new Date().toLocaleString('pt-BR'),user:currentUser().username,action:'Projeto criado a partir do template v0.5.0',version:VERSION}];
  db.projects.push(src);db.activeProjectId=pid;persist();modal='';page='dashboard';toast('Projeto criado');render();
}
function createUser(){
  const username=document.getElementById('nuUser').value.trim();
  if(db.users.some(x=>x.username===username)){toast('Usuário já existe');return}
  db.users.push({id:'u-'+Date.now(),username,password:document.getElementById('nuPass').value||'ITCC2026',name:document.getElementById('nuName').value.trim()||username,globalRole:document.getElementById('nuRole').value,active:true});
  persist();modal='';render();
}
function saveShare(){
  const p=db.projects.find(x=>x.id===document.getElementById('saveShare').dataset.id);
  p.members=p.members.filter(m=>m.userId===p.ownerUserId);
  document.querySelectorAll('.share-role').forEach(s=>{if(s.value!=='none')p.members.push({userId:s.dataset.uid,projectRole:s.value})});
  audit('Compartilhamentos atualizados');modal='';render();
}
function saveComment(){
  const txt=document.getElementById('commentText').value.trim();
  if(txt)project().comments.unshift({id:'c-'+Date.now(),at:new Date().toLocaleString('pt-BR'),user:currentUser().username,text:txt});
  audit('Comentário registrado');modal='';render();
}
function exportBudgetCsv(){
  const rows=[['id','grupo','classe','codigo','descricao','quantidade','unidade','preco_unitario','fonte','fornecedor','total'],...project().budgetItems.map(x=>[x.id,groupName('budget',x.groupId),x.kind,x.code,x.name,x.qty,x.unit,x.unitPrice,sourceName(x.sourceId),supplierName(x.supplierId),x.qty*x.unitPrice])];
  download(`${project().shortName.replace(/\s+/g,'_')}_orcamento_v041.csv`,rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\n'),'text/csv;charset=utf-8');
}
function importJson(e){
  const f=e.target.files?.[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const p=JSON.parse(r.result);if(!p.id||!p.name)throw new Error();normalizeStore({projects:[p],users:[],theme:'system'});db.projects.push(p);db.activeProjectId=p.id;persist();page='dashboard';render()}catch(err){toast('JSON incompatível')}};
  r.readAsText(f);
}
function download(name,content,type){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
applyTheme();render();
})();