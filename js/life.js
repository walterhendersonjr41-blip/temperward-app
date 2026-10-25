/* Today / Life Mode: onboarding, daily plan, "What do I do now?", autonomy, reminders,
   money, meals, health, home, family, work. Everything stays on this phone. */
(function(){
"use strict";
const TW = window.TW, LS = TW.LS, $ = TW.$, t = TW.t, esc = TW.esc, toast = TW.toast;
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_ES = ["Dom","Lun","Mar","Mi\u00e9","Jue","Vie","S\u00e1b"];
const GOALS = ["job","money","health","home","family","rise"];
const AUTOS = ["suggest","do","run"];
const SECTIONS = ["plan","money","meals","health","home","family","work"];
const SEC_ICON = {plan:"\u{1F5D3}",money:"\u{1F4B5}",meals:"\u{1F372}",health:"\u2764\uFE0F",home:"\u{1F3E0}",family:"\u{1F46A}",work:"\u{1F4BC}"};
const toMin = s => { const m=/^(\d{1,2}):(\d{2})/.exec(s||""); return m ? (+m[1])*60+(+m[2]) : 0; };
const hm = m => { m = ((Math.round(m)%1440)+1440)%1440; return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); };
const nowMin = () => { const d=new Date(); return d.getHours()*60+d.getMinutes(); };
const nice = s => { const m=toMin(s), h=Math.floor(m/60), x=m%60; return ((h%12)||12)+":"+String(x).padStart(2,"0")+(h<12?" am":" pm"); };
const tplName = id => { const g=TW.getTemplate(id); return g ? g.name : id; };
const uid = () => Math.random().toString(36).slice(2,9);
const monthKey = () => TW.dayKey().slice(0,7);

let draft = null; // onboarding draft
function profile(){ return LS.get("profile", null); }
function autonomy(){ return LS.get("autonomy", (profile()||{}).autonomy || "suggest"); }

/* ---------- Onboarding ---------- */
function renderOnboard(){
  const p = profile() || {};
  if(!draft){
    draft = {days: p.days || [1,2,3,4,5], goals: p.goals || ["job","money","health"], autonomy: p.autonomy || autonomy()};
    // fill the text/time boxes only once, so tapping chips never wipes what was typed
    $("obName").value = p.name || ""; $("obWake").value = p.wake || "07:00"; $("obBed").value = p.bed || "22:30";
    $("obWorkStart").value = p.workStart || "09:00"; $("obWorkEnd").value = p.workEnd || "17:00";
  }
  const dl = TW.lang==="es" ? DAYS_ES : DAYS;
  $("obDays").innerHTML = dl.map((d,i)=>`<button data-d="${i}" class="${draft.days.includes(i)?"on":""}" aria-pressed="${draft.days.includes(i)}">${d}</button>`).join("") + `<button data-d="none" class="${draft.days.length?"":"on"}">${esc(t("no_work"))}</button>`;
  $("obDays").querySelectorAll("button").forEach(b=> b.onclick = ()=>{
    if(b.dataset.d==="none") draft.days = [];
    else { const d=+b.dataset.d; draft.days = draft.days.includes(d) ? draft.days.filter(x=>x!==d) : draft.days.concat(d).sort(); }
    renderOnboard();
  });
  $("obWorkTimes").classList.toggle("hidden", !draft.days.length);
  $("obGoals").innerHTML = GOALS.map(g=>`<button data-g="${g}" class="${draft.goals.includes(g)?"on":""}" aria-pressed="${draft.goals.includes(g)}">${esc(t("g_"+g))}</button>`).join("");
  $("obGoals").querySelectorAll("button").forEach(b=> b.onclick = ()=>{ const g=b.dataset.g; draft.goals = draft.goals.includes(g) ? draft.goals.filter(x=>x!==g) : draft.goals.concat(g); renderOnboard(); });
  $("obAuto").innerHTML = AUTOS.map(a=>`<button data-a="${a}" class="${draft.autonomy===a?"on":""}" title="${esc(t("a_"+a+"_d"))}">${esc(t("a_"+a))}</button>`).join("");
  $("obAuto").querySelectorAll("button").forEach(b=> b.onclick = ()=>{ draft.autonomy=b.dataset.a; renderOnboard(); });
}
function saveSetup(){
  const p = {name:$("obName").value.trim().slice(0,40), wake:$("obWake").value||"07:00", bed:$("obBed").value||"22:30",
    days:draft.days, workStart:$("obWorkStart").value||"09:00", workEnd:$("obWorkEnd").value||"17:00", goals:draft.goals, autonomy:draft.autonomy};
  LS.set("profile", p); LS.set("autonomy", p.autonomy); LS.del("aiPlan"); draft = null; editing = false;
  render(); scheduleReminders();
  TW.speak((p.name? p.name+", your" : "Your")+" plan is ready. Press What do I do now any time.", null, {lang:TW.lang});
  toast("Plan ready.");
}
let editing = false;

/* ---------- Plan ---------- */
function mealOfDay(d){ d = d||new Date(); const start=new Date(d.getFullYear(),0,0); const doy=Math.floor((d-start)/864e5); return TW.MEALS[doy % TW.MEALS.length]; }
function daysUntil(day){ const d=new Date(); const today=d.getDate(); const dim=new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); const due=Math.min(day, dim); return due>=today ? due-today : (dim-today)+Math.min(day, new Date(d.getFullYear(), d.getMonth()+2, 0).getDate()); }
function bdayIn(md){ const m=/^(\d{1,2})-(\d{1,2})$/.exec(md||""); if(!m) return -1; const d=new Date(); d.setHours(0,0,0,0); let b=new Date(d.getFullYear(), +m[1]-1, +m[2]); if(b<d) b=new Date(d.getFullYear()+1, +m[1]-1, +m[2]); return Math.round((b-d)/864e5); }
function buildPlan(date){
  const p = profile(); if(!p) return [];
  date = date || new Date();
  const W = toMin(p.wake), B0 = toMin(p.bed), B = B0 <= W ? B0+1440 : B0, wd = date.getDay();
  const work = p.days.includes(wd), g = p.goals || [];
  const items = [];
  const add = (m, id, title, guide, kind) => items.push({id, m, time:hm(m), title, guide:guide||"", kind:kind||"task"});
  add(W, "wake", "Wake up: morning routine", "morning", "self");
  add(W+15, "water1", "Drink a glass of water", "", "water");
  add(W+30, "breakfast", "Eat breakfast", "eggs", "meal");
  LS.get("meds",[]).forEach(md=> add(toMin(md.time), "med-"+md.id, "Take "+md.name, "", "med"));
  LS.get("bills",[]).forEach(b=>{ const n=daysUntil(+b.day); if(n<=3 && !(b.paid||{})[monthKey()]) add(W+60, "bill-"+b.id, `Pay ${b.name} (${TW.money(b.amt)}) \u2014 ${n===0?"due today":"due in "+n+" day"+(n>1?"s":"")}`, "paybill", "bill"); });
  LS.get("family",[]).forEach(f=>{ if(bdayIn(f.bday)===0) add(W+75, "bday-"+f.id, `It's ${f.name}'s birthday! Call or text them.`, "", "family"); });
  if(work){
    const S = toMin(p.workStart), E = toMin(p.workEnd) <= S ? toMin(p.workEnd)+1440 : toMin(p.workEnd);
    add(S-45, "leave", "Get ready and leave for work", "", "work");
    add(S, "work", `Work: ${nice(p.workStart)} to ${nice(p.workEnd)}`, "", "work");
    add(E+10, "afterwork", "Work's done. Take 10 minutes to rest.", "", "self");
    if(g.includes("job")) add(E+60, "job", "Job search: apply to one job", "job", "job");
    if(g.includes("rise")) add(E+75, "rise", "Rise: do one step", "", "rise");
  } else {
    const chore = TW.CHORES[wd];
    add(W+90, "chore", "Chore: "+tplName(chore), chore, "home");
    if(g.includes("job")) add(W+150, "job", "Job search: apply to two jobs", "job", "job");
    if(g.includes("rise")) add(W+120, "rise", "Rise: do one step", "", "rise");
    add(W+240, "lunch", "Make lunch", "lunch", "meal");
  }
  if(g.includes("money")) add(Math.min(B-200, 19*60+30), "money", "Write down what you spent today", "", "money");
  if(g.includes("health")) add(work ? Math.min(B-150, 18*60+45) : W+180, "workout", "Move your body: 15 minute workout", "workout", "health");
  const meal = mealOfDay(date);
  add(Math.min(Math.max(18*60, work ? toMin(p.workEnd)+45 : 18*60), B-150), "dinner", "Dinner: "+meal.name, meal.guide, "meal");
  if(g.includes("family")) add(B-100, "family", "Family time: call, talk or play (20 minutes)", "", "family");
  add(B-75, "tidy", "Quick tidy: 10 minutes", "", "home");
  add(B-45, "bed", "Get ready for bed", "bedtime", "self");
  items.sort((a,b)=>a.m-b.m);
  return items;
}
function todayPlan(){
  const ai = LS.get("aiPlan", null);
  if(ai && ai.date===TW.dayKey() && Array.isArray(ai.items) && ai.items.length) return ai.items.map(x=>Object.assign({}, x, {m:toMin(x.time)})).sort((a,b)=>a.m-b.m);
  return buildPlan();
}
function doneMap(){ const d = LS.get("planDone", {}); return d[TW.dayKey()] || {}; }
function markDone(id, on){
  const all = LS.get("planDone", {}), k = TW.dayKey();
  Object.keys(all).forEach(x=>{ if(x<TW.dayKey(Date.now()-7*864e5)) delete all[x]; });
  all[k] = all[k] || {};
  if(on===false) delete all[k][id]; else all[k][id] = true;
  LS.set("planDone", all);
  if(on!==false){
    const it = todayPlan().find(x=>x.id===id);
    if(it && it.kind==="water") addWater(1, true);
    if(it && it.kind==="med"){ const meds=LS.get("meds",[]); const md=meds.find(m=>"med-"+m.id===id); if(md){ md.taken=md.taken||{}; md.taken[k]=true; LS.set("meds",meds); } }
    TW.buzz("tap");
  }
  if(TW.curScreen==="today") render();
}
function nowItem(){
  const items = todayPlan(), done = doneMap(), n = nowMin();
  const open = items.filter(x=>!done[x.id]);
  if(!open.length) return null;
  const past = open.filter(x=>x.m <= n+10);
  return past.length ? past[past.length-1] : open[0];
}
function renderPlan(){
  const items = todayPlan(), done = doneMap(), cur = nowItem();
  const pct = items.length ? Math.round(items.filter(x=>done[x.id]).length/items.length*100) : 0;
  $("dayPct").textContent = pct+"%"; $("dayBar").style.width = pct+"%";
  const a = autonomy();
  $("autoPill").textContent = t("a_"+a); $("autoPill").className = "pill "+(a==="run"?"warn":a==="do"?"acc":"");
  $("planList").innerHTML = items.map(x=>`<li class="${done[x.id]?"done":""}${cur&&cur.id===x.id?" now":""}" data-id="${esc(x.id)}">
    <span class="tm">${esc(nice(x.time))}</span>
    <span><span class="pt">${esc(x.title)}</span>${x.guide?`<span class="pk">\u{1F4CB} ${esc(tplName(x.guide))}</span>`:""}</span>
    <span class="pb">${x.guide&&!done[x.id]?`<button class="go" aria-label="Start guide for ${esc(x.title)}">\u25B6</button>`:""}${x.kind==="rise"&&!done[x.id]?`<button class="gr" aria-label="Open Rise">\u2B06</button>`:""}<button class="ck${done[x.id]?" on":""}" aria-label="Mark done: ${esc(x.title)}">\u2713</button></span></li>`).join("");
  $("planList").querySelectorAll("li").forEach(li=>{
    const id = li.dataset.id, it = items.find(x=>x.id===id);
    li.querySelector(".ck").onclick = ()=> markDone(id, !done[id]);
    const go = li.querySelector(".go"); if(go) go.onclick = ()=> TW.openGuide(it.guide, true, "today");
    const gr = li.querySelector(".gr"); if(gr) gr.onclick = ()=> TW.show("rise");
  });
  const ai = LS.get("aiPlan", null), isAi = ai && ai.date===TW.dayKey();
  $("planNote").innerHTML = (isAi ? "\u2728 This plan was made with AI. <button class='btn2' id='btnPlainPlan' style='min-height:40px'>Use the simple plan</button><br>" : "") +
    esc(t("a_"+a+"_d")) + (a==="run" ? " Rules: I only start guides that are on your plan. I never spend money or send messages." : "") +
    (LS.get("reminders", false) ? " Reminders are on." : "");
  const pp = $("btnPlainPlan"); if(pp) pp.onclick = ()=>{ LS.del("aiPlan"); render(); scheduleReminders(); };
  $("btnReminders").textContent = LS.get("reminders", false) ? "Reminders on \u2713" : t("reminders_on");
}
function whatNow(){
  const it = nowItem(), card = $("nowCard");
  card.classList.remove("hidden");
  if(!profile()){ card.innerHTML = `<b>${esc(t("setup_title"))}</b>Answer a few questions below first.`; TW.speak("Let's set up your day first. Answer the questions below.", null, {lang:TW.lang}); $("onboard").scrollIntoView({block:"start"}); return null; }
  if(!it){ card.innerHTML = `<b>${esc(t("nothing_now"))}</b>`; TW.speak(t("nothing_now"), null, {lang:TW.lang}); return null; }
  const late = it.m < nowMin()-10;
  card.innerHTML = `<span class="small">${esc(t("now_is"))} \u00b7 ${esc(nice(it.time))}${late?" (a little late \u2014 that's okay)":""}</span><b>${esc(it.title)}</b>
    <div class="row">${it.guide?`<button class="start" style="margin:0;min-height:60px;font-size:1.2rem" id="nowGo">\u25B6 ${esc(t("start_guide"))}</button>`:""}<button class="btn2" id="nowDone">\u2713 ${esc(t("done"))}</button></div>`;
  $("nowDone").onclick = ()=>{ markDone(it.id, true); whatNow(); };
  if($("nowGo")) $("nowGo").onclick = ()=> TW.openGuide(it.guide, true, "today");
  const a = autonomy();
  const sayIt = (TW.lang==="es" ? "Ahora: " : "Now: ") + it.title + ".";
  TW.buzz("step");
  if(a==="suggest" || !it.guide){ TW.speak(sayIt + (it.guide ? " Press start when you're ready." : " Press done when you finish."), null, {lang:"en"}); }
  else if(a==="do"){ TW.speak(sayIt + " I opened the guide for you. Press start.", null, {lang:"en"}); TW.openGuide(it.guide, false); }
  else { TW.speak(sayIt + " Starting now.", null, {lang:"en"}); TW.openGuide(it.guide, true, "today"); }
  return it;
}
function onGuideDone(name){
  const items = todayPlan(), done = doneMap();
  const hit = items.find(x=>x.guide && !done[x.id] && tplName(x.guide)===name);
  if(hit) markDone(hit.id, true);
}
async function aiPlan(){
  const p = profile(); if(!p){ toast("Set up your day first."); return; }
  const btn = $("btnAiPlan"); btn.disabled = true; btn.textContent = "Thinking\u2026";
  const d = new Date();
  const ids = TW.TEMPLATES.map(x=>x.id+" ("+x.name+")").join(", ");
  const base = buildPlan().map(x=>x.time+" "+x.title).join("\n");
  const prompt = `You plan one day for a person who may not read well and may be rebuilding their life. Make a kind, realistic plan for ${DAYS[d.getDay()]} ${TW.dayKey()}.
Wake ${p.wake}, bed ${p.bed}. Work days: ${p.days.map(i=>DAYS[i]).join(", ")||"none"}${p.days.includes(d.getDay())?` (works today ${p.workStart}-${p.workEnd})`:" (day off today)"}.
Goals: ${(p.goals||[]).join(", ")||"none"}.
Must keep these fixed items (medicines, bills, work, birthdays):
${base}
You may adjust or add small helpful items. Use short plain titles (under 9 words). When a built-in guide fits, set "guide" to its id, else "". Guide ids: ${ids}.
Reply with ONLY a JSON array of 8 to 18 items: [{"time":"HH:MM","title":"...","guide":""}]`;
  try{
    const out = TW.parseJSON(await TW.gemini(prompt, {temperature:0.5}));
    const arr = (Array.isArray(out)?out:(out.items||[])).filter(x=>x && /^\d{1,2}:\d{2}$/.test(String(x.time||"").trim()) && String(x.title||"").trim())
      .slice(0,20).map((x,i)=>({id:"ai"+i, time:hm(toMin(String(x.time).trim())), title:String(x.title).trim().slice(0,80), guide:TW.getTemplate(x.guide)? x.guide : "", kind:/medic|pill|take /i.test(x.title)?"med":/water/i.test(x.title)?"water":"task"}));
    if(arr.length < 4) throw new Error("short");
    LS.set("aiPlan", {date:TW.dayKey(), items:arr});
    toast("Your AI plan is ready."); render(); scheduleReminders();
  }catch(e){ toast(e.code ? TW.geminiMsg(e) : "AI plan didn't work. Keeping the simple plan."); }
  finally{ btn.disabled = false; btn.textContent = t("ai_plan"); }
}

