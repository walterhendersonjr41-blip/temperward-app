/* Temperward core: storage, language, speech, navigation, Pick and Start, step player,
   timers, voice commands, history, devices (haptics, watch/HUD), settings, backup, PWA. */
(function(){
"use strict";
const TW = window.TW;
const VERSION = "3.0.0";
TW.VERSION = VERSION;

/* ---------- Storage ---------- */
const LS = TW.LS = {
  get(k, d){ try{ const v = localStorage.getItem("tw_"+k); return v===null? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("tw_"+k, JSON.stringify(v)); return true; }catch(e){ toast("Phone storage is full. Export a backup and clear old data."); return false; } },
  del(k){ try{ localStorage.removeItem("tw_"+k); }catch(e){} }
};
const $ = TW.$ = id => document.getElementById(id);
const esc = TW.esc = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg, ms){ const t=$("toast"); t.textContent=msg; t.classList.remove("hidden"); clearTimeout(toast._h); toast._h=setTimeout(()=>t.classList.add("hidden"), ms||2600); }
TW.toast = toast;
TW.dayKey = function(d){ const x=new Date(d||Date.now()); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
TW.money = n => "$"+(Math.round((+n||0)*100)/100).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2});

/* ---------- Language ---------- */
Object.assign(TW.STR.en, {cat_all:"All", cat_cook:"Cooking", cat_clean:"Cleaning", cat_car:"Car", cat_fix:"Home repair", cat_kids:"Kids & baby", cat_work:"Job tasks", cat_self:"Self care", cat_papers:"Papers & money"});
Object.assign(TW.STR.es, {cat_all:"Todas", cat_cook:"Cocina", cat_clean:"Limpieza", cat_car:"Carro", cat_fix:"Reparaciones", cat_kids:"Ni\u00f1os y beb\u00e9s", cat_work:"Tareas de trabajo", cat_self:"Cuidado personal", cat_papers:"Papeles y dinero"});
TW.lang = LS.get("lang", "en");
const t = TW.t = function(k, vars){
  let s = (TW.STR[TW.lang]||{})[k]; if(s==null) s = TW.STR.en[k]; if(s==null) s = k;
  if(vars) s = s.replace(/\{(\w+)\}/g, (m,v)=> vars[v]!=null ? vars[v] : m);
  return s;
};
TW.applyI18n = function(){
  document.documentElement.lang = TW.lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{ el.placeholder = t(el.dataset.i18nPh); });
};
function setLang(l){
  TW.lang = (l==="es") ? "es" : "en"; LS.set("lang", TW.lang);
  TW.applyI18n(); renderCats(); renderGoals(); if(selected) choose(selected, true);
  rerender(curTab);
  if(run) renderStep(false);
}
TW.setLang = setLang;

