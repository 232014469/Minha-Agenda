import PixelArte from './PixelArte'

/*
 * Caixinha de papelão em pixel art (desenho próprio): é nela que o gatinho
 * chega, abandonado, até você abrir e adotar. Fechada ela balança (tem
 * alguém aí dentro); aberta, as abas vão para os lados.
 */

const FECHADA = [
  '..kkkkkkkkkkkkkkkkkk..',
  '.kddddddddddddddddddk.',
  '.kllllllllllllllllllk.',
  '.kcccccccccccccccccck.',
  '.kccccccccccccccclcck.',
  '.kccccccccccccccclcck.',
  '.kccccccccccccccclcck.',
  '.kcccccccccccccccccck.',
  '.kccccccccccccccclcck.',
  '.kcccccccccccccccccck.',
  '.kcccccccccccccccccck.',
  '.kcccccccccccccccccck.',
  '.kddddddddddddddddddk.',
  '.kddddddddddddddddddk.',
  '.kkkkkkkkkkkkkkkkkkkk.',
]

const ABERTA = [
  'kkk................kkk',
  'kffk..............kffk',
  'kfffk............kfffk',
  '.kfffk..........kfffk.',
  '..kfffkkkkkkkkkkfffk..',
  '..kkiiiiiiiiiiiiiikk..',
  '..kiiiiiiiiiiiiiiiik..',
  '.kllllllllllllllllllk.',
  '.kkkkkkkkkkkkkkkkkkkk.',
  '..kccccccccccccclcck..',
  '..kccccccccccccclcck..',
  '..kcccccccccccccccck..',
  '..kccccccccccccclcck..',
  '..kcccccccccccccccck..',
  '..kddddddddddddddddk..',
  '..kddddddddddddddddk..',
  '..kkkkkkkkkkkkkkkkkk..',
]

const CORES = {
  k: 'caixinha-contorno',
  c: 'caixinha-papelao',
  d: 'caixinha-sombra',
  l: 'caixinha-brilho',
  i: 'caixinha-dentro',
  f: 'caixinha-aba',
}

export default function Caixinha({ aberta = false }) {
  return (
    <PixelArte
      className={`caixinha-papel${aberta ? ' aberta' : ''}`}
      desenho={aberta ? ABERTA : FECHADA}
      cores={CORES}
      escala={1.5}
    />
  )
}
