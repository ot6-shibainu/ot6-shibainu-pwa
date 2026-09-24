const CACHE='ot6-shibainu-ver2.0-250q';
const ASSETS=['./','./index.html','./questions.json','./questions.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./img/shibasaburo.png','./img/genki.png','./img/momo.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(a=>Promise.all(a.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