/* ---------- Speech ---------- */
const synth = TW.synth = window.speechSynthesis || null;
let muted = LS.get("muted", false);
let rate = LS.get("rate", 0.85);
let voiceName = LS.get("voice", "");
let speaking = false;
TW.isSpeaking = ()=> speaking;
TW.outMode = LS.get("outMode", "earbud");
function langCode(l){ l = l || TW.lang; if(l==="es") return "es-US"; if(l==="en") return "en-US"; return l; }
function pickVoice(code){
  if(!synth) return null;
  const vs = synth.getVoices() || [], pre = code.slice(0,2).toLowerCase();
  const chosen = vs.find(v=>v.name===voiceName);
  if(chosen && chosen.lang.slice(0,2).toLowerCase()===pre) return chosen;
  return vs.find(v=>v.lang===code) || vs.find(v=>v.lang.slice(0,2).toLowerCase()===pre) || null;
}
/* speak(text, onend, {lang}) — lang: "en" | "es" | BCP-47 code. Guide text defaults to English. */
function speak(text, onend, opts){
  opts = opts || {};
  if(!synth || muted){ if(onend) setTimeout(onend, 600); return; }
  try{
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const code = langCode(opts.lang);
    u.rate = TW.outMode==="speaker" ? Math.max(0.6, rate-0.05) : rate; u.pitch = 1; u.volume = 1;
    const v = pickVoice(code); if(v){ u.voice=v; u.lang=v.lang; } else u.lang=code;
    u.onstart = () => { speaking = true; };
    let fired = false;
    const done = () => { if(onend && !fired){ fired=true; onend(); } };
    u.onend = u.onerror = () => { speaking = false; done(); };
    synth.speak(u);
    if(onend) setTimeout(done, 3000 + String(text).split(" ").length*450); // some phones never fire onend
  }catch(e){ if(onend) setTimeout(onend, 600); }
}
TW.speak = speak;
function fillVoices(){
  const sel=$("voiceSel"); if(!synth){ sel.innerHTML="<option>Voice not supported</option>"; return; }
  const vs = (synth.getVoices()||[]).filter(v=>/^(en|es)/i.test(v.lang));
  sel.innerHTML = '<option value="">Default</option>' + vs.map(v=>`<option${v.name===voiceName?" selected":""} value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join("");
}
if(synth && "onvoiceschanged" in synth) synth.onvoiceschanged = fillVoices;
function beep(){
  try{ const C=window.AudioContext||window.webkitAudioContext; if(!C) return; const c=new C();
    [0,0.4,0.8].forEach(d=>{ const o=c.createOscillator(), g=c.createGain(); o.frequency.value=660; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.2,c.currentTime+d); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d+0.3); o.start(c.currentTime+d); o.stop(c.currentTime+d+0.32); });
    setTimeout(()=>{ try{ c.close(); }catch(e){} }, 1600);
  }catch(e){}
}
TW.beep = beep;

/* ---------- Haptics (watch-style buzz) ---------- */
const BUZZ = {step:[70], done:[80,60,80,60,80], hazard:[400,150,400,150,400], timer:[300,150,300], tap:[30]};
TW.buzz = function(kind){
  if(!LS.get("haptics", true) || !navigator.vibrate) return false;
  try{ return navigator.vibrate(BUZZ[kind]||BUZZ.tap); }catch(e){ return false; }
};

/* ---------- Gemini (optional) ---------- */
const GEMINI_URL = TW.GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
TW.hasKey = () => !!LS.get("apiKey","");
function gErr(code, status){ const e=new Error(code); e.code=code; e.status=status||0; return e; }
const sleep = ms => new Promise(r=>setTimeout(r, ms));
/* Text (and optional image) -> model text. Retries 429/5xx/network with back-off. */
TW.gemini = async function(parts, o){
  o = o || {};
  const key = LS.get("apiKey","");
  if(!key) throw gErr("nokey");
  if(navigator.onLine === false) throw gErr("offline");
  if(typeof parts === "string") parts = [{text:parts}];
  const retries = o.retries==null ? 2 : o.retries;
  const gen = {temperature:o.temperature==null?0.4:o.temperature, thinkingConfig:{thinkingBudget:0}};
  if(o.json!==false) gen.responseMimeType = "application/json";
  if(o.maxTokens) gen.maxOutputTokens = o.maxTokens;
  let wait = 1500;
  for(let attempt=0; attempt<=retries; attempt++){
    const ctl = new AbortController(), to = setTimeout(()=>ctl.abort(), o.timeout||25000);
    try{
      const r = await fetch(GEMINI_URL, {method:"POST", signal:ctl.signal, headers:{"Content-Type":"application/json","x-goog-api-key":key},
        body: JSON.stringify({contents:[{parts}], generationConfig:gen})});
      if(!r.ok){
        if(r.status===400 || r.status===401 || r.status===403) throw gErr("badkey", r.status);
        if((r.status===429 || r.status>=500) && attempt<retries){ await sleep(wait); wait*=2; continue; }
        throw gErr(r.status===429 ? "busy" : "server", r.status);
      }
      const j = await r.json();
      const txt = ((((j.candidates||[])[0]||{}).content||{}).parts||[]).map(p=>p.text||"").join("");
      if(!txt) throw gErr("empty");
      return txt;
    }catch(e){
      if(e.code) throw e;
      if(attempt<retries){ await sleep(wait); wait*=2; continue; }
      throw gErr(e.name==="AbortError" ? "timeout" : "network");
    }finally{ clearTimeout(to); }
  }
  throw gErr("network");
};
TW.geminiMsg = function(e){
  const c = e && e.code;
  return c==="nokey" ? "Add a free Gemini key in Settings for AI help." :
    c==="offline" ? "You're offline. Using built-in help." :
    c==="badkey" ? "Your Gemini key didn't work. Check it in Settings." :
    c==="busy" ? "AI is busy right now (free limit). Using built-in help." :
    c==="timeout" ? "AI took too long. Using built-in help." :
    "AI didn't answer. Using built-in help.";
};
TW.parseJSON = function(txt){
  txt = String(txt||"").replace(/^\s*```(json)?/i,"").replace(/```\s*$/,"").trim();
  try{ return JSON.parse(txt); }catch(e){}
  const m = /\[[\s\S]*\]|\{[\s\S]*\}/.exec(txt); if(!m) throw new Error("bad json");
  return JSON.parse(m[0]);
};

/* ---------- Navigation ---------- */
const TABS = ["today","pick","rise","hire","coach","devices"];
const SCREENS = TABS.concat(["run","done","jobDone","paid","history","settings"]);
const FOCUS = ["run","done","jobDone","paid"];
let curTab = LS.get("lastTab", "today"); if(!TABS.includes(curTab)) curTab = "today";
TW.curScreen = curTab;
const renderers = TW.renderers = {};
function rerender(s){ const f = renderers[s]; if(f){ try{ f(); }catch(e){ console.warn(e); } } }
function show(s){
  SCREENS.forEach(x => { const el=$(x); if(el) el.classList.toggle("hidden", x!==s); });
  TW.curScreen = s;
  if(TABS.includes(s)){ curTab = s; LS.set("lastTab", s); }
  document.body.classList.toggle("focus", FOCUS.includes(s));
  document.querySelectorAll("#tabbar button").forEach(b=>{ const on=b.dataset.tab===curTab && TABS.includes(s); b.classList.toggle("on", on); b.setAttribute("aria-current", on?"page":"false"); });
  window.scrollTo(0,0);
  if(TW.coach) TW.coach.onScreen(s);
  rerender(s);
}
TW.show = show;
TW.tab = name => show(TABS.includes(name)? name : "today");
TW.getTab = () => curTab;
document.querySelectorAll("#tabbar button").forEach(b=> b.onclick = ()=> show(b.dataset.tab));
document.addEventListener("click", e=>{ const g = e.target.closest("[data-goto]"); if(g){ show(g.dataset.goto); } });

/* ---------- Sheet (bottom panel) ---------- */
TW.sheet = function(title, html){
  $("sheetTitle").textContent = title; $("sheetBody").innerHTML = html;
  $("sheet").classList.remove("hidden"); $("sheetBg").classList.remove("hidden");
  setTimeout(()=>$("sheetClose").focus(), 50);
};
TW.closeSheet = function(){ $("sheet").classList.add("hidden"); $("sheetBg").classList.add("hidden"); };
$("sheetClose").onclick = $("sheetBg").onclick = TW.closeSheet;
document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ TW.closeSheet(); closeWatch(); } });
TW.celebrate = function(title, text){
  $("celebrateT").textContent = title; $("celebrateP").textContent = text||"";
  $("celebrate").classList.remove("hidden"); TW.buzz("done"); speak(title+". "+(text||""), null, {lang:TW.lang});
};
$("celebrateOk").onclick = ()=> $("celebrate").classList.add("hidden");

/* ---------- Pick and Start ---------- */
const TEMPLATES = TW.TEMPLATES;
TW.getTemplate = id => TEMPLATES.find(x=>x.id===id) || null;
let cat = "all", query = "", selected = null;
function renderCats(){
  $("catChips").innerHTML = TW.CATEGORIES.map(c=>`<button role="tab" data-cat="${c.id}" class="${c.id===cat?"on":""}" aria-selected="${c.id===cat}">${c.icon} ${esc(t("cat_"+c.id))}</button>`).join("");
  $("catChips").querySelectorAll("button").forEach(b=> b.onclick = ()=>{ cat=b.dataset.cat; renderCats(); renderGoals(); });
}
function renderGoals(){
  const q = query.toLowerCase().trim();
  const list = TEMPLATES.filter(g => (cat==="all" || g.cat===cat) && (!q || (g.name+" "+g.cat+" "+g.steps.join(" ")).toLowerCase().includes(q)));
  $("goals").innerHTML = list.map(g=>{
    const hasCam = g.steps.some(s=>/\{cam\}/.test(s)), hasSafety = g.steps.some(s=>/\{!/.test(s));
    return `<button class="goal${selected&&selected.id===g.id?" sel":""}" data-id="${g.id}"><span class="ic" aria-hidden="true">${g.icon}</span>${esc(g.name)}<span class="n">${g.steps.length} ${esc(t("steps_word"))}${hasCam?" \u00b7 \u{1F4F7}":""}${hasSafety?" \u00b7 \u26A0":""}</span></button>`;
  }).join("");
  $("noMatch").classList.toggle("hidden", list.length>0);
  $("goals").querySelectorAll(".goal").forEach(b=>b.onclick=()=>{
    const g = TW.getTemplate(b.dataset.id);
    choose({id:g.id, name:g.name, steps:g.steps});
    $("goals").querySelectorAll(".goal").forEach(x=>x.classList.toggle("sel", x===b));
  });
}
function choose(goal, quiet){
  selected = goal;
  $("chosen").textContent = `${goal.name} \u2014 ${goal.steps.length} ${t("steps_word")}. ${t("press_start")}`;
  $("btnStart").disabled = false;
  if(!quiet) TW.buzz("tap");
}
TW.selectGoal = function(id){ const g = TW.getTemplate(id); if(!g) return false; cat="all"; query=""; $("goalSearch").value=""; renderCats(); choose({id:g.id,name:g.name,steps:g.steps}, true); renderGoals(); return true; };
/* Open a guide from anywhere. autoStart = start it right away. */
TW.openGuide = function(id, autoStart, from){
  if(!TW.selectGoal(id)) return;
  if(autoStart){ startGoal(from || curTab); }
  else { show("pick"); const b=document.querySelector(`.goal[data-id="${id}"]`); if(b) b.scrollIntoView({block:"center"}); }
};
function scaffold(goal){
  return [
    `Your goal: ${goal}. Take a slow breath. You only need to do one step at a time.`,
    `Think about what "done" looks like for ${goal}. Picture it clearly.`,
    "Clear a space and remove distractions. Put your phone on do not disturb if you can.",
    "Gather everything you need: tools, supplies, papers, or information.",
    "Break the goal into three small parts. Say them out loud or write them down.",
    "Do the first small part now. Take about 10 minutes. {t:10}",
    "Do the second small part. About 10 minutes. {t:10}",
    "Do the third small part. About 10 minutes. {t:10}",
    "Check your work. Is anything missing or not quite right? Fix it. {cam}",
    "Clean up and put things away.",
    `Finish: ${goal} is done. Be proud of yourself.`
  ];
}
TW.scaffold = scaffold;
function parseTimerFromText(s){
  const m = /(\d+)\s*(minutes?|mins?|seconds?|secs?|hours?|hrs?|minutos?|segundos?|horas?)\b/i.exec(s);
  if(!m) return 0;
  const n = parseInt(m[1],10), u=m[2].toLowerCase();
  if(u.startsWith("s")) return n;
  if(u.startsWith("h")) return n*3600;
  return n*60;
}
async function aiSteps(goal){
  const es = TW.lang==="es";
  const prompt = `Break this goal into 8 to 15 short, practical, safe steps that a person can follow one at a time while listening to them read aloud. Goal: "${goal}". Each step is one clear instruction under 25 words, in plain simple ${es?"Spanish":"English"} for someone who may not read well. If a step involves waiting a set time, include the time like "10 minutes". If a step has a real safety risk, add a short safety warning. Mark steps where a camera could check the work.
Reply with ONLY a JSON array of objects: [{"step":"...","safety":"" ,"camera":true|false}]`;
  const txt = await TW.gemini(prompt, {temperature:0.4});
  let arr = TW.parseJSON(txt);
  if(!Array.isArray(arr)) arr = arr.steps || [];
  arr = arr.map(s=>{
    if(typeof s==="string") return {t:s.trim(), timer:parseTimerFromText(s), safety:"", cam:false};
    const txt = String(s.step||s.text||"").trim();
    return {t:txt, timer:parseTimerFromText(txt), safety:String(s.safety||"").trim(), cam:!!(s.camera||s.cam)};
  }).filter(s=>s.t).slice(0,20);
  if(arr.length < 3) throw new Error("too few steps");
  return arr;
}
TW.aiSteps = aiSteps;
async function makeCustom(){
  const goal = $("customGoal").value.trim();
  if(!goal){ toast("Type a goal first."); return; }
  $("goals").querySelectorAll(".goal").forEach(x=>x.classList.remove("sel"));
  const exact = TEMPLATES.find(g=>g.name.toLowerCase()===goal.toLowerCase());
  if(exact){ choose({id:exact.id, name:exact.name, steps:exact.steps}); return; }
  if(TW.hasKey() && navigator.onLine !== false){
    $("chosen").textContent = "Making your steps...";
    $("btnStart").disabled = true;
    try{ const steps = await aiSteps(goal); choose({id:"custom", name:goal, steps}); return; }
    catch(e){ toast(e.code ? TW.geminiMsg(e) : "AI didn't answer, so here's a simple plan instead."); }
  }
  choose({id:"custom", name:goal, steps:scaffold(goal)});
}

/* ---------- Step player ---------- */
let run = null; // {name, steps[], i, paused, jobId, verified:Set, from}
let lastFrom = "pick";
TW.getRun = () => run;
function stepObj(i){ return run.steps[i]; }
TW.stepObj = stepObj;
function startGoal(from){
  if(!selected) return;
  TW.startRun({name:selected.name, steps:selected.steps, from: typeof from==="string" ? from : curTab});
}
/* Start any step list. opts: {name, steps, from, jobId} */
TW.startRun = function(opts){
  run = {name:opts.name, steps:opts.steps.map(TW.parseStep), i:0, paused:false, jobId:opts.jobId||null, verified:new Set(), from:opts.from||curTab, started:Date.now(), meta:opts.meta||null};
  lastFrom = run.from;
  $("runTitle").textContent = run.name;
  const jb = $("jobBanner");
  if(run.jobId && TW.hire){ jb.innerHTML = TW.hire.bannerHtml(run.jobId); jb.classList.remove("hidden"); } else jb.classList.add("hidden");
  show("run");
  if(wantMic) startMic();
  renderStep(true);
  if(run.jobId && TW.hire) TW.hire.onJobStart(run);
};
function renderStep(say){
  const n = run.steps.length, s = stepObj(run.i);
  $("stepNum").textContent = t("step_of", {a:run.i+1, b:n});
  $("stepText").textContent = s.t;
  const sn = $("safetyNote"); sn.textContent = s.safety ? "\u26A0 "+s.safety : ""; sn.classList.toggle("hidden", !s.safety);
  $("camBadge").classList.toggle("hidden", !s.cam);
  $("progBar").style.width = (run.i/n*100)+"%";
  $("btnBack").disabled = run.i===0;
  $("btnNext").innerHTML = run.i===n-1 ? esc(t("finish"))+" &#10003;" : esc(t("next"))+" &#9654;";
  $("btnRepeat").innerHTML = "&#8635; "+esc(t("repeat"));
  $("btnBack").innerHTML = "&#9664; "+esc(t("back"));
  $("btnSkip").innerHTML = esc(t("skip"))+" &#9197;";
  setupTimer(s.timer||0);
  setPaused(false);
  if(say){ speak(`Step ${run.i+1}. ${s.t}` + (s.safety ? ` Careful: ${s.safety}` : ""), null, {lang:"en"}); TW.buzz("step"); }
  $("btnDoneOffer").classList.add("hidden");
  const cam = TW.coach && TW.coach.cam;
  if(cam && cam.stream){ cam.nextAt = Date.now() + (cam.interval+2)*1000; $("coachLine").textContent=""; }
  renderWatch();
}
function next(){
  if(!run) return;
  if(run.jobId && TW.hire) TW.hire.logStep(run, run.i);
  if(run.i < run.steps.length-1){ run.i++; renderStep(true); } else finish();
}
function back(){ if(!run || run.i===0) return; run.i--; renderStep(true); }
function repeat(){ if(!run) return; setPaused(false); const s=stepObj(run.i); speak(s.t + (s.safety? " Careful: "+s.safety : ""), null, {lang:"en"}); }
function skip(){ if(!run) return; toast(t("skip")); next(); }
function setPaused(p){
  if(!run) return;
  run.paused = p;
  $("btnPause").innerHTML = p ? "&#9654; "+esc(t("resume")) : "&#10074;&#10074; "+esc(t("pause"));
  if(p){ if(synth) synth.cancel(); if(timer.running) pauseTimer(); }
}
function togglePause(){ if(!run) return; const p=!run.paused; setPaused(p); if(!p) speak("Okay. "+stepObj(run.i).t, null, {lang:"en"}); }
function exitRun(){
  if(synth) synth.cancel(); stopTimer(); stopMic();
  const from = run ? run.from : lastFrom; run=null; closeWatch(); show(TABS.includes(from)? from : "pick");
}
TW.next = next; TW.back = back;

/* ---------- Timer ---------- */
const timer = {total:0, left:0, running:false, h:null, end:0};
function fmt(s){ const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h? h+":"+String(m).padStart(2,"0") : m)+":"+String(x).padStart(2,"0"); }
function setupTimer(sec){
  stopTimer();
  timer.total = timer.left = sec;
  $("timerBox").classList.toggle("hidden", !sec);
  $("timerT").textContent = fmt(sec);
  $("btnTimer").textContent = "Start timer";
}
function tick(){
  timer.left = Math.max(0, Math.round((timer.end - Date.now())/1000));
  $("timerT").textContent = fmt(timer.left);
  if(timer.left<=0){
    stopTimer(); $("btnTimer").textContent="Start timer";
    beep(); speak("Time's up. " + (run? "When you're ready, say next." : ""), null, {lang:"en"});
    toast("Time's up!"); TW.buzz("timer");
  }
}
function startTimer(){ if(!timer.left) timer.left=timer.total; timer.end=Date.now()+timer.left*1000; timer.running=true; clearInterval(timer.h); timer.h=setInterval(tick,250); $("btnTimer").textContent="Pause timer"; speak("Timer started.", null, {lang:"en"}); }
function pauseTimer(){ timer.running=false; clearInterval(timer.h); $("btnTimer").textContent="Resume timer"; }
function stopTimer(){ timer.running=false; clearInterval(timer.h); }

/* ---------- Voice commands ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let rec = null, wantMic = false, micOn = false;
function setMicStatus(s){ $("micStatus").textContent = s; }
function startMic(){
  if(!SR){ setMicStatus("Voice commands need Chrome. Use the buttons."); wantMic=false; return; }
  wantMic = true;
  if(micOn) return;
  try{
    rec = new SR(); rec.lang = TW.lang==="es" ? "es-US" : "en-US"; rec.continuous=true; rec.interimResults=false;
    rec.onresult = e => {
      const said = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
      if(speaking) return; // ignore our own voice
      const C = TW.coach;
      if(/\b(what do you see|check this|check it|look at this|ask the coach|how am i doing|am i doing (it|this) right|qu[eé] ves)\b/.test(said)) { if(C) C.askCoach(); return; }
      if(/\b(stop camera|camera off)\b/.test(said)) { if(C) C.stopCamera(); return; }
      if(/\b(camera on|start camera|camera coach)\b/.test(said)) { if(C) C.startCamera(); return; }
      if(/\b(next|done|okay next|go on|siguiente|listo)\b/.test(said)) next();
      else if(/\b(repeat|again|say that again|what|repite|otra vez)\b/.test(said)) repeat();
      else if(/\b(back|previous|go back|atr[aá]s)\b/.test(said)) back();
      else if(/\b(skip|salta)\b/.test(said)) skip();
      else if(/\b(pause|stop|wait|pausa|espera)\b/.test(said)) setPaused(true);
      else if(/\b(resume|continue|sigue)\b/.test(said)) togglePause();
      else if(/\b(start timer|timer)\b/.test(said)) { if(timer.total) startTimer(); }
    };
    rec.onstart = () => { micOn=true; setMicStatus("Listening: say next, repeat, back, or what do you see"); $("btnMic").innerHTML="&#127908; Stop"; };
    rec.onerror = e => { if(e.error==="not-allowed"||e.error==="service-not-allowed"){ wantMic=false; setMicStatus("Microphone blocked. Use the buttons."); } };
    rec.onend = () => { micOn=false; if(wantMic && run){ setTimeout(()=>{ try{ rec.start(); }catch(e){} },300); } else { setMicStatus("Voice commands off"); $("btnMic").innerHTML="&#127908; Voice"; } };
    rec.start();
  }catch(e){ setMicStatus("Voice commands not available. Use the buttons."); wantMic=false; }
}
function stopMic(){ wantMic=false; if(rec){ try{ rec.stop(); }catch(e){} } }

/* ---------- History & streak ---------- */
function streak(){
  const days = new Set(LS.get("history",[]).map(h=>TW.dayKey(h.date)));
  let d = new Date(), s = 0;
  if(!days.has(TW.dayKey(d))) d.setDate(d.getDate()-1);
  while(days.has(TW.dayKey(d))){ s++; d.setDate(d.getDate()-1); }
  return s;
}
TW.streak = streak;
function refreshStats(){
  const h = LS.get("history",[]), s = streak();
  $("streak").textContent = $("streak2").textContent = s;
  $("totalDone").textContent = $("totalDone2").textContent = h.length;
}
TW.refreshStats = refreshStats;
TW.addHistory = function(name, steps, kind){
  const h = LS.get("history",[]);
  h.unshift({name, date:new Date().toISOString(), steps, kind:kind||"guide"});
  LS.set("history", h.slice(0,500)); refreshStats();
};
function finish(){
  stopTimer(); stopMic(); if(TW.coach) TW.coach.stopCamera(true);
  $("progBar").style.width="100%";
  TW.buzz("done"); closeWatch();
  const r = run; run = null;
  if(r.jobId && TW.hire){ TW.hire.onJobFinish(r); return; }
  TW.addHistory(r.name, r.steps.length, "guide");
  if(TW.life) TW.life.onGuideDone(r.name);
  (TW.finishHooks||[]).forEach(f=>{ try{ f(r); }catch(e){ console.warn(e); } });
  const s = streak();
  $("doneMsg").textContent = `${r.name} \u2014 finished. ` + (s>1? `That's ${s} days in a row.` : "Day 1 of your streak. Come back tomorrow to keep it going.");
  speak(`You did it. ${r.name} is done. Great work.`, null, {lang:"en"});
  show("done");
}
function renderHistory(){
  const h = LS.get("history",[]);
  $("histList").innerHTML = h.length ? h.map(x=>`<li><span>${x.kind==="job"?"\u{1F91D} ":""}${esc(x.name)}</span><span>${new Date(x.date).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</span></li>`).join("")
    : '<li><span class="small">No finished goals yet. Pick one and press Start.</span></li>';
}

/* ---------- Watch view / Glasses HUD ---------- */
let watchOn = false;
function openWatch(hud){
  watchOn = true; const w=$("watchView"); w.classList.toggle("hud", !!hud); w.classList.remove("hidden");
  renderWatch(); TW.buzz("tap");
}
function closeWatch(){ watchOn=false; $("watchView").classList.add("hidden"); }
function renderWatch(){
  if(!watchOn) return;
  if(run){
    const s = stepObj(run.i);
    $("wNum").textContent = t("step_of",{a:run.i+1,b:run.steps.length}) + " \u00b7 " + run.name;
    $("wStep").textContent = s.t + (s.safety ? "  \u26A0 "+s.safety : "");
    $("wNext").innerHTML = (run.i===run.steps.length-1 ? esc(t("finish"))+" &#10003;" : esc(t("next"))+" &#9654;");
    $("wBack").disabled = run.i===0;
  } else {
    const it = TW.life && TW.life.nowItem();
    $("wNum").textContent = it ? t("now_is")+" \u00b7 "+it.time : t("what_now");
    $("wStep").textContent = it ? it.title : t("nothing_now");
    $("wNext").innerHTML = it ? (it.guide ? esc(t("start_guide"))+" &#9654;" : esc(t("done"))+" &#10003;") : "OK";
    $("wBack").disabled = true;
  }
}
TW.openWatch = openWatch; TW.closeWatch = closeWatch;
$("wClose").onclick = closeWatch;
$("wBack").onclick = ()=>{ if(run) back(); };
$("wNext").onclick = ()=>{
  if(run){ next(); return; }
  const it = TW.life && TW.life.nowItem();
  if(!it){ closeWatch(); return; }
  if(it.guide){ TW.openGuide(it.guide, true, "today"); openWatch($("watchView").classList.contains("hud")); }
  else { TW.life.markDone(it.id, true); renderWatch(); }
};
$("btnWatch").onclick = ()=> openWatch(false);
$("btnWatchView").onclick = ()=> openWatch(false);
$("btnHudView").onclick = ()=> openWatch(true);

/* ---------- Devices tab ---------- */
renderers.devices = function(){
  $("hapticsOn").checked = LS.get("haptics", true);
  const wl = LS.get("waitlist", null);
  $("wlNote").textContent = wl ? `You're on the list, ${wl.name}. Saved on this phone only \u2014 nothing was sent.` : "Saved on this phone only. Nothing is sent or charged.";
};
$("hapticsOn").onchange = e=>{ LS.set("haptics", e.target.checked); if(e.target.checked) TW.buzz("step"); };
$("btnTestBuzz").onclick = ()=>{ const ok = TW.buzz("done"); toast(navigator.vibrate ? (ok===false && LS.get("haptics",true) ? "Your phone didn't buzz. Check that vibration is on." : (LS.get("haptics",true)? "Bzz bzz bzz." : "Buzz is off.")) : "This device can't buzz."); };
$("btnWaitlist").onclick = ()=>{
  const name = $("wlName").value.trim();
  if(!name){ toast("Type your name first."); $("wlName").focus(); return; }
  LS.set("waitlist", {name, contact:$("wlContact").value.trim(), date:new Date().toISOString()});
  renderers.devices(); toast("You're on the waitlist (saved on this phone).");
};

/* ---------- Settings ---------- */
function openSettings(){
  fillVoices(); $("rate").value=rate; $("rateVal").textContent=rate; $("apiKey").value=LS.get("apiKey","");
  const cam = TW.coach.cam;
  $("coachOn").checked=cam.coachOn; $("autoAdv").checked=cam.autoAdv; $("camInt").value=cam.interval; $("camIntVal").textContent=cam.interval;
  $("langSel").value = TW.lang; $("largeText").checked = LS.get("largeText", false);
  $("autonomySel").value = LS.get("autonomy","suggest");
  $("notifNote").textContent = !("Notification" in window) ? "This browser can't show reminders. The app will speak them while it's open." :
    Notification.permission==="granted" ? "Reminders are allowed. They show while Temperward is open or running in the background." :
    Notification.permission==="denied" ? "Reminders are blocked. Allow notifications for this site in Chrome settings." : "Tap to allow reminder pop-ups.";
  $("verNote").textContent = "Version "+VERSION;
  show("settings");
}
$("btnSettings").onclick = openSettings;
$("btnHistory").onclick = ()=>{ renderHistory(); show("history"); };
document.querySelectorAll("[data-home]").forEach(b=>b.onclick=()=>{ refreshStats(); show(curTab); });
$("btnClearHist").onclick = ()=>{ if(confirm("Clear all history?")){ LS.set("history",[]); renderHistory(); refreshStats(); } };
$("rate").oninput = e=>{ rate=parseFloat(e.target.value); $("rateVal").textContent=rate; LS.set("rate",rate); };
$("voiceSel").onchange = e=>{ voiceName=e.target.value; LS.set("voice",voiceName); };
$("btnTestVoice").onclick = ()=> speak(TW.lang==="es" ? "Hola. Soy Temperward. Elige, presiona empezar, y solo sigue los pasos." : "Hi. I'm Temperward. Pick it, press start, and just follow along.", null, {lang:TW.lang});
$("btnSaveKey").onclick = ()=>{ LS.set("apiKey",$("apiKey").value.trim()); TW.coach.cam.badKey=false; TW.coach.refresh(); toast("Key saved on this device."); };
$("btnClearKey").onclick = ()=>{ LS.set("apiKey",""); $("apiKey").value=""; TW.coach.refresh(); toast("Key removed."); };
$("langSel").onchange = e=> setLang(e.target.value);
function applyLarge(){ document.documentElement.classList.toggle("lt", !!LS.get("largeText", false)); }
$("largeText").onchange = e=>{ LS.set("largeText", e.target.checked); applyLarge(); };
$("autonomySel").onchange = e=>{ LS.set("autonomy", e.target.value); if(TW.life) TW.life.setAutonomy(e.target.value); };
$("btnNotif").onclick = async ()=>{
  if(!("Notification" in window)){ toast("This browser can't show reminders."); return; }
  try{ const p = await Notification.requestPermission(); toast(p==="granted" ? "Reminders allowed." : "Reminders not allowed."); if(TW.life) TW.life.scheduleReminders(); }catch(e){}
  openSettings();
};

/* ---------- Backup: export / import / reset ---------- */
function collect(includeKey){
  const data = {};
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(!k || !k.startsWith("tw_")) continue;
    if(k==="tw_apiKey" && !includeKey) continue;
    try{ data[k.slice(3)] = JSON.parse(localStorage.getItem(k)); }catch(e){}
  }
  return {app:"temperward", version:VERSION, exported:new Date().toISOString(), data};
}
TW.exportData = collect;
$("btnExport").onclick = ()=>{
  const json = JSON.stringify(collect($("exportKey").checked), null, 1);
  const blob = new Blob([json], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "temperward-backup-"+TW.dayKey()+".json";
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast("Backup saved to your Downloads.");
};
TW.importData = function(obj){
  if(!obj || obj.app!=="temperward" || typeof obj.data!=="object") throw new Error("not a Temperward backup");
  Object.keys(localStorage).filter(k=>k.startsWith("tw_") && k!=="tw_apiKey").forEach(k=>localStorage.removeItem(k));
  Object.entries(obj.data).forEach(([k,v])=>{ if(/^[\w-]+$/.test(k)) LS.set(k, v); });
};
$("importFile").onchange = e=>{
  const f = e.target.files && e.target.files[0]; if(!f) return;
  const rd = new FileReader();
  rd.onload = ()=>{
    try{
      const obj = JSON.parse(rd.result);
      if(!confirm("Replace the data on this phone with this backup?")) return;
      TW.importData(obj); toast("Backup loaded. Restarting...");
      setTimeout(()=>location.reload(), 700);
    }catch(err){ toast("That file isn't a Temperward backup."); }
    e.target.value = "";
  };
  rd.readAsText(f);
};
$("btnReset").onclick = ()=>{
  if(!confirm("Erase ALL Temperward data on this phone? Export a backup first if you want to keep it.")) return;
  Object.keys(localStorage).filter(k=>k.startsWith("tw_")).forEach(k=>localStorage.removeItem(k));
  toast("Erased. Restarting..."); setTimeout(()=>location.reload(), 600);
};

/* ---------- Wire up player ---------- */
$("goalSearch").addEventListener("input", e=>{ query=e.target.value; renderGoals(); });
$("btnStart").onclick = ()=> startGoal();
$("btnMake").onclick = makeCustom;
$("customGoal").addEventListener("keydown", e=>{ if(e.key==="Enter") makeCustom(); });
$("btnNext").onclick = next; $("btnBack").onclick = back; $("btnRepeat").onclick = repeat;
$("btnPause").onclick = togglePause; $("btnSkip").onclick = skip; $("btnExit").onclick = exitRun;
$("btnTimer").onclick = ()=> timer.running ? pauseTimer() : startTimer();
$("btnTimerReset").onclick = ()=> setupTimer(timer.total);
$("btnMic").onclick = ()=> (wantMic||micOn) ? stopMic() : startMic();
$("btnMute").onclick = ()=>{ muted=!muted; LS.set("muted",muted); if(muted&&synth) synth.cancel(); $("btnMute").innerHTML = muted? "&#128263;" : "&#128266;"; };
$("btnMute").innerHTML = muted? "&#128263;" : "&#128266;";
$("btnHome").onclick = ()=>{ refreshStats(); show(TABS.includes(lastFrom)? lastFrom : "pick"); };
document.addEventListener("keydown", e=>{ if(!run || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || TW.curScreen!=="run") return; if(e.key==="ArrowRight"||e.key===" ") {e.preventDefault(); next();} else if(e.key==="ArrowLeft") back(); else if(e.key==="r") repeat(); });
renderers.pick = ()=>{ refreshStats(); };

/* ---------- Online / PWA ---------- */
function netBadge(){ $("offlineBadge").classList.toggle("hidden", navigator.onLine!==false); }
window.addEventListener("online", netBadge); window.addEventListener("offline", netBadge);
TW.swReady = null;
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
  TW.swReady = navigator.serviceWorker.register("sw.js").catch(e=>{ console.warn("SW", e); return null; });
}

/* ---------- Boot (after all modules loaded) ---------- */
window.addEventListener("DOMContentLoaded", ()=>{
  applyLarge(); TW.applyI18n(); renderCats(); renderGoals(); refreshStats(); netBadge();
  if(TW.coach) TW.coach.refresh();
  show(curTab);
});
})();