/* ---------- Reminders ---------- */
let timers = [];
function notify(title, body){
  const opts = {body: body||"", icon:"icons/icon-192.png", badge:"icons/icon-192.png", tag:"tw-"+title, vibrate:[80,60,80]};
  try{
    if("Notification" in window && Notification.permission==="granted"){
      if(TW.swReady) TW.swReady.then(reg=> reg && reg.showNotification ? reg.showNotification(title, opts) : new Notification(title, opts)).catch(()=>{});
      else new Notification(title, opts);
    }
  }catch(e){}
  toast("\u23F0 "+title, 6000); TW.speak(title, null, {lang:"en"}); TW.buzz("timer");
}
TW.notify = notify;
function scheduleReminders(){
  timers.forEach(clearTimeout); timers = [];
  if(!LS.get("reminders", false) || !profile()) return 0;
  const done = doneMap(), n = new Date(), base = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  todayPlan().forEach(it=>{
    if(done[it.id]) return;
    const at = base + it.m*60000, ms = at - Date.now();
    if(ms <= 0 || ms > 864e5) return;
    timers.push(setTimeout(()=>{
      if(doneMap()[it.id]) return;
      notify(it.title, it.guide ? "Open Temperward to start the guide." : "Tap Done in Temperward when finished.");
      if(autonomy()==="run" && it.guide && !TW.getRun()) TW.openGuide(it.guide, true, "today");
      if(TW.curScreen==="today") render();
    }, ms));
  });
  return timers.length;
}
async function remindersOn(){
  if(LS.get("reminders", false)){ LS.set("reminders", false); scheduleReminders(); render(); toast("Reminders off."); return; }
  let perm = "default";
  if("Notification" in window){ try{ perm = await Notification.requestPermission(); }catch(e){} }
  LS.set("reminders", true);
  const n = scheduleReminders(); render();
  toast(perm==="granted" ? `Reminders on: ${n} more today.` : `Reminders on while the app is open (${n} more today). Allow notifications to get pop-ups.`, 4000);
}

