/* Temperward service worker: offline app shell. Bump VERSION when files change. */
const VERSION = "tw-v3.0.0";
const SHELL = ["./","index.html","manifest.webmanifest","css/app.css",
  "js/data.js","js/i18n.js","js/app.js","js/coach.js","js/life.js","js/rise.js","js/hire.js",
  "icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method!=="GET") return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;           // never cache Gemini or outside links
  // Network first (always fresh when online), cache fallback (works offline).
  e.respondWith(fetch(req).then(r=>{
    if(r.ok){ const cp=r.clone(); caches.open(VERSION).then(c=>c.put(req.mode==="navigate" ? "index.html" : req, cp)); }
    return r;
  }).catch(()=> caches.match(req, {ignoreSearch:true}).then(hit=> hit || (req.mode==="navigate" ? caches.match("index.html") : Response.error()))));
});
self.addEventListener("notificationclick", e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window", includeUncontrolled:true}).then(cs=>{
    for(const c of cs){ if("focus" in c) return c.focus(); }
    return self.clients.openWindow("./");
  }));
});
