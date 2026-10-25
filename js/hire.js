/* Hands-for-Hire (DEMO, no real payments): workers take jobs, the camera coach guides them,
   pay is held in simulated escrow and released on verified completion.
   Every action goes into a tamper-evident SHA-256 hash-chain log shown as a receipt. */
(function(){
"use strict";
const TW = window.TW, LS = TW.LS, $ = TW.$, t = TW.t, esc = TW.esc, toast = TW.toast;
const SKILLS = ["Cleaning","Cooking","Stocking","Cashier","Greeting","Warehouse","Delivery","Home repair","Inspection","Child care","Car care"];
const ME_BIZ = "My Business (demo)";

/* ---------- SHA-256 (WebCrypto, with a small fallback for non-secure pages) ---------- */
function sha256Fallback(str){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const b = new TextEncoder().encode(str), l = b.length, n = ((l+9+63)>>6)<<6, m = new Uint8Array(n);
  m.set(b); m[l]=0x80; const dv = new DataView(m.buffer); dv.setUint32(n-4, l*8>>>0); dv.setUint32(n-8, Math.floor(l/0x20000000));
  let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]; const W=new Uint32Array(64);
  const r=(x,y)=>(x>>>y)|(x<<(32-y));
  for(let o=0;o<n;o+=64){
    for(let i=0;i<16;i++) W[i]=dv.getUint32(o+i*4);
    for(let i=16;i<64;i++){ const s0=r(W[i-15],7)^r(W[i-15],18)^(W[i-15]>>>3), s1=r(W[i-2],17)^r(W[i-2],19)^(W[i-2]>>>10); W[i]=(W[i-16]+s0+W[i-7]+s1)>>>0; }
    let [a,b2,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){ const t1=(h+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+W[i])>>>0, t2=((r(a,2)^r(a,13)^r(a,22))+((a&b2)^(a&c)^(b2&c)))>>>0; h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b2; b2=a; a=(t1+t2)>>>0; }
    H=[H[0]+a,H[1]+b2,H[2]+c,H[3]+d,H[4]+e,H[5]+f,H[6]+g,H[7]+h].map(x=>x>>>0);
  }
  return H.map(x=>x.toString(16).padStart(8,"0")).join("");
}
async function sha256(str){
  if(window.crypto && crypto.subtle){
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(x=>x.toString(16).padStart(2,"0")).join("");
  }
  return sha256Fallback(str);
}
TW.sha256 = sha256;
const genesis = id => sha256("temperward-demo-ledger|"+id);
const body = e => JSON.stringify({i:e.i, ts:e.ts, type:e.type, data:e.data});
async function verifyChain(log, jobId){
  let prev = await genesis(jobId);
  for(let i=0;i<log.length;i++){
    const e = log[i];
    if(e.i!==i || e.prev!==prev) return {ok:false, at:i};
    const h = await sha256(prev+"|"+body(e));
    if(h!==e.hash) return {ok:false, at:i};
    prev = h;
  }
  return {ok:true, n:log.length, head:prev};
}

/* ---------- State ---------- */
function load(){
  let s = LS.get("hire", null);
  if(!s){
    s = {wallet:{business:500}, worker:{name:"", skills:["Stocking","Cleaning"], earnings:0, jobsDone:0}, jobs:[], role:"worker", seeded:false};
  }
  return s;
}
let S = load();
const save = () => LS.set("hire", S);
const job = id => S.jobs.find(j=>j.id===id);
let queue = Promise.resolve();
/* Append a hash-chained entry (serialised so order is guaranteed). */
function append(j, type, data){
  queue = queue.then(async ()=>{
    const jj = job(j.id) || j;
    const prev = jj.log.length ? jj.log[jj.log.length-1].hash : await genesis(jj.id);
    const e = {i:jj.log.length, ts:new Date().toISOString(), type, data:data||{}, prev};
    e.hash = await sha256(prev+"|"+body(e));
    jj.log.push(e); save();
    return e;
  }).catch(err=>{ console.warn("ledger", err); });
  return queue;
}
TW.hireFlush = () => queue;
async function seed(){
  if(S.seeded) return;
  S.seeded = true;
  for(const d of TW.DEMO_JOBS){
    const g = TW.getTemplate(d.tpl);
    const j = {id:d.id, title:d.title, biz:d.biz, pay:d.pay, place:d.place, tpl:d.tpl, steps:g? g.steps.slice() : [], status:"open", escrow:"held", worker:"", log:[], proof:null, verified:0, mine:false, posted:new Date().toISOString()};
    S.jobs.push(j);
    append(j, "posted", {biz:j.biz, pay:j.pay, steps:j.steps.length, escrow:"held"});
  }
  save();
  await queue;
}

/* ---------- Render ---------- */
const STATUS = {open:["Open","acc"], accepted:["Accepted",""], active:["In progress","warn"], paid:["Paid","ok"], cancelled:["Cancelled","bad"]};
function pill(st){ const s = STATUS[st]||[st,""]; return `<span class="pill ${s[1]}">${s[0]}</span>`; }
function stepsDone(j){ return j.log.filter(e=>e.type==="step").length; }
function render(){
  const role = S.role || "worker";
  document.querySelectorAll("#hireRole button").forEach(b=>{ const on=b.dataset.role===role; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
  $("hireWorker").classList.toggle("hidden", role!=="worker");
  $("hireBiz").classList.toggle("hidden", role!=="business");
  role==="worker" ? renderWorker() : renderBiz();
}
function renderWorker(){
  const w = S.worker;
  $("wName").value = w.name || ((LS.get("profile",{})||{}).name || "");
  $("wSkills").innerHTML = SKILLS.map(k=>`<button class="${w.skills.includes(k)?"on":""}" data-k="${k}" aria-pressed="${w.skills.includes(k)}">${k}</button>`).join("");
  $("wSkills").querySelectorAll("button").forEach(b=> b.onclick = ()=>{ const k=b.dataset.k; w.skills = w.skills.includes(k) ? w.skills.filter(x=>x!==k) : w.skills.concat(k); save(); renderWorker(); });
  $("wEarn").textContent = TW.money(w.earnings); $("wDone").textContent = w.jobsDone;
  const mine = S.jobs.filter(j=>j.worker==="me" && j.status!=="cancelled");
  $("myJobs").innerHTML = mine.length ? mine.map(j=>`<li data-id="${j.id}"><div class="rowsb"><span class="jt">${esc(j.title)}</span><span class="jpay">${TW.money(j.pay)}</span></div>
      <div class="jm">${esc(j.biz)} \u00b7 ${pill(j.status)} ${j.status==="paid"?'<span class="pill ok">Released</span>':'<span class="pill">Pay held</span>'}</div>
      <div class="row">${j.status==="paid" ? `<button class="btn2 rc">\u{1F9FE} ${esc(t("receipt"))}</button>` : `<button class="acc go">\u25B6 ${esc(t("start_job"))}</button><button class="btn2 rc">Log</button>`}</div></li>`).join("")
    : '<li><span class="small">No jobs yet. Accept one below.</span></li>';
  const avail = S.jobs.filter(j=>j.status==="open");
  $("availJobs").innerHTML = avail.length ? avail.map(j=>`<li data-id="${j.id}"><div class="rowsb"><span class="jt">${esc(j.title)}</span><span class="jpay">${TW.money(j.pay)}</span></div>
      <div class="jm">${esc(j.biz)} \u00b7 ${esc(j.place||"nearby")} \u00b7 ${j.steps.length} steps \u00b7 \u{1F512} pay held in escrow</div>
      <div class="row"><button class="btn2 pv">Steps</button><button class="acc ac">${esc(t("accept"))}</button></div></li>`).join("")
    : '<li><span class="small">No open jobs right now. Switch to Business to post one.</span></li>';
  document.querySelectorAll("#myJobs li[data-id], #availJobs li[data-id]").forEach(li=>{
    const j = job(li.dataset.id);
    const go = li.querySelector(".go"); if(go) go.onclick = ()=> startJob(j.id);
    const rc = li.querySelector(".rc"); if(rc) rc.onclick = ()=> showLog(j.id);
    const ac = li.querySelector(".ac"); if(ac) ac.onclick = ()=> accept(j.id);
    const pv = li.querySelector(".pv"); if(pv) pv.onclick = ()=> TW.sheet(j.title, `<p class="small">${esc(j.biz)} \u00b7 ${TW.money(j.pay)}</p><ol>${j.steps.map(s=>`<li>${esc(TW.parseStep(s).t)}</li>`).join("")}</ol>`);
  });
}
function renderBiz(){
  const held = S.jobs.filter(j=>j.mine && j.escrow==="held" && j.status!=="cancelled");
  $("bizWallet").textContent = TW.money(S.wallet.business);
  $("bizEscrow").textContent = held.length ? `${TW.money(held.reduce((a,j)=>a+j.pay,0))} held in escrow for ${held.length} job${held.length>1?"s":""}. It's released only when the work is verified.` : "Pay is held in escrow when you post, and released only when the work is verified.";
  const sel = $("pjSop");
  if(!sel.options.length){
    sel.innerHTML = `<option value="">\u2014 my own steps \u2014</option>` + TW.CATEGORIES.filter(c=>c.id!=="all").map(c=>`<optgroup label="${esc(t("cat_"+c.id))}">${TW.TEMPLATES.filter(x=>x.cat===c.id).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</optgroup>`).join("");
  }
  const list = S.jobs.slice().sort((a,b)=> (b.mine-a.mine) || (b.posted>a.posted?1:-1));
  $("bizJobs").innerHTML = list.map(j=>{ const n=stepsDone(j), tot=j.steps.length;
    return `<li data-id="${j.id}"><div class="rowsb"><span class="jt">${esc(j.title)}</span><span class="jpay">${TW.money(j.pay)}</span></div>
      <div class="jm">${j.mine?'<span class="pill acc">Yours</span> ':esc(j.biz)+" \u00b7 "}${pill(j.status)} <span class="pill ${j.escrow==="released"?"ok":j.escrow==="refunded"?"bad":""}">Escrow: ${j.escrow}</span>${j.worker?" \u00b7 Worker: "+esc(j.worker==="me"?(S.worker.name||"You"):j.worker):""}</div>
      <div class="prog"><div style="width:${tot? n/tot*100 : 0}%"></div></div><div class="small">${n}/${tot} steps logged${j.verified?` \u00b7 ${j.verified} checked by camera`:""}</div>
      <div class="row"><button class="btn2 rc">\u{1F9FE} Log</button>${j.mine && j.status==="open" ? '<button class="btn2 danger cx">Cancel & refund</button>':""}</div></li>`; }).join("");
  $("bizJobs").querySelectorAll("li[data-id]").forEach(li=>{
    const id = li.dataset.id;
    li.querySelector(".rc").onclick = ()=> showLog(id);
    const cx = li.querySelector(".cx"); if(cx) cx.onclick = ()=> cancelJob(id);
  });
  const ws = TW.DEMO_WORKERS.concat(S.worker.name || S.worker.jobsDone ? [{name:(S.worker.name||"You")+" (you)", skills:S.worker.skills, rating:4.9, jobs:S.worker.jobsDone}] : []);
  $("bizWorkers").innerHTML = ws.map(w=>`<li><span>${esc(w.name)}<span class="sub">${esc(w.skills.join(", "))}</span></span><span class="pill">${w.rating}\u2605 \u00b7 ${w.jobs} jobs</span></li>`).join("");
}

/* ---------- Actions ---------- */
async function accept(id){
  const j = job(id); if(!j || j.status!=="open") return;
  S.worker.name = $("wName").value.trim() || S.worker.name;
  j.status = "accepted"; j.worker = "me"; save();
  await append(j, "accepted", {worker:S.worker.name||"Worker", skills:S.worker.skills});
  TW.buzz("step"); toast(`Accepted. ${TW.money(j.pay)} is held for you until the job is verified.`);
  render();
}
function startJob(id){
  const j = job(id); if(!j) return;
  TW.startRun({name:j.title, steps:j.steps, jobId:j.id, from:"hire"});
  TW.speak("Paid job started. Turn on the camera coach so it can check your work.", null, {lang:"en"});
}
async function cancelJob(id){
  const j = job(id); if(!j || !confirm("Cancel this job and refund the held pay to your demo wallet?")) return;
  j.status = "cancelled"; j.escrow = "refunded"; S.wallet.business += j.pay; save();
  await append(j, "cancelled", {refund:j.pay}); render(); toast("Cancelled. Pay refunded (demo).");
}
async function postJob(){
  const title = $("pjTitle").value.trim(), pay = Math.round((parseFloat($("pjPay").value)||0)*100)/100, tpl = $("pjSop").value;
  let steps = $("pjSteps").value.split("\n").map(s=>s.trim()).filter(Boolean);
  if(!steps.length && tpl){ const g=TW.getTemplate(tpl); steps = g ? g.steps.slice() : []; }
  if(!title){ toast("Give the job a title."); $("pjTitle").focus(); return; }
  if(!(pay>0)){ toast("Set the pay."); return; }
  if(steps.length < 2){ toast("Pick a guide or type at least 2 steps."); return; }
  if(pay > S.wallet.business){ toast("Not enough in your demo wallet."); return; }
  S.wallet.business = Math.round((S.wallet.business - pay)*100)/100;
  const j = {id:"j-"+Date.now().toString(36), title, biz:ME_BIZ, pay, place:"your site", tpl, steps, status:"open", escrow:"held", worker:"", log:[], proof:null, verified:0, mine:true, posted:new Date().toISOString()};
  S.jobs.unshift(j); save();
  await append(j, "posted", {biz:j.biz, pay, steps:steps.length, escrow:"held"});
  $("pjTitle").value = ""; $("pjSteps").value = "";
  toast(`Posted. ${TW.money(pay)} is held in escrow (demo).`); render();
}

/* ---------- Run hooks (called by the step player) ---------- */
let current = null, proofData = null;
function bannerHtml(id){ const j = job(id); return j ? `\u{1F91D} ${esc(j.biz)} \u00b7 ${TW.money(j.pay)} held \u00b7 every step is logged` : ""; }
function onJobStart(run){
  const j = job(run.jobId); if(!j) return;
  if(j.status!=="active"){ j.status = "active"; save(); }
  append(j, j.log.some(e=>e.type==="started") ? "restarted" : "started", {steps:j.steps.length});
}
function logStep(run, i){
  const j = job(run.jobId); if(!j) return;
  const s = run.steps[i];
  append(j, "step", {n:i+1, text:s.t.slice(0,80), method: run.verified.has(i) ? "camera" : "self"});
}
async function onJobFinish(run){
  await queue;
  const j = job(run.jobId); if(!j) return;
  current = {id:j.id, verified:run.verified.size, total:run.steps.length};
  j.verified = run.verified.size; save();
  proofData = j.proof || null;
  $("jdSummary").innerHTML = `<h3>${esc(j.title)}</h3><p class="small">${esc(j.biz)}</p>
    <p>\u2705 ${run.steps.length} of ${run.steps.length} steps done<br>\u{1F4F7} ${run.verified.size} checked by the camera coach<br>\u{1F512} ${TW.money(j.pay)} waiting in escrow</p>`;
  showProof();
  $("jdNote").textContent = run.verified.size===run.steps.length ? "The camera checked every step. You can submit now." : "Add a proof photo, then submit.";
  TW.show("jobDone");
  TW.speak("All steps done. Take a proof photo, then submit for payment.", null, {lang:"en"});
}
function showProof(){
  const img = $("proofImg");
  img.classList.toggle("hidden", !proofData); $("proofEmpty").classList.toggle("hidden", !!proofData);
  if(proofData) img.src = proofData; else img.removeAttribute("src");
}
function readProof(file){
  return new Promise((res, rej)=>{
    const rd = new FileReader();
    rd.onerror = rej;
    rd.onload = ()=>{
      const im = new Image();
      im.onload = ()=>{ const W=Math.min(640, im.width), H=Math.round(im.height*W/im.width), c=document.createElement("canvas"); c.width=W; c.height=H; c.getContext("2d").drawImage(im,0,0,W,H); res(c.toDataURL("image/jpeg",0.7)); };
      im.onerror = ()=> rej(new Error("not an image"));
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
  });
}
async function submit(){
  if(!current) return;
  const j = job(current.id); if(!j) return;
  const allCam = current.verified===current.total && current.total>0;
  if(!allCam && !proofData){ $("jdNote").textContent = "Add a proof photo first (or let the camera coach check every step)."; toast("Proof photo needed."); TW.buzz("hazard"); return; }
  $("btnSubmitJob").disabled = true;
  try{
    if(proofData && j.proof !== proofData){ j.proof = proofData; save(); await append(j, "proof", {photoSha256: await sha256(proofData), bytes: proofData.length}); }
    await append(j, "verified", {rule: allCam ? "camera checked every step" : "proof photo", cameraSteps:current.verified, steps:current.total});
    j.escrow = "released"; j.status = "paid"; j.paidAt = new Date().toISOString();
    S.worker.earnings = Math.round((S.worker.earnings + j.pay)*100)/100; S.worker.jobsDone++; save();
    await append(j, "released", {amount:j.pay, to:S.worker.name||"Worker", demo:true});
    TW.addHistory(j.title, j.steps.length, "job");
    $("paidTitle").textContent = t("payment_released");
    $("paidMsg").textContent = `${TW.money(j.pay)} released to ${S.worker.name||"you"} for "${j.title}". Total earned: ${TW.money(S.worker.earnings)}.`;
    await renderReceipt(j, $("paidReceipt"));
    current = null; proofData = null;
    TW.show("paid"); TW.buzz("done");
    TW.speak(`Payment released. ${TW.money(j.pay)}. Great work.`, null, {lang:"en"});
  } finally { $("btnSubmitJob").disabled = false; }
}
const LABEL = {posted:"Job posted, pay held in escrow", accepted:"Worker accepted", started:"Work started", restarted:"Work restarted", step:"Step done", proof:"Proof photo added", verified:"Work verified", released:"Payment released", cancelled:"Cancelled, pay refunded"};
async function renderReceipt(j, el){
  const v = await verifyChain(j.log, j.id);
  el.innerHTML = `<div class="small">Job ${esc(j.id)} \u00b7 ${esc(j.biz)} \u00b7 ${TW.money(j.pay)} \u00b7 Demo</div>
    <div class="rcpt">${j.log.map(e=>`<div><b>#${e.i} ${esc(LABEL[e.type]||e.type)}</b>${e.type==="step"?` \u2014 ${e.data.n}. ${esc(e.data.text)} <span class="pill ${e.data.method==="camera"?"ok":""}">${e.data.method==="camera"?"\u{1F4F7} camera":"self"}</span>`:""}
      <br><span class="small">${new Date(e.ts).toLocaleString()}</span><br><span class="h">hash ${e.hash.slice(0,16)}\u2026 \u00b7 prev ${e.prev.slice(0,10)}\u2026</span></div>`).join("")}</div>
    <div class="chain ${v.ok?"ok":"bad"}" id="chainStatus">${v.ok ? `\u2713 Log checks out: ${v.n} entries, nothing changed.` : `\u2715 Log was changed at entry #${v.at}.`}</div>
    <p class="small">Each entry's hash includes the one before it, so changing any entry breaks the chain.</p>`;
  return v;
}
async function showLog(id){
  const j = job(id); if(!j) return;
  await queue;
  TW.sheet(j.title, `<div id="logBox"></div>`);
  await renderReceipt(j, $("logBox"));
}

/* ---------- Wire up ---------- */
document.querySelectorAll("#hireRole button").forEach(b=> b.onclick = ()=>{ S.role = b.dataset.role; save(); render(); });
$("wName").onchange = e=>{ S.worker.name = e.target.value.trim(); save(); };
$("btnPostJob").onclick = postJob;
$("btnProof").onclick = ()=> $("proofFile").click();
$("proofFile").onchange = async e=>{
  const f = e.target.files && e.target.files[0]; if(!f) return;
  try{ proofData = await readProof(f); showProof(); $("jdNote").textContent = "Photo added. Submit when ready."; }
  catch(err){ toast("Couldn't read that photo."); }
  e.target.value = "";
};
$("btnSubmitJob").onclick = submit;
$("btnPaidBack").onclick = ()=> TW.show("hire");
TW.renderers.hire = ()=>{ if(!S.seeded) seed().then(render); else render(); };
TW.hire = {bannerHtml, onJobStart, logStep, onJobFinish, verifyChain, sha256Fallback, state:()=>S, flush:()=>queue,
  setProof(dataUrl){ proofData = dataUrl; showProof(); }, reload(){ S = load(); }};
})();
