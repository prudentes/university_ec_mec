import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base=process.env.ITCC_URL||"http://127.0.0.1:8000/";
const out=process.env.QA_OUT||"ITCC/v0.5.0/qa-output";
fs.mkdirSync(out,{recursive:true});
const errors=[];
function assert(ok,msg){if(!ok)throw new Error(msg)}
async function globalOverflow(page,label){
  const v=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth}));
  assert(v.sw<=v.cw+2&&v.bw<=v.cw+2,label+" possui overflow horizontal global: "+JSON.stringify(v));
}
async function login(page){
  await page.fill("#loginUser","ITCC");
  await page.fill("#loginPass","ITCC");
  await page.click("#loginBtn");
  await page.waitForSelector(".sidebar");
}
const browser=await chromium.launch({headless:true});
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const p=await desktop.newPage();
  p.on("console",m=>{if(m.type()==="error")errors.push("console: "+m.text())});
  p.on("pageerror",e=>errors.push("pageerror: "+e.message));
  await p.goto(base,{waitUntil:"networkidle"});
  const loginGeom=await p.evaluate(()=>{
    const shell=document.querySelector(".login-shell").getBoundingClientRect();
    const brand=document.querySelector(".login-brand").getBoundingClientRect();
    const panel=document.querySelector(".login-panel").getBoundingClientRect();
    const card=document.querySelector(".login-card").getBoundingClientRect();
    return {shell:{x:shell.x,w:shell.width,h:shell.height},brand:{x:brand.x,w:brand.width},panel:{x:panel.x,w:panel.width},card:{x:card.x,w:card.width},display:getComputedStyle(document.querySelector(".login-shell")).display};
  });
  assert(Math.abs(loginGeom.shell.w-1440)<2,"login-shell não ocupa viewport");
  assert(loginGeom.brand.w>800&&loginGeom.brand.w<850,"proporção esquerda do login v0.2.0 mudou: "+loginGeom.brand.w);
  assert(Math.abs(loginGeom.panel.x-loginGeom.brand.w)<2,"colunas do login se sobrepõem");
  assert(loginGeom.card.w<=442,"login-card maior que baseline v0.2.0");
  await globalOverflow(p,"Login desktop");
  await p.screenshot({path:path.join(out,"01-login-desktop.png"),fullPage:true});

  await login(p);
  const shellGeom=await p.evaluate(()=>{
    const sb=document.querySelector(".sidebar").getBoundingClientRect();
    const mn=document.querySelector(".main").getBoundingClientRect();
    const tb=document.querySelector(".topbar").getBoundingClientRect();
    return {sb:{x:sb.x,w:sb.width},mn:{x:mn.x,w:mn.width},tb:{h:tb.height,x:tb.x,w:tb.width}};
  });
  assert(Math.abs(shellGeom.sb.w-258)<2,"sidebar deve manter 258px; atual "+shellGeom.sb.w);
  assert(Math.abs(shellGeom.mn.x-258)<2,"main deve iniciar após sidebar v0.2.0");
  assert(Math.abs(shellGeom.tb.h-68)<2,"topbar deve manter 68px; atual "+shellGeom.tb.h);
  assert(Math.abs(shellGeom.tb.x-258)<2,"topbar sobrepõe sidebar");
  await globalOverflow(p,"Dashboard desktop");
  await p.screenshot({path:path.join(out,"02-dashboard-desktop.png"),fullPage:true});

  const pages=["zones","budget","planning","supply","suppliers","sources","teams","logistics","abcpage","risks","matrix","scenarios","site","insights","references","audit","users"];
  for(const pg of pages){
    await p.click('[data-page="'+pg+'"]');
    await p.waitForTimeout(60);
    await globalOverflow(p,"Página "+pg);
    const top=await p.locator(".topbar").boundingBox(),side=await p.locator(".sidebar").boundingBox();
    assert(top.x>=side.width-1,"topbar sobrepõe sidebar em "+pg);
  }

  await p.click('[data-page="budget"]');
  const before=await p.locator('tbody [data-delete="budget"]').count();
  await p.click('[data-add="budget"]');
  const after=await p.locator('tbody [data-delete="budget"]').count();
  assert(after===before+1,"CRUD orçamento: adicionar falhou");
  p.once("dialog",d=>d.accept());
  await p.locator('tbody [data-delete="budget"]').last().click();
  assert(await p.locator('tbody [data-delete="budget"]').count()===before,"CRUD orçamento: excluir falhou");

  await p.click('[data-groups="budget"]');
  const modal=await p.locator(".modal").boundingBox();
  assert(modal.x>=0&&modal.y>=0&&modal.x+modal.width<=1440&&modal.y+modal.height<=1000,"modal de agrupamento excede viewport");
  await p.screenshot({path:path.join(out,"03-modal-agrupamentos.png"),fullPage:true});
  await p.click("[data-close-modal]");

  await p.click('[data-page="zones"]');
  await p.screenshot({path:path.join(out,"04-zonas-desktop.png"),fullPage:true});
  await p.click('[data-page="planning"]');
  await p.screenshot({path:path.join(out,"05-planejamento-desktop.png"),fullPage:true});
  await p.click('[data-page="sources"]');
  await p.screenshot({path:path.join(out,"06-fontes-desktop.png"),fullPage:true});

  await p.click('[data-theme="dark"]');
  assert(await p.getAttribute("html","data-bs-theme")==="dark","tema escuro não aplicado");
  await p.click('[data-theme="light"]');
  assert(await p.getAttribute("html","data-bs-theme")==="light","tema claro não aplicado");
  await desktop.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  const m=await mobile.newPage();
  m.on("console",x=>{if(x.type()==="error")errors.push("mobile console: "+x.text())});
  m.on("pageerror",e=>errors.push("mobile pageerror: "+e.message));
  await m.goto(base,{waitUntil:"networkidle"});
  const md=await m.evaluate(()=>({
    brand:getComputedStyle(document.querySelector(".login-brand")).display,
    panel:document.querySelector(".login-panel").getBoundingClientRect().width,
    shell:document.querySelector(".login-shell").getBoundingClientRect().width
  }));
  assert(md.brand==="none","login-brand deveria ocultar no mobile conforme v0.2.0");
  assert(Math.abs(md.panel-390)<2&&Math.abs(md.shell-390)<2,"login mobile não ocupa largura corretamente");
  await globalOverflow(m,"Login mobile");
  await m.screenshot({path:path.join(out,"07-login-mobile.png"),fullPage:true});
  await login(m);
  assert(await m.locator("#mobilePageSelect").isVisible(),"seletor de página mobile não aparece");
  const mobileGeom=await m.evaluate(()=>({
    mainX:document.querySelector(".main").getBoundingClientRect().x,
    sidebarRight:document.querySelector(".sidebar").getBoundingClientRect().right,
    topW:document.querySelector(".topbar").getBoundingClientRect().width
  }));
  assert(Math.abs(mobileGeom.mainX)<2,"main mobile mantém margem da sidebar");
  assert(mobileGeom.sidebarRight<=1,"sidebar está sobrepondo conteúdo mobile");
  assert(Math.abs(mobileGeom.topW-390)<2,"topbar mobile excede viewport");
  await globalOverflow(m,"Dashboard mobile");
  await m.selectOption("#mobilePageSelect","budget");
  await globalOverflow(m,"Orçamento mobile");
  await m.screenshot({path:path.join(out,"08-orcamento-mobile.png"),fullPage:true});
  await mobile.close();

  if(errors.length)throw new Error(errors.join("\n"));
  console.log("OK browser/layout QA v0.5.0 — desktop + mobile — sem overflow global/sobreposição.");
} finally {
  await browser.close();
}