/* ---------- Money ---------- */
function renderMoney(){
  const inc = +LS.get("income", 0) || 0, bills = LS.get("bills", []), mk = monthKey();
  const spend = LS.get("spend", []).filter(s=>String(s.date).slice(0,7)===mk);
  const billTot = bills.reduce((a,b)=>a+(+b.amt||0),0), spent = spend.reduce((a,s)=>a+(+s.amt||0),0), left = inc-billTot-spent;
  $("income").value = inc || "";
  $("budgetBox").innerHTML = `<div><span class="small">Coming in</span><b>${TW.money(inc)}</b></div><div><span class="small">Bills</span><b>${TW.money(billTot)}</b></div>
    <div><span class="small">Spent</span><b>${TW.money(spent)}</b></div><div><span class="small">Left</span><b class="${left<0?"bad":"good"}">${TW.money(left)}</b></div>`;
  $("billList").innerHTML = bills.length ? bills.slice().sort((a,b)=>daysUntil(a.day)-daysUntil(b.day)).map(b=>{ const n=daysUntil(+b.day), paid=(b.paid||{})[mk];
    return `<li data-id="${b.id}"><span>${esc(b.name)} \u00b7 ${TW.money(b.amt)}<span class="sub">${paid?"Paid this month \u2713":n===0?"Due today":"Due in "+n+" day"+(n===1?"":"s")+" (day "+b.day+")"}</span></span>
      <span class="row" style="margin:0"><button class="act pay">${paid?"Undo":"Paid"}</button><button class="x del" aria-label="Delete ${esc(b.name)}">\u2715</button></span></li>`; }).join("")
    : '<li><span class="small">No bills yet. Add rent, phone, lights...</span></li>';
  $("billList").querySelectorAll("li[data-id]").forEach(li=>{
    const id=li.dataset.id;
    li.querySelector(".pay").onclick = ()=>{ const bs=LS.get("bills",[]); const b=bs.find(x=>x.id===id); b.paid=b.paid||{}; if(b.paid[mk]) delete b.paid[mk]; else { b.paid[mk]=true; markDone("bill-"+id, true); } LS.set("bills",bs); renderMoney(); };
    li.querySelector(".del").onclick = ()=>{ if(confirm("Delete this bill?")){ LS.set("bills", LS.get("bills",[]).filter(x=>x.id!==id)); renderMoney(); } };
  });
  $("spendList").innerHTML = spend.slice(0,30).map(s=>`<li><span>${esc(s.what)}<span class="sub">${new Date(s.date).toLocaleDateString()}</span></span><b>${TW.money(s.amt)}</b></li>`).join("");
}
function addBill(){
  const name=$("billName").value.trim(), amt=parseFloat($("billAmt").value), day=parseInt($("billDay").value,10);
  if(!name || !(amt>=0) || !(day>=1 && day<=31)){ toast("Fill in the bill name, amount, and due day (1 to 31)."); return; }
  const bs = LS.get("bills",[]); bs.push({id:uid(), name, amt, day, paid:{}}); LS.set("bills", bs);
  $("billName").value=$("billAmt").value=$("billDay").value=""; renderMoney(); scheduleReminders(); toast("Bill added.");
}
function addSpend(){
  const what=$("spendWhat").value.trim()||"Spending", amt=parseFloat($("spendAmt").value);
  if(!(amt>0)){ toast("Type how much you spent."); return; }
  const s = LS.get("spend",[]); s.unshift({what, amt, date:new Date().toISOString()}); LS.set("spend", s.slice(0,1000));
  $("spendWhat").value=$("spendAmt").value=""; renderMoney(); markDone("money", true);
}

