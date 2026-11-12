// Deixa o app abrir sem internet. As páginas buscam primeiro a versão nova
// na rede (e usam a guardada se estiver offline); os arquivos de código e
// imagens, que mudam de nome a cada versão, vêm do cache.
//
// O site tem duas versões (Jeff Study na raiz e Study em study/), cada uma
// com o seu sw.js. Por isso o nome do cache leva o endereço da versão: uma
// nunca apaga nem usa o cache da outra.
const ESCOPO = self.registration.scope
const CACHE = `${ESCOPO}#v1`
const BASICOS = ['./', './manifest.webmanifest']

/** Pedidos da outra versão (study/ dentro da raiz) não são deste app. */
function eDaOutraVersao(url) {
  return url.startsWith(`${ESCOPO}study/`)
}

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
            .filter(
              (nome) =>
                nome !== CACHE &&
                // Caches antigos desta versão, e o da primeira publicação.
                (nome.startsWith(`${ESCOPO}#`) || nome === 'jeff-study-v1'),
            )
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
    new URL(pedido.url).origin !== location.origin ||
    eDaOutraVersao(pedido.url)
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
        .catch(() => caches.match('./', { cacheName: CACHE })),
    )
    return
  }

  evento.respondWith(
    caches.match(pedido, { cacheName: CACHE }).then(
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
