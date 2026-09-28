const CACHE='ot6-shibainu-ver2.0-250-final-start';
const ASSETS=['./','./index.html','./questions.json','./questions.js','./app.js','./img/shibasaburo.png','./img/genki.png','./img/momo.png','./manifest.webmanifest','./icon-192.png','./icon-512.png','./img/visuals/gauge-normal.svg','./img/visuals/gauge-low.svg','./img/visuals/gauge-high.svg','./img/visuals/siphon.svg','./img/visuals/gas-cylinder.svg','./img/visuals/cap-wrench.svg','./img/visuals/safety-plug.svg','./img/visuals/reduction-groove.svg','./img/visuals/scale.svg','./img/visuals/fire-marks.svg','./img/visuals/extinguisher.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(a=>Promise.all(a.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
