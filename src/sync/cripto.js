/**
 * A chave de sincronização e a criptografia dos dados.
 *
 * A chave tem 20 caracteres sorteados (100 bits), escritos como
 * WOLF-XXXX-XXXX-XXXX-XXXX-XXXX. Dela saem duas coisas, por SHA-256:
 * - o id do cofre no servidor (quem não tem a chave não acha o cofre);
 * - a senha da criptografia AES-GCM, que acontece no aparelho. O servidor
 *   só recebe e devolve texto embaralhado.
 */

// Sem I, O, 0 e 1, que se confundem ao digitar.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const TAMANHO = 20
const PREFIXO = 'WOLF'

/** Sorteia uma chave nova, já formatada. */
export function gerarChave() {
  const sorteio = crypto.getRandomValues(new Uint8Array(TAMANHO))
  const letras = Array.from(sorteio, (n) => ALFABETO[n % ALFABETO.length])

  return formatarChave(letras.join(''))
}

/** "WOLF-ABCD-EFGH-..." a partir dos 20 caracteres. */
export function formatarChave(crua) {
  const grupos = crua.match(/.{1,4}/g) ?? []

  return [PREFIXO, ...grupos].join('-')
}

/**
 * Aceita a chave do jeito que a pessoa digitar (minúsculas, sem traços,
 * com espaços) e devolve só os 20 caracteres, ou `null` se não for válida.
 */
export function lerChave(texto) {
  let limpa = String(texto ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

  if (limpa.startsWith(PREFIXO) && limpa.length === TAMANHO + PREFIXO.length) {
    limpa = limpa.slice(PREFIXO.length)
  }

  const valida =
    limpa.length === TAMANHO && [...limpa].every((c) => ALFABETO.includes(c))

  return valida ? limpa : null
}

async function sha256(texto) {
  const bytes = new TextEncoder().encode(texto)

  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
}

const paraHex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

// Em pedaços: com muitos dados, converter tudo de uma vez estoura a pilha.
function paraBase64(bytes) {
  let binario = ''

  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }

  return btoa(binario)
}

const deBase64 = (texto) => Uint8Array.from(atob(texto), (c) => c.charCodeAt(0))

/** Id do cofre: 64 caracteres hexadecimais. */
export async function idDoCofre(chave) {
  return paraHex(await sha256(`wolf-study/id/${chave}`))
}

async function senhaAES(chave) {
  const bruta = await sha256(`wolf-study/cripto/${chave}`)

  return crypto.subtle.importKey('raw', bruta, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

/** Dados do app → texto criptografado para o servidor. */
export async function cifrar(dados, chave) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const conteudo = new TextEncoder().encode(JSON.stringify(dados))
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await senhaAES(chave),
    conteudo,
  )

  return JSON.stringify({
    v: 1,
    iv: paraBase64(iv),
    dados: paraBase64(new Uint8Array(cifrado)),
  })
}

/** Texto do servidor → dados do app. Lança erro se a chave não for a certa. */
export async function decifrar(texto, chave) {
  const { iv, dados } = JSON.parse(texto)
  const aberto = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: deBase64(iv) },
    await senhaAES(chave),
    deBase64(dados),
  )

  return JSON.parse(new TextDecoder().decode(aberto))
}
