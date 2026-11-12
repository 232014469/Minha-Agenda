// Deixa o app abrir sem internet. As páginas buscam primeiro a versão nova
// na rede (e usam a guardada se estiver offline); os arquivos de código e
// imagens, que mudam de nome a cada versão, vêm do cache.
const CACHE = 'jeff-study-v1'
const BASICOS = [
  './',
  './manifest.webmanifest',
  './favicon.svg',
  './icone-192.png',
  './icone-512.png',
  './apple-touch-icon.png',
]

self.addEventListener('install', (evento) => {
  self.skipWaiting()
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(BASICOS)))
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome !== CACHE)
            .map((nome) => caches.delete(nome)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request

  if (
    pedido.method !== 'GET' ||
    new URL(pedido.url).origin !== location.origin
  ) {
    return
  }

  if (pedido.mode === 'navigate') {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copia))
          return resposta
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  evento.respondWith(
    caches.match(pedido).then(
      (guardada) =>
        guardada ||
        fetch(pedido).then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone()
            caches.open(CACHE).then((cache) => cache.put(pedido, copia))
          }
          return resposta
        }),
    ),
  )
})
