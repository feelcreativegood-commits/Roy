// РОЙ — service worker: игра работает без сети и обновляется по кнопке.
// При каждом выпуске поднимайте VERSION здесь и в index.html (одно и то же число).
const VERSION='1.2.2';
const CACHE='roy-'+VERSION;
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];

self.addEventListener('install',e=>{
  // Новая версия скачивается целиком, но включается только по кнопке «Обновить».
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>
    fetch(new Request(f,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(f);return c.put(f,r)})
  ))));
});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k.startsWith('roy-')&&k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  if(req.mode==='navigate'){
    // Страница игры всегда из кэша текущей версии: так файлы одной версии не смешиваются.
    e.respondWith(caches.open(CACHE).then(c=>c.match('index.html')).then(r=>r||fetch(req)));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req)));
});