/* ---------- Meals ---------- */
function renderMeals(extra){
  const have = ($("pantry").value || LS.get("pantry","")).toLowerCase().split(/[,\s]+/).filter(Boolean);
  const scored = TW.MEALS.map(m=>({m, s:m.has.filter(h=>have.some(x=>h.includes(x)||x.includes(h))).length})).sort((a,b)=>b.s-a.s);
  const today = mealOfDay();
  const rows = scored.map(({m,s})=>`<li><span>${esc(m.name)}${m===today?' <span class="pill acc">today</span>':""}<span class="sub">${have.length? (s? "You have "+s+" of "+m.has.length+" main items" : "Needs: "+m.has.join(", ")) : "Needs: "+m.has.join(", ")}</span></span><button class="act" data-g="${m.guide}">Cook it</button></li>`);
  (extra||[]).forEach((x,i)=> rows.unshift(`<li><span>\u2728 ${esc(x.name)}<span class="sub">${x.steps.length} steps (AI)</span></span><button class="act" data-ai="${i}">Cook it</button></li>`));
  $("mealList").innerHTML = rows.join("");
  $("mealList").querySelectorAll("[data-g]").forEach(b=> b.onclick = ()=> TW.openGuide(b.dataset.g, true, "today"));
  $("mealList").querySelectorAll("[data-ai]").forEach(b=> b.onclick = ()=>{ const x=extra[+b.dataset.ai]; TW.startRun({name:x.name, steps:x.steps, from:"today"}); });
}
async function mealIdeas(){
  LS.set("pantry", $("pantry").value.trim());
  renderMeals();
  if(!$("pantry").value.trim()){ $("mealNote").textContent = "Type what food you have for better ideas."; return; }
  $("mealNote").textContent = "Getting more ideas\u2026 (free AI, can take up to a minute)";
  try{
    const out = TW.parseJSON(await TW.gemini(`Suggest 3 cheap, simple meals someone can cook with mostly these foods: ${$("pantry").value}. Basic kitchen only. For each, give 6 to 10 short plain-English steps (under 20 words each), including times like "10 minutes" when waiting. Reply ONLY JSON: [{"name":"...","steps":["..."]}]`, {temperature:0.6}));
    const list = (Array.isArray(out)?out:[]).filter(x=>x && x.name && Array.isArray(x.steps) && x.steps.length>=3).slice(0,3)
      .map(x=>({name:String(x.name).slice(0,60), steps:x.steps.map(s=>String(s)).slice(0,15)}));
    $("mealNote").textContent = list.length ? "" : "No AI ideas this time.";
    renderMeals(list);
  }catch(e){ $("mealNote").textContent = TW.geminiMsg(e); }
}

