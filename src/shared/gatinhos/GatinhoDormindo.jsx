import { usePreferencias } from '../preferencias'
import Sprite from './Sprite'
import { ehGato } from './gatos'

/** Gatinho cochilando, para quando não há nada pendente. */
export default function GatinhoDormindo() {
  const { cantinho, mascote } = usePreferencias()

  if (cantinho !== 'gatinho') return null

  return (
    <div className="gatinho-dormindo" aria-hidden="true">
      <Sprite
        gato={ehGato(mascote) ? mascote : 'gato01'}
        animacao="liedown"
        fps={6}
      />
      <span className="gatinho-zzz">z z z</span>
    </div>
  )
}
