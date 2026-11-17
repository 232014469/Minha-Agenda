// O antigo Study instalava um modo offline neste endereço. Esta versão
// substitui a antiga, apaga o cache dela e se desliga, para o app abrir
// sempre o Wolf Study.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome.startsWith(self.registration.scope))
            .map((nome) => caches.delete(nome)),
        ),
      )
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((janelas) => janelas.forEach((janela) => janela.navigate('../'))),
  )
})