/* ---------- Health ---------- */
function water(){ const w = LS.get("water", {}); return w.date===TW.dayKey() ? w.n : 0; }
function addWater(d, quiet){ const n = Math.max(0, Math.min(16, water()+d)); LS.set("water", {date:TW.dayKey(), n}); if(!quiet) TW.buzz("tap"); if(TW.curScreen==="today") renderHealth(); if(n===8 && d>0 && !quiet) toast("8 glasses! Great job."); }
function renderHealth(){
  const n = water();
  $("waterCups").innerHTML = Array.from({length:8},(_,i)=>`<span class="${i<n?"on":""}">\u{1F964}</span>`).join("") + (n>8? ` <b>+${n-8}</b>`:"");
  $("waterCups").setAttribute("aria-label", n+" of 8 glasses");
  const meds = LS.get("meds",[]), k = TW.dayKey();
  $("medList").innerHTML = meds.length ? meds.map(m=>`<li data-id="${m.id}"><span>${esc(m.name)}<span class="sub">${nice(m.time)} every day${(m.taken||{})[k]?" \u00b7 taken today \u2713":""}</span></span>
    <span class="row" style="margin:0"><button class="act tk">${(m.taken||{})[k]?"Undo":"Took it"}</button><button class="x del" aria-label="Delete ${esc(m.name)}">\u2715</button></span></li>`).join("")
    : '<li><span class="small">No medicines added.</span></li>';
  $("medList").querySelectorAll("li[data-id]").forEach(li=>{
    const id=li.dataset.id;
    li.querySelector(".tk").onclick = ()=>{ const ms=LS.get("meds",[]); const m=ms.find(x=>x.id===id); m.taken=m.taken||{}; const was=m.taken[k]; if(was) delete m.taken[k]; else m.taken[k]=true; LS.set("meds",ms); markDone("med-"+id, !was); renderHealth(); };
    li.querySelector(".del").onclick = ()=>{ if(confirm("Remove this medicine?")){ LS.set("meds", LS.get("meds",[]).filter(x=>x.id!==id)); renderHealth(); scheduleReminders(); } };
  });
  const p = profile();
  if(p){ const W=toMin(p.wake), B=toMin(p.bed); const hrs = ((W - B + 1440) % 1440)/60; $("sleepGoal").textContent = `Your plan gives you ${hrs.toFixed(1).replace(".0","")} hours of sleep. Most adults need 7 to 9.`; }
  const sl = LS.get("sleep", {}), days = [];
  for(let i=6;i>=0;i--){ const d=new Date(Date.now()-i*864e5); days.push({k:TW.dayKey(d), l:DAYS[d.getDay()][0], h:+sl[TW.dayKey(d)]||0}); }
  $("sleepBars").innerHTML = days.map(d=>`<div style="height:${Math.max(4, Math.min(100, d.h/10*100))}%;${d.h&&d.h<7?"background:#a0703a":""}" title="${d.h} hours"><i>${d.l}</i></div>`).join("");
}
function addMed(){
  const name=$("medName").value.trim(), time=$("medTime").value||"08:00";
  if(!name){ toast("Type the medicine name."); return; }
  const ms = LS.get("meds",[]); ms.push({id:uid(), name, time, taken:{}}); LS.set("meds", ms);
  $("medName").value=""; renderHealth(); scheduleReminders(); toast("Added. It will show on your plan.");
}
function saveSleep(){
  const h = parseFloat($("sleepHrs").value);
  if(!(h>=0 && h<=24)){ toast("Type hours between 0 and 24."); return; }
  const sl = LS.get("sleep", {}); sl[TW.dayKey()] = h; LS.set("sleep", sl); $("sleepHrs").value=""; renderHealth();
  toast(h<7 ? "Try to get to bed a little earlier tonight." : "Good sleep. Nice.");
}

