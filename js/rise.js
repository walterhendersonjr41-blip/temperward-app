/* Rise: 6 gated stages to get back on your feet. Progress saved on this phone. */
(function(){
"use strict";
const TW = window.TW, LS = TW.LS, $ = TW.$, t = TW.t, esc = TW.esc, toast = TW.toast;
const CHEER = [
  "One step today is enough. Small steps add up.",
  "You've already started. That's the hardest part.",
  "Ask for help. That's what strong people do.",
  "Write things down. Keep your papers safe.",
  "Bad days happen. Come back tomorrow and do one step.",
  "Every stage you finish makes the next one easier.",
  "You don't have to do it alone. Call 2-1-1 for local help."
];
function state(){ const s = LS.get("rise", null) || {}; s.done = s.done || {}; s.days = s.days || []; return s; }
function save(s){ LS.set("rise", s); }
function stageDone(st, s){ return st.items.every(it=> s.done[it.id]); }
function curStageIdx(s){ const i = TW.RISE.findIndex(st=> !stageDone(st, s)); return i<0 ? TW.RISE.length : i; }
function unlocked(idx, s){ return idx===0 || stageDone(TW.RISE[idx-1], s); }
function riseStreak(s){
  const days = new Set(s.days); let d = new Date(), n = 0;
  if(!days.has(TW.dayKey(d))) d.setDate(d.getDate()-1);
  while(days.has(TW.dayKey(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function findItem(id){ for(const st of TW.RISE){ const it = st.items.find(x=>x.id===id); if(it) return {st, it}; } return null; }
function setDone(id, how){
  const s = state(), f = findItem(id); if(!f) return;
  const idx = TW.RISE.indexOf(f.st);
  if(!unlocked(idx, s)){ toast(t("locked")); return; }
  const before = stageDone(f.st, s);
  if(how) s.done[id] = how; else delete s.done[id];
  if(how){ const k = TW.dayKey(); if(!s.days.includes(k)) s.days.push(k); s.days = s.days.slice(-400); TW.buzz("step"); }
  save(s);
  if(how && TW.life) { const items = TW.life.todayPlan(); if(items.some(x=>x.id==="rise")) TW.life.markDone("rise", true); }
  if(!before && stageDone(f.st, s)){
    const last = idx===TW.RISE.length-1;
    TW.celebrate(last ? "You did all six stages!" : t("st_"+f.st.id)+": "+t("complete"),
      last ? "You rebuilt your life one step at a time. Be proud." : "Next up: "+t("st_"+TW.RISE[idx+1].id)+". You've got this.");
  }
  render();
}
function guideMe(id){
  const f = findItem(id); if(!f) return;
  TW.closeSheet();
  if(f.it.guide){ const g = TW.getTemplate(f.it.guide); if(g){ TW.startRun({name:g.name, steps:g.steps, from:"rise", meta:{rise:id}}); return; } }
  TW.startRun({name:f.it.t, steps:f.it.how.concat(["Done for now. If this step is finished, it will be checked off in Rise."]), from:"rise", meta:{rise:id}});
}
function openHow(id){
  const f = findItem(id); if(!f) return;
  const s = state(), it = f.it;
  TW.sheet(it.t, `<ol>${it.how.map(h=>`<li>${esc(h)}</li>`).join("")}</ol>
    ${(it.links||[]).length ? `<ul class="links">${it.links.map(l=>`<li><a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])} \u2197</a></li>`).join("")}</ul>` : ""}
    <button class="start" id="shGuide">\u25B6 ${esc(t("guide_me"))}</button>
    <div class="row"><button class="btn2 grow" id="shDid">\u2713 I did it</button><button class="btn2 grow" id="shHad">${esc(t("already"))}</button></div>
    <button class="btn2 full" id="shRead">\u{1F50A} Read it to me</button>`);
  $("shGuide").onclick = ()=> guideMe(id);
  $("shDid").onclick = ()=>{ TW.closeSheet(); setDone(id, "did"); };
  $("shHad").onclick = ()=>{ TW.closeSheet(); setDone(id, "had"); };
  $("shRead").onclick = ()=> TW.speak(it.t+". "+it.how.join(" "), null, {lang:"en"});
  if(s.done[id]) $("shDid").textContent = "\u21BA Not done yet";
  if(s.done[id]) $("shDid").onclick = ()=>{ TW.closeSheet(); setDone(id, null); };
}
function render(){
  const s = state(), cur = curStageIdx(s);
  const all = TW.RISE.reduce((a,st)=>a+st.items.length,0), done = TW.RISE.reduce((a,st)=>a+st.items.filter(it=>s.done[it.id]).length,0);
  $("riseStage").textContent = Math.min(cur+1, TW.RISE.length) + "/" + TW.RISE.length;
  $("risePct").textContent = Math.round(done/all*100)+"%";
  $("riseStreak").textContent = riseStreak(s);
  // Today's step
  const day = Math.floor(Date.now()/864e5);
  if(cur >= TW.RISE.length){
    $("riseToday").innerHTML = `<h3>\u{1F3C6} ${esc(t("complete"))}</h3><p>You finished every stage. Keep your routine going and help someone else start.</p>`;
  } else {
    const st = TW.RISE[cur], it = st.items.find(x=>!s.done[x.id]);
    $("riseToday").innerHTML = `<h3>${esc(t("rise_today"))}</h3><p class="small">${esc(t("stage"))} ${cur+1}: ${esc(t("st_"+st.id))}</p>
      <p style="font-size:1.3rem;font-weight:800;margin:6px 0">${esc(it.t)}</p><p class="small">${esc(CHEER[day % CHEER.length])}</p>
      <button class="start" id="rtGuide">\u25B6 ${esc(t("guide_me"))}</button>
      <div class="row"><button class="btn2 grow" id="rtHow">How to</button><button class="btn2 grow" id="rtDid">\u2713 I did it</button></div>`;
    $("rtGuide").onclick = ()=> guideMe(it.id);
    $("rtHow").onclick = ()=> openHow(it.id);
    $("rtDid").onclick = ()=> setDone(it.id, "did");
  }
  // Stages
  $("riseStages").innerHTML = TW.RISE.map((st, i)=>{
    const n = st.items.filter(it=>s.done[it.id]).length, open = unlocked(i, s), complete = n===st.items.length;
    return `<details class="stagecard${i===cur?" cur":""}${open?"":" lock"}" data-st="${st.id}"${i===cur?" open":""}>
      <summary><span class="si" aria-hidden="true">${open? st.icon : "\u{1F512}"}</span><span>${i+1}. ${esc(t("st_"+st.id))}</span>
      <span class="sp pill ${complete?"ok":open?"acc":""}">${complete? "\u2713 "+esc(t("complete")) : n+"/"+st.items.length}</span></summary>
      <div class="prog"><div style="width:${n/st.items.length*100}%"></div></div>
      ${open ? "" : `<p class="small">\u{1F512} ${esc(t("locked"))}</p>`}
      ${st.items.map(it=>`<div class="ritem${s.done[it.id]?" done":""}" data-id="${it.id}">
        <label><input type="checkbox" ${s.done[it.id]?"checked":""} ${open?"":"disabled"} aria-label="${esc(it.t)}"><span>${esc(it.t)}${s.done[it.id]==="had"?' <span class="pill">had it</span>':""}</span></label>
        <button class="how" ${open?"":"disabled"}>How</button></div>`).join("")}
    </details>`;
  }).join("");
  $("riseStages").querySelectorAll(".ritem").forEach(r=>{
    const id = r.dataset.id;
    r.querySelector("input").onchange = e=> setDone(id, e.target.checked ? "did" : null);
    r.querySelector(".how").onclick = ()=> openHow(id);
  });
  // Links
  const seen = new Set(), links = [];
  Object.values(TW.RISE_LINKS).forEach(l=>{ if(!seen.has(l[1])){ seen.add(l[1]); links.push(l); } });
  $("riseLinks").innerHTML = links.map(l=>`<li><a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])} \u2197</a></li>`).join("");
}
TW.renderers.rise = render;
TW.finishHooks = TW.finishHooks || [];
TW.finishHooks.push(r=>{ if(r.meta && r.meta.rise){ const s=state(); if(!s.done[r.meta.rise]) setDone(r.meta.rise, "did"); } });
TW.rise = {state, setDone, guideMe, openHow, curStageIdx:()=>curStageIdx(state())};
})();
