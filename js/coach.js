/* Camera Coach (live AI coaching from camera frames) + Earbud/Speaker modes + "Say to someone". */
(function(){
"use strict";
const TW = window.TW, LS = TW.LS, $ = TW.$, toast = TW.toast, speak = TW.speak, synth = TW.synth;
const run = () => TW.getRun();
const next = () => TW.next();

const cam = {
  stream:null, facing:LS.get("camFacing","environment"), onScreen:"pick",
  coachOn:LS.get("coachOn", true), autoAdv:LS.get("autoAdv", true), interval:LS.get("camInt", 4),
  loop:null, inFlight:false, nextAt:0, backoff:0, badKey:false, lastSaid:"", history:[], advancing:false, hazardH:null, lastFrame:null
};
const SLOTS = {pick:"camSlotHome", run:"camSlotRun", coach:"camSlotCoach"};
const canvas = document.createElement("canvas");
const hasKey = TW.hasKey;
function liveCoaching(){ return cam.coachOn && hasKey() && !cam.badKey; }
function camNote(t){ const n=$("coachNote"); n.textContent=t||""; n.classList.toggle("hidden", !t); }
function camRefreshMode(){
  const live = liveCoaching(), m=$("coachMode");
  m.classList.toggle("live", live);
  m.textContent = live ? "Live coaching \u2022 every "+cam.interval+"s" : "Mirror mode";
  if(cam.badKey) camNote("Your Gemini key didn't work. Check it in Settings. Camera still works as a mirror.");
  else if(!hasKey()) camNote("Hands-free view. Live coaching needs a free Gemini API key (Settings \u2192 AI steps). Get one at aistudio.google.com.");
  else if(!cam.coachOn) camNote("Live coaching is off in Settings. Nothing is sent anywhere.");
  else if(!cam.backoff) camNote("");
  $("btnAsk").disabled = !live;
  ["btnCamHome","btnCamRun","btnCamCoach"].forEach(id=>{ const b=$(id); if(!b) return; b.classList.toggle("on", !!cam.stream); b.innerHTML = cam.stream ? "&#9632; Stop Camera Coach" : "&#128247; Camera Coach"; });
  $("outTag").textContent = TW.outMode==="speaker" ? "\u{1F4E2} Speaker" : "\u{1F3A7} Earbud";
}
function camOnScreen(s){
  cam.onScreen = s;
  const p=$("camPanel");
  if(SLOTS[s]) $(SLOTS[s]).appendChild(p);
  else if(cam.stream) stopCamera(true); // never leave the camera running out of sight
  p.classList.toggle("hidden", !cam.stream || !SLOTS[s]);
}
async function startCamera(){
  if(cam.stream) return;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast(window.isSecureContext===false ? "Camera needs a secure https link (or localhost)." : "This browser can't use the camera.");
    return;
  }
  try{
    cam.stream = await navigator.mediaDevices.getUserMedia({audio:false, video:{facingMode:{ideal:cam.facing}, width:{ideal:1280}, height:{ideal:720}}});
  }catch(e){
    cam.stream = null;
    const n = e && e.name;
    toast(n==="NotAllowedError" ? "Camera blocked. Allow the camera for this site in Chrome settings." :
          n==="NotFoundError" || n==="OverconstrainedError" ? "No camera found." : "Couldn't start the camera.");
    camRefreshMode(); return;
  }
  const v=$("camVideo"); v.srcObject=cam.stream; v.classList.toggle("mirror", cam.facing==="user");
  try{ await v.play(); }catch(e){}
  cam.lastSaid=""; cam.history=[]; cam.backoff=0; cam.nextAt=Date.now()+1500;
  $("hazardBanner").classList.add("hidden"); $("btnDoneOffer").classList.add("hidden"); $("coachLine").textContent="";
  camOnScreen(run() ? "run" : (SLOTS[TW.curScreen] ? TW.curScreen : "pick"));
  camRefreshMode();
  clearInterval(cam.loop); cam.loop=setInterval(camTick, 500);
  if(liveCoaching()) speak(run() ? "Camera coach is on. Show me what you're doing." : "Camera coach is on.", null, {lang:"en"});
  else toast("Camera on. Live coaching needs a free Gemini key.");
}
function stopCamera(silent){
  clearInterval(cam.loop); cam.loop=null;
  if(cam.stream){ cam.stream.getTracks().forEach(t=>t.stop()); }
  cam.stream=null; cam.inFlight=false;
  const v=$("camVideo"); v.pause(); v.srcObject=null;
  $("camPanel").classList.add("hidden"); $("camThinking").classList.add("hidden");
  camRefreshMode();
  if(!silent) toast("Camera off.");
}
async function flipCamera(){
  cam.facing = cam.facing==="environment" ? "user" : "environment"; LS.set("camFacing", cam.facing);
  if(cam.stream){ stopCamera(true); await startCamera(); }
}
function camTick(){
  if(!cam.stream || !liveCoaching() || cam.inFlight || cam.advancing) return;
  const r = run();
  if(document.hidden || (r && r.paused) || !SLOTS[cam.onScreen]) return;
  if(Date.now() < cam.nextAt) return;
  checkFrame(false);
}
/* Returns base64 JPEG (max 640 wide). Frame is not kept unless keep=true (used for proof photos). */
function grabFrame(keep){
  const v=$("camVideo"); const w=v.videoWidth, h=v.videoHeight;
  if(!w || !h) return null;
  const W=Math.min(640,w), H=Math.round(h*W/w);
  canvas.width=W; canvas.height=H;
  const c=canvas.getContext("2d"); c.drawImage(v,0,0,W,H);
  const url=canvas.toDataURL("image/jpeg",0.7);
  c.clearRect(0,0,W,H);
  return keep ? url : url.split(",")[1];
}
function coachPrompt(asked){
  const r = run();
  const goal = r ? r.name : "No goal running. The person just wants a helper looking at what they're doing.";
  const s = r ? TW.stepObj(r.i) : null;
  const step = r ? `Step ${r.i+1} of ${r.steps.length}: ${s.t}` : "(none)";
  const hist = cam.history.slice(-5).map(h=>"- "+h).join("\n") || "(nothing yet)";
  const lang = TW.lang==="es" ? "plain simple Spanish" : "plain simple English";
  const out = TW.outMode==="speaker" ? "You are speaking out loud through a speaker, so people nearby (maybe a customer) can hear. Stay polite and professional." : "You are talking privately in their earbud.";
  return `You are Temperward, a calm, friendly real-world job coach watching through the person's body or phone camera. ${out}
Goal: ${goal}
Current step: ${step}
${s && s.safety ? "Safety rule for this step: "+s.safety+"\n" : ""}${r && r.jobId ? "This is a paid job. The customer needs it done right.\n" : ""}What you said recently:
${hist}
${asked ? "The person just asked you to look and tell them what you see and how they're doing." : "This is a routine check."}
Look at the photo. Decide one status:
- "on_track": they're doing the current step fine or getting ready for it.
- "needs_fix": something is wrong or could be done better. Say exactly what to change.
- "step_done": the current step is clearly finished.
- "hazard": something dangerous (fire, smoke, knife or hand near blade, hot surface, person under a car, traffic, electrical, spill near power, child at risk). Say it first and plainly.
Write "say" as one short spoken line, 20 words or fewer, in ${lang}, no repeats of what you just said. If nothing new to say on a routine check, give a short encouraging cue.
Reply with ONLY JSON: {"status":"on_track|needs_fix|step_done|hazard","say":"..."}`;
}
function parseCoach(txt){
  txt = String(txt||"").replace(/^\s*```(json)?/i,"").replace(/```\s*$/,"").trim();
  let o;
  try{ o = JSON.parse(txt); }catch(e){ const m=/\{[\s\S]*\}/.exec(txt); if(!m) throw new Error("bad json"); o = JSON.parse(m[0]); }
  if(Array.isArray(o)) o=o[0]||{};
  const allowed=["on_track","needs_fix","step_done","hazard"];
  let status = String(o.status||"").toLowerCase().trim().replace(/[\s-]+/g,"_");
  if(!allowed.includes(status)) status="on_track";
  let say = String(o.say||"").replace(/\s+/g," ").trim();
  const words = say.split(" "); if(words.length>20) say = words.slice(0,20).join(" ").replace(/[,;:]$/,"")+".";
  return {status, say};
}
async function checkFrame(asked){
  if(!cam.stream){ toast("Turn on the camera first."); return; }
  if(!hasKey()){ speak("Live coaching needs a free Gemini key. Add it in settings.", null, {lang:"en"}); return; }
  if(cam.inFlight){ return; }
  const b64 = grabFrame();
  if(!b64){ cam.nextAt=Date.now()+1000; return; }
  const key=LS.get("apiKey",""), r0=run(), stepAt = r0 ? r0.i : -1;
  cam.inFlight=true; $("camThinking").classList.remove("hidden");
  const ctl=new AbortController(), to=setTimeout(()=>ctl.abort(), 20000);
  try{
    const r = await fetch(TW.GEMINI_URL, {method:"POST", signal:ctl.signal, headers:{"Content-Type":"application/json","x-goog-api-key":key},
      body: JSON.stringify({contents:[{parts:[{text:coachPrompt(asked)},{inline_data:{mime_type:"image/jpeg", data:b64}}]}],
        generationConfig:{temperature:0.3, maxOutputTokens:200, responseMimeType:"application/json", thinkingConfig:{thinkingBudget:0}}})});
    if(!r.ok){ const e=new Error("HTTP "+r.status); e.status=r.status; throw e; }
    const j = await r.json();
    const txt = ((((j.candidates||[])[0]||{}).content||{}).parts||[]).map(p=>p.text||"").join("");
    if(!txt) throw new Error("empty");
    const res = parseCoach(txt);
    cam.backoff=0; camNote("");
    if(!cam.stream) return;
    const r1 = run();
    handleCoach(res, asked, r0===r1 && (r1? r1.i:-1)===stepAt);
  }catch(e){
    const st=e.status||0;
    if(st===400 || st===401 || st===403){ cam.badKey=true; toast("Gemini key didn't work. Check it in Settings."); }
    else if(st===429){ cam.backoff=Math.min(120, cam.backoff? cam.backoff*2 : 20); camNote(`Coach is busy (free limit reached). Trying again in ${cam.backoff} seconds.`); }
    else if(e.name==="AbortError" || st===0 && e.message!=="empty" && e.message!=="bad json"){ cam.backoff=Math.min(60, cam.backoff? cam.backoff*2 : 10); camNote(navigator.onLine===false ? "No internet. Coaching paused, steps still work." : `Can't reach the coach. Trying again in ${cam.backoff} seconds.`); }
    else if(st>=500){ cam.backoff=Math.min(60, cam.backoff? cam.backoff*2 : 10); camNote(`Coach had a problem. Trying again in ${cam.backoff} seconds.`); }
    else { cam.backoff=Math.min(30, (cam.backoff||5)); camNote("Coach gave an unclear answer. Trying again."); }
    if(asked) toast("Coach couldn't answer right now.");
    camRefreshMode();
  }finally{
    clearTimeout(to); cam.inFlight=false; $("camThinking").classList.add("hidden");
    cam.nextAt = Date.now() + (cam.backoff ? cam.backoff : cam.interval)*1000 + (cam.advancing? 2000:0);
  }
}
function coachSay(text, urgent, onend){
  if(!text){ if(onend) onend(); return; }
  if(!urgent && text===cam.lastSaid){ if(onend) onend(); return; } // no back-to-back repeats
  if(!urgent && synth && (synth.speaking || TW.isSpeaking())){ if(onend) onend(); return; } // don't talk over anyone
  cam.lastSaid=text; cam.history.push(text); if(cam.history.length>10) cam.history.shift();
  speak(text, onend, {lang:TW.lang});
}
function handleCoach(res, asked, sameStep){
  const line=$("coachLine"), r=run();
  line.className="coachline "+(res.status==="hazard"?"":res.status); line.textContent=res.say;
  if(res.status==="hazard"){
    line.textContent="";
    const hb=$("hazardBanner"); hb.textContent="\u26A0 "+(res.say||"Careful! Stop and look."); hb.classList.remove("hidden");
    clearTimeout(cam.hazardH); cam.hazardH=setTimeout(()=>hb.classList.add("hidden"), 10000);
    TW.buzz("hazard");
    TW.beep(); coachSay(res.say||"Careful! Stop and look.", true);
    return;
  }
  if(res.status==="step_done" && r && sameStep){
    r.verified.add(r.i); // camera-verified step (used for Hands-for-Hire escrow)
    if(cam.autoAdv){
      cam.advancing=true;
      const sameStepIndex = r.i;
      const finishNext = ()=>{ cam.advancing=false; const r2=run(); if(r2 && r2===r && r2.i===sameStepIndex) next(); };
      coachSay((res.say||"Nice, that step's done.")+" Moving on.", true, finishNext);
    } else {
      $("btnDoneOffer").classList.remove("hidden");
      coachSay((res.say||"Looks done.")+" Say next when you're ready.", asked);
    }
    return;
  }
  coachSay(res.say, asked);
}
function askCoach(){
  if(!cam.stream){ startCamera().then(()=>{ if(cam.stream && liveCoaching()) setTimeout(()=>checkFrame(true), 1200); }); return; }
  if(!liveCoaching()){ speak(hasKey()? "Live coaching is off in settings." : "Live coaching needs a free Gemini key. Add it in settings.", null, {lang:"en"}); return; }
  if(cam.inFlight){ toast("Coach is already looking..."); return; }
  checkFrame(true);
}
const toggleCam = ()=> cam.stream ? stopCamera() : startCamera();
$("btnCamHome").onclick = $("btnCamRun").onclick = $("btnCamCoach").onclick = toggleCam;
$("btnCamStop").onclick = ()=> stopCamera();
$("btnFlip").onclick = flipCamera;
$("btnAsk").onclick = askCoach;
$("btnDoneOffer").onclick = ()=>{ $("btnDoneOffer").classList.add("hidden"); next(); };
$("hazardBanner").onclick = ()=> $("hazardBanner").classList.add("hidden");
$("coachOn").onchange = e=>{ cam.coachOn=e.target.checked; LS.set("coachOn",cam.coachOn); camRefreshMode(); };
$("autoAdv").onchange = e=>{ cam.autoAdv=e.target.checked; LS.set("autoAdv",cam.autoAdv); };
$("camInt").oninput = e=>{ cam.interval=Math.max(3,Math.min(10,parseInt(e.target.value,10)||4)); $("camIntVal").textContent=cam.interval; LS.set("camInt",cam.interval); camRefreshMode(); };
document.addEventListener("visibilitychange", ()=>{ if(!document.hidden && cam.stream) cam.nextAt=Date.now()+1000; });

/* ---------- Earbud / Speaker mode ---------- */
function setOut(m){
  TW.outMode = m==="speaker" ? "speaker" : "earbud"; LS.set("outMode", TW.outMode);
  document.querySelectorAll("#outMode button").forEach(b=>{ const on=b.dataset.out===TW.outMode; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
  $("outModeNote").textContent = TW.t(TW.outMode==="speaker" ? "speaker_d" : "earbud_d");
  camRefreshMode();
}
document.querySelectorAll("#outMode button").forEach(b=> b.onclick = ()=>{ setOut(b.dataset.out); TW.buzz("tap"); });

/* ---------- Say to someone (phrasebook offline, Gemini for anything else) ---------- */
const LANG_NAME = {"en-US":"English","es-US":"Spanish","fr-FR":"French","pt-BR":"Portuguese","zh-CN":"Chinese (Simplified)","vi-VN":"Vietnamese","ar-SA":"Arabic"};
function renderPhrases(){
  $("phraseChips").innerHTML = TW.PHRASES.map((p,i)=>`<button data-p="${i}">${TW.esc(TW.lang==="es"? p.es : p.en)}</button>`).join("");
  $("phraseChips").querySelectorAll("button").forEach(b=> b.onclick = ()=>{ $("sayText").value = TW.PHRASES[+b.dataset.p].en; sayIt(); });
}
async function translate(text, code){
  const base = code.slice(0,2);
  const hit = TW.PHRASES.find(p=> p.en.toLowerCase()===text.toLowerCase() || p.es.toLowerCase()===text.toLowerCase());
  if(hit && (base==="en" || base==="es")) return base==="es" ? hit.es : hit.en;
  if(base==="en" && /^[\x00-\x7F]*$/.test(text)) return text;
  const out = await TW.gemini(`Translate this into ${LANG_NAME[code]||code} for a worker to say out loud to a customer. Keep it short, polite and natural. Reply with ONLY JSON {"text":"..."}.\nText: ${text}`, {temperature:0.2, maxTokens:200});
  const o = TW.parseJSON(out);
  const t = String(o.text||o.translation||"").trim();
  if(!t) throw new Error("empty");
  return t;
}
TW.translate = translate;
async function sayIt(){
  const text = $("sayText").value.trim(), code = $("sayLang").value;
  if(!text){ toast("Type what to say, or tap a phrase."); return; }
  $("sayOut").textContent = "\u2026";
  try{
    const out = await translate(text, code);
    $("sayOut").textContent = out;
    const prev = TW.outMode; TW.outMode = "speaker"; speak(out, null, {lang:code}); TW.outMode = prev;
  }catch(e){
    $("sayOut").textContent = "";
    toast(e.code==="nokey" ? "That phrase needs a Gemini key (Settings). The phrases above work without one." : TW.geminiMsg(e));
  }
}
$("btnSayIt").onclick = sayIt;
$("sayText").addEventListener("keydown", e=>{ if(e.key==="Enter") sayIt(); });

TW.renderers.coach = ()=>{ setOut(TW.outMode); renderPhrases(); };
TW.coach = {cam, onScreen:camOnScreen, refresh:camRefreshMode, startCamera, stopCamera, askCoach, checkFrame, grabFrame, parseCoach, handleCoach, coachPrompt};
window.__tw = {TEMPLATES:TW.TEMPLATES, scaffold:TW.scaffold, streak:TW.streak, cam, parseCoach, handleCoach, checkFrame, startCamera, stopCamera, getRun:()=>TW.getRun(), TW};
camRefreshMode();
})();