/* ---------- Home ---------- */
function renderHome(){
  const wd = new Date().getDay(), id = TW.CHORES[wd];
  $("choreToday").innerHTML = `<p style="font-size:1.2rem;font-weight:700;margin:0 0 6px">${esc(tplName(id))}</p><button class="start" style="margin-top:6px" id="btnChore">\u25B6 ${esc(t("start_guide"))}</button>`;
  $("btnChore").onclick = ()=> TW.openGuide(id, true, "today");
  $("choreWeek").innerHTML = [1,2,3,4,5,6,0].map(d=>`<li><span>${DAYS[d]}${d===wd?' <span class="pill acc">today</span>':""}</span><button class="act" data-g="${TW.CHORES[d]}">${esc(tplName(TW.CHORES[d]))}</button></li>`).join("");
  $("choreWeek").querySelectorAll("[data-g]").forEach(b=> b.onclick = ()=> TW.openGuide(b.dataset.g, false));
}

/* ---------- Family ---------- */
function renderFamily(){
  const fam = LS.get("family",[]).slice().sort((a,b)=>{ const x=bdayIn(a.bday), y=bdayIn(b.bday); return (x<0?999:x)-(y<0?999:y); });
  $("famList").innerHTML = fam.length ? fam.map(f=>{ const n=bdayIn(f.bday);
    return `<li data-id="${f.id}"><span>${esc(f.name)}<span class="sub">${n===0?"\u{1F382} Birthday today!":n>0?"Birthday in "+n+" day"+(n===1?"":"s"):"No birthday saved"}</span></span>
    <span class="row" style="margin:0">${f.phone?`<a class="act btn2" style="display:flex;align-items:center;text-decoration:none;border-radius:16px" href="tel:${esc(f.phone.replace(/[^\d+]/g,""))}">Call</a>`:""}<button class="x del" aria-label="Remove ${esc(f.name)}">\u2715</button></span></li>`; }).join("")
    : '<li><span class="small">Add the people who matter. I\'ll remind you of birthdays.</span></li>';
  $("famList").querySelectorAll("li[data-id]").forEach(li=>{ li.querySelector(".del").onclick = ()=>{ if(confirm("Remove this person?")){ LS.set("family", LS.get("family",[]).filter(x=>x.id!==li.dataset.id)); renderFamily(); } }; });
}
function addFam(){
  const name=$("famName").value.trim(), phone=$("famPhone").value.trim(), bd=$("famBday").value.trim();
  if(!name){ toast("Type a name."); return; }
  let bday = "";
  if(bd){ const m=/^(\d{1,2})[-\/](\d{1,2})$/.exec(bd); if(!m || +m[1]<1 || +m[1]>12 || +m[2]<1 || +m[2]>31){ toast("Birthday should look like 04-15 (month-day)."); return; } bday = String(+m[1]).padStart(2,"0")+"-"+String(+m[2]).padStart(2,"0"); }
  const f = LS.get("family",[]); f.push({id:uid(), name, phone, bday}); LS.set("family", f);
  $("famName").value=$("famPhone").value=$("famBday").value=""; renderFamily();
}

/* ---------- Work ---------- */
function renderWork(){
  const p = profile() || {days:[]};
  $("workSched").innerHTML = `<h3>My work days</h3><p style="margin:0">${p.days.length ? p.days.map(i=>DAYS[i]).join(", ")+` \u00b7 ${nice(p.workStart)} to ${nice(p.workEnd)}` : "No work days set."}</p>`;
  const ws = TW.TEMPLATES.filter(x=>x.cat==="work" || x.id==="job" || x.id==="interview");
  $("workGuides").innerHTML = ws.map(x=>`<button data-g="${x.id}">${x.icon} ${esc(x.name)}</button>`).join("");
  $("workGuides").querySelectorAll("button").forEach(b=> b.onclick = ()=> TW.openGuide(b.dataset.g, false));
}

/* ---------- Render ---------- */
let sec = LS.get("lifeTab", "plan");
function renderTabs(){
  $("lifeTabs").innerHTML = SECTIONS.map(s=>`<button role="tab" data-s="${s}" class="${s===sec?"on":""}" aria-selected="${s===sec}">${SEC_ICON[s]} ${esc(t("sec_"+s))}</button>`).join("");
  $("lifeTabs").querySelectorAll("button").forEach(b=> b.onclick = ()=>{ sec=b.dataset.s; LS.set("lifeTab", sec); render(); });
  SECTIONS.forEach(s=> $("ls-"+s).classList.toggle("hidden", s!==sec));
}
function render(){
  const p = profile();
  const showSetup = !p || editing;
  $("onboard").classList.toggle("hidden", !showSetup);
  $("life").classList.toggle("hidden", !p || editing);
  if(showSetup) renderOnboard();
  if(p){
    const h = new Date().getHours(), gr = TW.lang==="es" ? (h<12?"Buenos d\u00edas":h<19?"Buenas tardes":"Buenas noches") : (h<12?"Good morning":h<17?"Good afternoon":"Good evening");
    $("greet").textContent = gr + (p.name ? ", "+p.name : "") + ". " + t("hero_sub");
  }
  if(!p || editing) { $("dayPct").textContent = "0%"; return; }
  renderTabs();
  renderPlan();
  ({money:renderMoney, meals:()=>renderMeals(), health:renderHealth, home:renderHome, family:renderFamily, work:renderWork})[sec]?.();
}
TW.renderers.today = ()=>{ TW.refreshStats(); render(); };

$("btnSaveSetup").onclick = saveSetup;
$("btnEditSetup").onclick = ()=>{ editing = true; draft = null; render(); $("onboard").scrollIntoView({block:"start"}); };
$("btnWhatNow").onclick = whatNow;
$("btnReminders").onclick = remindersOn;
$("btnAiPlan").onclick = aiPlan;
$("income").onchange = e=>{ LS.set("income", Math.max(0, parseFloat(e.target.value)||0)); renderMoney(); };
$("btnAddBill").onclick = addBill; $("btnAddSpend").onclick = addSpend;
$("btnMealIdeas").onclick = mealIdeas; $("pantry").value = LS.get("pantry","");
$("pantry").addEventListener("keydown", e=>{ if(e.key==="Enter") mealIdeas(); });
$("btnWater").onclick = ()=>{ addWater(1); markDone("water1", true); };
$("btnWaterMinus").onclick = ()=> addWater(-1);
$("btnAddMed").onclick = addMed; $("btnSleep").onclick = saveSleep; $("btnAddFam").onclick = addFam;

TW.life = {buildPlan, todayPlan, nowItem, markDone, whatNow, onGuideDone, scheduleReminders, render,
  setAutonomy(a){ const p=profile(); if(p){ p.autonomy=a; LS.set("profile",p); } if(TW.curScreen==="today") render(); }};
window.addEventListener("DOMContentLoaded", ()=> setTimeout(scheduleReminders, 500));
})();
